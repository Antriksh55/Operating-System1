import { useState, useRef, useEffect } from 'react'
import './App.css'

// Simulator components
import Terminal from './components/Terminal/Terminal'
import Sidebar from './components/Sidebar/Sidebar'
import HelpPanel from './components/HelpPanel/HelpPanel'

function App() {
  const [activeView, setActiveView] = useState('terminal');
  const [showHelp, setShowHelp] = useState(false);

  const toggleHelp = () => {
    setShowHelp(!showHelp);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gray-800 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Virtual OS Simulator</h1>
          <div className="space-x-2">
            <button 
              onClick={() => setActiveView('terminal')}
              className={`px-3 py-1 rounded ${activeView === 'terminal' ? 'bg-blue-600' : 'bg-gray-700'}`}
            >
              Terminal
            </button>
            <button 
              onClick={() => setActiveView('hardware')}
              className={`px-3 py-1 rounded ${activeView === 'hardware' ? 'bg-blue-600' : 'bg-gray-700'}`}
            >
              Hardware
            </button>
            <button 
              onClick={() => setActiveView('processes')}
              className={`px-3 py-1 rounded ${activeView === 'processes' ? 'bg-blue-600' : 'bg-gray-700'}`}
            >
              Processes
            </button>
            <button 
              onClick={toggleHelp}
              className="px-3 py-1 rounded bg-green-600"
            >
              Help
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeView={activeView} />
        
        <main className="flex-1 overflow-auto p-4">
          {activeView === 'terminal' && <Terminal />}
          {activeView === 'hardware' && <div className="terminal p-4 h-full">Hardware Monitor - Coming Soon</div>}
          {activeView === 'processes' && <div className="terminal p-4 h-full">Process Manager - Coming Soon</div>}
        </main>

        {showHelp && <HelpPanel onClose={toggleHelp} />}
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white p-2 text-center text-sm">
        <p>Virtual OS Simulator for Educational Purposes - © {new Date().getFullYear()}</p>
      </footer>
    </div>
  )
}

export default App
