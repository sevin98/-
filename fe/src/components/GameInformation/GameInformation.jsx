import React, { useState } from 'react';
import Modal from 'react-modal';
import './GameInformation.css';
import "/public/rpgui/rpgui.css";

const slides = [
    {
        text: <h2 className="custom-heading">게임 방법 1</h2>,
        image: "/image/SlideSample1.png"
    },
    {
        text: <h2 className="custom-heading">게임 방법 2</h2>,
        image: "/image/SlideSample2.png"
    },
    {
        text: <h2 className="custom-heading">게임 방법 3</h2>,
        image: "/image/SlideSample3.png"
    }
];

const GameInformation = () => { 
    const [informationIsOpen, setInformationIsOpen] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);

    const openInformation = () => {
        setCurrentSlide(0);
        setInformationIsOpen(true); //설명을 열 때 슬라이드를 처음부터 다시 보기
    };
    const closeInformation = () => setInformationIsOpen(false);

    const handleNext = () => {
        setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
    };

    const handlePrev = () => {
        setCurrentSlide((prevSlide) => (prevSlide - 1 + slides.length) % slides.length);
    };

    return (
        <div className='information-container'>
            <button onClick={openInformation} className='info-button'>
                <img src="/image/menu-button-ui.png" alt="게임 설명" />
            </button>
            <Modal
                isOpen={informationIsOpen}
                onRequestClose={closeInformation}
                className="modal-content rpgui-container framed"
                overlayClassName="modal-overlay"
                closeTimeoutMS={300}
            >
                <button onClick={closeInformation} className="close-button">
                    <img src="/image/close-button-ui.png" alt="닫기" />
                </button>
                <div className="slide">
                    <p>{slides[currentSlide].text}</p>
                    <img src={slides[currentSlide].image} alt={`Slide ${currentSlide}`} className="slide-image" />
                </div>
                <button className="prev-button" onClick={handlePrev}>
                    <img src="/image/left-button-ui.png" alt="이전" />
                </button>
                <button className="next-button" onClick={handleNext}>
                    <img src="/image/right-button-ui.png" alt="다음" />
                </button>
            </Modal>
        </div>
    );
};

export default GameInformation;
