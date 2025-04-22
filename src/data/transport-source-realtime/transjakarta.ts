export type BusPosition = {
  route_color: string;
  route_code: string;
  route_text_color: string;
  latitude: number;
  longitude: number;
};

export type BusPositions = {
  busData: Array<BusPosition>;
};

export class RealtimeBusLocationSocket {
  private socket: WebSocket | undefined = undefined;
  private _onUpdate: ((data: BusPositions) => void) | undefined = undefined;

  onPositionUpdate(onUpdate: (data: BusPositions) => void) {
    this._onUpdate = onUpdate;
  }

  async connect() {
    await new Promise<void>((resolve, reject) => {
      if (this.socket) {
        resolve();
        return;
      }
      this.socket = new WebSocket("wss://opentije-realtime-bus.andra.id/");
      this.socket.onmessage = (event) => {
        // Don't care about error for now
        try {
          const data = JSON.parse(event.data) as BusPositions;
          this._onUpdate?.(data);
        } catch (error) {
          console.error(error);
        }
      };
      this.socket.onopen = () => {
        resolve();
      };
      this.socket.onerror = (error) => {
        reject(error);
      };
    });
  }

  async disconnect() {
    await new Promise<void>((resolve, reject) => {
      if (!this.socket) {
        return;
      }
      this.socket.onopen = () => {
        resolve();
      };
      this.socket.onerror = (error) => {
        reject(error);
      };
      this.socket.close();
    });
  }
}
