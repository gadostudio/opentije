import { Show } from "solid-js";
import style from "./about.module.scss";

interface AboutModalParam {
    show: any;
    onHide: () => void;
}

export const AboutModal = (param: AboutModalParam) => {
    return (
        <Show when={param.show}>
            <div class={style.overlay}>
                <h1>About OpenTije 🚌🗺️</h1>
                <p>
                    Discover stops and routes on the map for all bus & train
                    services in Jakarta, complete with real-time arrival
                    information and an overview of passing routes at each stops.
                </p>
                <p>Built with ❤️ by Gado Studio.</p>
                <p>No affiliation with other service provides.</p>
                <p>For inquires please email: andra.antariksa[at]gmail.com</p>
                <button onClick={() => param.onHide()}>Close</button>
            </div>
        </Show>
    );
};
