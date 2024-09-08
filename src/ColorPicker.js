import React, { useEffect, useRef } from 'react';
import './ColorPicker.css';

const ColorPicker = ({ colors, onColorSelect, onClose, anchorEl }) => {
  const popupRef = useRef(null);

  useEffect(() => {
    const updatePosition = () => {
      if (anchorEl && popupRef.current) {
        const anchorRect = anchorEl.getBoundingClientRect();
        const popupRect = popupRef.current.getBoundingClientRect();
        
        popupRef.current.style.top = `${anchorRect.top + anchorRect.height / 2 - popupRect.height / 2}px`;
        popupRef.current.style.left = `${anchorRect.left - popupRect.width - 10}px`;
      }
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [anchorEl]);

  return (
    <div className="color-picker-overlay" onClick={onClose}>
      <div 
        ref={popupRef}
        className="color-picker-popup" 
        onClick={(e) => e.stopPropagation()}
      >
        {colors.map((color, index) => (
          <button
            key={index}
            className="color-option"
            style={{ backgroundColor: color }}
            onClick={() => onColorSelect(color)}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorPicker;