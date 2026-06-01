import React, { useState, useEffect } from 'react';
import './Slider.css';
import img1 from '../../images/image1.jpeg';
import img2 from '../../images/image2.jpeg';
import img3 from '../../images/image3.jpeg';
import img4 from '../../images/image4.jpeg';

const defaultImages = [img1, img2, img3, img4];

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