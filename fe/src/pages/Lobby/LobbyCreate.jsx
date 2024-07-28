import react, {useState, } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import "./Loby.css";

const LobbyCreate = () => {

    const navigate = useNavigate();

    const [roomPassword, setRoomPassword] = useState("");

    const createRoom = (e) =>{
        e.preventDefault()

        axios.post('http://i11a410.p.ssafy.io/staging',{
            password:roomPassword
        })
        .then((res)=>{
            console.log(res.data)
        })
        .catch((err)=>{
            console.log(err)
        })

        console.log(roomPassword)
        navigate('../WaitingRoom') //대기실로 이동 
    }

    return (
        <div className="wrapper">
            <h1 >방 생성</h1>
            <form action="">
                <input className='input-box' type="password" placeholder='방 비밀번호 생성' id='roomPassword'
                onChange={(e) => setRoomPassword(e.target.value)}></input>
            <p style={{color: 'red'}}>*비밀번호가 없으면 공개 방으로 생성 됩니다</p>

                <button type="submit" onClick={createRoom}>
                    <p>방 만들기 </p>
                </button>
            </form>
        </div>
    );
};

export default LobbyCreate;
