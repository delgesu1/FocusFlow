import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import TimerBlock from './TimerBlock';
import TimeInput from './TimeInput';
import { FaPlay, FaPause, FaUndo, FaSave, FaPlus, FaBars, FaChevronLeft, FaCheck } from 'react-icons/fa';
import ColorPicker from './ColorPicker';
import FlowIndicator from './FlowIndicator';
import EncouragementPopup from './EncouragementPopup';

const STOCK_FLOWS = [
  {
    id: "comprehensive-technique",
    name: "Comprehensive Technique Routine",
    blocks: [
      { id: "warm-up", name: "Warm-up & Stretching", duration: 300, color: "#5271C4" },
      { id: "scales-major", name: "Scales: Major & Arpeggios", duration: 600, color: "#4A97B8" },
      { id: "scales-minor", name: "Scales: Minor & Arpeggios", duration: 600, color: "#4A97B8" },
      { id: "etude-kreutzer", name: "Etude: Kreutzer No. 2", duration: 900, color: "#45A177" },
      { id: "break-1", name: "Short Break", duration: 300, color: "#C7694B" },
      { id: "double-stops", name: "Double Stops Practice", duration: 600, color: "#6EA35C" },
      { id: "shifting-exercise", name: "Shifting Exercises", duration: 600, color: "#93A545" },
      { id: "vibrato-practice", name: "Vibrato Technique", duration: 450, color: "#B8A53E" },
      { id: "bow-control", name: "Bow Control & Articulation", duration: 600, color: "#D27F55" },
      { id: "break-2", name: "Reflection Break", duration: 300, color: "#C7694B" },
      { id: "sight-reading", name: "Sight-Reading Practice", duration: 600, color: "#D76663" },
      { id: "cool-down", name: "Cool-down & Stretching", duration: 300, color: "#5271C4" }
    ]
  },
  {
    id: "performance-preparation",
    name: "Performance Preparation Routine",
    blocks: [
      { id: "mental-prep", name: "Mental Preparation", duration: 300, color: "#8A6FB3" },
      { id: "warm-up-scales", name: "Warm-up with Scales", duration: 600, color: "#4A97B8" },
      { id: "concerto-exposition", name: "Concerto: Exposition", duration: 900, color: "#5967A1" },
      { id: "concerto-development", name: "Concerto: Development", duration: 900, color: "#5967A1" },
      { id: "break-1", name: "Mindful Break", duration: 300, color: "#C7694B" },
      { id: "concerto-recapitulation", name: "Concerto: Recapitulation", duration: 900, color: "#5967A1" },
      { id: "technical-passages", name: "Technical Passages Focus", duration: 600, color: "#45A177" },
      { id: "break-2", name: "Performance Visualization", duration: 300, color: "#C7694B" },
      { id: "sonata-movement1", name: "Sonata: 1st Movement", duration: 720, color: "#6EA35C" },
      { id: "sonata-movement2", name: "Sonata: 2nd Movement", duration: 600, color: "#6EA35C" },
      { id: "mock-performance", name: "Mock Performance Run", duration: 1200, color: "#D76663" },
      { id: "cool-down-reflection", name: "Cool-down & Reflection", duration: 300, color: "#5271C4" }
    ]
  },
  {
    id: "chamber-music-intensive",
    name: "Chamber Music Intensive",
    blocks: [
      { id: "individual-warm-up", name: "Individual Warm-up", duration: 600, color: "#5271C4" },
      { id: "intonation-exercises", name: "Intonation Exercises", duration: 450, color: "#4A97B8" },
      { id: "rhythm-precision", name: "Rhythm & Ensemble Precision", duration: 600, color: "#45A177" },
      { id: "quartet-1st-mvt", name: "Quartet: 1st Movement Work", duration: 1200, color: "#5967A1" },
      { id: "break-1", name: "Active Listening Break", duration: 300, color: "#C7694B" },
      { id: "balance-blend", name: "Balance & Blend Practice", duration: 600, color: "#6EA35C" },
      { id: "quartet-2nd-mvt", name: "Quartet: 2nd Movement Work", duration: 900, color: "#5967A1" },
      { id: "individual-part-focus", name: "Individual Part Focus", duration: 600, color: "#93A545" },
      { id: "break-2", name: "Score Study", duration: 300, color: "#C7694B" },
      { id: "quartet-3rd-mvt", name: "Quartet: 3rd Movement Work", duration: 900, color: "#5967A1" },
      { id: "ensemble-communication", name: "Non-Verbal Communication", duration: 450, color: "#B8A53E" },
      { id: "full-run-through", name: "Full Piece Run-Through", duration: 1500, color: "#D76663" },
      { id: "cool-down-reflection", name: "Cool-down & Group Reflection", duration: 300, color: "#5271C4" }
    ]
  }
];

