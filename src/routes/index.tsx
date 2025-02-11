import { HomePage } from "../ui/home/HomePage";
import { TransportDataProvider } from "../data/transport-data";
import { SidebarStateProvider } from "../data/sidebar-state";

export default function Index() {
    return (
        <TransportDataProvider>
            <SidebarStateProvider>
                <HomePage />
            </SidebarStateProvider>
        </TransportDataProvider>
    );
}
