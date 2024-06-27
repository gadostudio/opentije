import {Component, onMount} from 'solid-js';
import maplibregl from 'maplibre-gl';
import {jakartaCoordinate} from "./constants";

const Map: Component = () => {

    onMount(() => {
        const map = new maplibregl.Map({
            container: 'map',
            style: 'https://api.maptiler.com/maps/bright/style.json?key=6VuZySsdw7PsGcj8f6tz',
            center: [jakartaCoordinate.longitude, jakartaCoordinate.latitude],
            zoom: 12,
        });
    });

    return (
        <div className="map__container">
            <div className="map__sidebar"></div>
            <div className="map__canvas-container">
                <div id="map" className="map__canvas"></div>
                <div className="map__search-box"></div>
            </div>
        </div>
    );
};

const App: Component = () => {
    return <Map />;
};

export default App;