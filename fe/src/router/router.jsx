import { createBrowserRouter } from "react-router-dom";

import LoginForm, {
    ROUTE_PATH as LOGIN_FORM_ROUTE_PATH,
} from "../pages/LoginForm/LoginForm";
import Lobby, { ROUTE_PATH as LOBBY_ROUTE_PATH } from "../pages/Lobby/Lobby";
import RoomCreate, {
    ROUTE_PATH as ROOM_CREATE_ROUTE_PATH,
} from "../pages/Lobby/RoomCreate";
import RoomJoin, {
    ROUTE_PATH as ROOM_JOIN_ROUTE_PATH,
} from "../pages/Lobby/RoomJoin";
import WaitingRoom, {
    ROUTE_PATH as WAITING_ROOM_ROUTE_PATH,
} from "../pages/WaitingRoom/WaitingRoom";
import PhaserGame, {
    ROUTE_PATH as PHASER_GAME_ROUTE_PATH,
} from "../game/PhaserGame";

const Router = createBrowserRouter([
    {
        path: LOGIN_FORM_ROUTE_PATH,
        element: <LoginForm />,
        // errorElement:<NotFound />
    },
    {
        path: LOBBY_ROUTE_PATH,
        element: <Lobby />,
        // errorElement:<NotFound />
    },
    {
        path: ROOM_CREATE_ROUTE_PATH,
        element: <RoomCreate />,
        // errorElement:<NotFound />
    },
    {
        path: ROOM_JOIN_ROUTE_PATH,
        element: <RoomJoin />,
        // errorElement:<NotFound />
    },
    {
        path: WAITING_ROOM_ROUTE_PATH,
        element: <WaitingRoom />,
        // errorElement:<NotFound />
    },
    {
        path: PHASER_GAME_ROUTE_PATH,
        element: <PhaserGame />,
        // errorElement:<NotFound />
    },
]);

export default Router;
