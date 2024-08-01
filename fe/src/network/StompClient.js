import { Client } from "@stomp/stompjs";

const createStompClient = (url) => {
    return new Client({
        brokerURL: url, //실제 WebSocket 서버 URL로 변경해야 함
        connectHeaders: {},
        debug: function (str) {
            console.log(str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
            console.log("Connected to STOMP");
        },
        onDisconnect: () => {
            console.log("Disconnected from STOMP");
        },
        onStompError: (frame) => {
            console.error("STOMP Error: " + frame);
        },
    });
};

export default createStompClient;
