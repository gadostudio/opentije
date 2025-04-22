import { MapUiStateProvider } from "@/data/map-ui";
import { MapCanvas } from "./components/MapCanvas";
import Sidebar from "./components/sidebar/Sidebar";
import { RightPopover } from "./RightPopover";
import { TransportControllerProvider } from "@/data/transport-controller";

export default function HomePage() {
  return (
    <TransportControllerProvider>
      <MapUiStateProvider>
        <div className="map__container">
          <Sidebar />
          <div className="map__canvas-container">
            <MapCanvas />
            <RightPopover />
          </div>
        </div>
      </MapUiStateProvider>
    </TransportControllerProvider>
  );
}
