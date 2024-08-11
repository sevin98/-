import { useState, useEffect, useRef } from "react";
import "./MusicPlayer.css";

export const NORMAL_MUSIC = "/sounds/music/default_music.wav";
export const FAST_MUSIC = "/sounds/music/fast_music.wav";
export const PHASER_GAME_ROUTE_PATH = "/phaser-game";

export default function MusicPlayer() {
    const [bgmTrack, setBgmTrack] = useState(NORMAL_MUSIC);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);

    const onAudioPlay = () => {
        if (audioRef.current) {
            audioRef.current.play();
        }
    };

    const onAudioPause = () => {
        if (audioRef.current) {
            audioRef.current.pause();
        }
    };

    const onMusicEnded = () => {
        onAudioPlay();
    };

    const onSoundButtonClick = () => {
        if (isPlaying) {
            onAudioPause();
        } else {
            onAudioPlay();
        }
        setIsPlaying(!isPlaying);
    };

    // TODO : 게임 화면으로 이동했을 때 배경 음악 바꿔줘야 함

    return (
        <div className="music-player">
            <audio ref={audioRef} src={bgmTrack} onEnded={onMusicEnded} />
            <img
                className="music-player__sound-button"
                src={
                    isPlaying
                        ? "/image/sound-playing-button.png"
                        : "/image/sound-muted-button.png"
                }
                alt="Sound Button"
                onClick={onSoundButtonClick}
            />
        </div>
    );
}

