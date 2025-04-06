import { XMLParser } from "fast-xml-parser";
import { TransportModeLoader } from ".";
import { ModeType, Route, Stop, StopType } from "@/domain/transport-mode";
import { LrtjMode } from "../transport-mode/lrtj";
import { CommuterlineMode } from "../transport-mode/commuterline";
import { MrtjMode } from "../transport-mode/mrtj";
import { LrtJabodebekMode } from "../transport-mode/lrtjabodebek";

export const loadRailsTransportMode: TransportModeLoader = async () => {
  const response = await fetch("assets/transport-data/rails.kml");

  const parser = new XMLParser();
  const text = await response.text();
  const content = parser.parse(text);

  /* Start MRTJ */
  const mrtjPlacemarks = content.kml.Document.Folder.find(
    (folder: any) => folder.name === "MRT Jakarta",
  ).Placemark;
  const mrtjStations: Array<Stop> = mrtjPlacemarks.map((placemark: any) => {
    const [longitude, latitude] = placemark.Point.coordinates
      .split(",")
      .map(parseFloat);
    const stop = new Stop();
    stop.id = placemark.name;
    stop.name = placemark.name;
    stop.type = StopType.Station;
    stop.coordinate = {
      latitude,
      longitude,
    };
    return stop;
  });
  const mrtjRoute = new Route();
  mrtjRoute.id = "mrtj";
  mrtjRoute.fullName = "MRTJ Lin Utara Selatan";
  mrtjRoute.shortName = "M";
  mrtjRoute.color = "FF0000";
  mrtjRoute.type = ModeType.Train;
  mrtjRoute.stops = mrtjStations;

  const mrtj = new MrtjMode();
  mrtj.stops = mrtjStations;
  mrtj.routes = {
    [mrtjRoute.id]: mrtjRoute,
  };
  /* End MRTJ */

  /* Start Commuterline */
  const lineMapping: Record<string, { shortName: string; color: string }> = {
    "KRL Commuter Lin Lingkar Cikarang (Jatinegara - Manggarai - Cikarang)": {
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
      const stop = new Stop();
      stop.id = placemark.name;
      stop.name = placemark.name;
      stop.type = StopType.Station;
      stop.coordinate = {
        latitude,
        longitude,
      };
      return stop;
    });
    const route = new Route();
    route.id = folder.name;
    route.fullName = folder.name;
    route.shortName = lineMapping[folder.name].shortName;
    route.color = lineMapping[folder.name].color;
    route.type = ModeType.Train;
    route.stops = stations;

    for (const station of stations) {
      if (
        commuterLine.stops.find((_station) => _station.id === station.id) !==
        undefined
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
      const stop = new Stop();
      stop.id = placemark.name;
      stop.name = placemark.name;
      stop.type = StopType.Station;
      stop.coordinate = {
        latitude,
        longitude,
      };
      return stop;
    },
  );
  const lrtJabodebekRoute = new Route();
  lrtJabodebekRoute.id = "lrtjabodebek";
  lrtJabodebekRoute.fullName = "LRT Jabodebek (Lin Cibubur & Bekasi)";
  lrtJabodebekRoute.shortName = "BK";
  lrtJabodebekRoute.color = "046C37";
  lrtJabodebekRoute.type = ModeType.Train;
  lrtJabodebekRoute.stops = lrtJabodebekStations;

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
    const stop = new Stop();
    stop.id = placemark.name;
    stop.name = placemark.name;
    stop.type = StopType.Station;
    stop.coordinate = {
      latitude,
      longitude,
    };
    return stop;
  });

  const lrtjRoute = new Route();
  lrtjRoute.id = "lrtj";
  lrtjRoute.fullName = "LRT Jakarta";
  lrtjRoute.shortName = "S";
  lrtjRoute.color = "F05F21";
  lrtjRoute.type = ModeType.Train;
  lrtjRoute.stops = lrtjStations;

  const lrtj = new LrtjMode();
  lrtj.stops = lrtjStations;
  lrtj.routes = {
    [lrtj.name]: lrtjRoute,
  };
  /* End LRTJ */

  return [mrtj, lrtj, lrtJabodebek, commuterLine];
};
