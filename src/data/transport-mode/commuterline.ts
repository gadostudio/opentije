import { ModeType } from "@/domain/transport-mode";
import { TransportMode } from ".";

export class CommuterlineMode extends TransportMode {
  name: string = "Commuterline";
  type: ModeType = ModeType.Train;
}
