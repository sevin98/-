import { Client } from "@stomp/stompjs";
import { WebSocket } from "ws";
import axios from "axios";

const HTTP_API_URL_PREFIX = "http://localhost:8080/api";
const { accessToken, userProfile } = (await axios.post(`${HTTP_API_URL_PREFIX}/auth/guest/sign-up`)).data;

// Web Socket Client
const client = new Client({
  webSocketFactory: () => {
    return new WebSocket("ws://localhost:8080/ws", undefined, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },
  onConnect: async () => {
    // 방 만들기
    const createdRoom = (
      await axios.post(
        `${HTTP_API_URL_PREFIX}/rooms`,
        {
          password: null,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
    ).data;

    // 방 입장에 필요한 토큰 발급
    const token = (
      await axios.post(
        `${HTTP_API_URL_PREFIX}/rooms/${createdRoom.roomNumber}/join`,
        {
          password: null,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
    ).data.token;

    // 방 입장 토큰을 사용하여 방 구독
    client.subscribe(
      `/topic/rooms/${createdRoom.roomNumber}`,
      async (message) => {
        console.log(`Message from room ${createdRoom.roomNumber}: ${message.body}`);
      },
      {
        subscriptionToken: token,
      }
    );

    // 메시지 수신 처리부터 해주고 (구독!!!)
    // client.subscribe("/topic/messages", (message) => {
    //   console.log(message.body);
    // });

    // // 메시지 전송해서 보낸 메시지가 그대로 돌아오면 성공
    // client.publish({
    //   destination: "/ws/send-message",
    //   body: "Hello, STOMP",
    // });
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
