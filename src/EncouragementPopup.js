import React, { useEffect, useState } from 'react';
import './EncouragementPopup.css';

const EncouragementPopup = ({ message, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`encouragement-popup ${visible ? 'visible' : ''}`}>
      <p>{message}</p>
    </div>
  );
};

export default EncouragementPopup;