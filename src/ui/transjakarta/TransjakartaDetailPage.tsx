import { useParams } from "@solidjs/router";
import { useTransportController } from "../../data/states/transport-controller";

export const TransjakartaDetailPage = () => {
    const { getRoute } = useTransportController();
    const params = useParams();

    return (
        <div>
            <h3>Rute {params.id}</h3>
        </div>
    );
};
