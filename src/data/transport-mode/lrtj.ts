import { ModeType } from "@/domain/transport-mode";
import { Route, Stop, TransportMode } from ".";

export class LrtjMode extends TransportMode {
  name: string = "LRT Jakarta";
  type: ModeType = ModeType.Train;
}
