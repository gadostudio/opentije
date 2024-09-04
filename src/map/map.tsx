import {Component, onMount} from 'solid-js';
import maplibregl from 'maplibre-gl';
import {jakartaCoordinate} from "../constants";
import {test} from "../consumer";
import style from "./map.module.scss";

export const Map: Component = () => {
    onMount(async () => {
        const map = new maplibregl.Map({
            container: 'map',
            style: '/assets/style.json',
            center: [jakartaCoordinate.longitude, jakartaCoordinate.latitude],
            zoom: 12,
        });

        const {routes, stops} = await test();

        map.addSource('bus_stops', {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: stops.data.map(stop => ({
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [stop.stop_lon, stop.stop_lat],
                    }
                })),
            },
        });
        map.addLayer({
            id: 'bus_stops',
            type: 'circle',
            source: 'bus_stops'
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
