let socket = undefined;

export function getRealtimeSocket(): WebSocket {
    socket = new WebSocket('ws://opentije-realtime-bus.andra.id/');
    return socket;
}
