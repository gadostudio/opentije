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
                <h1>About 🚃🚌🗺️</h1>
                <p>
                    Tije stands for Transportasi Jabodetabek (Greater
                    Jabodetabek transporations).
                </p>
                <p>
                    Discover bus stops and routes on the map for all public
                    transportation services in Jabodetabek, complete with
                    real-time bus arrival information and an overview of passing
                    routes at each stop/station.
                </p>
                <p>
                    Built with ❤️ by Gado Project. Visit our github page{" "}
                    <a href="https://github.com/gadostudio">Here</a>
                </p>
                <p>For inquires please email: andra.antariksa[at]gmail.com</p>
                <p>
                    No affiliation with any other company. Transjakarta bus data
                    are owned &copy; PT. Transportasi Jakarta
                </p>
                <button onClick={() => param.onHide()}>Close</button>
            </div>
        </Show>
    );
};
