import { useState, useEffect, useRef } from 'react';
import { HardwareSimulator } from '../../services/HardwareSimulator';

const Hardware = () => {
  const hardwareSimulator = useRef(new HardwareSimulator()).current;
  const [activeTab, setActiveTab] = useState('overview');
  const [cpuData, setCpuData] = useState(null);
  const [memoryData, setMemoryData] = useState(null);
  const [diskData, setDiskData] = useState(null);
  const [networkData, setNetworkData] = useState(null);
  const [gpuData, setGpuData] = useState(null);
  
  // Update data every second
  useEffect(() => {
    const fetchHardwareData = () => {
      setCpuData(hardwareSimulator.getDetailedCpuInfo());
      setMemoryData(hardwareSimulator.getDetailedMemoryInfo());
      setDiskData(hardwareSimulator.getDetailedStorageInfo());
      setNetworkData(hardwareSimulator.getDetailedNetworkInfo());
      setGpuData(hardwareSimulator.getDetailedGpuInfo());
    };
    
    // Initial fetch
    fetchHardwareData();
    
    // Setup interval for updates
    const intervalId = setInterval(fetchHardwareData, 1000);
    
    // Cleanup on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [hardwareSimulator]);
  
  // CPU usage graph with Canvas
  const cpuCanvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = cpuCanvasRef.current;
    if (!canvas || !hardwareSimulator.usage) return;
    
    const ctx = canvas.getContext('2d');
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Get CPU history data (last 60 points)
    const cpuHistory = hardwareSimulator.usage.cpu.history.slice(-60);
    
    // Background
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Grid lines
    ctx.strokeStyle = '#dddddd';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines (0%, 25%, 50%, 75%, 100%)
    for (let i = 0; i <= 4; i++) {
      const y = canvasHeight - (canvasHeight * (i * 0.25));
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasWidth, y);
      ctx.stroke();
      
      // Labels
      ctx.fillStyle = '#666666';
      ctx.font = '10px sans-serif';
      ctx.fillText(`${i * 25}%`, 5, y - 3);
    }
    
    // Draw CPU usage line
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    cpuHistory.forEach((value, index) => {
      const x = (index / (cpuHistory.length - 1)) * canvasWidth;
      const y = canvasHeight - (value / 100) * canvasHeight;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
    
    // Fill area under the curve
    ctx.lineTo(canvasWidth, canvasHeight);
    ctx.lineTo(0, canvasHeight);
    ctx.closePath();
    ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
    ctx.fill();
    
    // Current value label
    const currentValue = cpuHistory[cpuHistory.length - 1];
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(`${Math.round(currentValue)}%`, canvasWidth - 30, 20);
    
  }, [hardwareSimulator.usage, cpuData]);
  
  // Format hardware data output
  const formatOutput = (output) => {
    if (!output) return null;
    
    return output.split('\n').map((line, index) => {
      if (line.startsWith('===')) {
        return <h3 key={index} className="text-xl font-bold mt-4 mb-2">{line.replace(/=/g, '')}</h3>;
      } else if (line.trim() === '') {
        return <br key={index} />;
      } else {
        return <div key={index}>{line}</div>;
      }
    });
  };
  
  const renderTab = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded shadow p-4">
              <h3 className="text-lg font-bold mb-2">CPU Usage</h3>
              <canvas ref={cpuCanvasRef} width="400" height="150" className="mb-3" />
              {cpuData && (
                <div className="text-sm">
                  <div>Model: {hardwareSimulator.specs.cpu.model}</div>
                  <div>Cores: {hardwareSimulator.specs.cpu.cores}</div>
                  <div>Current: {Math.round(hardwareSimulator.usage.cpu.current)}%</div>
                  <div>Temperature: {hardwareSimulator.usage.cpu.temperature}°C</div>
                </div>
              )}
            </div>
            
            <div className="bg-white rounded shadow p-4">
              <h3 className="text-lg font-bold mb-2">Memory Usage</h3>
              <div className="w-full bg-gray-200 rounded-full h-5 mb-3">
                {memoryData && (
                  <div 
                    className="bg-blue-600 h-5 rounded-full" 
                    style={{ width: `${Math.round(hardwareSimulator.usage.memory.used / hardwareSimulator.specs.memory.total * 100)}%` }}
                  />
                )}
              </div>
              {memoryData && (
                <div className="text-sm">
                  <div>Total: {hardwareSimulator.specs.memory.total} MB</div>
                  <div>Used: {hardwareSimulator.usage.memory.used} MB ({Math.round(hardwareSimulator.usage.memory.used / hardwareSimulator.specs.memory.total * 100)}%)</div>
                  <div>Free: {hardwareSimulator.usage.memory.free} MB</div>
                  <div>Type: {hardwareSimulator.specs.memory.technology} @ {hardwareSimulator.specs.memory.speed} MHz</div>
                </div>
              )}
            </div>
            
            <div className="bg-white rounded shadow p-4">
              <h3 className="text-lg font-bold mb-2">Storage</h3>
              {diskData && hardwareSimulator.specs.storage.devices.map((device, index) => (
                <div key={index} className="mb-3">
                  <div className="font-semibold">{device.name} ({device.type})</div>
                  {device.partitions.map((partition, pidx) => {
                    const usedPercentage = Math.round((partition.used / partition.size) * 100);
                    return (
                      <div key={pidx} className="ml-3 mb-2">
                        <div className="text-sm">{partition.name} ({partition.mountPoint})</div>
                        <div className="w-full bg-gray-200 rounded-full h-3 mt-1 mb-1">
                          <div 
                            className="bg-green-600 h-3 rounded-full" 
                            style={{ width: `${usedPercentage}%` }}
                          />
                        </div>
                        <div className="text-xs">
                          {hardwareSimulator.formatBytes(partition.used * 1024 * 1024)} of {hardwareSimulator.formatBytes(partition.size * 1024 * 1024)} ({usedPercentage}%)
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
            
            <div className="bg-white rounded shadow p-4">
              <h3 className="text-lg font-bold mb-2">Network</h3>
              {networkData && hardwareSimulator.specs.network.interfaces.map((iface, index) => (
                <div key={index} className="mb-3">
                  <div className="font-semibold">{iface.name} ({iface.type})</div>
                  <div className={`text-xs ${iface.status === 'connected' ? 'text-green-600' : 'text-red-600'}`}>
                    {iface.status}
                  </div>
                  {iface.status === 'connected' && (
                    <div className="mt-2 text-sm">
                      <div>IP: {iface.ipv4}</div>
                      <div>Download: {hardwareSimulator.usage.network.interfaces[index].download.current.toFixed(2)} MB/s</div>
                      <div>Upload: {hardwareSimulator.usage.network.interfaces[index].upload.current.toFixed(2)} MB/s</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'cpu':
        return <pre className="font-mono text-sm">{cpuData?.output}</pre>;
        
      case 'memory':
        return <pre className="font-mono text-sm">{memoryData?.output}</pre>;
        
      case 'storage':
        return <pre className="font-mono text-sm">{diskData?.output}</pre>;
        
      case 'network':
        return <pre className="font-mono text-sm">{networkData?.output}</pre>;
        
      case 'gpu':
        return <pre className="font-mono text-sm">{gpuData?.output}</pre>;
        
      default:
        return null;
    }
  };
  
  return (
    <div className="terminal h-full flex flex-col">
      <div className="mb-4 border-b">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          <button 
            className={`px-4 py-2 ${activeTab === 'overview' ? 'bg-blue-600 text-white' : 'bg-gray-200'} rounded`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`px-4 py-2 ${activeTab === 'cpu' ? 'bg-blue-600 text-white' : 'bg-gray-200'} rounded`}
            onClick={() => setActiveTab('cpu')}
          >
            CPU
          </button>
          <button 
            className={`px-4 py-2 ${activeTab === 'memory' ? 'bg-blue-600 text-white' : 'bg-gray-200'} rounded`}
            onClick={() => setActiveTab('memory')}
          >
            Memory
          </button>
          <button 
            className={`px-4 py-2 ${activeTab === 'storage' ? 'bg-blue-600 text-white' : 'bg-gray-200'} rounded`}
            onClick={() => setActiveTab('storage')}
          >
            Storage
          </button>
          <button 
            className={`px-4 py-2 ${activeTab === 'network' ? 'bg-blue-600 text-white' : 'bg-gray-200'} rounded`}
            onClick={() => setActiveTab('network')}
          >
            Network
          </button>
          <button 
            className={`px-4 py-2 ${activeTab === 'gpu' ? 'bg-blue-600 text-white' : 'bg-gray-200'} rounded`}
            onClick={() => setActiveTab('gpu')}
          >
            GPU
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        {renderTab()}
      </div>
    </div>
  );
};

export default Hardware; 