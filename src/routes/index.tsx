import { HomePage } from "../ui/home/HomePage";
import { MapUiStateProvider } from "../data/states/map-ui";
import { TransportControllerProvider } from "../data/states/transport-controller";

export default function Index() {
    return (
        <TransportControllerProvider>
            <MapUiStateProvider>
                <HomePage />
            </MapUiStateProvider>
        </TransportControllerProvider>
    );
}
