import { Component } from "solid-js";
import { Link, MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import "./global.scss";
import { useGoogleAnalytics } from "./ui/hooks/useGoogleAnalytics";

const App: Component = () => {
    useGoogleAnalytics();

    return (
        <Router
            root={(props) => (
                <MetaProvider>
                    <Title>Open Tije</Title>
                    <Suspense>{props.children}</Suspense>
                    <Link
                        rel="stylesheet"
                        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
                        integrity="sha512-Evv84Mr4kqVGRNSgIGL/F/aIDqQb7xQ2vcrdIwxfjThSH8CSR7PBEakCr51Ck+w+/U6swU2Im1vVX0SVk9ABhg=="
                        crossorigin="anonymous"
                        referrerpolicy="no-referrer"
                    />
                </MetaProvider>
            )}
        >
            <FileRoutes />
        </Router>
    );
};

export default App;
