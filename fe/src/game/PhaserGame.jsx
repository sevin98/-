import PropTypes from "prop-types";
import { forwardRef, useEffect, useLayoutEffect, useRef, useState } from "react";
import StartGame from "./main";
import eventBus from "./EventBus";
import { useNavigate } from "react-router-dom";
import { LOBBY_ROUTE_PATH } from "../pages/Lobby/Lobby";
import axios from "../network/AxiosClient";

export const PhaserGame = forwardRef(function PhaserGame(
    { currentActiveScene },
    ref
) {
    const game = useRef();
    const [isGameDestroyed, setIsGameDestroyed] = useState(false);
    const navigate = useNavigate();

    useLayoutEffect(() => {
        if (game.current === undefined && isGameDestroyed === false) {
            game.current = StartGame("game-container");

            if (ref !== null) {
                ref.current = { game: game.current, scene: null };
            }
        }

        return () => {
            if (game.current) {
                game.current.destroy(true);
                game.current = undefined;
                setIsGameDestroyed(true);
            }
        };
    }, [ref]);

    useEffect(() => {
        // Phaser 게임 생성 및 current-scene-ready 이벤트 리스너 설정
        eventBus.on("current-scene-ready", (currentScene) => {
            if (currentActiveScene instanceof Function) {
                currentActiveScene(currentScene);
            }
            if (ref.current) {
                ref.current.scene = currentScene;
            }
        });
    
        return () => {
            if (game.current) {
                game.current.destroy(true);
                game.current = undefined;
            }
            eventBus.removeListener("current-scene-ready");
        };
    }, [currentActiveScene, ref]);
    
    useEffect(() => {
        // 라우팅 이벤트 리스너 설정
        const handleRoutingEvent = (event) => {
            const { path, roomNumber } = event.detail;
            if (game.current) {
                game.current.destroy(true);
                game.current = undefined;
                setIsGameDestroyed(true);
            }

            // 방 나가기 결과에 상관없이 로비로 이동
            axios.post(`/api/rooms/${roomNumber}/leave`).finally(() => {
                navigate(path, { replace: true })
            })
        };
    
        window.addEventListener("phaser-route", handleRoutingEvent);
    
        return () => {
            if (game.current) {
                game.current.destroy(true);
                game.current = undefined;
                setIsGameDestroyed(true);
            }
            window.removeEventListener("phaser-route", handleRoutingEvent);
        };
    }, [navigate]);

    return <div id="game-container"></div>;
});

export const PHASER_GAME_ROUTE_PATH = "/GameStart";

export default PhaserGame;

PhaserGame.propTypes = {
    currentActiveScene: PropTypes.func,
};
