import { createBrowserRouter } from 'react-router-dom';

import LoginForm from "../pages/LoginForm/LoginForm";
import Lobby from "../pages/Lobby/Lobby";
import RoomCreate from "../pages/Lobby/RoomCreate";
import RoomJoin from "../pages/Lobby/RoomJoin";
import WaitingRoom from "../pages/WaitingRoom/WaitingRoom";
import PhaserGame from '../game/PhaserGame';

const Router = createBrowserRouter ([
    {
        path:'/',
        element:<LoginForm/>,
        // errorElement:<NotFound />
    },
    {
        path:'/Lobby',
        element:<Lobby/>,
        // errorElement:<NotFound />
    },
    {
        path:'/RoomCreate',
        element:<RoomCreate/>,
        // errorElement:<NotFound />
    },
    {
        path:'/RoomJoin',
        element:<RoomJoin/>,
        // errorElement:<NotFound />
    },
    {
        path:'/WaitingRoom',
        element:<WaitingRoom/>,
        // errorElement:<NotFound />
    },
    {
        path:'/GameStart',
        element:<PhaserGame/>,
        // errorElement:<NotFound />
    },

]);
  
  export default Router;