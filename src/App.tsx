import { Component } from "solid-js";
import { HomePage } from "./ui/home/HomePage";
import { TransportDataProvider } from "./data/transport-data";
import { SidebarStateProvider } from "./data/sidebar-state";

const App: Component = () => {
    return (
        <TransportDataProvider>
            <SidebarStateProvider>
                <HomePage />
            </SidebarStateProvider>
        </TransportDataProvider>
    );
};

export default App;
