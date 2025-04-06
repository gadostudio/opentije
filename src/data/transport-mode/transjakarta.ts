import { ModeType } from "@/domain/transport-mode";
import { TransportMode } from ".";

export class TransjakartaMode extends TransportMode {
  name: string = "Transjakarta";
  type: ModeType = ModeType.Bus;

  init(): void {
    super.init();
    this.clearDeadStops();
  }

  clearDeadStops() {
    this.stops = this.stops.filter((stop) => {
      return stop.servedRoutes.length > 0;
    });
  }
}
