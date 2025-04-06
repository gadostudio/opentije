"use client";

import { useMapUiState } from "@/data/map-ui";
import { Stop } from "@/domain/transport-mode";
import style from "./RightPopover.module.scss";
import { PopOverBusStop } from "@/data/popover";

export const RightPopover = () => {
  const { rightPopover } = useMapUiState();

  const openedClass = rightPopover !== null ? style.opened : "";

  return (
    <div className={`${style.container} ${openedClass}`}>
      {rightPopover?.type === "stop" && <BusStop stop={rightPopover.stop} />}
    </div>
  );
};

type BusStopProps = {
  stop: Stop;
};

const BusStop = ({ stop }: BusStopProps) => {
  const { closeRightPopover } = useMapUiState();

  return (
    <div>
      <div className={style.header}>
        <p className={style["station-name"]}>{stop.name}</p>
        <button
          className={style["close-button"]}
          onClick={() => closeRightPopover()}
        >
          ×
        </button>
      </div>
      <div>
        {stop.servedRoutes.map((route) => (
          <p key={route.id}>{route.id}</p>
        ))}
      </div>
    </div>
  );
};
