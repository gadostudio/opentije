import { TransportControllerProvider } from "../../data/states/transport-controller";
import { TransportModeDataSourceType } from "../../data/transport-mode";
import { loadRailsTransportMode } from "../../data/transport-source/rails";
import { loadTransjakartaTransportMode } from "../../data/transport-source/transjakarta";
import { TransjakartaPage } from "../../ui/transjakarta/TransjakartaPage";

export default function Index() {
    return (
        <TransportControllerProvider
            register={[
                {
                    mode: TransportModeDataSourceType.Transjakarta,
                    loader: loadTransjakartaTransportMode,
                },
            ]}
        >
            <TransjakartaPage />
        </TransportControllerProvider>
    );
}
