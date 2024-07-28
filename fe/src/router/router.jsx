import { createBrowserRouter } from 'react-router-dom';

import LoginForm from "../pages/LoginForm/LoginForm";
import Lobby from "../pages/Lobby/Lobby";
import LobbyCreate from "../pages/Lobby/LobbyCreate";
import LobbyJoin from "../pages/Lobby/LobbyJoin";
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
        path:'/LobbyCreate',
        element:<LobbyCreate/>,
        // errorElement:<NotFound />
    },
    {
        path:'/LobbyJoin',
        element:<LobbyJoin/>,
        // errorElement:<NotFound />
    },
    {
        path:'/WaitingRoom',
        element:<WaitingRoom/>,
        // errorElement:<NotFound />
    },
    {
        path:'/GameComponent',
        element:<PhaserGame/>,
        // errorElement:<NotFound />
    },

]);
  
  export default Router;