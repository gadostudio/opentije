import { HomePage } from "../ui/home/HomePage";
import { MapUiStateProvider } from "../data/states/sidebar-state";
import { TransportControllerProvider } from "../data/states/transport-controller";
import { loadTransjakartaTransportMode } from "../data/transport-source/transjakarta";
import { TransportModeDataSourceType } from "../data/transport-mode";
import { loadRailsTransportMode } from "../data/transport-source/rails";

export default function Index() {
    return (
        <TransportControllerProvider
            register={[
                {
                    mode: TransportModeDataSourceType.Rails,
                    loader: loadRailsTransportMode,
                },
                {
                    mode: TransportModeDataSourceType.Transjakarta,
                    loader: loadTransjakartaTransportMode,
                },
            ]}
        >
            <MapUiStateProvider>
                <HomePage />
            </MapUiStateProvider>
        </TransportControllerProvider>
    );
}
