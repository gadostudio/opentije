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
                    Discover bus stops and routes on the map for all bus
                    services in Jakarta, complete with real-time bus arrival
                    information and an overview of passing routes at each stop.
                </p>
                <p>Built with ❤️ by Gado Project.</p>
                <p>
                    No affiliation with PT. Transjakarta. Just for demonstration
                    work.
                </p>
                <p>
                    Visit our github page{" "}
                    <a href="https://github.com/gadostudio">Here</a>
                </p>
                <p>For inquires please email: andra.antariksa[at]gmail.com</p>
                <button onClick={() => param.onHide()}>Close</button>
            </div>
        </Show>
    );
};
