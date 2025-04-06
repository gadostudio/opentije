import { ModeType } from "@/domain/transport-mode";
import { TransportMode } from ".";

export class MrtjMode extends TransportMode {
  name: string = "MRT Jakarta";
  type: ModeType = ModeType.Train;
}
