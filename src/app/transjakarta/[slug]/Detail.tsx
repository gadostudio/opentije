"use client";

import { loadTransjakartaTransportMode } from "@/data/transport-source-static/transjakarta";
import { Route, Stop } from "@/domain/transport-mode";
import { useTransjakartaRealtimePositions } from "@/hooks/transjakarta-realtime";
import { useEffect, useState } from "react";

type Props = {
    slug: string
};

export const Detail = ({ slug }: Props) => {
    const { busPositions } = useTransjakartaRealtimePositions();
    const routeBuses = busPositions.filter(bus => bus.route_code === slug);
    const [route, setRoute] = useState<Route | null>(null);

    useEffect(() => {
        (async () => {
            const modes = await loadTransjakartaTransportMode();
            const mode = modes[0];
            mode.init();

            const route_ = mode.routes[slug];
            setRoute(route_);
        })();
    }, [setRoute, slug]);

    return <p>{slug}</p>;
}