import { Stop } from "./transport-mode";

export type PopOverBusStop = {
  type: "stop";
  stop: Stop;
};
export type PopOverState = PopOverBusStop | null;
