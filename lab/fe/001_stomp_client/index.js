import { Client } from "@stomp/stompjs";
import { WebSocket } from "ws";

Object.assign(global, { WebSocket });

const client = new Client({
  brokerURL: "wss://i11a410.p.ssafy.io/staging/ws",
  //   brokerURL: "ws://localhost:8080/ws",
  onConnect: () => {
    console.log("Connected to web socket server");
    client.subscribe("/topic/messages", (message) => {
      console.log(`Received message: ${message.body}`);
    });

    client.publish({
      destination: "/ws/send-message",
      body: "Hello from client",
    });
  },
});

client.activate();
