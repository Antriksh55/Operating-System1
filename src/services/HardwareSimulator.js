/**
 * HardwareSimulator simulates computer hardware components like CPU and memory
 * and provides methods to monitor their usage.
 */
export class HardwareSimulator {
  constructor() {
    // Initialize hardware specifications
    this.specs = {
      cpu: {
        model: 'VirtualCPU X86-64',
        cores: 4,
        clockSpeed: 3.4, // GHz
        architecture: '64-bit',
        temperature: 42, // °C
      },
      memory: {
        total: 1024, // MB
        technology: 'DDR4',
        speed: 2666, // MHz
      },
      storage: {
        total: 20480, // MB (20GB)
        type: 'SSD',
        interface: 'SATA',
      },
      network: {
        interface: 'eth0',
        speed: 1000, // Mbps
        macAddress: '00:1A:2B:3C:4D:5E',
      }
    };
    
    // Current usage metrics (will be updated dynamically)
    this.usage = {
      cpu: {
        current: 12, // %
        history: Array(60).fill(0).map(() => Math.random() * 30), // 60 seconds of history
        temperature: 42, // °C
        distribution: {
          user: 8,
          system: 3,
          io: 1,
          idle: 88
        }
      },
      memory: {
        used: 256, // MB
        free: 768, // MB
        cached: 128, // MB
        buffers: 64, // MB
        swap: {
          total: 2048, // MB
          used: 32, // MB
        }
      },
      storage: {
        used: 5120, // MB
        free: 15360, // MB
        inodes: {
          total: 2000000,
          used: 500000
        }
      },
      network: {
        bytesReceived: 1024, // bytes/sec
        bytesSent: 512, // bytes/sec
        packetsReceived: 42,
        packetsSent: 24
      }
    };
    
    // Setup interval to simulate changing hardware metrics
    this.updateInterval = setInterval(() => {
      this.updateHardwareMetrics();
    }, 2000); // Update every 2 seconds
  }
  
  /**
   * Updates hardware metrics to simulate real-time changes
   */
  updateHardwareMetrics() {
    // Update CPU usage (fluctuate between 5% and 30%)
    const cpuChange = (Math.random() - 0.5) * 8;
    this.usage.cpu.current = Math.max(5, Math.min(30, this.usage.cpu.current + cpuChange));
    
    // Update temperature based on CPU usage (between 40°C and 60°C)
    this.usage.cpu.temperature = 40 + (this.usage.cpu.current / 100) * 20;
    
    // Shift CPU history and add new value
    this.usage.cpu.history.shift();
    this.usage.cpu.history.push(this.usage.cpu.current);
    
    // Update CPU distribution
    this.usage.cpu.distribution.user = Math.max(2, Math.min(20, this.usage.cpu.distribution.user + (Math.random() - 0.5) * 3));
    this.usage.cpu.distribution.system = Math.max(1, Math.min(15, this.usage.cpu.distribution.system + (Math.random() - 0.5) * 2));
    this.usage.cpu.distribution.io = Math.max(0, Math.min(10, this.usage.cpu.distribution.io + (Math.random() - 0.5) * 1));
    this.usage.cpu.distribution.idle = 100 - this.usage.cpu.distribution.user - this.usage.cpu.distribution.system - this.usage.cpu.distribution.io;
    
    // Update memory usage (fluctuate between 200MB and 400MB)
    const memoryChange = (Math.random() - 0.5) * 40;
    this.usage.memory.used = Math.max(200, Math.min(400, this.usage.memory.used + memoryChange));
    this.usage.memory.free = this.specs.memory.total - this.usage.memory.used;
    
    // Update cached memory
    this.usage.memory.cached = Math.max(64, Math.min(256, this.usage.memory.cached + (Math.random() - 0.5) * 10));
    
    // Update network traffic
    this.usage.network.bytesReceived = Math.floor(Math.random() * 20000);
    this.usage.network.bytesSent = Math.floor(Math.random() * 10000);
    this.usage.network.packetsReceived = Math.floor(Math.random() * 100);
    this.usage.network.packetsSent = Math.floor(Math.random() * 50);
  }
  
  /**
   * Gets the current CPU usage percentage
   * @returns {number} CPU usage percentage
   */
  getCpuUsage() {
    return parseFloat(this.usage.cpu.current.toFixed(1));
  }
  
