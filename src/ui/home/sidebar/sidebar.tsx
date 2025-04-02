import { Accessor, For, Setter, Show, createSignal } from "solid-js";
import { RouteItem, StopItem } from "./items";
import style from "./sidebar.module.scss";
import { AboutModal } from "./about";
import { useMapUiState } from "../../../data/states/map-ui";
import { useTransportController } from "../../../data/states/transport-controller";
import {
    Route as RouteType,
    Stop as StopType,
} from "../../../data/transport-mode";
import { transportCategories } from "../../../data/transport-data";

export const Sidebar = () => {
    const {
        isSidebarExpanded: isExpanded,
        setIsSidebarExpanded: setIsExpanded,
    } = useMapUiState();

    return (
        <div
            class={`${style.container} ${isExpanded() ? style["container-focused"] : ""}`}
        >
            <Content onSearchBarFocused={() => setIsExpanded(true)} />
        </div>
    );
};

type CategoriesType = Array<string> | { [key: string]: CategoriesType };
type CategoriesToggle = Record<string, boolean>;

export type CategoryProps = {
    categories: CategoriesType;
    path?: string;
    checks: Accessor<CategoriesToggle>;
    setChecks: Setter<CategoriesToggle>;
};

const getAllChildPaths = (
    categories: CategoriesType,
    prefix: string = "",
): string[] => {
    const paths: string[] = [];

    if (Array.isArray(categories)) {
        return categories.map((item) => (prefix ? `${prefix}.${item}` : item));
    }

    for (const [key, value] of Object.entries(categories)) {
        const newPrefix = prefix ? `${prefix}.${key}` : key;
        paths.push(newPrefix);
        paths.push(...getAllChildPaths(value, newPrefix));
    }

    return paths;
};

// Helper function to check if all children are checked
const areAllChildrenChecked = (
    childPaths: string[],
    checks: CategoriesToggle,
): boolean => {
    return childPaths.every((path) => checks[path]);
};

// Helper function to check if any child is unchecked
const isAnyChildUnchecked = (
    childPaths: string[],
    checks: CategoriesToggle,
): boolean => {
    return childPaths.some((path) => !checks[path]);
};

const Categories = ({ categories, path, checks, setChecks }: CategoryProps) => {
    const items = Array.isArray(categories)
        ? categories.map((item) => [item, null] as const)
        : Object.entries(categories);

    return (
        <ul class={style.categoryList}>
            <For each={items}>
                {([key, value]) => {
                    const _path = path ? `${path}.${key}` : key;
                    const isChecked = () => !!checks()[_path];
                    const [isExpanded, setIsExpanded] = createSignal(false);
                    const childPaths = value
                        ? getAllChildPaths(value, _path)
                        : [];

                    const handleCheckboxChange = (checked: boolean) => {
                        setChecks((prev) => {
                            const newChecks = { ...prev };

                            // Update the current path and all child paths (downward propagation)
                            const pathsToUpdate = value ? childPaths : [];
                            for (const p of pathsToUpdate) {
                                newChecks[p] = checked;
                            }
                            newChecks[_path] = checked;

                            // Update parent paths (upward propagation)
                            let currentPath = _path;
                            while (currentPath.includes(".")) {
                                const parentPath = currentPath.substring(
                                    0,
                                    currentPath.lastIndexOf("."),
                                );
                                const parentChildPaths = getAllChildPaths(
                                    categories,
                                    parentPath,
                                ).filter(
                                    (p) =>
                                        p !== parentPath &&
                                        p.startsWith(parentPath),
                                );

                                if (
                                    checked &&
                                    areAllChildrenChecked(
                                        parentChildPaths,
                                        newChecks,
                                    )
                                ) {
                                    newChecks[parentPath] = true;
                                } else if (
                                    isAnyChildUnchecked(
                                        parentChildPaths,
                                        newChecks,
                                    )
                                ) {
                                    newChecks[parentPath] = false;
                                }

                                currentPath = parentPath;
                            }

                            return newChecks;
                        });
                    };

                    return (
                        <li
                            class={`${style.categoryItem} ${value ? style.categoryItemExpandable : undefined}`}
                        >
                            {value && (
                                <span
                                    class={style.arrow}
                                    onClick={() =>
                                        setIsExpanded((prev) => !prev)
                                    }
                                >
                                    {isExpanded() ? "▼" : "▶"}
                                </span>
                            )}
                            <label class={style.categoryLabel}>
                                <input
                                    type="checkbox"
                                    checked={isChecked()}
                                    onChange={(e) =>
                                        handleCheckboxChange(e.target.checked)
                                    }
                                />
                                {key}
                            </label>
                            {value && isExpanded() && (
                                <div class={style.categorySubList}>
                                    <Categories
                                        categories={value}
                                        path={_path}
                                        checks={checks}
                                        setChecks={setChecks}
                                    />
                                </div>
                            )}
                        </li>
                    );
                }}
            </For>
        </ul>
    );
};

const createChecksFilter = (types: CategoriesType): CategoriesToggle =>
    Object.fromEntries(getAllChildPaths(types).map((path) => [path, true]));

const Content = ({
    onSearchBarFocused,
}: {
    onSearchBarFocused: () => void;
}) => {
    const [query, setQuery] = createSignal<string>("");
    const { stops, routes } = useTransportController();
    const [showAboutModal, setShowAboutModal] = createSignal<boolean>(false);
    const [checks, setChecks] = createSignal<CategoriesToggle>(
        createChecksFilter(transportCategories),
    );

    const filter = (route: RouteType): boolean => {
        const activeKeys = Object.entries(checks())
            .filter(([_, value]) => value)
            .map(([key, _]) => {
                const lastSegment = key.split(".").at(-1) ?? "";
                return lastSegment;
            });
        const activeKeywords = new Set(activeKeys);
        const routeKeywords = new Set([
            route.type,
            route.mode.name,
            route.label,
        ]);

        if (activeKeywords.intersection(routeKeywords).size === 0) {
            return false;
        }

        return (
            route.fullName.toLowerCase().includes(query()) ||
            route.id.toLowerCase().includes(query())
        );
    };

    const stopSearchPredicate = (stop: StopType): boolean =>
        stop.name.toLowerCase().includes(query());

    return (
        <>
            <div class={style.header}>
                <input
                    placeholder="Cari rute bus, kereta, bus stop, atau stasiun"
                    onInput={(e) => setQuery(e.target.value)}
                    onFocus={() => onSearchBarFocused()}
                    value={query()}
                    class={style.searchInput}
                />
                <div class={style.filters}>
                    <Categories
                        categories={transportCategories}
                        checks={checks}
                        setChecks={setChecks}
                    />
                </div>
            </div>
            <div class="sidebar__routes">
                <ul class={style.routes}>
                    {routes()
                        .filter(filter)
                        .map((route) => (
                            <RouteItem route={route} />
                        ))}
                    <Show when={query().length !== 0}>
                        {stops()
                            .filter(stopSearchPredicate)
                            .map((stop) => (
                                <StopItem stop={stop} />
                            ))}
                    </Show>
                </ul>
            </div>
            <div class={style.footer}>
                <div></div>
                <div class={style.footerRight}>
                    <a
                        href="https://github.com/gadoproject/opentije"
                        target="_blank"
                    >
                        <i class={`fa-brands fa-github`}></i>
                    </a>
                    <a onClick={() => setShowAboutModal(true)}>
                        <i class={`fa-solid fa-circle-info`}></i>
                    </a>
                </div>
            </div>
            <AboutModal
                show={showAboutModal()}
                onHide={() => setShowAboutModal(false)}
            />
        </>
    );
};
