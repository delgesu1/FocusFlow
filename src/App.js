import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import TimerBlock from './TimerBlock';
import TimeInput from './TimeInput';
import { FaPlay, FaPause, FaUndo, FaSave, FaPlus, FaBars, FaChevronLeft } from 'react-icons/fa';
import ColorPicker from './ColorPicker';

// Add this function at the top of your file, outside the App component
function getRandomColor(colors) {
  return colors[Math.floor(Math.random() * colors.length)];
}

const defaultSequences = [
  {
    name: "Technique Routine",
    blocks: [
      { name: "Scales: Acceleration", duration: 1200, color: "#5271C4" },
      { name: "Scales: Bowings", duration: 1200, color: "#4A97B8" },
      { name: "Vamos exercise", duration: 600, color: "#45A177" },
      { name: "Break", duration: 900, color: "#5C9D8F" },
      { name: "Scales: 3rds and 6ths", duration: 1200, color: "#6EA35C" },
      { name: "Dounis Trills", duration: 600, color: "#93A545" },
      { name: "Shifting Exercise", duration: 300, color: "#B8A53E" }
    ]
  },
  {
    name: "Repertoire",
    blocks: [
      { name: "Debussy Sonata 3rd Mvt passages", duration: 2400, color: "#D27F55" },
      { name: "Debussy Sonata 2nd Mvt passages", duration: 1800, color: "#D76663" },
      { name: "Debussy Sonata 1st Mvt passages", duration: 1800, color: "#B2568E" },
      { name: "Franck passages", duration: 1800, color: "#8A6FB3" },
      { name: "Break", duration: 900, color: "#7387C2" },
      { name: "Mock Performance Debussy 2x", duration: 1800, color: "#5967A1" },
      { name: "Mock Performance Franck", duration: 1800, color: "#4A8475" }
    ]
  }
];

