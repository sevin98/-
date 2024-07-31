import { Client } from "@stomp/stompjs";
import { WebSocket } from "ws";
import axios from "axios";

// 이 값이 falsy하면 응답 받은 방 번호를 사용
const fixedRoomNumber = 1000;
const roomPassword = null;

const HTTP_API_URL_PREFIX = "http://localhost:8081/api";
const { accessToken, userProfile, webSocketConnectionToken } = (await axios.post(`${HTTP_API_URL_PREFIX}/auth/guest/sign-up`)).data;
console.log("로그인한 게스트의 닉네임: ", userProfile.nickname);

// Web Socket Client
const client = new Client({
  webSocketFactory: () => {
    return new WebSocket(`ws://localhost:8081/ws?token=${webSocketConnectionToken}`, undefined, {
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
          password: roomPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
    ).data;

    // 방 입장 및 Room/Player 구독 정보 받기
    const { roomSubscriptionInfo, playerSubscriptionInfo } = (
      await axios.post(
        `${HTTP_API_URL_PREFIX}/rooms/${fixedRoomNumber || createdRoom.roomNumber}/join`,
        {
          password: roomPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
    ).data;

    // 방에 입장해 있는 플레이어들 목록 (참가할 때마다 갱신됨)
    const joinedPlayers = [];
    // 방에 참가해 있으며, 레디 상태인 플레이어들 목록
    const readyPlayers = [];

    // 방 입장 토큰을 사용하여 방 채널 구독
    client.subscribe(
      roomSubscriptionInfo.topic,
      async (stompMessage) => {
        // 방으로부터 수신되는 메시지 처리
        const message = JSON.parse(stompMessage.body);
        // 방 입장
        if (message.type === "PLAYER_JOIN") {
          // (본인은 제외)
          const updatedJoinedPlayers = message.data;
          updatedJoinedPlayers.forEach((player) => {
            if (!joinedPlayers.find((p) => p.playerId === player.playerId)) {
              joinedPlayers.push(player);
              console.log(`[${player.playerNickname}]님이 입장했습니다.`, player);
            }
          });
        }
        // 레디
        else if (message.type === "PLAYER_READY") {
          // (본인은 제외)
          const updatedReadyPlayers = message.data;
          updatedReadyPlayers.forEach((player) => {
            if (!readyPlayers.find((p) => p.playerId === player.playerId)) {
              readyPlayers.push(player);
              console.log(`[${player.playerNickname}]님이 레디했습니다.`);
            }
          });
        }
        // 게임 시작 알림
        else if (message.type === "SUBSCRIBE_GAME") {
          const { subscriptionInfo, startsAfterMilliSec } = message.data;
          console.log(`게임이 ${startsAfterMilliSec}ms 후 시작됩니다. 게임 토픽: ${subscriptionInfo.topic}`);
          // 게임 토픽 구독
          client.subscribe(
            subscriptionInfo.topic,
            (stompMessage) => {
              const message = JSON.parse(stompMessage.body);
              if (message.type === "GAME_INFO") {
                console.log(`게임 정보: ${JSON.stringify(message.data)}`);
              } else if (message.type === "ROUND_CHANGE") {
                console.log(`라운드 변경: ${message.data.nextRound}/${message.data.totalRound}`);
              } else if (message.type === "PHASE_CHANGE") {
                console.log(`페이즈 변경: ${message.data.phase}, ${message.data.finishAfterMilliSec}ms 후 종료`);
              }
            },
            {
              subscriptionToken: subscriptionInfo.token,
            }
          );
        }
      },
      {
        subscriptionToken: roomSubscriptionInfo.token,
      }
    );

    // 플레이어 채널 구독
    client.subscribe(
      playerSubscriptionInfo.topic,
      (stompMessage) => {
        const message = JSON.parse(stompMessage.body);
        if (message.type === "INITIALIZE_PLAYER") {
          const { teamCharacter, playerPositionInfo, teamSubscriptionInfo } = message.data;
          console.log("팀:", teamCharacter);
          console.log("플레이어 시작 위치:", playerPositionInfo);

          client.subscribe(
            teamSubscriptionInfo.topic,
            (stompMessage) => {
              const message = JSON.parse(stompMessage.body);
              console.log(message);
              if (message.type === "SHARE_POSITION") {
                console.log(`[${message.data.playerId}]의 위치: ${message.data.x}, ${message.data.y}`);
              }
            },
            { subscriptionToken: teamSubscriptionInfo.token }
          );

          // // 팀 정보 수신
          // client.subscribe(
          //   {
          //     destination: teamSubscriptionInfo.topic,
          //   },
          //   (stompMessage) => {
          //     const message = JSON.parse(stompMessage.body);
          //     console.log(message);
          //     if (message.type === "SHARE_POSITION") {
          //       console.log(`[${message.data.playerNickname}]의 위치: ${message.data.x}, ${message.data.y}`);
          //     }
          //   },
          //   {
          //     headers: {
          //       Authorization: `Bearer ${accessToken}`,
          //     },
          //   }
          // );

          setTimeout(() => {
            setInterval(() => {
              client.publish({
                destination: `/ws/rooms/${fixedRoomNumber || createdRoom.roomNumber}/game/share-position`,
                body: JSON.stringify({
                  x: Math.random() * 100,
                  y: Math.random() * 100,
                  direction: "LEFT",
                }),
              });
            }, 800);
          }, 100);
        }
      },
      {
        subscriptionToken: playerSubscriptionInfo.token,
      }
    );

    // 레디
    console.log("3초 후 레디...");
    setTimeout(() => {
      client.publish({
        destination: `/ws/rooms/${fixedRoomNumber || createdRoom.roomNumber}/ready`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      // axios.post(`${HTTP_API_URL_PREFIX}/rooms/${fixedRoomNumber || createdRoom.roomNumber}/ready`, null, {
      //   headers: {
      //     Authorization: `Bearer ${accessToken}`,
      //   },
      // });
    }, 3000);

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
