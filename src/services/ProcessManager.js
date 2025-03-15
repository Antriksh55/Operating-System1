/**
 * ProcessManager simulates process creation, management and scheduling
 * in an operating system.
 */
export class ProcessManager {
  constructor() {
    // Define process states
    this.PROCESS_STATES = {
      RUNNING: 'running',
      SLEEPING: 'sleeping',
      WAITING: 'waiting',
      STOPPED: 'stopped',
      ZOMBIE: 'zombie'
    };
    
    // Initialize with some system processes
    this.processes = [
      {
        pid: 1,
        name: 'init',
        command: '/sbin/init',
        state: this.PROCESS_STATES.RUNNING,
        priority: 0,
        nice: 0,
        cpu: 0.1,
        memory: 2048, // KB
        cpuPercent: 0.1,
        memoryPercent: 0.2,
        startTime: new Date(Date.now() - 3600000), // Started 1 hour ago
        user: 'root',
        threads: 1,
        children: [2, 345],
        descriptors: 18
      },
      {
        pid: 2,
        name: 'kthreadd',
        command: '[kthreadd]',
        state: this.PROCESS_STATES.RUNNING,
        priority: -20,
        nice: -20,
        cpu: 0.0,
        memory: 0, // KB
        cpuPercent: 0.0,
        memoryPercent: 0.0,
        startTime: new Date(Date.now() - 3600000),
        user: 'root',
        threads: 1,
        children: [3, 4, 5, 6, 9],
        descriptors: 1
      },
      {
        pid: 3,
        name: 'ksoftirqd/0',
        command: '[ksoftirqd/0]',
        state: this.PROCESS_STATES.RUNNING,
        priority: -20,
        nice: -20,
        cpu: 0.2,
        memory: 0, // KB
        cpuPercent: 0.2,
        memoryPercent: 0.0,
        startTime: new Date(Date.now() - 3600000),
        user: 'root',
        threads: 1,
        children: [],
        descriptors: 1
      },
      {
        pid: 345,
        name: 'systemd',
        command: '/lib/systemd/systemd --user',
        state: this.PROCESS_STATES.RUNNING,
        priority: 0,
        nice: 0,
        cpu: 0.0,
        memory: 3584, // KB
        cpuPercent: 0.0,
        memoryPercent: 0.3,
        startTime: new Date(Date.now() - 3540000), // Started 59 minutes ago
        user: 'user',
        threads: 1,
        children: [346, 348],
        descriptors: 10
      },
      {
        pid: 346,
        name: 'shell',
        command: '/bin/bash',
        state: this.PROCESS_STATES.RUNNING,
        priority: 0,
        nice: 0,
        cpu: 0.2,
        memory: 4096, // KB
        cpuPercent: 0.2,
        memoryPercent: 0.4,
        startTime: new Date(Date.now() - 120000), // Started 2 minutes ago
        user: 'user',
        threads: 1,
        children: [],
        descriptors: 6
      }
    ];
    
    this.nextPid = 1000;
    this.schedulerInterval = null;
    this.uptime = 3600; // System uptime in seconds
    
    // Process statistics
    this.stats = {
      totalCreated: 5,
      totalKilled: 0,
      contextSwitches: 3450982,
      forks: 2345
    };
    
    // Named common processes that can be spawned
    this.processTemplates = {
      'sleep': {
        name: 'sleep',
        command: 'sleep',
        memory: 1024, // KB
        lifespan: 30000, // 30 seconds
        cpuUsage: 0.0
      },
      'httpd': {
        name: 'httpd',
        command: '/usr/sbin/httpd -DFOREGROUND',
        memory: 15360, // KB (15MB)
        lifespan: -1, // runs indefinitely
        cpuUsage: 0.5
      },
      'nginx': {
        name: 'nginx',
        command: '/usr/sbin/nginx',
        memory: 10240, // KB (10MB)
        lifespan: -1, // runs indefinitely
        cpuUsage: 0.3
      },
      'mysql': {
        name: 'mysqld',
        command: '/usr/sbin/mysqld',
        memory: 51200, // KB (50MB)
        lifespan: -1, // runs indefinitely
        cpuUsage: 1.2
      },
      'find': {
        name: 'find',
        command: 'find / -name',
        memory: 2048, // KB (2MB)
        lifespan: 15000, // 15 seconds
        cpuUsage: 5.0
      }
    };
    
    // Start the process scheduler
    this.startScheduler();
  }
  
