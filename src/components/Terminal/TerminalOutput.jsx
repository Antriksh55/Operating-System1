import React from 'react';

const TerminalOutput = ({ history, prompt }) => {
  const renderWelcomeMessage = () => (
    <div className="mb-3">
      <div className="text-green-400 font-bold mb-1">OS Simulator Terminal v1.0</div>
      <div className="text-green-300 mb-1">Welcome to Virtual OS Simulator!</div>
      <div className="text-gray-400 mb-1">Type 'help' to see available commands.</div>
      <div className="text-gray-400 mb-1">Your files and directories will be saved in localStorage.</div>
      <div className="text-yellow-500 text-xs mb-1">Current time: {new Date().toLocaleString()}</div>
      <div className="text-gray-500 mb-2">------------------------------------------</div>
    </div>
  );

  const formatOutput = (output, success) => {
    if (Array.isArray(output)) {
      return output.map((line, i) => (
        <div 
          key={i} 
          className={success ? 'text-gray-300' : 'text-red-400'}
        >
          {line}
        </div>
      ));
    }
    
    // Handle color codes in output
    if (typeof output === 'string' && output.includes('[COLOR:')) {
      const parts = output.split(/\[COLOR:([a-z-]+)\]/);
      return (
        <div className="flex flex-wrap">
          {parts.map((part, index) => {
            if (index % 2 === 0) {
              return <span key={index}>{part}</span>;
            } else {
              // This is a color indicator
              return (
                <span 
                  key={index} 
                  className={`text-${part}`}
                >
                  {parts[index + 1]}
                </span>
              );
            }
          })}
        </div>
      );
    }
    
    return (
      <div className={success ? 'text-gray-300' : 'text-red-400'}>
        {output}
      </div>
    );
  };

  return (
    <div className="terminal-output">
      {renderWelcomeMessage()}
      
      {history.map((item) => (
        <div key={item.id} className="command-block mb-3">
          <div className="command-line flex">
            <span className="terminal-prompt text-green-400 mr-2">{item.prompt || prompt}</span>
            <span className="command-text text-white font-bold">{item.command}</span>
          </div>
          
          {item.output && (
            <div className={`command-output pl-4 mt-1`}>
              {formatOutput(item.output, item.success)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default TerminalOutput; 