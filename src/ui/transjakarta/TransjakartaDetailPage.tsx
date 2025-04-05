import { useParams } from "@solidjs/router";
import { useTransportController } from "../../data/states/transport-controller";
import { For } from "solid-js";
import { Error404 } from "../error_404/Error404";

export const TransjakartaDetailPage = () => {
    const { getRoute, loadingModes } = useTransportController();
    const params = useParams();
    const route = getRoute(params.id);

    if (loadingModes().transjakarta.type === 'loading') {
        return 'Loading...';
    }

    if (!route) {
        return <Error404 />;
    }

    return (
        <div>
            <div>
                <img src="" />
                <h1>Transjakarta</h1>
            </div>
            <div>
                <h2>{params.id}</h2>
                <p>{route.fullName}</p>
            </div>
            <For each={route.trips}>
                {(trip) => {
                    return (
                        <div>
                            <h3>Arah {trip.id}</h3>
                        </div>
                    );
                }}
            </For>
        </div>
    );
};
