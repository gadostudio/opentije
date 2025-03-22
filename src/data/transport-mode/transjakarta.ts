import { TransportMode } from ".";

export class TransjakartaMode extends TransportMode {
    name: string = "Transjakarta";

    constructor(routeIds: Array<string>, stopIds: Array<string>) {
        super();
        this.routeIds = new Set(routeIds);
        this.stopIds = new Set(stopIds);
    }
};
