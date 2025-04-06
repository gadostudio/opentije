"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import {
  CanvasSourceSpecification,
  GeoJSONSource,
  GeolocateControl,
  Map,
  NavigationControl,
  SourceSpecification,
} from "maplibre-gl";
import { useTransportController } from "./transport-controller";
import { PopOverState } from "./popover";

type MapUiState = {
  isSidebarExpanded: boolean;
  setIsSidebarExpanded: (value: boolean) => void;

  showContextMenu: boolean;
  setShowContextMenu: (value: boolean) => void;

  selectedRouteIds: Set<string>;
  setSelectedRouteId: (id: string, checked?: boolean) => void;

  libreMap: Map | null;
  setLibreMap: (map: Map | null) => void;

  closeRightPopover: () => void;
  rightPopover: PopOverState;
  setSelectedStop: (id: string) => void;
};

export const MapUiStateContext = createContext<MapUiState | undefined>(
  undefined,
);

export const useMapUiState = () => {
  const context = useContext(MapUiStateContext);
  if (!context) {
    throw new Error("useMapUiState must be used within a MapUiStateProvider");
  }
  return context;
};

export const MapUiStateProvider = ({ children }: { children: ReactNode }) => {
  const { modes } = useTransportController();

  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [selectedRouteIds, setSelectedRouteIds] = useState<Set<string>>(
    new Set(),
  );
  const [rightPopover, setRightPopOver] = useState<PopOverState>(null);

  const setSelectedRouteId = (id: string, checked?: boolean) => {
    if (checked === undefined) {
      const newSet = new Set([id]);
      if (selectedRouteIds.size === 1 && selectedRouteIds.has(id)) {
        setSelectedRouteIds(new Set<string>());
      } else {
        setSelectedRouteIds(newSet);
      }
      return;
    }

    setSelectedRouteIds((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  };

  const setSelectedStop = (id: string) => {
    const stop = modes
      .flatMap((mode) => mode.stops)
      .find((stop) => stop.id === id);
    if (stop === undefined) return;
    setRightPopOver({
      type: "stop",
      stop,
    });
  };

  const [libreMap, setLibreMap] = useState<Map | null>(null);

  const value: MapUiState = {
    isSidebarExpanded,
    setIsSidebarExpanded,
    showContextMenu,
    setShowContextMenu,
    selectedRouteIds,
    setSelectedRouteId,
    libreMap,
    setLibreMap,
    closeRightPopover: () => setRightPopOver(null),
    rightPopover,
    setSelectedStop,
  };

  return (
    <MapUiStateContext.Provider value={value}>
      {children}
    </MapUiStateContext.Provider>
  );
};