// Your existing color palette
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

function App() {
  const [savedFlows, setSavedFlows] = useState(() => {
    try {
      const saved = localStorage.getItem('savedFlows');
      let flows = saved ? JSON.parse(saved) : STOCK_FLOWS;
      
      // Ensure "Today" is always the first flow
      if (!flows.some(flow => flow.id === "today")) {
        flows.unshift({ id: "today", name: "Today", blocks: [] });
      }
      
      return flows;
    } catch (error) {
      console.error('Error loading saved flows:', error);
      return [...STOCK_FLOWS, { id: "today", name: "Today", blocks: [] }];
    }
  });

  const [blocks, setBlocks] = useState(() => {
    // Find the "Comprehensive Technique Routine" flow
    const techniqueRoutine = STOCK_FLOWS.find(flow => flow.name === "Comprehensive Technique Routine");
    return techniqueRoutine ? techniqueRoutine.blocks : [];
  });

  const [currentBlockIndex, setCurrentBlockIndex] = useState(null);
  const [currentFlowName, setCurrentFlowName] = useState("Comprehensive Technique Routine");
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
  const [currentFlowId, setCurrentFlowId] = useState(null);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [encouragementMessage, setEncouragementMessage] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [colorPickerAnchor, setColorPickerAnchor] = useState(null);

  const colors = [
    '#4CAF50', '#2196F3', '#FFC107', '#E91E63', '#9C27B0',
    '#FF5722', '#795548', '#607D8B', '#3F51B5', '#009688'
  ];

  const newBlockRef = useRef(null);
  const newBlockInputRef = useRef(null);

  const encouragementMessages = [
    "Great job on that task! Now, let's tackle the next one with the same energy!",
    "You nailed it! On to the next task—let's keep the momentum going!",
    "Fantastic work! Let's take it to the next level in the next task!",
    "One task down—amazing focus! Let's move to the next and keep growing!",
    "That was awesome! Ready to power through the next task? You've got this!",
    "You're doing great! Let's bring that same focus to the next task!",
    "Bravo! You've got the rhythm—let's carry it into the next task!",
    "You crushed it! Let's dive into the next task with the same dedication!",
    "Great focus! Time to move forward and shine in the next task!",
    "Amazing effort! Ready to conquer the next task? I believe in you!",
    "Well done! Let's jump into the next task and make it even better!",
    "Incredible work! Let's keep that flow going into the next task!",
    "You're on fire! Keep that drive and head into the next task!",
    "Excellent progress! Let's push on and make the next task count!",
    "Task complete—fantastic! Keep the energy high as we move to the next!"
  ];

  useEffect(() => {
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
        setTimeRemaining(blocks[0].duration);
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

  const getRandomColor = useCallback((palette) => {
    return palette[Math.floor(Math.random() * palette.length)];
  }, []);

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
    const index = blocks.findIndex(block => block.id === id);
    if (index !== -1) {
      if (index === currentBlockIndex) {
        // Toggle timer if clicking on the current block
        setIsRunning(prevIsRunning => !prevIsRunning);
      } else if (!isRunning) {
        // Switch to the clicked block if the timer is not running
        setCurrentBlockIndex(index);
        setTimeRemaining(blocks[index].duration);
        setShowConfirmation(false);
      }
    }
  }, [isRunning, blocks, currentBlockIndex]);

  const handleEditBlock = useCallback((id, field, value) => {
    if (isRunning && currentBlockIndex !== null && blocks[currentBlockIndex].id === id) {
      // Do nothing if trying to edit the currently running block
      return;
    }
    setBlocks(prevBlocks => prevBlocks.map(block => 
      block.id === id ? { ...block, [field]: value } : block
    ));
  }, [isRunning, currentBlockIndex, blocks]);

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
    const newFlow = { 
      id: currentFlowId,
      name: currentFlowName,
      blocks: blocks.map(block => ({
        id: block.id,
        name: block.name,
        color: block.color,
        duration: block.duration + (dynamicTimeAdjustments[block.id] || 0)
      }))
    };

    setSavedFlows(prevFlows => {
      const flowIndex = prevFlows.findIndex(flow => flow.id === newFlow.id);
      if (flowIndex >= 0) {
        // Update existing flow
        return prevFlows.map(flow => flow.id === newFlow.id ? newFlow : flow);
      } else {
        // Add new flow
        return [...prevFlows, newFlow];
      }
    });

    setDynamicTimeAdjustments({});
    setShowSaveSuccess(true);
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
    setCurrentFlowId(flow.id);
    setCurrentBlockIndex(flow.blocks.length > 0 ? 0 : null);
    setTimeRemaining(flow.blocks.length > 0 ? flow.blocks[0].duration : 0);
    setIsRunning(false);
    setShowLoadDialog(false);
    setDynamicTimeAdjustments({});
    setIsSidebarOpen(false); // Close the sidebar
  };

  // Add this effect to handle changes in savedFlows
  useEffect(() => {
    if (savedFlows.length > 0 && !savedFlows.some(flow => flow.id === currentFlowId)) {
      const firstAvailableFlow = savedFlows.find(flow => flow.id !== "today") || savedFlows[0];
      handleLoadFlow(firstAvailableFlow);
    }
  }, [savedFlows, currentFlowId]);

  const deleteFlow = (id) => {
    if (id === "today") {
      alert("The 'Today' routine cannot be deleted.");
      return;
    }
    
    setSavedFlows(prevFlows => {
      const updatedFlows = prevFlows.filter(flow => flow.id !== id);
      
      // If the deleted flow was the current one, reset the current flow
      if (id === currentFlowId) {
        const firstAvailableFlow = updatedFlows.find(flow => flow.id !== "today") || updatedFlows[0];
        if (firstAvailableFlow) {
          handleLoadFlow(firstAvailableFlow);
        } else {
          // If no flows left, reset to an empty state
          setCurrentFlowId(null);
          setBlocks([]);
          setCurrentFlowName("");
          setCurrentBlockIndex(null);
          setTimeRemaining(0);
        }
      }
      
      return updatedFlows;
    });
  };

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

  useEffect(() => {
    setDynamicTimeAdjustments({});
  }, [currentBlockIndex]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleColorPickerOpen = (blockId, event) => {
    setActiveBlockId(blockId);
    setColorPickerAnchor(event.currentTarget);
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
                <div key={flow.id} className="flow-item">
                  <h4>{flow.name}</h4>
                  <div className="mini-blocks-container">
                    {flow.blocks.length > 0 ? (
                      flow.blocks.map((block, blockIndex) => (
                        <div
                          key={`${flow.id}-${blockIndex}`}
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
                    <button onClick={() => deleteFlow(flow.id)}>Delete</button>
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
    if (!newFlowName.trim()) {
      alert("Please enter a name for the new flow.");
      return;
    }

    const newFlowId = newFlowName.toLowerCase().replace(/\s+/g, '-');

    // Check if a flow with this id already exists
    if (savedFlows.some(flow => flow.id === newFlowId)) {
      alert("A flow with this name already exists. Please choose a different name.");
      return;
    }

    const newFlow = {
      id: newFlowId,
      name: newFlowName,
      blocks: []
    };

    setSavedFlows(prevFlows => [...prevFlows, newFlow]);
    setNewFlowName('');
    setShowNewFlowDialog(false);

    // Optionally, load the new flow immediately
    handleLoadFlow(newFlow);
  };

  const numberOfBlocks = blocks.length;
  const blockHeight = 100; // Adjust this value based on your actual block height

  useEffect(() => {
    if (showSaveSuccess) {
      const timer = setTimeout(() => {
        setShowSaveSuccess(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [showSaveSuccess]);

  const handleBlockCompletion = useCallback(() => {
    setIsRunning(false);
    if (currentBlockIndex < blocks.length - 1) {
      const randomMessage = encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)];
      setEncouragementMessage(randomMessage);
      setShowEncouragement(true);
      // Move to the next block after a short delay
      setTimeout(() => {
        setCurrentBlockIndex(prevIndex => prevIndex + 1);
        setTimeRemaining(blocks[currentBlockIndex + 1].duration);
        setShowEncouragement(false);
        setIsRunning(true);
      }, 3000);
    } else {
      // Flow completed
      setCurrentBlockIndex(null);
      // Show completion message
      setEncouragementMessage("Congratulations! You've completed the flow!");
      setShowEncouragement(true);
    }
  }, [currentBlockIndex, blocks, encouragementMessages]);

  useEffect(() => {
    let timer;
    if (isRunning && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timer);
            handleBlockCompletion();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (isRunning && timeRemaining === 0) {
      handleBlockCompletion();
    }
    return () => clearInterval(timer);
  }, [isRunning, timeRemaining, handleBlockCompletion]);

  const handleCloseEncouragement = () => {
    setShowEncouragement(false);
  };

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
            <div className="save-button-container">
              <button onClick={saveFlow} className="icon-button" aria-label="Save Flow">
                <FaSave />
              </button>
              {showSaveSuccess && (
                <div className="save-success-icon">
                  <FaCheck />
                </div>
              )}
            </div>
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
          <div className="timer-flow" style={{ position: 'relative' }}>
            {blocks.map((block, index) => (
              <TimerBlock
                key={block.id}
                block={block}
                isActive={index === currentBlockIndex}
                isCompleted={index < currentBlockIndex}
                currentTime={index === currentBlockIndex ? (isTransitioning ? 0 : timeRemaining) : block.duration}
                blockDuration={block.duration}
                dynamicAdjustment={dynamicTimeAdjustments[block.id] || 0}
                isRunning={isRunning && !isTransitioning}
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
                  flow.name !== "Today" && (
                    <div key={flow.id} className="flow-item">
                      <h3>{flow.name}</h3>
                      <div className="mini-blocks">
                        {flow.blocks.map((block, blockIndex) => (
                          <div key={`${flow.id}-${blockIndex}`} className="mini-block" style={{backgroundColor: block.color}}>
                            {block.name}
                          </div>
                        ))}
                      </div>
                      <button className="load-button" onClick={() => handleLoadFlow(flow)}>Load</button>
                      <button className="delete-flow-button" onClick={() => deleteFlow(flow.id)}>×</button>
                    </div>
                  )
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
          onClose={() => {
            setShowColorPicker(false);
            setColorPickerAnchor(null);
          }}
          anchorEl={colorPickerAnchor}
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
              <button onClick={() => {
                setShowNewFlowDialog(false);
                setNewFlowName('');
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {showEncouragement && (
        <EncouragementPopup
          message={encouragementMessage}
          onClose={handleCloseEncouragement}
        />
      )}
    </div>
  );
}

export default App;