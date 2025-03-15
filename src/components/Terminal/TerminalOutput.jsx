import React from 'react';

const TerminalOutput = ({ history, prompt }) => {
  if (history.length === 0) {
    return (
      <div className="mb-2">
        <p className="text-green-400 mb-1">Welcome to Virtual OS Simulator!</p>
        <p className="text-gray-300 mb-1">Type 'help' to see available commands.</p>
        <p className="text-gray-300 mb-3">------------------------------------------</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-2">
        <p className="text-green-400 mb-1">Welcome to Virtual OS Simulator!</p>
        <p className="text-gray-300 mb-1">Type 'help' to see available commands.</p>
        <p className="text-gray-300 mb-3">------------------------------------------</p>
      </div>
      
      {history.map((item) => (
        <div key={item.id} className="mb-2">
          <div className="flex">
            <span className="terminal-prompt mr-2">{prompt}</span>
            <span>{item.command}</span>
          </div>
          
          <div className={`ml-2 ${item.success ? 'terminal-success' : 'terminal-error'}`}>
            {Array.isArray(item.output) ? (
              item.output.map((line, i) => <div key={i}>{line}</div>)
            ) : (
              <div>{item.output}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TerminalOutput; 