import {Component, onMount} from 'solid-js';
import maplibregl from 'maplibre-gl';
import {jakartaCoordinate} from "../constants";
import {DefaultDict, getRawData, RouteRawData, ShapeRawData} from "../consumer";
import style from "./map.module.scss";

type Trip = {
    routeId: string;
    shapes: Array<ShapeRawData>;
};

type Route = {
    data: RouteRawData,
    // stops: Array<Stop>,
    trips: Array<Trip>,
};

export const Map: Component = () => {
    onMount(async () => {
        const map = new maplibregl.Map({
            container: 'map',
            style: '/assets/style.json',
            center: [jakartaCoordinate.longitude, jakartaCoordinate.latitude],
            zoom: 12,
        });

        const {routesRawData, stopsRawData, tripsRawData, shapesRawData} = await getRawData();

        const shapeSegments = new DefaultDict<string, Array<ShapeRawData>>(() => []);
        for (const shapeRawData of shapesRawData) {
            shapeSegments.get(shapeRawData.shape_id).push(shapeRawData);
        }
        for (const shapes of Object.values(shapeSegments) as Array<Array<ShapeRawData>>) {
            shapes.sort((shape) => shape.shape_pt_sequence);
        }

        const trips = new DefaultDict<string, Array<Trip>>(() => []);
        for (const tripRawData of tripsRawData) {
            trips.get(tripRawData.route_id).push({
                routeId: tripRawData.trip_id,
                shapes: shapeSegments.get(tripRawData.shape_id),
            });
        }

        const routes: Record<string, Route> = {};
        for (const routeRawData of routesRawData) {
            const routeTrips = [];

            routes[routeRawData.id] = {
                data: routeRawData,
                // stops: [],
                trips: trips[routeRawData.id],
            };
        }

        for (const [routeId, route] of Object.entries(routes)) {
            const stopCoordinates = route.trips.map((trip) => [trip.latitude, trip.longitude]);

            map.addSource(`route_${routeId}`, {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: [
                        {
                            'type': 'Feature',
                            'geometry': {
                                'type': 'Point',
                                'coordinates': stopCoordinates,
                            }
                        }
                    ],
                },
            });
        }

        const stopCoordinates = stopsRawData.map((stopRawData) => [stopRawData.stop_lon, stopRawData.stop_lat]);
        map.addSource(`opentije_bus_stops`, {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: [
                    {
                        'type': 'Feature',
                        'geometry': {
                            'type': 'MultiPoint',
                            'coordinates': stopCoordinates,
                        }
                    }
                ],
            },
        });

        // const stopsFeatures = stops.data.map(stop => ({
        //     type: 'Feature',
        //     geometry: {
        //         type: 'Point',
        //         coordinates: [stop.stop_lon, stop.stop_lat],
        //     }
        // }));
        // map.addSource('bus_stops', {
        //     type: 'geojson',
        //     data: {
        //         type: 'FeatureCollection',
        //         features: stopsFeatures,
        //     },
        // });
        map.addLayer({
            id: 'opentije_bus_stops',
            type: 'circle',
            source: 'opentije_bus_stops'
        });
    });

    return (
        <div className="map__container">
            <div className="map__sidebar"></div>
            <div className="map__canvas-container">
                <div id="map" className="map__canvas"></div>
                <div class={`${style.searchContainer} map__search-box`}>
                    <input placeholder="Search in Tije" class={style.searchInput} />
                </div>
            </div>
        </div>
    );
};
