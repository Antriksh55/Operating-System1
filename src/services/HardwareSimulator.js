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
        threads: 8,
        clockSpeed: 3.4, // GHz
        architecture: '64-bit',
        temperature: 42, // °C
        cache: {
          l1: '64KB per core',
          l2: '256KB per core',
          l3: '8MB shared'
        }
      },
      memory: {
        total: 8192, // MB (8GB)
        technology: 'DDR4',
        speed: 3200, // MHz
        channels: 2,
        timing: 'CL16-18-18-38'
      },
      storage: {
        devices: [
          {
            name: '/dev/sda',
            model: 'VirtualSSD 1000',
            total: 204800, // MB (200GB)
            type: 'SSD',
            interface: 'SATA III',
            speed: '550MB/s',
            partitions: [
              { name: '/dev/sda1', mountPoint: '/', size: 102400, used: 15360 }, // 100GB, 15% used
              { name: '/dev/sda2', mountPoint: '/home', size: 92160, used: 30720 } // 90GB, 33% used
            ]
          },
          {
            name: '/dev/sdb',
            model: 'VirtualHDD 2000',
            total: 1048576, // MB (1TB)
            type: 'HDD',
            interface: 'SATA III',
            speed: '150MB/s',
            partitions: [
              { name: '/dev/sdb1', mountPoint: '/mnt/data', size: 1048576, used: 419430 } // 1TB, 40% used
            ]
          }
        ]
      },
      network: {
        interfaces: [
          {
            name: 'eth0',
            type: 'Ethernet',
            speed: 1000, // Mbps
            macAddress: '00:1A:2B:3C:4D:5E',
            ipv4: '192.168.1.100',
            ipv6: 'fe80::21a:2bff:fe3c:4d5e',
            status: 'connected'
          },
          {
            name: 'wlan0',
            type: 'WiFi',
            speed: 867, // Mbps
            macAddress: '00:1A:2B:3C:4D:5F',
            ipv4: '',
            ipv6: '',
            status: 'disconnected'
          }
        ]
      },
      gpu: {
        model: 'VirtualGPU 3000',
        memory: 4096, // MB (4GB)
        interface: 'PCIe 3.0 x16',
        driver: 'vgpu 22.04.1'
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
        },
        perCore: [
          { usage: 15, temperature: 41 },
          { usage: 10, temperature: 40 },
          { usage: 18, temperature: 42 },
          { usage: 5, temperature: 39 }
        ]
      },
      memory: {
        used: 2048, // MB
        free: 6144, // MB
        cached: 1024, // MB
        buffers: 512, // MB
        swapTotal: 4096, // MB
        swapUsed: 128, // MB
        history: Array(60).fill(0).map(() => 2048 + Math.random() * 1024)
      },
      storage: {
        reads: {
          current: 2.5, // MB/s
          history: Array(60).fill(0).map(() => Math.random() * 10)
        },
        writes: {
          current: 1.2, // MB/s
          history: Array(60).fill(0).map(() => Math.random() * 5)
        },
        iops: {
          reads: 125,
          writes: 35
        }
      },
      network: {
        interfaces: [
          {
            name: 'eth0',
            download: {
              current: 1.5, // MB/s
              history: Array(60).fill(0).map(() => Math.random() * 4)
            },
            upload: {
              current: 0.3, // MB/s
              history: Array(60).fill(0).map(() => Math.random() * 1)
            },
            packets: {
              received: 35892,
              sent: 28451,
              errors: 0,
              dropped: 12
            }
          },
          {
            name: 'wlan0',
            download: {
              current: 0,
              history: Array(60).fill(0)
            },
            upload: {
              current: 0,
              history: Array(60).fill(0)
            },
            packets: {
              received: 0,
              sent: 0,
              errors: 0,
              dropped: 0
            }
          }
        ]
      },
      gpu: {
        usage: 5, // %
        memoryUsed: 512, // MB
        temperature: 38 // °C
      }
    };
    
    // Start the update interval
    this.updateInterval = setInterval(() => this.updateHardwareMetrics(), 1000);
  }
  
  /**
   * Updates hardware metrics to simulate realistic usage patterns
   */
  updateHardwareMetrics() {
    // Update CPU usage with realistic fluctuations
    const prevCpuUsage = this.usage.cpu.current;
    // Create small random fluctuations around the previous value with random spikes
    const randomSpike = Math.random() < 0.05 ? 15 + Math.random() * 25 : 0;
    let newCpuUsage = prevCpuUsage + (Math.random() * 6 - 3) + randomSpike;
    // Keep within reasonable bounds
    newCpuUsage = Math.max(0.5, Math.min(99, newCpuUsage));
    
    // Update the CPU usage
    this.usage.cpu.current = Math.round(newCpuUsage);
    this.usage.cpu.history.push(newCpuUsage);
    this.usage.cpu.history.shift();
    
    // Adjust core usages
    this.usage.cpu.perCore = this.usage.cpu.perCore.map(core => {
      let newUsage = core.usage + (Math.random() * 8 - 4);
      newUsage = Math.max(0, Math.min(100, newUsage));
      let newTemp = 38 + (newUsage / 20); // Higher usage = higher temp
      return { usage: Math.round(newUsage), temperature: Math.round(newTemp) };
    });
    
    // Update CPU temperature based on load
    this.usage.cpu.temperature = Math.round(40 + (newCpuUsage / 10));
    
    // Update CPU distribution
    const idle = Math.max(0, 100 - newCpuUsage);
    this.usage.cpu.distribution = {
      user: Math.round(newCpuUsage * 0.7),  // 70% of CPU usage is user
      system: Math.round(newCpuUsage * 0.2), // 20% is system
      io: Math.round(newCpuUsage * 0.1),     // 10% is I/O
      idle: Math.round(idle)
    };
    
    // Update memory usage
    const prevMemUsage = this.usage.memory.used;
    const memoryChange = Math.random() < 0.1 ? 
                          (Math.random() < 0.5 ? 256 : -256) : // Occasional big changes
                          (Math.random() * 100 - 50); // Small fluctuations
    
    let newMemUsage = prevMemUsage + memoryChange;
    // Keep within reasonable bounds
    newMemUsage = Math.max(1024, Math.min(this.specs.memory.total - 1024, newMemUsage));
    
    this.usage.memory.used = Math.round(newMemUsage);
    this.usage.memory.free = this.specs.memory.total - this.usage.memory.used;
    this.usage.memory.history.push(newMemUsage);
    this.usage.memory.history.shift();
    
    // Update disk I/O
    const prevReads = this.usage.storage.reads.current;
    const prevWrites = this.usage.storage.writes.current;
    
    // Simulate realistic fluctuations in disk activity
    let newReads = prevReads + (Math.random() * 1 - 0.5);
    let newWrites = prevWrites + (Math.random() * 0.6 - 0.3);
    
    // Occasional spikes in disk activity
    if (Math.random() < 0.03) {
      newReads += 15 + Math.random() * 20;
      newWrites += 10 + Math.random() * 15;
    }
    
    // Keep within reasonable bounds
    newReads = Math.max(0.1, Math.min(100, newReads));
    newWrites = Math.max(0.05, Math.min(50, newWrites));
    
    this.usage.storage.reads.current = parseFloat(newReads.toFixed(1));
    this.usage.storage.writes.current = parseFloat(newWrites.toFixed(1));
    this.usage.storage.reads.history.push(newReads);
    this.usage.storage.writes.history.push(newWrites);
    this.usage.storage.reads.history.shift();
    this.usage.storage.writes.history.shift();
    
    // Update IOPS
    this.usage.storage.iops.reads = Math.round(newReads * 50);
    this.usage.storage.iops.writes = Math.round(newWrites * 30);
    
    // Update network activity for active interfaces
    this.usage.network.interfaces.forEach(iface => {
      if (iface.name === 'eth0') { // Only active interface
        const prevDownload = iface.download.current;
        const prevUpload = iface.upload.current;
        
        // Create realistic network traffic patterns
        let newDownload = prevDownload + (Math.random() - 0.5);
        let newUpload = prevUpload + (Math.random() * 0.4 - 0.2);
        
        // Simulate brief network bursts
        if (Math.random() < 0.05) {
          newDownload += 3 + Math.random() * 5;
          newUpload += 0.5 + Math.random() * 1.5;
        }
        
        // Keep within reasonable bounds
        newDownload = Math.max(0.02, Math.min(50, newDownload));
        newUpload = Math.max(0.01, Math.min(10, newUpload));
        
        iface.download.current = parseFloat(newDownload.toFixed(2));
        iface.upload.current = parseFloat(newUpload.toFixed(2));
        iface.download.history.push(newDownload);
        iface.upload.history.push(newUpload);
        iface.download.history.shift();
        iface.upload.history.shift();
        
        // Update packet counters
        const downloadPackets = Math.round(newDownload * 100);
        const uploadPackets = Math.round(newUpload * 80);
        
        iface.packets.received += downloadPackets;
        iface.packets.sent += uploadPackets;
        
        // Small chance of dropped or error packets
        if (Math.random() < 0.01) {
          iface.packets.errors += 1;
        }
        if (Math.random() < 0.05) {
          iface.packets.dropped += Math.round(Math.random() * 3);
        }
      }
    });
    
    // Update GPU metrics
    const prevGpuUsage = this.usage.gpu.usage;
    let newGpuUsage = prevGpuUsage + (Math.random() * 10 - 5);
    
    if (Math.random() < 0.02) {
      newGpuUsage += 20 + Math.random() * 30;
    }
    
    newGpuUsage = Math.max(1, Math.min(99, newGpuUsage));
    
    this.usage.gpu.usage = Math.round(newGpuUsage);
    this.usage.gpu.memoryUsed = Math.min(
      this.specs.gpu.memory,
      Math.round(256 + (newGpuUsage * 30))
    );
    this.usage.gpu.temperature = Math.round(35 + (newGpuUsage / 5));
  }
  
  /**
   * Get current CPU usage with basic information
   */
  getCpuUsage() {
    return {
      success: true,
      output: `CPU Usage: ${this.usage.cpu.current}%
Temperature: ${this.usage.cpu.temperature}°C
User: ${this.usage.cpu.distribution.user}% | System: ${this.usage.cpu.distribution.system}% | I/O: ${this.usage.cpu.distribution.io}% | Idle: ${this.usage.cpu.distribution.idle}%
Model: ${this.specs.cpu.model} (${this.specs.cpu.cores} cores, ${this.specs.cpu.threads} threads)`
    };
  }
  
  /**
   * Get current memory usage with basic information
   */
  getMemoryUsage() {
    const usedPercentage = Math.round((this.usage.memory.used / this.specs.memory.total) * 100);
    
    return {
      success: true,
      output: `Memory Usage: ${this.usage.memory.used}MB / ${this.specs.memory.total}MB (${usedPercentage}%)
Free: ${this.usage.memory.free}MB
Cached: ${this.usage.memory.cached}MB
Buffers: ${this.usage.memory.buffers}MB
Swap: ${this.usage.memory.swapUsed}MB / ${this.usage.memory.swapTotal}MB
Type: ${this.specs.memory.technology} @ ${this.specs.memory.speed}MHz`
    };
  }
  
  /**
   * Get detailed CPU information
   */
  getDetailedCpuInfo() {
    const coreInfo = this.usage.cpu.perCore.map((core, index) => 
      `Core ${index}: ${core.usage}% (${core.temperature}°C)`
    ).join('\n');
    
    return {
      success: true,
      output: `=== CPU Information ===
Model: ${this.specs.cpu.model}
Architecture: ${this.specs.cpu.architecture}
Cores: ${this.specs.cpu.cores} physical, ${this.specs.cpu.threads} logical
Clock Speed: ${this.specs.cpu.clockSpeed} GHz
Cache: L1: ${this.specs.cpu.cache.l1}, L2: ${this.specs.cpu.cache.l2}, L3: ${this.specs.cpu.cache.l3}

=== CPU Usage ===
Current Usage: ${this.usage.cpu.current}%
Temperature: ${this.usage.cpu.temperature}°C

=== Usage Distribution ===
User: ${this.usage.cpu.distribution.user}%
System: ${this.usage.cpu.distribution.system}%
I/O Wait: ${this.usage.cpu.distribution.io}%
Idle: ${this.usage.cpu.distribution.idle}%

=== Core Usage ===
${coreInfo}

=== Last 10s Usage Trend ===
${this.usage.cpu.history.slice(-10).map(val => Math.round(val)).join('% → ')}%`
    };
  }
  
  /**
   * Get detailed memory information
   */
  getDetailedMemoryInfo() {
    const usedPercentage = Math.round((this.usage.memory.used / this.specs.memory.total) * 100);
    const swapPercentage = Math.round((this.usage.memory.swapUsed / this.usage.memory.swapTotal) * 100);
    
    // Create a simple ASCII visualization of memory usage
    const barLength = 40;
    const usedChars = Math.round((this.usage.memory.used / this.specs.memory.total) * barLength);
    const memoryBar = '[' + '#'.repeat(usedChars) + '-'.repeat(barLength - usedChars) + ']';
    
    return {
      success: true,
      output: `=== Memory Information ===
Total Memory: ${this.formatBytes(this.specs.memory.total * 1024 * 1024)}
Technology: ${this.specs.memory.technology}
Speed: ${this.specs.memory.speed} MHz
Channels: ${this.specs.memory.channels}
Timings: ${this.specs.memory.timing}

=== Memory Usage ===
Used: ${this.formatBytes(this.usage.memory.used * 1024 * 1024)} (${usedPercentage}%)
Free: ${this.formatBytes(this.usage.memory.free * 1024 * 1024)}
Cached: ${this.formatBytes(this.usage.memory.cached * 1024 * 1024)}
Buffers: ${this.formatBytes(this.usage.memory.buffers * 1024 * 1024)}

${memoryBar} ${usedPercentage}%

=== Swap ===
Total Swap: ${this.formatBytes(this.usage.memory.swapTotal * 1024 * 1024)}
Used Swap: ${this.formatBytes(this.usage.memory.swapUsed * 1024 * 1024)} (${swapPercentage}%)

=== Last 10s Memory Trend (MB) ===
${this.usage.memory.history.slice(-10).map(val => Math.round(val)).join(' → ')}`
    };
  }
  
  /**
   * Get detailed storage information
   */
  getDetailedStorageInfo() {
    const deviceInfo = this.specs.storage.devices.map(device => {
      const partitionInfo = device.partitions.map(part => {
        const usedPercentage = Math.round((part.used / part.size) * 100);
        const barLength = 20;
        const usedChars = Math.round((part.used / part.size) * barLength);
        const bar = '[' + '#'.repeat(usedChars) + '-'.repeat(barLength - usedChars) + ']';
        
        return `  ${part.name} (${part.mountPoint}):
    Size: ${this.formatBytes(part.size * 1024 * 1024)}
    Used: ${this.formatBytes(part.used * 1024 * 1024)} (${usedPercentage}%)
    ${bar} ${usedPercentage}%`;
      }).join('\n\n');
      
      return `${device.name} - ${device.model}
Type: ${device.type}
Interface: ${device.interface}
Total Size: ${this.formatBytes(device.total * 1024 * 1024)}
Speed: ${device.speed}

Partitions:
${partitionInfo}`;
    }).join('\n\n===\n\n');
    
    return {
      success: true,
      output: `=== Storage Information ===

${deviceInfo}

=== Disk Activity ===
Current Read: ${this.usage.storage.reads.current} MB/s (${this.usage.storage.iops.reads} IOPS)
Current Write: ${this.usage.storage.writes.current} MB/s (${this.usage.storage.iops.writes} IOPS)

=== Last 10s Activity Trend ===
Reads (MB/s): ${this.usage.storage.reads.history.slice(-10).map(val => val.toFixed(1)).join(' → ')}
Writes (MB/s): ${this.usage.storage.writes.history.slice(-10).map(val => val.toFixed(1)).join(' → ')}`
    };
  }
  
  /**
   * Get detailed network information
   */
  getDetailedNetworkInfo() {
    const interfaceInfo = this.specs.network.interfaces.map((iface, index) => {
      const usageIface = this.usage.network.interfaces[index];
      const isActive = iface.status === 'connected';
      
      let output = `${iface.name} (${iface.type}):
Status: ${iface.status}
MAC Address: ${iface.macAddress}`;
      
      if (isActive) {
        output += `
Speed: ${iface.speed} Mbps
IPv4: ${iface.ipv4}
IPv6: ${iface.ipv6}

Current Traffic:
  Download: ${usageIface.download.current} MB/s
  Upload: ${usageIface.upload.current} MB/s

Packets:
  Received: ${usageIface.packets.received.toLocaleString()}
  Sent: ${usageIface.packets.sent.toLocaleString()}
  Errors: ${usageIface.packets.errors}
  Dropped: ${usageIface.packets.dropped}

Traffic Trend (Last 10s):
  Download (MB/s): ${usageIface.download.history.slice(-10).map(val => val.toFixed(2)).join(' → ')}
  Upload (MB/s): ${usageIface.upload.history.slice(-10).map(val => val.toFixed(2)).join(' → ')}`;
      }
      
      return output;
    }).join('\n\n===\n\n');
    
    return {
      success: true,
      output: `=== Network Information ===

${interfaceInfo}`
    };
  }
  
  /**
   * Get detailed GPU information
   */
  getDetailedGpuInfo() {
    const usedPercentage = Math.round((this.usage.gpu.memoryUsed / this.specs.gpu.memory) * 100);
    
    return {
      success: true,
      output: `=== GPU Information ===
Model: ${this.specs.gpu.model}
Memory: ${this.specs.gpu.memory} MB
Interface: ${this.specs.gpu.interface}
Driver: ${this.specs.gpu.driver}

=== GPU Usage ===
Utilization: ${this.usage.gpu.usage}%
Memory Usage: ${this.usage.gpu.memoryUsed} MB / ${this.specs.gpu.memory} MB (${usedPercentage}%)
Temperature: ${this.usage.gpu.temperature}°C`
    };
  }
  
  /**
   * Format bytes to a human-readable format
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    
    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + units[i];
  }
  
  /**
   * Clean up and stop update interval when done
   */
  destroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
} 