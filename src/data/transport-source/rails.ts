import { XMLParser } from "fast-xml-parser";
import { TransportModeLoader } from ".";
import { CommuterlineMode } from "../transport-mode/commuterline";
import { LrtjMode } from "../transport-mode/lrtj";
import { LrtJabodebekMode } from "../transport-mode/lrtjabodebek";
import { MrtjMode } from "../transport-mode/mrtj";
import { Route, Stop } from "../transport-mode";

export const loadRailsTransportMode: TransportModeLoader = async () => {
    const response = await fetch('assets/transport-data/rails.kml');

    const parser = new XMLParser();
    const text = await response.text();
    const content = parser.parse(text);

    /* Start MRTJ */
    const mrtjPlacemarks = content.kml.Document.Folder.find((a: any) => a.name === 'MRT Jakarta').Placemark;
    const mrtjStations: Array<Stop> = mrtjPlacemarks.map((placemark: any) => {
        const [latitude, longitude] = placemark.Point.coordinates.split(',').map(parseFloat);
        return new Stop(
            placemark.name,
            placemark.name,
        'station',
        {
            latitude,
            longitude,
        });
    });
    const mrtjRoute = new Route('MRTJ Lin Utara Selatan');
    mrtjRoute.routeIds = mrtjStations.map((station) => station.id);

    const mrtj = new MrtjMode();
    mrtj.stops = mrtjStations;
    mrtj.routes = {
        [mrtjRoute.name]: mrtjRoute,
    };
    /* End MRTJ */

    return [
        mrtj,
        // new LrtjMode(),
        // new LrtJabodebekMode(),
        // new CommuterlineMode(),
    ];
};
