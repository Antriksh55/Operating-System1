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
    
    // System uptime in seconds
    this.startTime = Date.now();
    
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
    
    // Update network activity
    this.usage.network.interfaces.forEach(iface => {
      if (iface.name === 'eth0') {
        // Connected interface - realistic fluctuations
        const prevDownload = iface.download.current;
        const prevUpload = iface.upload.current;
        
        // Network traffic changes
        let newDownload = prevDownload + (Math.random() * 0.4 - 0.2);
        let newUpload = prevUpload + (Math.random() * 0.2 - 0.1);
        
        // Occasional spikes
        if (Math.random() < 0.05) {
          newDownload += 5 + Math.random() * 10;
          newUpload += 1 + Math.random() * 3;
        }
        
        // Keep within reasonable bounds
        newDownload = Math.max(0.05, Math.min(25, newDownload));
        newUpload = Math.max(0.01, Math.min(10, newUpload));
        
        iface.download.current = parseFloat(newDownload.toFixed(2));
        iface.upload.current = parseFloat(newUpload.toFixed(2));
        iface.download.history.push(newDownload);
        iface.upload.history.push(newUpload);
        iface.download.history.shift();
        iface.upload.history.shift();
        
        // Update packet counts
        iface.packets.received += Math.floor(newDownload * 100);
        iface.packets.sent += Math.floor(newUpload * 100);
        
        // Very occasional errors and drops
        if (Math.random() < 0.01) iface.packets.errors += 1;
        if (Math.random() < 0.03) iface.packets.dropped += 1;
      }
    });
    
    // Update GPU
    const prevGpuUsage = this.usage.gpu.usage;
    let newGpuUsage = prevGpuUsage + (Math.random() * 4 - 2);
    
    // Occasional GPU load spikes
    if (Math.random() < 0.03) {
      newGpuUsage += 30 + Math.random() * 50;
    }
    
    // Keep within bounds
    newGpuUsage = Math.max(0, Math.min(100, newGpuUsage));
    this.usage.gpu.usage = Math.round(newGpuUsage);
    
    // GPU memory usage correlates somewhat with GPU usage
    let newGpuMemory = this.usage.gpu.memoryUsed + (newGpuUsage - prevGpuUsage) * 10;
    newGpuMemory = Math.max(256, Math.min(this.specs.gpu.memory - 256, newGpuMemory));
    this.usage.gpu.memoryUsed = Math.round(newGpuMemory);
    
    // GPU temperature follows usage
    this.usage.gpu.temperature = Math.round(35 + (newGpuUsage / 5));
  }
  
  /**
   * Get the current CPU usage
   * @returns {Object} Current CPU usage with success status
   */
  getCpuUsage() {
    try {
      return {
        success: true,
        usage: this.usage.cpu.current
      };
    } catch (error) {
      return {
        success: false,
        error: `Error getting CPU usage: ${error.message}`
      };
    }
  }
  
  /**
   * Get current memory usage
   * @returns {Object} Memory usage information with success status
   */
  getMemoryUsage() {
    try {
      const used = this.usage.memory.used;
      const total = this.specs.memory.total;
      const percentage = (used / total) * 100;
      
      return {
        success: true,
        used,
        free: total - used,
        total,
        percentage
      };
    } catch (error) {
      return {
        success: false,
        error: `Error getting memory usage: ${error.message}`
      };
    }
  }
  
  /**
   * Get detailed CPU information
   * @returns {Object} Detailed CPU information with success status
   */
  getDetailedCpuInfo() {
    try {
      // Calculate 1-minute and 5-minute average CPU usage
      const last60Readings = this.usage.cpu.history;
      const average1min = last60Readings.slice(-60).reduce((a, b) => a + b, 0) / 60;
      const average5min = last60Readings.reduce((a, b) => a + b, 0) / last60Readings.length;
      
      return {
        success: true,
        info: {
          model: this.specs.cpu.model,
          cores: this.specs.cpu.cores,
          threads: this.specs.cpu.threads,
          clockSpeed: this.specs.cpu.clockSpeed,
          architecture: this.specs.cpu.architecture,
          cache: this.specs.cpu.cache,
          usage: {
            current: this.usage.cpu.current,
            average1min,
            average5min
          },
          temperature: this.usage.cpu.temperature,
          distribution: this.usage.cpu.distribution,
          perCore: this.usage.cpu.perCore
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Error getting detailed CPU info: ${error.message}`
      };
    }
  }
  
  /**
   * Get detailed memory information
   * @returns {Object} Detailed memory information with success status
   */
  getDetailedMemoryInfo() {
    try {
      const used = this.usage.memory.used;
      const total = this.specs.memory.total;
      const percentage = (used / total) * 100;
      
      return {
        success: true,
        info: {
          total,
          used,
          free: total - used,
          percentage,
          cached: this.usage.memory.cached,
          buffers: this.usage.memory.buffers,
          swapTotal: this.usage.memory.swapTotal,
          swapUsed: this.usage.memory.swapUsed,
          swapFree: this.usage.memory.swapTotal - this.usage.memory.swapUsed,
          technology: this.specs.memory.technology,
          speed: this.specs.memory.speed,
          channels: this.specs.memory.channels,
          // Calculate allocation proportions
          system: Math.round(used * 0.3), // 30% system
          userProcesses: Math.round(used * 0.5), // 50% user processes
          shared: Math.round(used * 0.2) // 20% shared
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Error getting detailed memory info: ${error.message}`
      };
    }
  }
  
  /**
   * Get detailed storage information
   * @returns {Object} Detailed storage information with success status
   */
  getDetailedStorageInfo() {
    try {
      // Calculate total storage metrics
      let totalSize = 0;
      let totalUsed = 0;
      let totalFree = 0;
      
      const storageDevices = this.specs.storage.devices;
      const partitions = [];
      
      // Process each storage device
      storageDevices.forEach(device => {
        const deviceSize = device.total / 1024; // Convert MB to GB
        totalSize += deviceSize;
        
        let deviceUsed = 0;
        
        // Process partitions for this device
        device.partitions.forEach(partition => {
          const partitionSize = partition.size / 1024;
          const partitionUsed = partition.used / 1024;
          const partitionFree = partitionSize - partitionUsed;
          const percentage = (partitionUsed / partitionSize) * 100;
          
          deviceUsed += partitionUsed;
          
          partitions.push({
            name: partition.name,
            mountPoint: partition.mountPoint,
            size: partitionSize,
            used: partitionUsed,
            free: partitionFree,
            percentage
          });
        });
        
        totalUsed += deviceUsed;
      });
      
      totalFree = totalSize - totalUsed;
      const percentage = (totalUsed / totalSize) * 100;
      
      // Create mount points information
      const mountpoints = [
        { path: '/', device: '/dev/sda1', type: 'ext4', options: 'rw,relatime' },
        { path: '/home', device: '/dev/sda2', type: 'ext4', options: 'rw,relatime' },
        { path: '/mnt/data', device: '/dev/sdb1', type: 'ext4', options: 'rw,relatime' }
      ];
      
      return {
        success: true,
        info: {
          total: parseFloat(totalSize.toFixed(1)),
          used: parseFloat(totalUsed.toFixed(1)),
          free: parseFloat(totalFree.toFixed(1)),
          percentage,
          devices: storageDevices.map(device => ({
            name: device.name,
            model: device.model,
            type: device.type,
            size: device.total / 1024, // Convert MB to GB
            interface: device.interface,
            speed: device.speed
          })),
          partitions,
          mountpoints,
          activity: {
            reads: this.usage.storage.reads.current,
            writes: this.usage.storage.writes.current,
            iops: this.usage.storage.iops
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Error getting detailed storage info: ${error.message}`
      };
    }
  }
  
  /**
   * Get detailed network information
   * @returns {Object} Detailed network information with success status
   */
  getDetailedNetworkInfo() {
    try {
      const networkInterfaces = this.usage.network.interfaces.map(iface => {
        const networkInfo = this.specs.network.interfaces.find(ni => ni.name === iface.name);
        
        // Calculate total bytes transferred
        const rx_bytes = iface.packets.received * 1500; // Approx avg packet size
        const tx_bytes = iface.packets.sent * 1500;
        
        return {
          name: iface.name,
          type: networkInfo?.type || 'Unknown',
          status: networkInfo?.status || 'unknown',
          speed: networkInfo?.speed || 0,
          mac: networkInfo?.macAddress || '00:00:00:00:00:00',
          ipv4: networkInfo?.ipv4 || '',
          ipv6: networkInfo?.ipv6 || '',
          rx_bytes,
          tx_bytes,
          rx_packets: iface.packets.received,
          tx_packets: iface.packets.sent,
          errors: iface.packets.errors,
          dropped: iface.packets.dropped,
          download: {
            current: iface.download.current,
            history: iface.download.history
          },
          upload: {
            current: iface.upload.current,
            history: iface.upload.history
          }
        };
      });
      
      return {
        success: true,
        info: {
          hostname: 'virtualmachine',
          domain: 'localdomain',
          interfaces: networkInterfaces
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Error getting detailed network info: ${error.message}`
      };
    }
  }
  
  /**
   * Get detailed GPU information
   * @returns {Object} Detailed GPU information with success status
   */
  getDetailedGpuInfo() {
    try {
      return {
        success: true,
        info: {
          model: this.specs.gpu.model,
          memory: {
            total: this.specs.gpu.memory,
            used: this.usage.gpu.memoryUsed,
            free: this.specs.gpu.memory - this.usage.gpu.memoryUsed,
            percentage: (this.usage.gpu.memoryUsed / this.specs.gpu.memory) * 100
          },
          usage: this.usage.gpu.usage,
          temperature: this.usage.gpu.temperature,
          interface: this.specs.gpu.interface,
          driver: this.specs.gpu.driver
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Error getting detailed GPU info: ${error.message}`
      };
    }
  }
  
  /**
   * Get system uptime
   * @returns {string} Formatted uptime string
   */
  getUptime() {
    const uptimeSeconds = Math.floor((Date.now() - this.startTime) / 1000);
    const days = Math.floor(uptimeSeconds / 86400);
    const hours = Math.floor((uptimeSeconds % 86400) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = uptimeSeconds % 60;
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else {
      return `${minutes}m ${seconds}s`;
    }
  }
  
  /**
   * Format bytes to human-readable string
   * @param {number} bytes - Bytes to format
   * @param {number} [decimals=2] - Number of decimal places
   * @returns {string} Formatted size string
   */
  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
  }
  
  /**
   * Clean up resources
   */
  destroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
} 