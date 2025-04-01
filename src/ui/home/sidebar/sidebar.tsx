import {
    Accessor,
    For,
    Match,
    Setter,
    Show,
    Switch,
    createSignal,
} from "solid-js";
import { RouteItem, StopItem } from "./items";
import style from "./sidebar.module.scss";
import { AboutModal } from "./about";
import { useMapUiState } from "../../../data/states/sidebar-state";
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

export type CategoryProps = {
    categories: CategoriesType;
    path?: string;
    checks: Accessor<Record<string, boolean | undefined>>;
    setCheckes: Setter<Record<string, boolean>>;
};

const Categories = ({
    categories,
    path,
    checks,
    setCheckes,
}: CategoryProps) => {
    const items = Array.isArray(categories)
        ? categories.map((item) => [item, null] as const)
        : Object.entries(categories);

    return (
        <ul class={style.categoryList}>
            <For each={items}>
                {([key, value]) => {
                    const _path = path ? `${path}.${key}` : key;
                    const isChecked = () => checks()[key];
                    const [isExpanded, setIsExpanded] = createSignal(false);

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
                                    onChange={(e) => {
                                        setCheckes((prev) => ({
                                            ...prev,
                                            [key]: e.target.checked,
                                        }));
                                    }}
                                />
                                {key}
                            </label>
                            {value && isExpanded() && (
                                <div class={style.categorySubList}>
                                    <Categories
                                        categories={value}
                                        path={_path}
                                        checks={checks}
                                        setCheckes={setCheckes}
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

const Content = ({
    onSearchBarFocused,
}: {
    onSearchBarFocused: () => void;
}) => {
    const [query, setQuery] = createSignal<string>("");
    const { stops, routes } = useTransportController();
    const [showAboutModal, setShowAboutModal] = createSignal<boolean>(false);
    const [checks, setChecks] = createSignal<Record<string, boolean>>({});

    const routeSearchPredicate = function (route: RouteType): boolean {
        return (
            route.fullName.toLowerCase().includes(query()) ||
            route.id.toLowerCase().includes(query())
        );
    };

    const stopSearchPredicate = function (stop: StopType): boolean {
        return stop.name.toLowerCase().includes(query());
    };

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
                        setCheckes={setChecks}
                    />
                </div>
            </div>
            <div class="sidebar__routes">
                <ul class={style.routes}>
                    {routes()
                        .filter(routeSearchPredicate)
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
            <div class="sidebar__about">
                <button
                    class="about-button"
                    onClick={() => setShowAboutModal(true)}
                >
                    About OpenTije
                </button>
            </div>
            <AboutModal
                show={showAboutModal()}
                onHide={() => setShowAboutModal(false)}
            />
        </>
    );
};
