import { useState, useRef, useEffect } from 'react';
import { processCommand } from '../../services/CommandProcessor';
import TerminalOutput from './TerminalOutput';
import '../../index.css';

const Terminal = () => {
  const [commandHistory, setCommandHistory] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [commandIndex, setCommandIndex] = useState(-1);
  const [prompt, setPrompt] = useState('user@os-simulator:~$ ');
  
  const inputRef = useRef(null);
  const terminalRef = useRef(null);

  // Focus the input when the terminal is clicked
  useEffect(() => {
    const handleClick = () => {
      inputRef.current?.focus();
    };

    const terminal = terminalRef.current;
    terminal?.addEventListener('click', handleClick);

    return () => {
      terminal?.removeEventListener('click', handleClick);
    };
  }, []);

  // Auto-scroll to the bottom when new content is added
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [commandHistory]);

  // Focus the input on component mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleInputChange = (e) => {
    setCurrentInput(e.target.value);
  };

  const handleKeyDown = (e) => {
    // Handle Up Arrow - previous command
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandIndex < commandHistory.length - 1) {
        const newIndex = commandIndex + 1;
        setCommandIndex(newIndex);
        setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex].command);
      }
    }
    
    // Handle Down Arrow - next command
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (commandIndex > 0) {
        const newIndex = commandIndex - 1;
        setCommandIndex(newIndex);
        setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex].command);
      } else if (commandIndex === 0) {
        setCommandIndex(-1);
        setCurrentInput('');
      }
    }

    // Handle Tab - autocomplete (basic implementation)
    if (e.key === 'Tab') {
      e.preventDefault();
      // Basic commands for autocomplete
      const commands = ['help', 'ls', 'cd', 'mkdir', 'touch', 'cat', 'rm', 'ps', 'top', 'memory', 'cpu'];
      const match = commands.find(cmd => cmd.startsWith(currentInput));
      if (match) {
        setCurrentInput(match);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!currentInput.trim()) return;
    
    const result = processCommand(currentInput);
    
    setCommandHistory([
      ...commandHistory, 
      { 
        id: Date.now(),
        command: currentInput,
        output: result.output,
        success: result.success
      }
    ]);
    
    setCurrentInput('');
    setCommandIndex(-1);
  };

  return (
    <div 
      className="terminal h-full flex flex-col" 
      ref={terminalRef}
    >
      <div className="flex-1 overflow-auto mb-2">
        <TerminalOutput history={commandHistory} prompt={prompt} />
      </div>
      
      <form onSubmit={handleSubmit} className="flex items-center">
        <span className="terminal-prompt mr-2">{prompt}</span>
        <input
          ref={inputRef}
          type="text"
          value={currentInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="command-input"
          autoComplete="off"
          autoFocus
        />
      </form>
    </div>
  );
};

export default Terminal; 