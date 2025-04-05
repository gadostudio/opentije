import { TransportControllerProvider } from "../../data/states/transport-controller";
import { TransportModeDataSourceType } from "../../data/transport-mode";
import { loadRailsTransportMode } from "../../data/transport-source/rails";
import { loadTransjakartaTransportMode } from "../../data/transport-source/transjakarta";
import { TransjakartaDetailPage } from "../../ui/transjakarta/TransjakartaDetailPage";
import { TransjakartaPage } from "../../ui/transjakarta/TransjakartaPage";

export default function Detail() {
    return (
        <TransportControllerProvider
            register={[
                {
                    mode: TransportModeDataSourceType.Transjakarta,
                    loader: loadTransjakartaTransportMode,
                },
            ]}
        >
            <TransjakartaDetailPage />
        </TransportControllerProvider>
    );
}
