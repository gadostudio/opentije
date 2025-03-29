import { ModeType, TransportMode } from ".";

export class TransjakartaMode extends TransportMode {
    name: string = "Transjakarta";
    type: ModeType = ModeType.Bus;

    clearDeadStops() {
        this.stops = this.stops.filter((stop) => {
            return stop.servedRoutes.length > 0;
        });
    }
}
