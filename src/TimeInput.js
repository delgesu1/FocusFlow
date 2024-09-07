import React, { useState, useEffect, useRef } from 'react';

function TimeInput({ value, onChange, onKeyDown }) {
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');

  useEffect(() => {
    const h = Math.floor(value / 3600);
    const m = Math.floor((value % 3600) / 60);
    const s = value % 60;
    setHours(h.toString().padStart(2, '0'));
    setMinutes(m.toString().padStart(2, '0'));
    setSeconds(s.toString().padStart(2, '0'));
  }, [value]);

  const handleChange = (e, setter) => {
    const newValue = e.target.value.replace(/\D/g, '').slice(0, 2);
    setter(newValue);
  };

  const handleBlur = (value, setter, max) => {
    let adjustedValue = parseInt(value || '0', 10);
    adjustedValue = Math.min(adjustedValue, max);
    // Only pad with a leading zero if the value is a single digit
    setter(adjustedValue < 10 ? adjustedValue.toString().padStart(2, '0') : adjustedValue.toString());
    updateParent();
  };

  const updateParent = () => {
    const h = parseInt(hours || '0', 10);
    const m = parseInt(minutes || '0', 10);
    const s = parseInt(seconds || '0', 10);
    const totalSeconds = h * 3600 + m * 60 + s;
    onChange(totalSeconds);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur();
      onKeyDown(e);
    }
  };

  const inputRefs = {
    hours: useRef(null),
    minutes: useRef(null),
    seconds: useRef(null)
  };

  const handleFocus = (inputName) => {
    setTimeout(() => {
      if (inputRefs[inputName].current) {
        inputRefs[inputName].current.select();
      }
    }, 0);
  };

  return (
    <div className="time-input-container">
      <input
        ref={inputRefs.hours}
        type="text"
        value={hours}
        onChange={(e) => handleChange(e, setHours)}
        onBlur={(e) => handleBlur(e.target.value, setHours, 99)}
        onKeyDown={handleKeyDown}
        onFocus={() => handleFocus('hours')}
        className="time-input"
        maxLength={2}
        placeholder="HH"
      />
      <span>:</span>
      <input
        ref={inputRefs.minutes}
        type="text"
        value={minutes}
        onChange={(e) => handleChange(e, setMinutes)}
        onBlur={(e) => handleBlur(e.target.value, setMinutes, 59)}
        onKeyDown={handleKeyDown}
        onFocus={() => handleFocus('minutes')}
        className="time-input"
        maxLength={2}
        placeholder="MM"
      />
      <span>:</span>
      <input
        ref={inputRefs.seconds}
        type="text"
        value={seconds}
        onChange={(e) => handleChange(e, setSeconds)}
        onBlur={(e) => handleBlur(e.target.value, setSeconds, 59)}
        onKeyDown={handleKeyDown}
        onFocus={() => handleFocus('seconds')}
        className="time-input"
        maxLength={2}
        placeholder="SS"
      />
    </div>
  );
}

export default TimeInput;