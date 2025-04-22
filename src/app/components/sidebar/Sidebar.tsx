"use client";

import {
  Stop as StopType,
  transportCategories,
  Route as RouteType,
} from "@/domain/transport-mode";
import { AboutModal } from "../about/About";
import { RouteItem, StopItem } from "./Items";
import styles from "./Sidebar.module.scss";
import { useMapUiState } from "@/data/map-ui";
import { useState } from "react";
import { useTransportController } from "@/data/transport-controller";

export default function Sidebar() {
  const { isSidebarExpanded: isExpanded, setIsSidebarExpanded: setIsExpanded } =
    useMapUiState();

  return (
    <div
      className={`${styles.container} ${isExpanded ? styles["container-focused"] : ""}`}
    >
      <Content onSearchBarFocused={() => setIsExpanded(true)} />
    </div>
  );
}

type CategoriesType = Array<string> | { [key: string]: CategoriesType };
type CategoriesToggle = Record<string, boolean>;

export type CategoryProps = {
  categories: CategoriesType;
  path?: string;
  checks: CategoriesToggle;
  setChecks: (checks: CategoriesToggle) => void;
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

const areAllChildrenChecked = (
  childPaths: string[],
  checks: CategoriesToggle,
): boolean => {
  return childPaths.every((path) => checks[path]);
};

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

  // Manage expanded state for all categories in an object
  const [expandedStates, setExpandedStates] = useState<Record<string, boolean>>(
    {},
  );

  const handleCheckboxChange = (
    _path: string,
    checked: boolean,
    childPaths: string[],
  ) => {
    const newChecks = { ...checks };

    const pathsToUpdate = childPaths;
    for (const p of pathsToUpdate) {
      newChecks[p] = checked;
    }
    newChecks[_path] = checked;

    let currentPath = _path;
    while (currentPath.includes(".")) {
      const parentPath = currentPath.substring(0, currentPath.lastIndexOf("."));
      const parentChildPaths = getAllChildPaths(categories, parentPath).filter(
        (p) => p !== parentPath && p.startsWith(parentPath),
      );

      if (checked && areAllChildrenChecked(parentChildPaths, newChecks)) {
        newChecks[parentPath] = true;
      } else if (isAnyChildUnchecked(parentChildPaths, newChecks)) {
        newChecks[parentPath] = false;
      }

      currentPath = parentPath;
    }
    setChecks(newChecks);
  };

  return (
    <ul className={styles.categoryList}>
      {items.map(([key, value]) => {
        const _path = path ? `${path}.${key}` : key;
        const isChecked = !!checks[_path];
        const isExpanded = expandedStates[_path] || false;
        const childPaths = value ? getAllChildPaths(value, _path) : [];

        return (
          <li
            key={_path}
            className={`${styles.categoryItem} ${value ? styles.categoryItemExpandable : ""}`}
          >
            {value && (
              <span
                className={styles.arrow}
                onClick={() =>
                  setExpandedStates((prev) => ({
                    ...prev,
                    [_path]: !prev[_path],
                  }))
                }
              >
                {isExpanded ? "▼" : "▶"}
              </span>
            )}
            <label className={styles.categoryLabel}>
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) =>
                  handleCheckboxChange(_path, e.target.checked, childPaths)
                }
              />
              {key}
            </label>
            {value && isExpanded && (
              <div className={styles.categorySubList}>
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
      })}
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
  const [query, setQuery] = useState<string>("");
  const { stops, routes } = useTransportController();
  const [showAboutModal, setShowAboutModal] = useState<boolean>(false);
  const [checks, setChecks] = useState<CategoriesToggle>(
    createChecksFilter(transportCategories()),
  );

  const filter = (route: RouteType): boolean => {
    const activeKeys = Object.entries(checks)
      .filter(([_, value]) => value)
      .map(([key]) => key.split(".").at(-1) ?? "");
    const activeKeywords = new Set(activeKeys);
    const routeKeywords = new Set([route.type, route.mode.name, route.label]);

    if (activeKeywords.intersection(routeKeywords).size === 0) {
      return false;
    }

    return (
      route.fullName.toLowerCase().includes(query.toLowerCase()) ||
      route.id.toLowerCase().includes(query.toLowerCase())
    );
  };

  const stopSearchPredicate = (stop: StopType): boolean =>
    stop.name.toLowerCase().includes(query.toLowerCase());

  return (
    <>
      <div className={styles.header}>
        <input
          placeholder="Cari rute bus, kereta, bus stop, atau stasiun"
          onInput={(e) => setQuery(e.currentTarget.value)}
          onFocus={onSearchBarFocused}
          value={query}
          className={styles.searchInput}
        />
        <div className={styles.filters}>
          <Categories
            categories={transportCategories()}
            checks={checks}
            setChecks={setChecks}
          />
        </div>
      </div>
      <div className="sidebar__routes">
        <ul className={styles.routes}>
          {routes.filter(filter).map((route) => (
            <RouteItem key={route.id} route={route} />
          ))}
          {query.length !== 0 &&
            stops
              .filter(stopSearchPredicate)
              .map((stop) => <StopItem key={stop.id} stop={stop} />)}
        </ul>
      </div>
      <div className={styles.footer}>
        <div></div>
        <div className={styles.footerRight}>
          <a
            href="https://github.com/gadoproject/opentije"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fa-brands fa-github"></i>
          </a>
          <a onClick={() => setShowAboutModal(true)}>
            <i className="fa-solid fa-circle-info"></i>
          </a>
        </div>
      </div>
      {showAboutModal && <AboutModal onHide={() => setShowAboutModal(false)} />}
    </>
  );
};
