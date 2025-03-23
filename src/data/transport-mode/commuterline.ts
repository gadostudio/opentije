import { ModeType, TransportMode } from ".";

export class CommuterlineMode extends TransportMode {
    name: string = "Commuterline";
    type: ModeType = ModeType.Train;
}
