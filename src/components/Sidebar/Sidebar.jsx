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
                  <li className="font-semibold mb-2">Quick Commands</li>
                  <li className="pl-2 py-1 cursor-pointer hover:bg-gray-800 rounded">help</li>
                  <li className="pl-2 py-1 cursor-pointer hover:bg-gray-800 rounded">ls</li>
                  <li className="pl-2 py-1 cursor-pointer hover:bg-gray-800 rounded">cd ~</li>
                  <li className="pl-2 py-1 cursor-pointer hover:bg-gray-800 rounded">mkdir</li>
                  <li className="pl-2 py-1 cursor-pointer hover:bg-gray-800 rounded">touch</li>
                </>
              )}
              
              {activeView === 'hardware' && (
                <>
                  <li className="font-semibold mb-2">Hardware Stats</li>
                  <li className="pl-2 py-1 cursor-pointer hover:bg-gray-800 rounded">CPU Usage</li>
                  <li className="pl-2 py-1 cursor-pointer hover:bg-gray-800 rounded">Memory</li>
                  <li className="pl-2 py-1 cursor-pointer hover:bg-gray-800 rounded">Storage</li>
                  <li className="pl-2 py-1 cursor-pointer hover:bg-gray-800 rounded">Network</li>
                </>
              )}
              
              {activeView === 'processes' && (
                <>
                  <li className="font-semibold mb-2">Process Controls</li>
                  <li className="pl-2 py-1 cursor-pointer hover:bg-gray-800 rounded">List All</li>
                  <li className="pl-2 py-1 cursor-pointer hover:bg-gray-800 rounded">Create New</li>
                  <li className="pl-2 py-1 cursor-pointer hover:bg-gray-800 rounded">Terminate</li>
                  <li className="pl-2 py-1 cursor-pointer hover:bg-gray-800 rounded">Scheduling</li>
                </>
              )}
            </ul>
          </nav>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <button className="p-2 rounded hover:bg-gray-700">?</button>
            <button className="p-2 rounded hover:bg-gray-700">!</button>
            <button className="p-2 rounded hover:bg-gray-700">+</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar; 