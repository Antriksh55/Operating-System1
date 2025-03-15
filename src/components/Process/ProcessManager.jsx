import { useState, useEffect, useRef } from 'react';
import { ProcessManager as ProcessManagerService } from '../../services/ProcessManager';

const ProcessManager = () => {
  const processManager = useRef(new ProcessManagerService()).current;
  const [activeTab, setActiveTab] = useState('processes');
  const [processes, setProcesses] = useState([]);
  const [topOutput, setTopOutput] = useState('');
  const [selectedPid, setSelectedPid] = useState(null);
  const [processDetail, setProcessDetail] = useState(null);
  const [newProcessName, setNewProcessName] = useState('');
  const [newProcessCommand, setNewProcessCommand] = useState('');
  const [newProcessPriority, setNewProcessPriority] = useState(0);
  const [newProcessUser, setNewProcessUser] = useState('user');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Update process data every second
  useEffect(() => {
    const updateProcesses = () => {
      // Get process list
      setProcesses(processManager.processes);
      
      // Get top output if tab is selected
      if (activeTab === 'top') {
        const topResult = processManager.getTopProcesses();
        setTopOutput(topResult.output);
      }
      
      // Update process detail if a process is selected
      if (selectedPid) {
        const result = processManager.getProcessByPid(selectedPid);
        if (result.success) {
          setProcessDetail(result.output);
        } else {
          // If process no longer exists, clear selection
          setSelectedPid(null);
          setProcessDetail(null);
        }
      }
    };
    
    // Initial update
    updateProcesses();
    
    // Setup interval
    const intervalId = setInterval(updateProcesses, 1000);
    
    // Cleanup
    return () => {
      clearInterval(intervalId);
    };
  }, [processManager, activeTab, selectedPid]);
  
  // Handle process creation
  const handleCreateProcess = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    
    if (!newProcessName.trim()) {
      setErrorMessage('Process name is required');
      return;
    }
    
    try {
      const priority = parseInt(newProcessPriority, 10);
      const result = processManager.createProcess(
        newProcessName, 
        newProcessCommand, 
        priority, 
        newProcessUser
      );
      
      if (result.success) {
        setSuccessMessage(result.output);
        // Clear form
        setNewProcessName('');
        setNewProcessCommand('');
        setNewProcessPriority(0);
      } else {
        setErrorMessage(result.output);
      }
    } catch (error) {
      setErrorMessage(error.message);
    }
  };
  
  // Handle process termination
  const handleKillProcess = (pid) => {
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      const result = processManager.killProcess(pid);
      
      if (result.success) {
        setSuccessMessage(result.output);
        // If we killed the currently selected process, clear selection
        if (pid === selectedPid) {
          setSelectedPid(null);
          setProcessDetail(null);
        }
      } else {
        setErrorMessage(result.output);
      }
    } catch (error) {
      setErrorMessage(error.message);
    }
  };
  
  // Handle changing process priority
  const handleChangePriority = (pid, priority) => {
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      const result = processManager.setProcessPriority(pid, priority);
      
      if (result.success) {
        setSuccessMessage(result.output);
      } else {
        setErrorMessage(result.output);
      }
    } catch (error) {
      setErrorMessage(error.message);
    }
  };
  
  // Render process list
  const renderProcessList = () => {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100 text-gray-700 text-sm leading-normal">
              <th className="py-2 px-3 text-left">PID</th>
              <th className="py-2 px-3 text-left">Name</th>
              <th className="py-2 px-3 text-left">User</th>
              <th className="py-2 px-3 text-left">State</th>
              <th className="py-2 px-3 text-right">CPU%</th>
              <th className="py-2 px-3 text-right">Memory</th>
              <th className="py-2 px-3 text-left">Started</th>
              <th className="py-2 px-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm">
            {processes.map(process => (
              <tr 
                key={process.pid} 
                className={`border-b border-gray-200 hover:bg-gray-50 ${selectedPid === process.pid ? 'bg-blue-50' : ''}`}
                onClick={() => setSelectedPid(process.pid)}
              >
                <td className="py-2 px-3">{process.pid}</td>
                <td className="py-2 px-3 font-medium">{process.name}</td>
                <td className="py-2 px-3">{process.user}</td>
                <td className="py-2 px-3">
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    process.state === 'running' ? 'bg-green-100 text-green-800' :
                    process.state === 'sleeping' ? 'bg-blue-100 text-blue-800' : 
                    process.state === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                    process.state === 'stopped' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {process.state}
                  </span>
                </td>
                <td className="py-2 px-3 text-right">{process.cpuPercent.toFixed(1)}%</td>
                <td className="py-2 px-3 text-right">{(process.memory / 1024).toFixed(1)} MB</td>
                <td className="py-2 px-3">{formatTime(process.startTime)}</td>
                <td className="py-2 px-3 text-center">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleKillProcess(process.pid);
                    }}
                    disabled={process.pid === 1}
                    className={`mr-2 px-2 py-1 rounded text-xs ${
                      process.pid === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    Kill
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  // Render process creation form
  const renderCreateProcessForm = () => {
    return (
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-bold mb-4">Create New Process</h3>
        <form onSubmit={handleCreateProcess}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Process Name</label>
              <input
                type="text"
                value={newProcessName}
                onChange={(e) => setNewProcessName(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="e.g., nginx, httpd, sleep"
              />
              <p className="text-xs text-gray-500 mt-1">Known processes: nginx, httpd, mysql, sleep, find</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Command (optional)</label>
              <input
                type="text"
                value={newProcessCommand}
                onChange={(e) => setNewProcessCommand(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="e.g., /usr/bin/nginx"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority (Nice Value)</label>
              <input
                type="number"
                min="-20"
                max="19"
                value={newProcessPriority}
                onChange={(e) => setNewProcessPriority(e.target.value)}
                className="w-full p-2 border rounded"
              />
              <p className="text-xs text-gray-500 mt-1">Range: -20 (highest) to 19 (lowest)</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
              <select
                value={newProcessUser}
                onChange={(e) => setNewProcessUser(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="user">user</option>
                <option value="root">root</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Create Process
            </button>
          </div>
        </form>
      </div>
    );
  };
  
  // Render process detail panel
  const renderProcessDetail = () => {
    if (!selectedPid || !processDetail) {
      return (
        <div className="bg-white p-4 rounded shadow h-full flex items-center justify-center text-gray-500">
          Select a process to view details
        </div>
      );
    }
    
    // Format the process detail into a more readable display
    const detailLines = processDetail.split('\n');
    
    return (
      <div className="bg-white p-4 rounded shadow">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-bold">Process Details</h3>
          <button 
            onClick={() => {
              setSelectedPid(null);
              setProcessDetail(null);
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {detailLines.map((line, index) => {
            const [key, value] = line.split(': ');
            if (!value) return null;
            
            return (
              <div key={index} className="mb-2">
                <span className="font-medium text-gray-700">{key}: </span>
                <span className="text-gray-900">{value}</span>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 pt-4 border-t">
          <h4 className="font-medium mb-2">Change Priority</h4>
          <div className="flex items-center">
            <input
              type="range"
              min="-20"
              max="19"
              defaultValue="0"
              className="mr-2"
              id="prioritySlider"
              onChange={(e) => {
                document.getElementById('priorityValue').innerText = e.target.value;
              }}
            />
            <span id="priorityValue">0</span>
            <button
              onClick={() => {
                const priority = parseInt(document.getElementById('prioritySlider').value, 10);
                handleChangePriority(selectedPid, priority);
              }}
              className="ml-4 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Helper function to format time
  const formatTime = (date) => {
    const now = new Date();
    const timeDiff = now - date;
    
    // If less than 24 hours ago, show time
    if (timeDiff < 86400000) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Otherwise show date
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };
  
  return (
    <div className="terminal h-full flex flex-col">
      {/* Navigation tabs */}
      <div className="mb-4 border-b">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          <button 
            className={`px-4 py-2 ${activeTab === 'processes' ? 'bg-blue-600 text-white' : 'bg-gray-200'} rounded`}
            onClick={() => setActiveTab('processes')}
          >
            Processes
          </button>
          <button 
            className={`px-4 py-2 ${activeTab === 'top' ? 'bg-blue-600 text-white' : 'bg-gray-200'} rounded`}
            onClick={() => setActiveTab('top')}
          >
            Top
          </button>
          <button 
            className={`px-4 py-2 ${activeTab === 'create' ? 'bg-blue-600 text-white' : 'bg-gray-200'} rounded`}
            onClick={() => setActiveTab('create')}
          >
            Create Process
          </button>
        </div>
      </div>
      
      {/* Notification area */}
      {errorMessage && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 relative">
          <button 
            onClick={() => setErrorMessage('')} 
            className="absolute top-1 right-1 text-red-500 hover:text-red-700"
          >
            ✕
          </button>
          <p>{errorMessage}</p>
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 relative">
          <button 
            onClick={() => setSuccessMessage('')} 
            className="absolute top-1 right-1 text-green-500 hover:text-green-700"
          >
            ✕
          </button>
          <p>{successMessage}</p>
        </div>
      )}
      
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'processes' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
            <div className="md:col-span-2 overflow-auto">
              {renderProcessList()}
            </div>
            <div className="md:col-span-1">
              {renderProcessDetail()}
            </div>
          </div>
        )}
        
        {activeTab === 'top' && (
          <div className="bg-black text-green-400 p-4 font-mono text-sm whitespace-pre overflow-auto h-full">
            {topOutput}
          </div>
        )}
        
        {activeTab === 'create' && renderCreateProcessForm()}
      </div>
    </div>
  );
};

export default ProcessManager; 