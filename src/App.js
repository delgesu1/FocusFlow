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

const STOCK_FLOWS = [
  {
    id: "technique-routine",
    name: "Technique Routine",
    blocks: [
      { id: "scales-acceleration", name: "Scales: Acceleration", duration: 1200, color: "#5271C4" },
      { id: "scales-bowings", name: "Scales: Bowings", duration: 1200, color: "#4A97B8" },
      { id: "vamos-exercise", name: "Vamos exercise", duration: 600, color: "#45A177" },
      { id: "break-1", name: "Break", duration: 900, color: "#5C9D8F" },
      { id: "scales-3rds-6ths", name: "Scales: 3rds and 6ths", duration: 1200, color: "#6EA35C" },
      { id: "dounis-trills", name: "Dounis Trills", duration: 600, color: "#93A545" },
      { id: "shifting-exercise", name: "Shifting Exercise", duration: 300, color: "#B8A53E" }
    ]
  },
  {
    id: "repertoire",
    name: "Repertoire",
    blocks: [
      { id: "debussy-3rd-mvt", name: "Debussy Sonata 3rd Mvt passages", duration: 2400, color: "#D27F55" },
      { id: "debussy-2nd-mvt", name: "Debussy Sonata 2nd Mvt passages", duration: 1800, color: "#D76663" },
      { id: "debussy-1st-mvt", name: "Debussy Sonata 1st Mvt passages", duration: 1800, color: "#B2568E" },
      { id: "franck-passages", name: "Franck passages", duration: 1800, color: "#8A6FB3" },
      { id: "break-2", name: "Break", duration: 900, color: "#7387C2" },
      { id: "mock-performance-debussy", name: "Mock Performance Debussy 2x", duration: 1800, color: "#5967A1" },
      { id: "mock-performance-franck", name: "Mock Performance Franck", duration: 1800, color: "#4A8475" }
    ]
  }
];

