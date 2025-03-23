import { TransjakartaRouteType } from "./transport-source/transjakarta";

enum TransportCategory {
    Transjakarta = "Transjakarta",
    MRT = "MRT",
    Commuterline = "Commuterline",
    LRT = "LRT",
}

type TransportCategoryExceptTransjakarta = Exclude<
    TransportCategory,
    TransportCategory.Transjakarta
>;
type TransportCategoryKey =
    | `${TransportCategory.Transjakarta}-${TransjakartaRouteType}`
    | `${TransportCategoryExceptTransjakarta}-`;

type TransportRoute = {
    routeId: string;
};

type Filter = {
    // For search only
    query: string;

    expandedCategory: Set<TransportCategory>;
    selectedCategory: Set<TransportCategoryKey>;

    selectedRoutes: Set<TransportRoute>;
};
