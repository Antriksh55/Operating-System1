import { useState, useRef, useEffect } from 'react';
import { processCommand } from '../../services/CommandProcessor';
import TerminalOutput from './TerminalOutput';
import './Terminal.css';

const Terminal = () => {
  const [commandHistory, setCommandHistory] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [commandIndex, setCommandIndex] = useState(-1);
  const [prompt, setPrompt] = useState('user@os-simulator:~$ ');
  
  const inputRef = useRef(null);
  const terminalRef = useRef(null);
  const cursorRef = useRef(null);
  const terminalHeaderRef = useRef(null);
  const outputRef = useRef(null);

  // Blinking cursor effect
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      if (cursorRef.current) {
        cursorRef.current.classList.toggle('opacity-0');
      }
    }, 600);
    
    return () => clearInterval(blinkInterval);
  }, []);

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
  
  // Lookup current directory from VirtualFileSystem to update prompt
  useEffect(() => {
    // Try to get the current directory from local storage
    try {
      const savedFS = localStorage.getItem('virtualFileSystem');
      if (savedFS) {
        const fsData = JSON.parse(savedFS);
        const currentPath = fsData.currentPath;
        
        // Format the path for display in prompt
        const displayPath = currentPath === '/home/user' ? '~' : 
                           currentPath === '/' ? '/' : 
                           currentPath.replace('/home/user', '~');
        
        setPrompt(`user@os-simulator:${displayPath}$ `);
      }
    } catch (error) {
      console.error('Error updating prompt:', error);
    }
  }, [commandHistory]); // Update prompt whenever command history changes

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
      const commands = [
        'help', 'ls', 'cd', 'mkdir', 'touch', 'cat', 'rm', 'cp', 'mv', 
        'chmod', 'pwd', 'find', 'grep', 'ps', 'top', 'kill', 'nice', 
        'memory', 'cpu', 'disk', 'network', 'clear'
      ];
      const match = commands.find(cmd => cmd.startsWith(currentInput));
      if (match) {
        setCurrentInput(match);
      }
    }
    
    // Handle Ctrl+L as an alternative for clear
    if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      handleClearCommand();
    }
  };
  
  // Helper function to handle clear command
  const handleClearCommand = (options = {}) => {
    // Default options
    const { preserveTitle = false, scrollToBottom = true, command = 'clear' } = options;
    
    // If we should preserve the title, only clear the output area
    if (preserveTitle && outputRef.current) {
      // Use a different approach to clear the terminal content
      // while preserving the terminal header
      const newHistoryItem = {
        id: Date.now(),
        command: command,
        output: '',
        success: true,
        prompt: prompt
      };
      
      // Keep only this command in history
      setCommandHistory([newHistoryItem]);
    } else {
      // Otherwise clear the entire terminal history
      setCommandHistory([{
        id: Date.now(),
        command: command,
        output: '',
        success: true,
        prompt: prompt
      }]);
    }
    
    // Scroll to bottom if requested
    if (scrollToBottom && terminalRef.current) {
      setTimeout(() => {
        terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
      }, 0);
    }
    
    // Set focus back to input
    inputRef.current?.focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!currentInput.trim()) return;
    
    const result = processCommand(currentInput);
    
    // Handle the 'clear' command
    if (result.clear) {
      handleClearCommand({
        preserveTitle: result.preserveTitle || false,
        scrollToBottom: result.scrollToBottom || true,
        command: currentInput
      });
    } else {
      // Regular command, add to history with the current prompt
      const newHistoryItem = { 
        id: Date.now(),
        command: currentInput,
        output: result.output,
        success: result.success,
        prompt: prompt // Store the current prompt with this command
      };
      
      setCommandHistory([...commandHistory, newHistoryItem]);
    }
    
    setCurrentInput('');
    setCommandIndex(-1);
  };

  return (
    <div 
      className="os-terminal h-full flex flex-col bg-black p-4 font-mono text-sm rounded-md overflow-hidden shadow-lg border border-gray-700" 
      ref={terminalRef}
    >
      {/* Terminal Header - similar to window title bar */}
      <div 
        className="terminal-header flex items-center mb-3 p-1 bg-gray-800 rounded-t-md"
        ref={terminalHeaderRef}
      >
        <div className="flex space-x-2 ml-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="mx-auto text-xs text-gray-400">Terminal - user@os-simulator</div>
      </div>
      
      {/* Terminal Content Area with Scroll */}
      <div 
        className="flex-1 overflow-auto mb-2 px-2 text-gray-200"
        ref={outputRef}
      >
        <TerminalOutput history={commandHistory} prompt={prompt} />
      </div>
      
      {/* Input Area */}
      <form onSubmit={handleSubmit} className="flex items-center bg-black">
        <span className="terminal-prompt text-green-400 mr-2">{prompt}</span>
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="bg-transparent outline-none caret-transparent text-gray-200 w-full"
            autoComplete="off"
            autoFocus
          />
          {/* Custom cursor */}
          <span 
            ref={cursorRef}
            className="absolute h-5 w-2 bg-gray-200 inset-y-0" 
            style={{ left: `${currentInput.length * 0.6}em` }}
          ></span>
        </div>
      </form>
    </div>
  );
};

export default Terminal; 