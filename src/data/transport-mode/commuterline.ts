import { TransportMode } from ".";

export class CommuterlineMode extends TransportMode {
    name: string = 'Commuterline';

    constructor(routeIds: Array<string>, stopIds: Array<string>) {
        super();
        this.routeIds = new Set(routeIds);
        this.stopIds = new Set(stopIds);
    };
};
