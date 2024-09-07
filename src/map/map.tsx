import {Component, createSignal, onMount} from 'solid-js';
import {Feature, Position} from "geojson";
import maplibregl from 'maplibre-gl';
import {jakartaCoordinate} from "../constants";
import {DefaultDict, getRawData, RouteRawData, ShapeRawData} from "../consumer";
import style from "./map.module.scss";
import { Route } from '../sidebar/routes';
import { Sidebar } from '../sidebar/sidebar';

type Trip = {
    routeId: string;
    shapes: Array<ShapeRawData>;
};

export type RouteData = {
    data: RouteRawData,
    // stops: Array<Stop>,
    trips: Array<Trip>,
};

export const MapCanvas: Component = () => {
    const [routes, setRoutes] = createSignal<Array<RouteData> | null>(null);

    onMount(async () => {
        const map = new maplibregl.Map({
            container: 'map',
            style: '/assets/style.json',
            center: [jakartaCoordinate.longitude, jakartaCoordinate.latitude],
            zoom: 12,
        });

        const {routesRawData, stopsRawData, tripsRawData, shapesRawData} = await getRawData();

        const tripShapes = new DefaultDict<string, Array<ShapeRawData>>(() => []);
        for (const shapeRawData of shapesRawData) {
            tripShapes.get(shapeRawData.shape_id).push(shapeRawData);
        }
        for (const shapes of tripShapes.values()) {
            shapes.sort((shape) => shape.shape_pt_sequence);
        }

        const trips = new DefaultDict<string, Array<Trip>>(() => []);
        for (const tripRawData of tripsRawData) {
            trips.get(tripRawData.route_id).push({
                routeId: tripRawData.trip_id,
                shapes: tripShapes.get(tripRawData.shape_id),
            });
        }

        const routes = new Map<string, RouteData>();
        // 1M for dev
        for (const routeRawData of routesRawData) {
            routes.set(routeRawData.route_id, {
                data: routeRawData,
                // stops: [],
                trips: trips.get(routeRawData.route_id),
            });
        }

        setRoutes([...routes.values()]);

        const pathsData: Array<Feature> = [];
        for (const route of routes.values()) {
            const routeShapes: Array<Array<Position>> = [];
            for (const trip of route.trips) {
                const shapes: Array<Position> = [];
                for (const shape of trip.shapes) {
                    shapes.push([shape.shape_pt_lon, shape.shape_pt_lat]);
                }
                routeShapes.push(shapes);
            }

            pathsData.push({
                type: 'Feature',
                geometry: {
                    type: 'MultiLineString',
                    coordinates: routeShapes,
                },
                properties: {
                    title: route.data.route_id,
                    color: `#${route.data.route_color}`,
                },
            });
        }

        const stopsData: Array<Feature> = stopsRawData.map((stopRawData) => ({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [
                    stopRawData.stop_lon,
                    stopRawData.stop_lat,
                ],
            },
            properties: {
                color: '#FF0000',
            },
        }));

        map.on('load', () => {
            map.addSource('opentije_bus_trips', {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: pathsData,
                },
            });
            map.addLayer({
                id: 'opentije_bus_trips',
                type: 'line',
                source: 'opentije_bus_trips',
                paint: {
                    "line-width": 3,
                    "line-color": ['get', 'color'],
                },
            });
            map.on('click', 'opentije_bus_trips', (e) => {
                console.log(e, e?.features);
            });
            // map.addLayer({
            //     id: 'opentije_bus_trips_symbol',
            //     type: 'symbol',
            //     source: 'opentije_bus_trips',
            //     layout: {
            //         'text-field': '{title}',
            //         "text-font": ['Noto Sans Regular']
            //     }
            // });

            map.addSource('opentije_bus_stops', {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: stopsData,
                },
            });
            map.addLayer({
                id: 'opentije_bus_stops',
                type: 'circle',
                source: 'opentije_bus_stops',
                paint: {
                    'circle-color': ['get', 'color'],
                },
            });
        });
    });

    return (
        <div class="map__container">
            <Sidebar routes={routes} />
            <div class="map__canvas-container">
                <div id="map" class="map__canvas"></div>
            </div>
        </div>
    );
};
