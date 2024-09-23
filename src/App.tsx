import { Component, createContext } from "solid-js";
import { HomePage } from "./ui/home/HomePage";
import { TransportDataProvider } from "./data/transport-data";

const App: Component = () => {
  return <TransportDataProvider><HomePage /></TransportDataProvider>;
};

export default App;
