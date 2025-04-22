"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  TransportModeDataSourceType,
  TransportModeLoader,
} from "./transport-source-static";
import { Result } from "@/utils/result";
import { Route, Stop, TransportMode } from "@/domain/transport-mode";
import { loadRailsTransportMode } from "./transport-source-static/rails";
import { loadTransjakartaTransportMode } from "./transport-source-static/transjakarta";

type TransportController = {
  loadingModes: Record<TransportModeDataSourceType, Result<TransportMode>>;
  modes: Array<TransportMode>;
  stops: Array<Stop>;
  routes: Array<Route>;
  getRoute: (id: string) => Route | undefined;
};

export const TransportControllerContext = createContext<
  TransportController | undefined
>(undefined);

export const useTransportController = () => {
  const context = useContext(TransportControllerContext);
  if (!context) {
    throw new Error(
      "useTransportController must be used within a TransportControllerProvider",
    );
  }
  return context;
};

export const TransportControllerProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [loadingModes, setLoadingModes] = useState<
    Record<TransportModeDataSourceType, Result<TransportMode>>
  >({
    [TransportModeDataSourceType.Rails]: { type: "loading" },
    [TransportModeDataSourceType.Transjakarta]: { type: "loading" },
  });
  const [modes, setModes] = useState<Array<TransportMode>>([]);

  const useRegisterTransportMode = (
    mode: TransportModeDataSourceType,
    loader: TransportModeLoader,
  ) => {
    useEffect(() => {
      (async () => {
        let result: Result<undefined>;
        let newModes: Array<TransportMode> = [];
        try {
          newModes = await loader();
          for (const mode of newModes) {
            mode.init();
          }
          result = { type: "success", data: undefined };
        } catch (error) {
          result = { type: "error", error };
        }

        setLoadingModes((prev) => ({
          ...prev,
          [mode]: result,
        }));
        setModes((prev) => [...prev, ...newModes]);
      })();
    }, [mode, loader]);
  };

  useRegisterTransportMode(
    TransportModeDataSourceType.Rails,
    loadRailsTransportMode,
  );
  useRegisterTransportMode(
    TransportModeDataSourceType.Transjakarta,
    loadTransjakartaTransportMode,
  );

  const value: TransportController = {
    loadingModes,
    modes,
    stops: modes.flatMap((mode) => mode.stops),
    routes: modes.flatMap((mode) => Object.values(mode.routes)),
    getRoute: (id: string) =>
      modes.find((mode) => mode.routes[id] !== undefined)?.routes[id],
  };

  return (
    <TransportControllerContext.Provider value={value}>
      {children}
    </TransportControllerContext.Provider>
  );
};
