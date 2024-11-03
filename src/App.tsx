import { Component } from "solid-js";
import { MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import "./global.scss";

const App: Component = () => {
    return (
        <Router
            root={(props) => (
                <MetaProvider>
                    <Title>Open Tije</Title>
                    <Suspense>{props.children}</Suspense>
                </MetaProvider>
            )}
        >
            <FileRoutes />
        </Router>
    );
};

export default App;
