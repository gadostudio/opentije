"use client";

import {
  GeoJSONSource,
  GeolocateControl,
  Map,
  NavigationControl,
} from "maplibre-gl";
import { GeoJsonProperties, Geometry, Feature } from "geojson";
import {
  BusPosition,
  BusPositions,
  RealtimeBusLocationSocket,
} from "@/data/transport-source-realtime/transjakarta";
import { useState, useEffect, useMemo } from "react";
import { useMapUiState } from "@/data/map-ui";
import { MapDataSource, MapLayer } from "@/app/components/MapCanvas";

export enum TjRealtimeConnectionStatus {
  Connected,
  Connecting,
  Disconnected,
  Error,
}

export type TjRealtimePositionsAction = {
  busPositions: Array<BusPosition>;
  connStatus: TjRealtimeConnectionStatus;
};

export const useTransjakartaRealtimePositions =
  (): TjRealtimePositionsAction => {
    const [busPositions, setBusPositions] = useState<Array<BusPosition>>([]);
    const [connStatus, setConnStatus] = useState<TjRealtimeConnectionStatus>(
      TjRealtimeConnectionStatus.Connecting,
    );
    const realtimeConn = useMemo(() => new RealtimeBusLocationSocket(), []);

    useEffect(() => {
      const connect = async () => {
        try {
          setConnStatus(TjRealtimeConnectionStatus.Connecting);
          await realtimeConn.connect();
          setConnStatus(TjRealtimeConnectionStatus.Connected);
        } catch (error) {
          setConnStatus(TjRealtimeConnectionStatus.Error);
        }
      };

      connect();

      return () => {
        const disconnect = async () => {
          try {
            await realtimeConn.disconnect();
            setConnStatus(TjRealtimeConnectionStatus.Disconnected);
          } catch (error) {
            setConnStatus(TjRealtimeConnectionStatus.Error);
          }
        };
        disconnect();
      };
    }, [realtimeConn]);

    useEffect(() => {
      const handlePositionUpdate = (data: BusPositions) => {
        setBusPositions(data.busData);
      };

      realtimeConn.onPositionUpdate(handlePositionUpdate);
    }, [realtimeConn]);

    return { busPositions, connStatus };
  };
