import react, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {Client} from '@stomp/stompjs';
// import NodeWebSocket from 'ws';

import "./Loby.css";

const LobbyCreate = () => {
    const navigate = useNavigate();

    const [roomPassword, setRoomPassword] = useState("");
    const HTTP_API_URL_PREFIX = "https://i11a410.p.ssafy.io/staging/api";

    let userProfile;
    let accessToken;
    let webSocketConnectionToken;

    const createRoom = async (e) => {
        e.preventDefault();
        // 토큰 먼저 받는 코드, redux 사용이후 삭제 예정
        try {
            await axios
                .post(`${HTTP_API_URL_PREFIX}/auth/guest/sign-up`)
                .then((res) => {
                    // accessToken = res.data.accessToken;
                    // userProfile = res.data.userProfile;
                    webSocketConnectionToken = res.data.webSocketConnectionToken;
                    // console.log(webSocketConnectionToken)

                    const client = new Client({
                        webSocketFactory: () => {
                            return new WebSocket(`wss://i11a410.p.ssafy.io/staging/ws?token=${webSocketConnectionToken}`, undefined, {
                            });
                          },
                          debug: (str) => {
                            console.log(`debug: ${str}`);
                          },

                        onConnect: async() => {
                            console.log("connect");
                            // 방 만들기
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
                            ).data;
                        },
                        });
                    client.activate();
                });
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div className="wrapper">
            <h1>방 생성</h1>
            <form action="">
                <input
                    className="input-box"
                    type="password"
                    placeholder="방 비밀번호 생성"
                    id="roomPassword"
                    onChange={(e) => setRoomPassword(e.target.value)}
                ></input>
                <p style={{ color: "red" }}>
                    *비밀번호가 없으면 공개 방으로 생성 됩니다
                </p>

                <button type="submit" onClick={createRoom}>
                    <p>방 만들기 </p>
                </button>
            </form>
        </div>
    );
};

export default LobbyCreate;
