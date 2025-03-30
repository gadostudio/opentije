import { HomePage } from "../ui/home/HomePage";
import { MapUiStateProvider } from "../data/states/sidebar-state";
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