function App() {
  const [blocks, setBlocks] = useState([]);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(null);
  const [currentSequenceName, setCurrentSequenceName] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [savedSequences, setSavedSequences] = useState(() => {
    const saved = localStorage.getItem('savedSequences');
    return saved ? JSON.parse(saved) : defaultSequences;
  });
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [editingBlockId, setEditingBlockId] = useState(null);
  const [audio] = useState(new Audio(`${process.env.PUBLIC_URL}/messiaen.mp3`));
  const [dynamicTimeAdjustments, setDynamicTimeAdjustments] = useState({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [activeBlockId, setActiveBlockId] = useState(null);
  const [colorPickerPosition, setColorPickerPosition] = useState({ top: 0, left: 0 });
  const [showNewSequenceDialog, setShowNewSequenceDialog] = useState(false);
  const [newSequenceName, setNewSequenceName] = useState('');

  const colors = [
    '#4CAF50', '#2196F3', '#FFC107', '#E91E63', '#9C27B0',
    '#FF5722', '#795548', '#607D8B', '#3F51B5', '#009688'
  ];

  const newBlockRef = useRef(null);
  const newBlockInputRef = useRef(null);

  const colorPalette = [
    '#5271C4',
    '#4A97B8',
    '#45A177',
    '#5C9D8F',
    '#6EA35C',
    '#93A545',
    '#B8A53E',
    '#D27F55',
    '#D76663',
    '#B2568E',
    '#8A6FB3',
    '#7387C2',
    '#5967A1',
    '#4A8475',
    '#C7694B'
  ];

  useEffect(() => {
    if (savedSequences.length === 0) {
      setSavedSequences(defaultSequences);
    }
    localStorage.setItem('savedSequences', JSON.stringify(savedSequences));
  }, [savedSequences]);

  useEffect(() => {
    if (blocks.length > 0 && timeRemaining === 0 && currentBlockIndex !== null) {
      setTimeRemaining(blocks[currentBlockIndex].duration);
    }
  }, [blocks, timeRemaining, currentBlockIndex]);

  useEffect(() => {
    audio.load();
  }, [audio]);

  const startSequence = () => {
    if (blocks.length > 0) {
      setIsRunning(true);
      if (currentBlockIndex === null) {
        setCurrentBlockIndex(0);
      }
      if (timeRemaining === 0) {
        setTimeRemaining(blocks[currentBlockIndex !== null ? currentBlockIndex : 0].duration);
      }
    }
  };

  const pauseSequence = () => {
    setIsRunning(false);
  };

  const resetSequence = () => {
    setIsRunning(false);
    setCurrentBlockIndex(blocks.length > 0 ? 0 : null);
    setTimeRemaining(blocks.length > 0 ? blocks[0].duration : 0);
    setDynamicTimeAdjustments({});
    setShowConfirmation(false);
  };

  const addBlock = useCallback(() => {
    const newBlock = {
      id: Date.now(),
      name: '',
      duration: 0,
      isEditing: true,
      color: getRandomColor(colorPalette)
    };
    setBlocks(prevBlocks => {
      const updatedBlocks = [...prevBlocks, newBlock];
      if (currentBlockIndex === null) {
        setCurrentBlockIndex(0);
        setTimeRemaining(0);
      }
      return updatedBlocks;
    });
  }, [colorPalette, currentBlockIndex]);

  const updateBlock = (id, field, value) => {
    setBlocks(blocks.map(block => 
      block.id === id ? { ...block, [field]: value } : block
    ));
    if (field === 'duration' && id === blocks[currentBlockIndex].id) {
      setTimeRemaining(value);
    }
  };

  const handleDynamicTimeAdjustment = useCallback((id, adjustment) => {
    setDynamicTimeAdjustments(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + adjustment
    }));
    if (id === blocks[currentBlockIndex].id) {
      setTimeRemaining(prev => Math.max(0, prev + adjustment));
    }
  }, [blocks, currentBlockIndex]);

  const handleFinishEditing = (id, newName, newDuration) => {
    setBlocks(prevBlocks =>
      prevBlocks.map(block =>
        block.id === id
          ? { ...block, name: newName, duration: newDuration, isEditing: false }
          : block
      )
    );
    if (currentBlockIndex !== null && blocks[currentBlockIndex].id === id) {
      setTimeRemaining(newDuration);
    }
  };

  const deleteBlock = (id) => {
    setBlocks(blocks.filter(block => block.id !== id));
    if (currentBlockIndex >= blocks.length - 1) {
      setCurrentBlockIndex(blocks.length - 2);
    }
  };

  const formatTime = useCallback((seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  }, []);

  const handleBlockClick = useCallback((id) => {
    if (!isRunning) {
      const index = blocks.findIndex(block => block.id === id);
      if (index !== -1 && index !== currentBlockIndex) {
        setCurrentBlockIndex(index);
        setTimeRemaining(blocks[index].duration);
        setShowConfirmation(false);
      }
    }
  }, [isRunning, blocks, currentBlockIndex]);

  const handleEditBlock = useCallback((id, field, value) => {
    setBlocks(prevBlocks => prevBlocks.map(block => 
      block.id === id ? { ...block, [field]: value } : block
    ));
  }, []);

  const handleDeleteBlock = useCallback((id) => {
    setBlocks(prevBlocks => prevBlocks.filter(block => block.id !== id));
    if (currentBlockIndex >= blocks.length - 1) {
      setCurrentBlockIndex(blocks.length - 2);
    }
  }, [blocks.length, currentBlockIndex]);

  const handleConfirmation = () => {
    audio.pause();
    audio.currentTime = 0;
    setShowConfirmation(false);
    if (currentBlockIndex < blocks.length - 1) {
      const nextIndex = currentBlockIndex + 1;
      setCurrentBlockIndex(nextIndex);
      setTimeRemaining(blocks[nextIndex].duration);
      setIsRunning(true);
    } else {
      // All blocks completed
      resetSequence();
    }
  };

  const saveSequence = () => {
    if (blocks.length === 0) {
      alert("Please add at least one block before saving.");
      return;
    }

    if (!currentSequenceName) {
      setShowSaveDialog(true);
    } else {
      const newSequence = { 
        name: currentSequenceName, 
        blocks: blocks.map(block => ({
          name: block.name,
          color: block.color,
          duration: block.duration + (dynamicTimeAdjustments[block.id] || 0)
        }))
      };
      setSavedSequences(prevSequences => {
        const updatedSequences = prevSequences.map(seq => 
          seq.name === currentSequenceName ? newSequence : seq
        );
        if (!prevSequences.some(seq => seq.name === currentSequenceName)) {
          updatedSequences.push(newSequence);
        }
        localStorage.setItem('savedSequences', JSON.stringify(updatedSequences));
        return updatedSequences;
      });
      setDynamicTimeAdjustments({});
      alert("Sequence saved successfully!");
    }
  };

  const loadSequence = () => {
    setShowLoadDialog(true);
  };

  const handleLoadSequence = (sequence) => {
    setBlocks(sequence.blocks.map(block => ({
      ...block,
      id: Date.now() + Math.random(), // Ensure unique IDs
      isEditing: false
    })));
    setCurrentSequenceName(sequence.name);
    setCurrentBlockIndex(0);
    setTimeRemaining(sequence.blocks[0].duration);
    setIsRunning(false);
    setShowLoadDialog(false);
    setDynamicTimeAdjustments({});
  };

  // Modify the main timer useEffect
  useEffect(() => {
    let intervalId;
    if (isRunning && currentBlockIndex !== null && currentBlockIndex < blocks.length && !showConfirmation) {
      intervalId = setInterval(() => {
        setTimeRemaining(prevTime => {
          if (prevTime > 0.1) {
            return prevTime - 0.1;
          } else {
            clearInterval(intervalId);
            setIsRunning(false);
            setShowConfirmation(true);
            audio.play();
            return 0;
          }
        });
      }, 100);
    }
    return () => clearInterval(intervalId);
  }, [isRunning, currentBlockIndex, blocks, audio, showConfirmation]);

  // Add this new useEffect to reset timeRemaining when changing blocks
  useEffect(() => {
    if (blocks.length > 0 && currentBlockIndex !== null && currentBlockIndex < blocks.length) {
      setTimeRemaining(blocks[currentBlockIndex].duration);
    }
  }, [currentBlockIndex, blocks]);

  const stopAudio = () => {
    audio.pause();
    audio.currentTime = 0;
  };

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.code === 'Space' && blocks.length > 0) {
        // Check if the active element is an input or textarea
        const activeElement = document.activeElement;
        const isInputActive = activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA';
        
        if (!isInputActive) {
          event.preventDefault();
          setIsRunning(prevIsRunning => !prevIsRunning);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [blocks]);

  const deleteSequence = (name) => {
    setSavedSequences(prevSequences => {
      const updatedSequences = prevSequences.filter(seq => seq.name !== name);
      return updatedSequences.length > 0 ? updatedSequences : defaultSequences;
    });
  };

  useEffect(() => {
    setDynamicTimeAdjustments({});
  }, [currentBlockIndex]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleColorPickerOpen = (blockId, event) => {
    const rect = event.target.getBoundingClientRect();
    const popupWidth = 180;
    const popupHeight = 225;
    setColorPickerPosition({ 
      top: rect.top + window.scrollY - (popupHeight / 2) + (rect.height / 2), 
      left: rect.left + window.scrollX - popupWidth - 10
    });
    setActiveBlockId(blockId);
    setShowColorPicker(true);
  };

  const handleColorSelect = useCallback((color) => {
    if (activeBlockId) {
      setBlocks(prevBlocks => 
        prevBlocks.map(block => 
          block.id === activeBlockId ? { ...block, color: color } : block
        )
      );
      setShowColorPicker(false);
      setActiveBlockId(null);
    }
  }, [activeBlockId]);

  // Helper function to darken a color for gradient effect
  function adjustColor(color, amount) {
    return '#' + color.replace(/^#/, '').replace(/../g, color => ('0'+Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
  }

  const renderSavedSequences = () => {
    return savedSequences.map((sequence, index) => (
      <div key={index} className={`sequence-item ${defaultSequences.some(seq => seq.name === sequence.name) ? 'default-sequence' : ''}`}>
        <h4>{sequence.name}</h4>
        <div className="mini-blocks-container">
          {sequence.blocks.map((block, blockIndex) => (
            <div
              key={blockIndex}
              className="mini-block"
              style={{ 
                background: block.color,
                padding: '4px 8px',
                borderRadius: '4px',
                display: 'inline-block',
                margin: '2px',
                maxWidth: '100px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              <span style={{ color: 'white', fontSize: '12px' }}>
                {block.name}
              </span>
            </div>
          ))}
        </div>
        <div className="sequence-item-buttons">
          <button onClick={() => handleLoadSequence(sequence)}>Load</button>
          <button onClick={() => deleteSequence(sequence.name)} className="delete-sequence-button">×</button>
        </div>
      </div>
    ));
  };

  useEffect(() => {
    if (savedSequences.length > 0 && blocks.length === 0) {
      const firstSequence = savedSequences[0];
      setBlocks(firstSequence.blocks.map(block => ({
        ...block,
        id: Date.now() + Math.random(), // Ensure unique IDs
        isEditing: false
      })));
      setCurrentSequenceName(firstSequence.name);
      setCurrentBlockIndex(0);
      setTimeRemaining(firstSequence.blocks[0].duration);
    }
  }, [savedSequences]);

  const createNewSequence = () => {
    if (blocks.length > 0) {
      const confirmSave = window.confirm("Do you want to save the current sequence?");
      if (confirmSave) {
        saveSequence();
      }
    }
    setShowNewSequenceDialog(true);
  };

  const handleNewSequence = () => {
    if (newSequenceName.trim()) {
      setCurrentSequenceName(newSequenceName);
      setBlocks([]);
      setCurrentBlockIndex(null);
      setTimeRemaining(0);
      setShowNewSequenceDialog(false);
      setNewSequenceName('');
    } else {
      alert("Please enter a name for your new sequence.");
    }
  };

  return (
    <div className={`App-container ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <div className="App">
        <header className="App-header">
          <h1>FocusFlow</h1>
        </header>
        
        <div className="sequence-header">
          <button onClick={toggleSidebar} className="sidebar-toggle">
            {isSidebarOpen ? <FaChevronLeft /> : <FaBars />}
          </button>
          <h2>{currentSequenceName || 'Untitled Sequence'}</h2>
          <div className="sequence-actions">
            <button onClick={saveSequence} className="icon-button" aria-label="Save Sequence">
              <FaSave />
            </button>
            <button onClick={createNewSequence} className="icon-button" aria-label="New Sequence">
              <FaPlus />
            </button>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <h3>Saved Sequences</h3>
          <div className="sequence-list">
            {renderSavedSequences()}
          </div>
        </div>

        {/* Main content */}
        <div className="main-content">
          <div className="control-panel">
            <button onClick={startSequence} className="icon-button start-button" aria-label="Start Sequence">
              <FaPlay />
            </button>
            <button onClick={pauseSequence} className="icon-button pause-button" aria-label="Pause Sequence">
              <FaPause />
            </button>
            <button onClick={resetSequence} className="icon-button reset-button" aria-label="Reset Sequence">
              <FaUndo />
            </button>
          </div>
          <div className="timer-sequence">
            {blocks.map((block, index) => (
              <TimerBlock
                key={block.id}
                block={block}
                isActive={index === currentBlockIndex}
                isCompleted={index < currentBlockIndex}
                currentTime={index === currentBlockIndex ? timeRemaining : block.duration}
                blockDuration={block.duration}
                dynamicAdjustment={dynamicTimeAdjustments[block.id] || 0}
                isRunning={isRunning}
                onBlockClick={handleBlockClick}
                onEditBlock={handleEditBlock}
                onDeleteBlock={handleDeleteBlock}
                onFinishEditing={handleFinishEditing}
                onDynamicTimeAdjustment={handleDynamicTimeAdjustment}
                formatTime={formatTime}
                onColorPickerOpen={handleColorPickerOpen}
                blockColor={block.color}
              />
            ))}
            <button onClick={addBlock} className="add-block-button" aria-label="Add new block">
              <FaPlus />
            </button>
          </div>
          {showConfirmation && (
            <div className="confirmation-dialog">
              <p>Timer finished. Move to the next block?</p>
              <button onClick={handleConfirmation}>OK</button>
            </div>
          )}
          {showSaveDialog && (
            <div className="save-dialog-overlay">
              <div className="save-dialog">
                <h2>Save Sequence</h2>
                <input
                  type="text"
                  value={currentSequenceName}
                  onChange={(e) => setCurrentSequenceName(e.target.value)}
                  placeholder="Enter sequence name"
                />
                <div className="save-dialog-buttons">
                  <button onClick={() => {
                    if (currentSequenceName) {
                      saveSequence();
                      setShowSaveDialog(false);
                    } else {
                      alert("Please enter a name for your sequence.");
                    }
                  }}>Save</button>
                  <button onClick={() => setShowSaveDialog(false)}>Cancel</button>
                </div>
              </div>
            </div>
          )}
          {showLoadDialog && (
            <div className="load-dialog">
              <h2>Saved Sequences</h2>
              <div className="sequence-list">
                {savedSequences.map((sequence, index) => (
                  <div key={index} className="sequence-item">
                    <h3>{sequence.name}</h3>
                    <div className="mini-blocks">
                      {sequence.blocks.map((block, blockIndex) => (
                        <div key={blockIndex} className="mini-block" style={{backgroundColor: block.color}}>
                          {block.name}
                        </div>
                      ))}
                    </div>
                    <button className="load-button" onClick={() => handleLoadSequence(sequence)}>Load</button>
                    <button className="delete-sequence-button" onClick={() => deleteSequence(sequence.name)}>×</button>
                  </div>
                ))}
              </div>
              <button onClick={() => setShowLoadDialog(false)}>Close</button>
            </div>
          )}
        </div>

        {/* Overlay */}
        {isSidebarOpen && <div className="overlay" onClick={toggleSidebar}></div>}
      </div>
      {showColorPicker && (
        <ColorPicker
          colors={colorPalette}
          onColorSelect={handleColorSelect}
          onClose={() => setShowColorPicker(false)}
          position={colorPickerPosition}
        />
      )}
      <svg width="0" height="0" style={{position: 'absolute'}}>
        <defs>
          <linearGradient id="purple-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6e8efb" />
            <stop offset="100%" stopColor="#a777e3" />
          </linearGradient>
        </defs>
      </svg>
      {showNewSequenceDialog && (
        <div className="save-dialog-overlay">
          <div className="save-dialog">
            <h2>Create New Sequence</h2>
            <input
              type="text"
              value={newSequenceName}
              onChange={(e) => setNewSequenceName(e.target.value)}
              placeholder="Enter sequence name"
            />
            <div className="save-dialog-buttons">
              <button onClick={handleNewSequence}>Create</button>
              <button onClick={() => setShowNewSequenceDialog(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;