  /**
   * Gets the current memory usage
   * @returns {Object} Memory usage information
   */
  getMemoryUsage() {
    return {
      total: this.specs.memory.total,
      used: Math.floor(this.usage.memory.used),
      free: Math.floor(this.usage.memory.free),
      percentage: parseFloat(((this.usage.memory.used / this.specs.memory.total) * 100).toFixed(1))
    };
  }
  
  /**
   * Gets detailed CPU information
   * @returns {Object} Detailed CPU information
   */
  getDetailedCpuInfo() {
    // Calculate average CPU usage over different time periods
    const last1MinSamples = this.usage.cpu.history.slice(-30); // Last 30 samples = 1 minute
    const last5MinSamples = this.usage.cpu.history.slice(-60); // All 60 samples = 5 minutes (for demo)
    
    const average1min = parseFloat((last1MinSamples.reduce((a, b) => a + b, 0) / last1MinSamples.length).toFixed(1));
    const average5min = parseFloat((last5MinSamples.reduce((a, b) => a + b, 0) / last5MinSamples.length).toFixed(1));
    
    return {
      model: this.specs.cpu.model,
      cores: this.specs.cpu.cores,
      clockSpeed: this.specs.cpu.clockSpeed,
      architecture: this.specs.cpu.architecture,
      temperature: parseFloat(this.usage.cpu.temperature.toFixed(1)),
      usage: {
        current: parseFloat(this.usage.cpu.current.toFixed(1)),
        average1min,
        average5min
      },
      distribution: {
        user: parseFloat(this.usage.cpu.distribution.user.toFixed(1)),
        system: parseFloat(this.usage.cpu.distribution.system.toFixed(1)),
        io: parseFloat(this.usage.cpu.distribution.io.toFixed(1)),
        idle: parseFloat(this.usage.cpu.distribution.idle.toFixed(1))
      }
    };
  }
  
  /**
   * Gets detailed memory information
   * @returns {Object} Detailed memory information
   */
  getDetailedMemoryInfo() {
    const used = Math.floor(this.usage.memory.used);
    const free = this.specs.memory.total - used;
    const percentage = parseFloat(((used / this.specs.memory.total) * 100).toFixed(1));
    
    // Break down memory usage
    const system = Math.floor(used * 0.2);
    const userProcesses = Math.floor(used * 0.6);
    const cached = Math.floor(this.usage.memory.cached);
    const buffers = Math.floor(this.usage.memory.buffers);
    
    return {
      total: this.specs.memory.total,
      used,
      free,
      percentage,
      technology: this.specs.memory.technology,
      speed: this.specs.memory.speed,
      system,
      userProcesses,
      cached,
      buffers,
      swap: {
        total: this.usage.memory.swap.total,
        used: this.usage.memory.swap.used,
        free: this.usage.memory.swap.total - this.usage.memory.swap.used,
        percentage: parseFloat(((this.usage.memory.swap.used / this.usage.memory.swap.total) * 100).toFixed(1))
      }
    };
  }
  
  /**
   * Gets detailed storage information
   * @returns {Object} Detailed storage information
   */
  getDetailedStorageInfo() {
    return {
      total: this.specs.storage.total,
      used: this.usage.storage.used,
      free: this.usage.storage.free,
      percentage: parseFloat(((this.usage.storage.used / this.specs.storage.total) * 100).toFixed(1)),
      type: this.specs.storage.type,
      interface: this.specs.storage.interface,
      inodes: this.usage.storage.inodes
    };
  }
  
  /**
   * Gets detailed network information
   * @returns {Object} Detailed network information
   */
  getDetailedNetworkInfo() {
    return {
      interface: this.specs.network.interface,
      speed: this.specs.network.speed,
      macAddress: this.specs.network.macAddress,
      traffic: {
        received: {
          bytes: this.usage.network.bytesReceived,
          bytesFormatted: this.formatBytes(this.usage.network.bytesReceived),
          packets: this.usage.network.packetsReceived
        },
        sent: {
          bytes: this.usage.network.bytesSent,
          bytesFormatted: this.formatBytes(this.usage.network.bytesSent),
          packets: this.usage.network.packetsSent
        }
      }
    };
  }
  
  /**
   * Helper function to format bytes into a readable format
   * @param {number} bytes - The number of bytes
   * @returns {string} Formatted string
   */
  formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
  
  /**
   * Clean up when destroying the simulator
   */
  destroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
} 