  /**
   * Creates a new process
   * @param {string} name - Process name
   * @param {string} command - Command running the process
   * @param {number} priority - Process priority (Nice value)
   * @param {string} user - User running the process
   * @returns {Object} Response object with success/failure and process info
   */
  createProcess(name, command = '', priority = 0, user = 'user') {
    try {
      // If name matches a template, use that as a base
      let processTemplate = null;
      if (this.processTemplates[name]) {
        processTemplate = this.processTemplates[name];
      }
      
      // Get the next available PID
      const pid = this.nextPid++;
      
      // Create the process with realistic values
      const process = {
        pid,
        name: processTemplate ? processTemplate.name : name,
        command: processTemplate ? processTemplate.command : (command || name),
        state: this.PROCESS_STATES.RUNNING,
        priority: priority,
        nice: priority,
        cpu: processTemplate ? processTemplate.cpuUsage : (Math.random() * 2),
        memory: processTemplate ? processTemplate.memory : (Math.floor(Math.random() * 10000) + 1000), // Random memory between 1-11MB in KB
        cpuPercent: 0, // Will be updated by scheduler
        memoryPercent: 0, // Will be updated by scheduler
        startTime: new Date(),
        user,
        threads: 1,
        children: [],
        descriptors: Math.floor(Math.random() * 10) + 3,
        // If process has a lifespan, set endTime
        endTime: processTemplate && processTemplate.lifespan > 0 ? new Date(Date.now() + processTemplate.lifespan) : null
      };
      
      // Add the process to our list
      this.processes.push(process);
      
      // Update stats
      this.stats.totalCreated++;
      this.stats.forks++;
      
      return {
        success: true,
        output: `Started process ${process.name} with PID ${pid}`,
        process: process
      };
    } catch (error) {
      return {
        success: false,
        output: `Failed to create process: ${error.message}`
      };
    }
  }
  
  /**
   * Kills a process by PID
   * @param {number} pid - Process ID to kill
   * @returns {Object} Response object with success/failure and message
   */
  killProcess(pid) {
    try {
      // Convert pid to number if it's a string
      pid = parseInt(pid, 10);
      
      // Find the process
      const index = this.processes.findIndex(p => p.pid === pid);
      
      // If process not found
      if (index === -1) {
        return { success: false, output: `No process found with PID ${pid}` };
      }
      
      // Don't allow killing init (PID 1)
      if (pid === 1) {
        return { success: false, output: `Cannot kill process with PID 1 (init)` };
      }
      
      // If process has children, make them zombies first
      const childrenPids = this.processes[index].children;
      for (const childPid of childrenPids) {
        const childIndex = this.processes.findIndex(p => p.pid === childPid);
        if (childIndex !== -1) {
          this.processes[childIndex].state = this.PROCESS_STATES.ZOMBIE;
        }
      }
      
      // Remove the process
      const process = this.processes[index];
      this.processes.splice(index, 1);
      
      // Update stats
      this.stats.totalKilled++;
      
      return {
        success: true,
        output: `Process ${pid} (${process.name}) terminated`
      };
    } catch (error) {
      return {
        success: false,
        output: `Failed to kill process: ${error.message}`
      };
    }
  }
  
  /**
   * Lists all running processes
   * @returns {Object} Response object with success/failure and processes
   */
  listProcesses() {
    try {
      return {
        success: true,
        processes: [...this.processes]
      };
    } catch (error) {
      return {
        success: false,
        output: `Failed to list processes: ${error.message}`,
        processes: []
      };
    }
  }
  
