import React, { useEffect, useState, useRef } from 'react';
import './EncouragementPopup.css';

const EncouragementPopup = ({ message, onClose }) => {
  const [visible, setVisible] = useState(false);
  const audioRef = useRef(new Audio('/sounds/encouragement.mp3'));

  useEffect(() => {
    setVisible(true);
    
    // Play the sound
    audioRef.current.play().catch(error => {
      console.warn("Audio playback failed:", error);
    });

    const visibilityTimer = setTimeout(() => {
      setVisible(false);
    }, 5000); // Popup visible for 5 seconds

    const closeTimer = setTimeout(() => {
      onClose();
    }, 5500); // Call onClose after fade-out animation (500ms after visibility change)

    return () => {
      clearTimeout(visibilityTimer);
      clearTimeout(closeTimer);
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    };
  }, [onClose]);

  return (
    <>
      <div className={`encouragement-popup-overlay ${visible ? 'visible' : ''}`} />
      <div className={`encouragement-popup ${visible ? 'visible' : ''}`}>
        <p>{message}</p>
      </div>
    </>
  );
};

export default EncouragementPopup;