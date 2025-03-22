import { HomePage } from "../ui/home/HomePage";
import { TransportDataProvider } from "../data/transport-data";
import { SidebarStateProvider } from "../data/sidebar-state";
import { TransportControllerProvider } from "../data/transport-controller";

export default function Index() {
    return (
        <TransportControllerProvider>
            <SidebarStateProvider>
                <HomePage />
            </SidebarStateProvider>
        </TransportControllerProvider>
    );
}