  /**
   * Gets top processes sorted by CPU usage
   * @returns {Object} Response object with success/failure and top processes
   */
  getTopProcesses() {
    try {
      // Sort processes by CPU usage (highest first)
      const sortedProcesses = [...this.processes].sort((a, b) => {
        return b.cpuPercent - a.cpuPercent;
      });
      
      // Get total memory
      const totalMemory = 8 * 1024 * 1024; // 8GB in KB
      
      // Calculate memory percentage
      sortedProcesses.forEach(proc => {
        proc.memoryPercent = (proc.memory / totalMemory) * 100;
      });
      
      // Format top output like real OS would
      const cpuUsage = Math.min(99.9, this.processes.reduce((acc, proc) => acc + proc.cpuPercent, 0));
      const memoryUsed = this.processes.reduce((acc, proc) => acc + proc.memory, 0);
      const memoryPercentage = (memoryUsed / totalMemory) * 100;
      
      return {
        success: true,
        processes: sortedProcesses,
        systemStats: {
          cpuUsage: cpuUsage,
          memoryUsed: Math.round(memoryUsed / 1024), // MB
          memoryTotal: Math.round(totalMemory / 1024), // MB
          memoryPercentage: memoryPercentage,
          uptime: this._formatUptime(),
          loadAvg: [cpuUsage / 100, (cpuUsage - 5) / 100, (cpuUsage - 10) / 100].map(v => Math.max(0, v).toFixed(2))
        }
      };
    } catch (error) {
      return {
        success: false,
        output: `Failed to get top processes: ${error.message}`,
        processes: []
      };
    }
  }
  
  /**
   * Gets detailed information about a specific process
   * @param {number} pid - Process ID to query
   * @returns {Object} Response object with success/failure and process details
   */
  getProcessByPid(pid) {
    try {
      // Convert pid to number if it's a string
      pid = parseInt(pid, 10);
      
      // Find the process
      const process = this.processes.find(p => p.pid === pid);
      
      // If process not found
      if (!process) {
        return { success: false, output: `No process found with PID ${pid}` };
      }
      
      // Format the output like ps would
      const output = [
        `PID: ${process.pid}`,
        `Name: ${process.name}`,
        `User: ${process.user}`,
        `State: ${process.state}`,
        `Priority: ${process.priority}`,
        `Nice Value: ${process.nice}`,
        `CPU Usage: ${process.cpuPercent.toFixed(1)}%`,
        `Memory: ${(process.memory / 1024).toFixed(1)} MB`,
        `Start Time: ${this._formatStartTime(process.startTime)}`,
        `Command: ${process.command}`,
        `Threads: ${process.threads}`,
        `Open FDs: ${process.descriptors}`,
        `Child Processes: ${process.children.join(', ') || 'None'}`
      ].join('\n');
      
      return {
        success: true,
        output,
        process
      };
    } catch (error) {
      return {
        success: false,
        output: `Failed to get process details: ${error.message}`
      };
    }
  }
  
  /**
   * Changes a process's priority (nice value)
   * @param {number} pid - Process ID to modify
   * @param {number} priority - New priority (-20 to 19)
   * @returns {Object} Response object with success/failure and message
   */
  setProcessPriority(pid, priority) {
    try {
      // Convert pid and priority to numbers
      pid = parseInt(pid, 10);
      priority = parseInt(priority, 10);
      
      // Validate priority value
      if (isNaN(priority) || priority < -20 || priority > 19) {
        return { success: false, output: `Invalid priority value: ${priority}. Must be between -20 and 19.` };
      }
      
      // Find the process
      const process = this.processes.find(p => p.pid === pid);
      
      // If process not found
      if (!process) {
        return { success: false, output: `No process found with PID ${pid}` };
      }
      
      // Update the priority
      process.nice = priority;
      process.priority = priority;
      
      return {
        success: true,
        output: `Changed priority of process ${pid} to ${priority}`
      };
    } catch (error) {
      return {
        success: false,
        output: `Failed to set process priority: ${error.message}`
      };
    }
  }
  
