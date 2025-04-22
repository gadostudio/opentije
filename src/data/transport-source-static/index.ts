import { TransportMode } from "@/domain/transport-mode";

export type TransportModeLoader = () => Promise<Array<TransportMode>>;

export enum TransportModeDataSourceType {
  Transjakarta = "transjakarta",
  Rails = "rails",
}
