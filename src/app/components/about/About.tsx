import style from "./About.module.scss";

interface AboutModalParam {
  onHide: () => void;
}

export const AboutModal = (param: AboutModalParam) => {
  return (
    <div className={style.overlay}>
      <h1>About 🚃🚌🗺️</h1>
      <p>
        Tije stands for Transportasi Jabodetabek (Greater Jabodetabek
        transporations).
      </p>
      <p>
        Discover bus stops, stations, and routes on the map for all public
        transportation services in Jabodetabek, complete with real-time bus
        arrival information and an overview of passing routes at each
        stop/station.
      </p>
      <p>
        Visit{" "}
        <a href="https://github.com/gadostudio/opentije">
          our github page here
        </a>
      </p>
      <p>Built with ❤️ by Gado Studio.</p>
      <p>For inquires please email: andra.antariksa[at]gmail.com</p>
      <p>
        No affiliation with any other company or service providers. Transjakarta
        bus data are owned &copy; PT. Transportasi Jakarta
      </p>
      <button onClick={() => param.onHide()}>Close</button>
    </div>
  );
};
