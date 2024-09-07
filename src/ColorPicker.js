import React from 'react';
import './ColorPicker.css';

const ColorPicker = ({ colors, onColorSelect, onClose, position }) => {
  const { top, left } = position || { top: 0, left: 0 };

  return (
    <div className="color-picker-overlay" onClick={onClose}>
      <div 
        className="color-picker-popup" 
        onClick={(e) => e.stopPropagation()}
        style={{ 
          position: 'absolute',
          top: `${top}px`,
          left: `${left}px`
        }}
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