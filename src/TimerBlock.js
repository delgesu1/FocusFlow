import React, { memo, useState, useEffect, useCallback, useRef } from 'react';
import TimeInput from './TimeInput';
import './TimerBlock.css'; // Make sure to create this CSS file

const TimerBlock = memo(({ 
  block, 
  isActive, 
  isCompleted, 
  currentTime, 
  blockDuration,
  dynamicAdjustment,
  isRunning, 
  onBlockClick, 
  onEditBlock, 
  onDeleteBlock, 
  onFinishEditing, 
  onDynamicTimeAdjustment,
  formatTime,
  onColorPickerOpen,
  blockColor
}) => {
  const [editedName, setEditedName] = useState(block.name);
  const [editedDuration, setEditedDuration] = useState(block.duration);
  const nameInputRef = useRef(null);
  const [progress, setProgress] = useState(100);
  const progressRef = useRef(null);
  const animationRef = useRef(null);

  // Function to lighten a color
  const lightenColor = useCallback((color, percent) => {
    const num = parseInt(color.replace("#",""), 16),
          amt = Math.round(2.55 * percent),
          R = (num >> 16) + amt,
          G = (num >> 8 & 0x00FF) + amt,
          B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255)).toString(16).slice(1);
  }, []);

  const lighterColor = lightenColor(blockColor, 10); // 10% lighter

  useEffect(() => {
    setEditedName(block.name);
    setEditedDuration(block.duration);
  }, [block.name, block.duration]);

  useEffect(() => {
    if (block.isEditing && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [block.isEditing]);

  useEffect(() => {
    if (progressRef.current) {
      const totalTime = blockDuration + dynamicAdjustment;
      const remainingTime = Math.max(0, currentTime);
      const progressPercentage = (remainingTime / totalTime) * 100;
      
      progressRef.current.style.transition = 'none';
      progressRef.current.style.width = `${100 - progressPercentage}%`;
      
      if (isActive && isRunning) {
        setTimeout(() => {
          if (progressRef.current) {
            progressRef.current.style.transition = `width ${remainingTime}s linear`;
            progressRef.current.style.width = '100%';
          }
        }, 0);
      }
    }
  }, [isActive, isRunning, currentTime, blockDuration, dynamicAdjustment]);

  const handleFinishEditing = useCallback(() => {
    onFinishEditing(block.id, editedName, editedDuration);
  }, [block.id, editedName, editedDuration, onFinishEditing]);

  const handleNameChange = (e) => {
    setEditedName(e.target.value);
  };

  const handleDurationChange = (newDuration) => {
    console.log('New duration:', newDuration);
    setEditedDuration(newDuration);
  };

  const handleTimeAdjustment = useCallback((adjustment) => {
    onDynamicTimeAdjustment(block.id, adjustment);
  }, [block.id, onDynamicTimeAdjustment]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      handleFinishEditing();
      e.preventDefault();
      e.stopPropagation();
    }
  }, [handleFinishEditing]);

  const progressPercentage = isActive ? (currentTime / blockDuration) * 100 : 100;

  const gradientStyle = {
    background: `linear-gradient(to right, ${blockColor || '#4CAF50'} ${progressPercentage}%, #f0f0f0 ${progressPercentage}%)`,
  };

  const displayTime = isActive ? formatTime(Math.max(0, currentTime)) : formatTime(blockDuration);

  return (
    <div
      className={`timer-bar ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isActive && isRunning ? 'glowing' : ''}`}
      style={{ 
        background: blockColor, 
        position: 'relative', 
        overflow: 'visible', // Changed from 'hidden' to 'visible'
        borderRadius: '8px', // Ensure the block has rounded corners
      }}
      onClick={() => onBlockClick(block.id)}
    >
      <div 
        ref={progressRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          background: lighterColor, // Using lighterColor here
          pointerEvents: 'none',
        }}
      />
      {block.isEditing ? (
        <div className="edit-container" onClick={(e) => e.stopPropagation()}>
          <input
            ref={nameInputRef}
            type="text"
            value={editedName}
            onChange={handleNameChange}
            onKeyDown={handleKeyDown}
            className="edit-input"
            placeholder="Enter block name"
          />
          <TimeInput
            value={editedDuration}
            onChange={handleDurationChange}
            onKeyDown={handleKeyDown}
          />
          <div className="color-input-wrapper" onClick={(e) => { e.stopPropagation(); onColorPickerOpen(block.id, e); }}>
            <div
              className="color-preview"
              style={{ background: block.color }}
            />
          </div>
          <button onClick={handleFinishEditing} className="finish-edit-button">✓</button>
        </div>
      ) : (
        <>
          <span className="block-name">{block.name}</span>
          <div className="block-controls">
            {isActive && (
              <div className="time-adjust-controls">
                <button className="time-adjust-button" onClick={(e) => { e.stopPropagation(); handleTimeAdjustment(60); }}>+1m</button>
                <button className="time-adjust-button" onClick={(e) => { e.stopPropagation(); handleTimeAdjustment(300); }}>+5m</button>
                <button className="time-adjust-button" onClick={(e) => { e.stopPropagation(); handleTimeAdjustment(600); }}>+10m</button>
              </div>
            )}
            <span className="block-time">{displayTime}</span>
            <div className="block-action-buttons">
              <button onClick={(e) => { e.stopPropagation(); onEditBlock(block.id, 'isEditing', true); }} className="edit-button">✎</button>
              <button onClick={(e) => { e.stopPropagation(); onDeleteBlock(block.id); }} className="delete-button">✖</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
});

export default TimerBlock;