import React, { useState } from 'react';

const Sidebar = ({ activeView }) => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className={`bg-gray-900 text-white transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className="p-4 flex justify-between items-center border-b border-gray-700">
        {!collapsed && <h2 className="text-lg font-bold">Navigator</h2>}
        <button 
          onClick={toggleSidebar}
          className="p-1 rounded hover:bg-gray-700"
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      <div className="p-4">
        {!collapsed ? (
          <nav>
            <ul className="space-y-2">
              {activeView === 'terminal' && (
                <>
                  <li className="font-semibold mb-2">File Operations</li>
                  <li className="pl-2 py-1 cursor-pointer hover:bg-gray-800 rounded">ls</li>
                  <li className="pl-2 py-1 cursor-pointer hover:bg-gray-800 rounded">cd ~</li>
                  <li className="pl-2 py-1 cursor-pointer hover:bg-gray-800 rounded">pwd</li>
                  <li className="pl-2 py-1 cursor-pointer hover:bg-gray-800 rounded">mkdir</li>
                  <li className="pl-2 py-1 cursor-pointer hover:bg-gray-800 rounded">touch</li>
                  <li className="pl-2 py-1 cursor-pointer hover:bg-gray-800 rounded">cp</li>
                  <li className="pl-2 py-1 cursor-pointer hover:bg-gray-800 rounded">mv</li>
                  <li className="pl-2 py-1 cursor-pointer hover:bg-gray-800 rounded">rm</li>
                  <li className="pl-2 py-1 cursor-pointer hover:bg-gray-800 rounded">chmod</li>
                  
                  <li className="font-semibold mb-2 mt-4">System Commands</li>
                  <li className="pl-2 py-1 cursor-pointer hover:bg-gray-800 rounded">ps</li>
                  <li className="pl-2 py-1 cursor-pointer hover:bg-gray-800 rounded">top</li>
                  <li className="pl-2 py-1 cursor-pointer hover:bg-gray-800 rounded">memory</li>
                  <li className="pl-2 py-1 cursor-pointer hover:bg-gray-800 rounded">cpu</li>
                  <li className="pl-2 py-1 cursor-pointer hover:bg-gray-800 rounded">disk</li>
                  <li className="pl-2 py-1 cursor-pointer hover:bg-gray-800 rounded">network</li>
                  
                  <li className="font-semibold mb-2 mt-4">Help</li>
                  <li className="pl-2 py-1 cursor-pointer hover:bg-gray-800 rounded">help</li>
                </>
              )}
              
              {activeView === 'hardware' && (
                <>
                  <li className="font-semibold mb-2">Hardware Monitoring</li>
                  <li className="pl-2 py-1 cursor-pointer hover:bg-gray-800 rounded">Overview</li>
                  <li className="pl-2 py-1 cursor-pointer hover:bg-gray-800 rounded">CPU</li>
                  <li className="pl-2 py-1 cursor-pointer hover:bg-gray-800 rounded">Memory</li>
                  <li className="pl-2 py-1 cursor-pointer hover:bg-gray-800 rounded">Storage</li>
                  <li className="pl-2 py-1 cursor-pointer hover:bg-gray-800 rounded">Network</li>
                  <li className="pl-2 py-1 cursor-pointer hover:bg-gray-800 rounded">GPU</li>
                  
                  <li className="font-semibold mb-2 mt-4">Terminal Commands</li>
                  <li className="pl-2 py-1 cursor-pointer hover:bg-gray-800 rounded">cpu</li>
                  <li className="pl-2 py-1 cursor-pointer hover:bg-gray-800 rounded">memory</li>
                  <li className="pl-2 py-1 cursor-pointer hover:bg-gray-800 rounded">disk</li>
                  <li className="pl-2 py-1 cursor-pointer hover:bg-gray-800 rounded">network</li>
                </>
              )}
              
              {activeView === 'processes' && (
                <>
                  <li className="font-semibold mb-2">Process Management</li>
                  <li className="pl-2 py-1 cursor-pointer hover:bg-gray-800 rounded">View Processes</li>
                  <li className="pl-2 py-1 cursor-pointer hover:bg-gray-800 rounded">Top View</li>
                  <li className="pl-2 py-1 cursor-pointer hover:bg-gray-800 rounded">Create Process</li>
                  
                  <li className="font-semibold mb-2 mt-4">Terminal Commands</li>
                  <li className="pl-2 py-1 cursor-pointer hover:bg-gray-800 rounded">ps</li>
                  <li className="pl-2 py-1 cursor-pointer hover:bg-gray-800 rounded">top</li>
                  <li className="pl-2 py-1 cursor-pointer hover:bg-gray-800 rounded">kill [pid]</li>
                  <li className="pl-2 py-1 cursor-pointer hover:bg-gray-800 rounded">nice [priority] [pid]</li>
                </>
              )}
            </ul>
          </nav>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            {activeView === 'terminal' && (
              <>
                <button className="p-2 rounded hover:bg-gray-700" title="File Operations">$</button>
                <button className="p-2 rounded hover:bg-gray-700" title="System Commands">!</button>
                <button className="p-2 rounded hover:bg-gray-700" title="Help">?</button>
              </>
            )}
            
            {activeView === 'hardware' && (
              <>
                <button className="p-2 rounded hover:bg-gray-700" title="CPU">C</button>
                <button className="p-2 rounded hover:bg-gray-700" title="Memory">M</button>
                <button className="p-2 rounded hover:bg-gray-700" title="Disk">D</button>
                <button className="p-2 rounded hover:bg-gray-700" title="Network">N</button>
              </>
            )}
            
            {activeView === 'processes' && (
              <>
                <button className="p-2 rounded hover:bg-gray-700" title="View Processes">P</button>
                <button className="p-2 rounded hover:bg-gray-700" title="Create Process">+</button>
                <button className="p-2 rounded hover:bg-gray-700" title="Kill Process">✕</button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar; 