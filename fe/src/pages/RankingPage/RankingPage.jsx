import { useState, useEffect } from "react";
import axios from "axios";
import { useInView } from "react-intersection-observer";
import { BackToLobbyButton } from "../WaitingRoom/WaitingRoomComponents";
import "./RankingPage.css";
import { LOBBY_ROUTE_PATH } from "../Lobby/Lobby";
import { useNavigate } from "react-router-dom";

export const RANKING_PAGE_ROUTE_PATH = "/ranking";

function RankingPage() {
    const [ranking, setRanking] = useState([]);
    const [myRanking, setMyRanking] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [sortCriteria, setSortCriteria] = useState("wins");
    const { ref, inView } = useInView();
    const navigate = useNavigate();

    useEffect(() => {
        if (inView && hasMore) {
            loadMoreRankings();
        }
    }, [inView]);

    useEffect(() => {
        setPage(1);
        setRanking([]);
        setHasMore(true);
        loadMoreRankings(true);
        loadMyRanking();
    }, [sortCriteria]);

    const loadMoreRankings = (reset = false) => {
        const apiUrl = `/api/rankings/${sortCriteria}?page=${page}&size=10`;
    
        axios.get(apiUrl).then((response) => {
            // console.log(response);
            const data = response.data;
    
            if (Array.isArray(data)) {
                setRanking((prev) => reset ? data : [...prev, ...data]);
            } else if (data.results && Array.isArray(data.results)) {
                setRanking((prev) => reset ? data.results : [...prev, ...data.results]);
            } else {
                console.error("Unexpected API response format:", data);
            }
    
            if (data.length === 0 || (data.results && data.results.length === 0)) {
                setHasMore(false);
            }
        }).catch((error) => {
            console.error("API Error:", error);
        });
    };
    

    const loadMyRanking = () => {
        axios.get("/api/rankings/me").then((response) => setMyRanking(response.data));
    };

    const onBackToLobbyBtnClicked = () => {
        navigate(LOBBY_ROUTE_PATH);
    };

    return (
        <div id="container" className="rpgui-cursor-default ranking-page">
            <h1>Ranking</h1>

            <div className="ranking-controls">
                <button className="rpgui-button" onClick={() => setSortCriteria("wins")}>승수 순</button>
                <button className="rpgui-button" onClick={() => setSortCriteria("catch-count")}>잡은 수 순</button>
                <button className="rpgui-button" onClick={() => setSortCriteria("survival-time")}>생존 시간 순</button>
            </div>

            <BackToLobbyButton onClick={onBackToLobbyBtnClicked} className="rpgui-button" isDisabled={false}/>

            <div className="ranking-section">
                <ul>
                    {Array.isArray(ranking) && ranking.map((user, index) => (
                        <li key={index}>
                            {index + 1}. {user.nickname} - Wins: {user.wins}, Catch Count: {user.catchCount}, Survival Time: {user.survivalTime}
                        </li>
                    ))}
                    <div ref={ref} />
                </ul>
            </div>

            {myRanking && (
                <div className="my-ranking">
                    <h2>Your Ranking</h2>
                    <ul>
                        <li>
                            나의 전적 - {myRanking.nickname} - Wins: {myRanking.wins}, Catch Count: {myRanking.catchCount}, Survival Time: {myRanking.survivalTime}
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
}

export default RankingPage;
