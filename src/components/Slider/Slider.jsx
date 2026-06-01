import React, { useState, useEffect } from 'react';
import './Slider.css';

const defaultImages = [
  'https://via.placeholder.com/800x400/007bff/ffffff?text=Курсы+Повышения+Квалификации',
  'https://via.placeholder.com/800x400/0d47a1/ffffff?text=Профессиональная+Переподготовка',
  'https://via.placeholder.com/800x400/28a745/ffffff?text=Охрана+Труда',
  'https://via.placeholder.com/800x400/17a2b8/ffffff?text=Сертификация'
];

const Slider = ({ images = defaultImages }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  const goPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <div className="slider-container">
      <div className="slider">
        <button className="slider-btn prev" onClick={goPrev}>‹</button>
        <div className="slider-track">
          {images.map((img, idx) => (
            <div
              key={idx}
              className={`slide ${idx === currentIndex ? 'active' : ''}`}
            >
              <img src={img} alt={`slide ${idx + 1}`} />
            </div>
          ))}
        </div>
        <button className="slider-btn next" onClick={goNext}>›</button>
      </div>
      <div className="slider-dots">
        {images.map((_, idx) => (
          <span
            key={idx}
            className={`dot ${idx === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(idx)}
          />
        ))}
      </div>
    </div>
  );
};

export default Slider;