  /**
   * Scheduler function to periodically update process states
   * Simulates real OS process scheduling
   */
  scheduleProcesses() {
    // Increment uptime
    this.uptime += 1;
    
    // Update context switches
    this.stats.contextSwitches += Math.floor(Math.random() * 100);
    
    // Update each process
    for (let i = 0; i < this.processes.length; i++) {
      const process = this.processes[i];
      
      // Skip kernel processes
      if (process.pid < 10) continue;
      
      // Random state changes
      const rand = Math.random();
      
      // Update CPU usage (fluctuating)
      if (process.state === this.PROCESS_STATES.RUNNING) {
        // Base CPU value plus some randomness
        const baseCpu = process.cpu;
        // Add random fluctuation (-0.5 to +0.5)
        const fluctuation = (Math.random() - 0.5);
        // Apply fluctuation but don't go below 0
        process.cpuPercent = Math.max(0, baseCpu + fluctuation);
        
        // Occasionally put process to sleep
        if (rand < 0.05 && process.pid !== 1) { // 5% chance
          process.state = this.PROCESS_STATES.SLEEPING;
          process.cpuPercent = 0;
        }
      } else if (process.state === this.PROCESS_STATES.SLEEPING) {
        // Sleeping processes don't use CPU
        process.cpuPercent = 0;
        
        // Occasionally wake up
        if (rand < 0.1) { // 10% chance
          process.state = this.PROCESS_STATES.RUNNING;
        }
      } else if (process.state === this.PROCESS_STATES.ZOMBIE) {
        // Zombie processes get cleaned up after a while
        if (rand < 0.2) { // 20% chance
          this.processes.splice(i, 1);
          i--; // Adjust index since we removed an element
          continue;
        }
      }
      
      // If process has an endTime and it's past that time, terminate it
      if (process.endTime && new Date() > process.endTime) {
        // Remove the process
        this.processes.splice(i, 1);
        i--; // Adjust index since we removed an element
        
        // Update stats
        this.stats.totalKilled++;
        continue;
      }
      
      // Update memory usage (slight fluctuations)
      const memoryFluctuation = (Math.random() - 0.5) * 100; // -50 to +50 KB
      process.memory = Math.max(0, process.memory + memoryFluctuation);
    }
  }
  
  /**
   * Format uptime to HH:MM:SS format
   * @returns {string} Formatted uptime
   */
  _formatUptime() {
    const hours = Math.floor(this.uptime / 3600);
    const minutes = Math.floor((this.uptime % 3600) / 60);
    const seconds = this.uptime % 60;
    
    let formattedUptime = '';
    
    if (hours > 0) {
      formattedUptime = `${hours}h`;
    }
    
    formattedUptime += `${minutes}m${seconds}s`;
    
    return formattedUptime;
  }
  
  /**
   * Format start time relative to current time
   * @param {Date} startTime - Process start time
   * @returns {string} Formatted start time
   */
  _formatStartTime(startTime) {
    const now = new Date();
    const diffInMs = now - startTime;
    const diffInMins = Math.floor(diffInMs / 60000);
    
    if (diffInMins < 60) {
      return `${diffInMins} min ago`;
    } else {
      const diffInHours = Math.floor(diffInMins / 60);
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    }
  }
  
  /**
   * Start the process scheduler
   */
  startScheduler() {
    if (!this.schedulerInterval) {
      this.schedulerInterval = setInterval(() => this.scheduleProcesses(), 1000);
    }
  }
  
  /**
   * Stop the process scheduler
   */
  stopScheduler() {
    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval);
      this.schedulerInterval = null;
    }
  }
  
  /**
   * Clean up resources
   */
  destroy() {
    this.stopScheduler();
    this.processes = [];
  }
} 