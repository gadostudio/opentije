import { XMLParser } from "fast-xml-parser";
import { TransportModeLoader } from ".";
import { CommuterlineMode } from "../transport-mode/commuterline";
import { LrtjMode } from "../transport-mode/lrtj";
import { LrtJabodebekMode } from "../transport-mode/lrtjabodebek";
import { MrtjMode } from "../transport-mode/mrtj";
import { Route, Stop } from "../transport-mode";

export const loadRailsTransportMode: TransportModeLoader = async () => {
    const response = await fetch("assets/transport-data/rails.kml");

    const parser = new XMLParser();
    const text = await response.text();
    const content = parser.parse(text);

    /* Start MRTJ */
    const mrtjPlacemarks = content.kml.Document.Folder.find(
        (a: any) => a.name === "MRT Jakarta",
    ).Placemark;
    const mrtjStations: Array<Stop> = mrtjPlacemarks.map((placemark: any) => {
        const [longitude, latitude] = placemark.Point.coordinates
            .split(",")
            .map(parseFloat);
        return new Stop(placemark.name, placemark.name, "station", {
            latitude,
            longitude,
        });
    });
    const mrtjRoute = new Route(
        "mrtj",
        "MRTJ Lin Utara Selatan",
        "M",
        "FF0000",
    );
    mrtjRoute.stopIds = mrtjStations.map((station) => station.id);

    const mrtj = new MrtjMode();
    mrtj.stops = mrtjStations;
    mrtj.routes = {
        [mrtjRoute.id]: mrtjRoute,
    };
    /* End MRTJ */

    /* Start Commuterline */
    const lineMapping: Record<string, { shortName: string; color: string }> = {
        "KRL Commuter Lin Lingkar Cikarang (Jatinegara - Manggarai - Cikarang)":
            {
                shortName: "C",
                color: "2CB4E5",
            },
        "KRL Commuter Lin Bogor (Jakarta Kota - Bogor/Nambo)": {
            shortName: "B",
            color: "E5252A",
        },
        "KRL Commuter Lin Rangkasbitung (Tanah Abang - Rangkasbitung)": {
            shortName: "R",
            color: "FFD700",
        },
        "KRL Commuter Lin Tangerang (Duri - Tangerang)": {
            shortName: "T",
            color: "9FC458",
        },
        "KRL Commuter Lin Tanjung Priok (Jakarta Kota - Tanjung Priok)": {
            shortName: "TP",
            color: "EE4F9A",
        },
    };

    const commuterLine = new CommuterlineMode();
    const commuterLineFolders = content.kml.Document.Folder.filter((a: any) =>
        a.name.startsWith("KRL Commuter Lin"),
    );
    for (const folder of commuterLineFolders) {
        const placemarks = folder.Placemark;
        const stations: Array<Stop> = placemarks.map((placemark: any) => {
            const [longitude, latitude] = placemark.Point.coordinates
                .split(",")
                .map(parseFloat);
            return new Stop(placemark.name, placemark.name, "station", {
                latitude,
                longitude,
            });
        });
        const route = new Route(
            folder.name,
            folder.name,
            lineMapping[folder.name].shortName,
            lineMapping[folder.name].color,
        );
        route.stopIds = stations.map((station) => station.id);

        for (const station of stations) {
            if (
                commuterLine.stops.find(
                    (_station) => _station.id === station.id,
                ) !== undefined
            ) {
                continue;
            }
            commuterLine.stops.push(station);
        }
        commuterLine.routes[route.id] = route;
    }
    /* End Commuterline */

    /* Start LRT Jabodebek */
    const lrtJabodebekPlacemarks = content.kml.Document.Folder.find(
        (a: any) => a.name === "LRT Jabodebek (Lin Cibubur & Bekasi)",
    ).Placemark;
    const lrtJabodebekStations: Array<Stop> = lrtJabodebekPlacemarks.map(
        (placemark: any) => {
            const [longitude, latitude] = placemark.Point.coordinates
                .split(",")
                .map(parseFloat);
            return new Stop(placemark.name, placemark.name, "station", {
                latitude,
                longitude,
            });
        },
    );
    const lrtJabodebekRoute = new Route(
        "lrtjabodebek",
        "LRT Jabodebek (Lin Cibubur & Bekasi)",
        "BK",
        "046C37",
    );
    lrtJabodebekRoute.stopIds = lrtJabodebekStations.map(
        (station) => station.id,
    );

    const lrtJabodebek = new LrtJabodebekMode();
    lrtJabodebek.stops = lrtJabodebekStations;
    lrtJabodebek.routes = {
        [lrtJabodebekRoute.id]: lrtJabodebekRoute,
    };
    /* End LRT Jabodebek */

    /* Start LRTJ */
    const lrtjPlacemarks = content.kml.Document.Folder.find(
        (a: any) => a.name === "LRT Jakarta",
    ).Placemark;
    const lrtjStations: Array<Stop> = lrtjPlacemarks.map((placemark: any) => {
        const [longitude, latitude] = placemark.Point.coordinates
            .split(",")
            .map(parseFloat);
        return new Stop(placemark.name, placemark.name, "station", {
            latitude,
            longitude,
        });
    });
    const lrtjRoute = new Route("lrtj", "LRT Jakarta", "S", "F05F21");
    lrtjRoute.stopIds = lrtjStations.map((station) => station.id);

    const lrtj = new LrtjMode();
    lrtj.stops = lrtjStations;
    lrtj.routes = {
        [lrtj.name]: lrtjRoute,
    };
    /* End LRTJ */

    return [mrtj, lrtj, lrtJabodebek, commuterLine];
};
