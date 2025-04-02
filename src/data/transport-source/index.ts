import { TransportMode } from "../transport-mode";

export type TransportModeLoader = () => Promise<Array<TransportMode>>;
