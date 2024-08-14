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

        axios
            .get(apiUrl)
            .then((response) => {
                // console.log(response);
                const data = response.data;

                if (Array.isArray(data)) {
                    setRanking((prev) => (reset ? data : [...prev, ...data]));
                } else if (data.results && Array.isArray(data.results)) {
                    setRanking((prev) =>
                        reset ? data.results : [...prev, ...data.results]
                    );
                } else {
                    console.error("Unexpected API response format:", data);
                }

                if (
                    data.length === 0 ||
                    (data.results && data.results.length === 0)
                ) {
                    setHasMore(false);
                }
            })
            .catch((error) => {
                console.error("API Error:", error);
            });
    };

    const loadMyRanking = () => {
        axios
            .get("/api/rankings/me")
            .then((response) => setMyRanking(response.data));
    };

    const onBackToLobbyBtnClicked = () => {
        navigate(LOBBY_ROUTE_PATH);
    };

    return (
            <div className="ranking-wrapper rpgui-content">
                <BackToLobbyButton onClick={onBackToLobbyBtnClicked} />
                <div className="ranking-section">
                <ul>
                    {Array.isArray(ranking) &&
                        ranking.map((user, index) => (
                            <li key={index}>
                                {index + 1}. {user.nickname} - Wins: {user.wins}
                                , Catch Count: {user.catchCount}, Survival Time:{" "}
                                {user.survivalTime}
                            </li>
                        ))}
                    <div ref={ref} />
                    </ul>
                </div>

            {myRanking && (
                <div className="my-ranking rpgui-container framed">
                    <h2>Your Ranking</h2>
                    <p>Nickname : {myRanking.nickname}</p>
                    <p>Wins : {myRanking.wins}</p>
                    <p>Catch Count: {myRanking.catchCount}</p>
                    <p>Survival Time: {myRanking.survivalTime}</p>
                </div>
                    )}
            <div className="ranking-controls">
                <button
                    className="rpgui-button"
                    onClick={() => setSortCriteria("wins")}
                >
                    <h2>승수 순</h2>
                </button>
                <button
                    className="rpgui-button"
                    onClick={() => setSortCriteria("catch-count")}
                >
                    <h2>잡은 수 순</h2>
                </button>
                <button
                    className="rpgui-button"
                    onClick={() => setSortCriteria("survival-time")}
                >
                    <h2>생존 시간 순</h2>
                </button>
            </div>
    </div>
    );
}

export default RankingPage;
