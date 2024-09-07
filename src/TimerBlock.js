import React, { memo, useState, useEffect, useCallback, useRef } from 'react';
import TimeInput from './TimeInput';

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

  useEffect(() => {
    setEditedName(block.name);
    setEditedDuration(block.duration);
  }, [block.name, block.duration]);

  useEffect(() => {
    if (block.isEditing && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [block.isEditing]);

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
      className={`timer-bar ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
      style={{ background: blockColor }}
      onClick={() => onBlockClick(block.id)}
    >
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
            <button onClick={(e) => { e.stopPropagation(); onEditBlock(block.id, 'isEditing', true); }} className="edit-button">✎</button>
            <button onClick={(e) => { e.stopPropagation(); onDeleteBlock(block.id); }} className="delete-button">✖</button>
            <div className="color-input-wrapper" onClick={(e) => { e.stopPropagation(); onColorPickerOpen(block.id, e); }}>
              <div
                className="color-preview"
                style={{ background: blockColor }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
});

export default TimerBlock;