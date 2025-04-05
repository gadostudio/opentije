import { useTransportController } from "../../data/states/transport-controller";

export const TransjakartaPage = () => {
    const { routes } = useTransportController();

    return (
        <div>
            <h3>Rute</h3>
            <ul>
                {routes().map((route) => (
                    <li>{route.fullName}</li>
                ))}
            </ul>
        </div>
    );
};
