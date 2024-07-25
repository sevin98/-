import { Client } from "@stomp/stompjs";
import { WebSocket } from "ws";

// 로그인을 통해 발급 받은 Access Token
const token =
  "eyJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJsb2NhbGhvc3QiLCJ1dWlkIjoiMjMxMTY2NDQtM2I3MS00ODc5LWI0YTctMTFiN2I0MDgyYTcwIiwicm9sZSI6IkdVRVNUIiwidHlwZSI6IkFVVEhfQUNDRVNTIiwiaWF0IjoxNzIxODM0MDUyLCJleHAiOjE3MjE4MzQwNTN9._3cJ1RNy57YTUQf5oEMTxeoGtogn3-NALd_6mgnYe2g_Hi4SLQ682_uMTuaMUd3Ea2SSk2H29kZ7DrKFwocK-g";

// Web Socket Client
const client = new Client({
  // Stomp 연결에 사용할 WebSocket 객체를 받아오는 factory function
  webSocketFactory: () => {
    return new WebSocket("ws://localhost:8080/ws", undefined, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
  // 연결이 수립되었을 때 처리
  onConnect: () => {
    // 로그 남겨주고
    console.log("connected!");

    // 메시지 수신 처리부터 해주고 (구독!!!)
    client.subscribe("/topic/messages", (message) => {
      console.log(message.body);
    });

    // 메시지 전송해서 보낸 메시지가 그대로 돌아오면 성공
    client.publish({
      destination: "/ws/send-message",
      body: "Hello, STOMP",
    });
  },
  // 연결이 끊겼을 때 처리
  onDisconnect: () => {
    console.log("disconnected");
  },
  // 토큰 만료, 누락 등의 이유로 연결이 실패했을 때 처리
  onWebSocketError: (event) => {
    // 비활성화 하지 않으면 계속 요청하므로 deactivate() 호출
    client.deactivate();
  },
});

client.activate();
