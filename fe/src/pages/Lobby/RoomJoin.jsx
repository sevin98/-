import React, { useState } from 'react';
import axios from '../axiosConfig';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import './Loby.css';

const RoomJoin    = () => {
    const navigate = useNavigate();
    const [roomNumber, setRoomNumber] = useState('');
    const [roomPassword, setRoomPassword] = useState('');

    const handleJoinRoom = async (e) => {
        e.preventDefault();
        
        try {
            const response = await axios.post(`/api/rooms/${roomNumber}/join`, {
                password: roomPassword
            });

            if (response.status === 200) {
                // sessionStorage에 데이터 저장
                sessionStorage.setItem('roomNumber', roomNumber);
                sessionStorage.setItem('roomPassword', roomPassword);

                // 응답에서 구독 정보 추출 (가정)
                const { roomSubscriptionInfo, playerSubscriptionInfo } = response.data;

                // 상태를 navigate 호출 시 전달
                navigate('/WaitingRoom', {
                    state: {
                        roomSubscriptionInfo,
                        playerSubscriptionInfo
                    }
                });
            }
        } catch (error) {
            if (error.response && error.response.status === 404) {
                toast.error('해당하는 방이 없습니다.');
            } else if (error.response && error.response.status === 401) {
                toast.error('비밀번호가 틀립니다.');
            } else {
                toast.error('방 참가 중 오류가 발생했습니다.');
            }
        }
    };

    return (
        <div className="wrapper">
            <form onSubmit={handleJoinRoom}>
                <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="방 번호"
                    required
                />
                <input
                    type="password"
                    value={roomPassword}
                    onChange={(e) => setRoomPassword(e.target.value)}
                    placeholder="비밀번호"
                    required
                />
                <button type="submit">방 참가</button>
            </form>
        </div>
    );
};

export default RoomJoin;
