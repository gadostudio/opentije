import { TransportMode } from ".";

export class LrtjMode implements TransportMode {
    name: string = 'LRT Jakarta';

    constructor(routeIds: Array<string>, stopIds: Array<string>) {
        super();
        this.routeIds = new Set(routeIds);
        this.stopIds = new Set(stopIds);
    };
};
