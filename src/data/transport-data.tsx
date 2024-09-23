import {
  Accessor,
  Component,
  createContext,
  createSignal,
  onMount,
  ParentComponent,
  ParentProps,
  Setter,
  useContext,
} from "solid-js";
import { Result } from "../utils/result";
import { RouteData } from "../ui/home/map/map";
import { getRawData, ShapeRawData } from "./consumer";
import { DefaultMap } from "../utils/container";

class Trip {
  constructor(
    public shapes: Array<ShapeRawData>,
  ) {}
};

class BusStop {
  constructor(
    public name: string,
    public latitude: number,
    public longitude: number
  ) {}
};

class BusRoute {
  constructor(
    public stops: Array<BusStop>,
    public trips: Array<Trip>,
  ) {}
};

class TJ {
  constructor(
    private routes: Record<string, BusRoute>,
    private stops: Array<BusStop>,
  ) {}

  getRouteIds = (): Array<string> => {
    return Object.keys(this.routes);
  };

  getRoute = (routeId: string): BusRoute => {
    return this.routes[routeId];
  };
  
  getBusStops = (routeId: string | null = null): Array<BusStop> => {
    if (routeId !== null) {
      return this.routes[routeId].stops;
    }

    return this.stops;
  };
}

export type TransportData = {
  tj: Accessor<Result<TJ>>;
};

export const TransportDataContext = createContext<TransportData>();

export const useTransportData = () => useContext(TransportDataContext)!;

export const TransportDataProvider: ParentComponent = ({ children }) => {
  const [tj, setTj] = createSignal<Result<TJ>>({
    type: "loading",
  });


  onMount(async () => {
    // Load route data
    const { routesRawData, stopsRawData, tripsRawData, shapesRawData } = await getRawData();

    const tripShapes = new DefaultMap<string, Array<ShapeRawData>>(() => []);
    for (const shapeRawData of shapesRawData) {
      tripShapes.get(shapeRawData.shape_id).push(shapeRawData);
    }
    for (const shapes of tripShapes.values()) {
      shapes.sort((shape) => shape.shape_pt_sequence);
    }

    const trips = new DefaultMap<string, Array<Trip>>(() => []);
    for (const tripRawData of tripsRawData) {
      trips.get(tripRawData.route_id).push({
        routeId: tripRawData.trip_id,
        shapes: tripShapes.get(tripRawData.shape_id),
      });
    }

    const tj = new Map<string, RouteData>();
    // 1M for dev
    for (const routeRawData of routesRawData) {
      if (routeRawData.route_id === "") {
        continue;
      }

      tj.set(routeRawData.route_id, {
        data: routeRawData,
        // stops: [],
        trips: trips.get(routeRawData.route_id),
      });
    }

    setTj({
      type: 'success',
      data: new TJ(),
    });
  });

  const controller: TransportData = {
    tj,
  };
  return (
    <TransportDataContext.Provider value={controller}>
      {children}
    </TransportDataContext.Provider>
  );
};
