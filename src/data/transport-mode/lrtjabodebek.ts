import { ModeType } from "@/domain/transport-mode";
import { TransportMode } from ".";

export class LrtJabodebekMode extends TransportMode {
  name: string = "LRT Jabodebek";
  type: ModeType = ModeType.Train;
}
