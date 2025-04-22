import { ModeType, TransportMode } from "@/domain/transport-mode";

export class LrtjMode extends TransportMode {
  name: string = "LRT Jakarta";
  type: ModeType = ModeType.Train;
}
