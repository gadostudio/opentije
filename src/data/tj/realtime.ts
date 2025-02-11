let socket: WebSocket | undefined = undefined;

export function getRealtimeSocket(): WebSocket {
    if (!socket) {
        socket = new WebSocket('wss://opentije-realtime-bus.andra.id/');
    }
    return socket;
}