function App() {
  const [savedFlows, setSavedFlows] = useState(() => {
    const saved = localStorage.getItem('savedFlows');
    let flows = saved ? JSON.parse(saved) : STOCK_FLOWS;
    
    // Ensure "Today" is always the first flow
    if (!flows.some(seq => seq.name === "Today")) {
      flows.unshift({
        name: "Today",
        blocks: []
      });
    }
    
    return flows;
  });

  const [blocks, setBlocks] = useState([]);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(null);
  const [currentFlowName, setCurrentFlowName] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [editingBlockId, setEditingBlockId] = useState(null);
  const [audio] = useState(new Audio(`${process.env.PUBLIC_URL}/messiaen.mp3`));
  const [dynamicTimeAdjustments, setDynamicTimeAdjustments] = useState({})
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [activeBlockId, setActiveBlockId] = useState(null);
  const [colorPickerPosition, setColorPickerPosition] = useState({ top: 0, left: 0 });
  const [showNewFlowDialog, setShowNewFlowDialog] = useState(false);
  const [newFlowName, setNewFlowName] = useState('');
  const [currentMessage, setCurrentMessage] = useState('');

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

  const encouragementMessages = [
    "Great job on that block! Now, let's tackle the next one with the same energy!",
    "You nailed it! On to the next block—let's keep the momentum going!",
    "Fantastic work! Let's take it to the next level in the next block!",
    "One block down—amazing focus! Let's move to the next and keep growing!",
    "That was awesome! Ready to power through the next block? You've got this!",
    "You're doing great! Let's bring that same focus to the next block!",
    "Bravo! You've got the rhythm—let's carry it into the next block!",
    "You crushed it! Let's dive into the next block with the same dedication!",
    "Great focus! Time to move forward and shine in the next block!",
    "Amazing effort! Ready to conquer the next block? I believe in you!",
    "Well done! Let's jump into the next block and make it even better!",
    "Incredible work! Let's keep that flow going into the next block!",
    "You're on fire! Keep that drive and head into the next block!",
    "Excellent progress! Let's push on and make the next block count!",
    "Block complete—fantastic! Keep the energy high as we move to the next!"
  ];

  useEffect(() => {
    if (savedFlows.length === 0) {
      setSavedFlows(STOCK_FLOWS);
    }
    localStorage.setItem('savedFlows', JSON.stringify(savedFlows));
  }, [savedFlows]);

  useEffect(() => {
    if (blocks.length > 0 && timeRemaining === 0 && currentBlockIndex !== null) {
      setTimeRemaining(blocks[currentBlockIndex].duration);
    }
  }, [blocks, timeRemaining, currentBlockIndex]);

  useEffect(() => {
    audio.load();
  }, [audio]);

  const startFlow = () => {
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

  const pauseFlow = () => {
    setIsRunning(false);
  };

  const resetFlow = () => {
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
      resetFlow();
    }
  };

  const saveFlow = () => {
    // Remove the check for empty blocks
    const newFlow = { 
      name: currentFlowName || "Untitled Flow", // Provide a default name if none is set
      blocks: blocks.map(block => ({
        name: block.name,
        color: block.color,
        duration: block.duration + (dynamicTimeAdjustments[block.id] || 0)
      }))
    };

    setSavedFlows(prevFlows => {
      const updatedFlows = prevFlows.map(seq => 
        seq.name === newFlow.name ? newFlow : seq
      );
      if (!prevFlows.some(seq => seq.name === newFlow.name)) {
        updatedFlows.push(newFlow);
      }
      localStorage.setItem('savedFlows', JSON.stringify(updatedFlows));
      return updatedFlows;
    });

    setDynamicTimeAdjustments({});
    alert("Flow saved successfully!");
  };

  const loadFlow = () => {
    setShowLoadDialog(true);
  };

  const handleLoadFlow = (flow) => {
    setBlocks(flow.blocks.map(block => ({
      ...block,
      id: Date.now() + Math.random(), // Ensure unique IDs
      isEditing: false
    })));
    setCurrentFlowName(flow.name);
    setCurrentBlockIndex(flow.blocks.length > 0 ? 0 : null);
    setTimeRemaining(flow.blocks.length > 0 ? flow.blocks[0].duration : 0);
    setIsRunning(false);
    setShowLoadDialog(false);
    setDynamicTimeAdjustments({});
    setIsSidebarOpen(false); // Close the sidebar
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
            // Select a random message when the timer runs out
            const randomIndex = Math.floor(Math.random() * encouragementMessages.length);
            setCurrentMessage(encouragementMessages[randomIndex]);
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

  const deleteFlow = (name) => {
    if (name === "Today") {
      alert("The 'Today' routine cannot be deleted.");
      return;
    }
    
    const updatedFlows = savedFlows.filter(seq => seq.name !== name);
    setSavedFlows(updatedFlows);
    localStorage.setItem('savedFlows', JSON.stringify(updatedFlows));
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

  const renderSidebar = () => {
    return (
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-content">
          <div className="flow-list">
            {savedFlows.map((flow, index) => (
              flow.name === "Today" && (
                <div key={index} className="flow-item today-routine">
                  <h4>{flow.name}</h4>
                  <div className="mini-blocks-container">
                    {flow.blocks.length > 0 ? (
                      flow.blocks.map((block, blockIndex) => (
                        <div
                          key={blockIndex}
                          className="mini-block"
                          style={{ backgroundColor: block.color }}
                        >
                          <span>{block.name}</span>
                        </div>
                      ))
                    ) : (
                      <p className="no-blocks-message">No blocks in this flow</p>
                    )}
                  </div>
                  <div className="flow-item-buttons">
                    <button onClick={() => handleLoadFlow(flow)}>Load</button>
                  </div>
                </div>
              )
            ))}
            <div className="routines-header-container">
              <h3 className="routines-header">ROUTINES</h3>
              <button className="add-routine-button" onClick={() => setShowNewFlowDialog(true)}>
                <FaPlus />
              </button>
            </div>
            {savedFlows.map((flow, index) => (
              flow.name !== "Today" && (
                <div key={index} className="flow-item">
                  <h4>{flow.name}</h4>
                  <div className="mini-blocks-container">
                    {flow.blocks.length > 0 ? (
                      flow.blocks.map((block, blockIndex) => (
                        <div
                          key={blockIndex}
                          className="mini-block"
                          style={{ backgroundColor: block.color }}
                        >
                          <span>{block.name}</span>
                        </div>
                      ))
                    ) : (
                      <p className="no-blocks-message">No blocks in this flow</p>
                    )}
                  </div>
                  <div className="flow-item-buttons">
                    <button onClick={() => handleLoadFlow(flow)}>Load</button>
                    <button onClick={() => deleteFlow(flow.name)}>Delete</button>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      </div>
    );
  };

  const createNewFlow = () => {
    if (blocks.length > 0) {
      const confirmSave = window.confirm("Do you want to save the current flow?");
      if (confirmSave) {
        saveFlow();
      }
    }
    setShowNewFlowDialog(true);
  };

  const handleNewFlow = () => {
    if (newFlowName.trim()) {
      setCurrentFlowName(newFlowName);
      setBlocks([]);
      setCurrentBlockIndex(null);
      setTimeRemaining(0);
      setShowNewFlowDialog(false);
      setNewFlowName('');
    } else {
      alert("Please enter a name for your new flow.");
    }
  };

  // Add this effect to ensure stock flows are always present
  useEffect(() => {
    setSavedFlows(currentFlows => {
      const updatedFlows = [...currentFlows];
      STOCK_FLOWS.forEach(stockFlow => {
        if (!updatedFlows.some(flow => flow.id === stockFlow.id)) {
          updatedFlows.push(stockFlow);
        }
      });
      return updatedFlows;
    });
  }, []);

  return (
    <div className={`App-container ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <div className="App">
        <header className="App-header">
          <h1>FocusFlow</h1>
        </header>
        
        <div className="flow-header">
          <button onClick={toggleSidebar} className="sidebar-toggle">
            {isSidebarOpen ? <FaChevronLeft /> : <FaBars />}
          </button>
          <h2>{currentFlowName || 'Untitled Flow'}</h2>
          <div className="flow-actions">
            <button onClick={saveFlow} className="icon-button" aria-label="Save Flow">
              <FaSave />
            </button>
            <button onClick={createNewFlow} className="icon-button" aria-label="Create New Flow">
              <FaPlus />
            </button>
          </div>
        </div>
        
        {renderSidebar()}

        {/* Main content */}
        <div className="main-content">
          <div className="control-panel">
            <button onClick={startFlow} className="icon-button start-button" aria-label="Start Flow">
              <FaPlay />
            </button>
            <button onClick={pauseFlow} className="icon-button pause-button" aria-label="Pause Flow">
              <FaPause />
            </button>
            <button onClick={resetFlow} className="icon-button reset-button" aria-label="Reset Flow">
              <FaUndo />
            </button>
          </div>
          <div className="timer-flow">
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
              <p>{currentMessage}</p>
              <button onClick={handleConfirmation}>OK</button>
            </div>
          )}
          {showSaveDialog && (
            <div className="save-dialog-overlay">
              <div className="save-dialog">
                <h2>Save Flow</h2>
                <input
                  type="text"
                  value={currentFlowName}
                  onChange={(e) => setCurrentFlowName(e.target.value)}
                  placeholder="Enter flow name"
                />
                <div className="save-dialog-buttons">
                  <button onClick={() => {
                    if (currentFlowName) {
                      saveFlow();
                      setShowSaveDialog(false);
                    } else {
                      alert("Please enter a name for your flow.");
                    }
                  }}>Save</button>
                  <button onClick={() => setShowSaveDialog(false)}>Cancel</button>
                </div>
              </div>
            </div>
          )}
          {showLoadDialog && (
            <div className="load-dialog">
              <h2>Saved Flows</h2>
              <div className="flow-list">
                {savedFlows.map((flow, index) => (
                  <div key={index} className="flow-item">
                    <h3>{flow.name}</h3>
                    <div className="mini-blocks">
                      {flow.blocks.map((block, blockIndex) => (
                        <div key={blockIndex} className="mini-block" style={{backgroundColor: block.color}}>
                          {block.name}
                        </div>
                      ))}
                    </div>
                    <button className="load-button" onClick={() => handleLoadFlow(flow)}>Load</button>
                    <button className="delete-flow-button" onClick={() => deleteFlow(flow.name)}>×</button>
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
      {showNewFlowDialog && (
        <div className="save-dialog-overlay">
          <div className="save-dialog">
            <h2>Create New Flow</h2>
            <input
              type="text"
              value={newFlowName}
              onChange={(e) => setNewFlowName(e.target.value)}
              placeholder="Enter flow name"
            />
            <div className="save-dialog-buttons">
              <button onClick={handleNewFlow}>Create</button>
              <button onClick={() => setShowNewFlowDialog(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;