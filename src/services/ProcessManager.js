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
   * @returns {Object} Created process object
   */
  createProcess(name, command = '', priority = 0, user = 'user') {
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
      output: `Started process ${process.name} with PID ${pid}`
    };
  }
  
  /**
   * Kills a process by PID
   * @param {number} pid - Process ID to kill
   * @returns {Object} Result of the operation
   */
  killProcess(pid) {
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
      output: `Terminated process ${process.name} with PID ${pid}`
    };
  }
  
  /**
   * Lists all running processes in a simplified format
   * @returns {Object} List of processes
   */
  listProcesses() {
    // Format the processes for display
    const formattedProcesses = this.processes.map(p => 
      `${p.pid.toString().padEnd(6)} ${p.user.padEnd(10)} ${p.state.padEnd(8)} ${p.cpuPercent.toFixed(1).padEnd(5)} ${p.memoryPercent.toFixed(1).padEnd(5)} ${this._formatStartTime(p.startTime).padEnd(14)} ${p.command}`
    );
    
    return {
      success: true,
      output: `PID    USER       STATE    CPU   MEM   STARTED       COMMAND\n${formattedProcesses.join('\n')}`
    };
  }
  
  /**
   * Gets the top processes sorted by CPU usage
   * @param {number} limit - Maximum number of processes to return
   * @returns {Object} Top processes by CPU usage
   */
  getTopProcesses() {
    // Sort processes by CPU usage
    const sortedProcesses = [...this.processes].sort((a, b) => b.cpuPercent - a.cpuPercent);
    
    // Create a header with system stats
    const load1 = (Math.random() * 0.5 + 0.1).toFixed(2);
    const load5 = (Math.random() * 0.4 + 0.2).toFixed(2);
    const load15 = (Math.random() * 0.3 + 0.3).toFixed(2);
    
    // Get total CPU and memory
    const totalCpu = this.processes.reduce((sum, p) => sum + p.cpuPercent, 0).toFixed(1);
    const totalMem = this.processes.reduce((sum, p) => sum + p.memory, 0) / 1024; // Convert to MB
    
    const header = `Virtual OS - ${this._formatUptime()}
Processes: ${this.processes.length} total, ${this.processes.filter(p => p.state === this.PROCESS_STATES.RUNNING).length} running, ${this.processes.filter(p => p.state === this.PROCESS_STATES.SLEEPING).length} sleeping, ${this.processes.filter(p => p.state === this.PROCESS_STATES.ZOMBIE).length} zombie
Load Avg: ${load1}, ${load5}, ${load15}
CPU Usage: ${totalCpu}% total
Memory Usage: ${totalMem.toFixed(1)} MB total

PID    USER       PRI  NI   STATE    CPU%   MEM%   TIME+    COMMAND`;
    
    // Format the processes for top display
    const formattedProcesses = sortedProcesses.map(p => {
      const runtime = Math.floor((Date.now() - p.startTime.getTime()) / 1000);
      const minutes = Math.floor(runtime / 60);
      const seconds = runtime % 60;
      const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      
      return `${p.pid.toString().padEnd(6)} ${p.user.padEnd(10)} ${p.priority.toString().padEnd(4)} ${p.nice.toString().padEnd(3)} ${p.state.padEnd(8)} ${p.cpuPercent.toFixed(1).padEnd(6)} ${p.memoryPercent.toFixed(1).padEnd(6)} ${timeStr.padEnd(8)} ${p.command}`;
    });
    
    return {
      success: true,
      output: `${header}\n${formattedProcesses.join('\n')}`
    };
  }
  
  /**
   * Gets a process by PID
   * @param {number} pid - Process ID
   * @returns {Object} Process object or null
   */
  getProcessByPid(pid) {
    // Convert pid to number if it's a string
    pid = parseInt(pid, 10);
    
    const process = this.processes.find(p => p.pid === pid);
    
    if (!process) {
      return { success: false, output: `No process found with PID ${pid}` };
    }
    
    // Format the detailed process info
    const detail = `Process ID: ${process.pid}
Name: ${process.name}
Command: ${process.command}
State: ${process.state}
User: ${process.user}
Priority: ${process.priority} (nice ${process.nice})
CPU Usage: ${process.cpuPercent.toFixed(1)}%
Memory: ${(process.memory / 1024).toFixed(2)} MB (${process.memoryPercent.toFixed(1)}%)
Started: ${process.startTime.toLocaleString()}
Threads: ${process.threads}
Open File Descriptors: ${process.descriptors}
Children: ${process.children.join(', ') || 'none'}`;
    
    return { success: true, output: detail };
  }
  
  /**
   * Sets the priority of a process
   * @param {number} pid - Process ID
   * @param {number} priority - New priority (nice value, -20 to 19)
   * @returns {Object} Result of the operation
   */
  setProcessPriority(pid, priority) {
    // Convert pid and priority to numbers if they're strings
    pid = parseInt(pid, 10);
    priority = parseInt(priority, 10);
    
    // Validate priority range
    if (priority < -20 || priority > 19) {
      return { success: false, output: `Invalid priority value. Must be between -20 and 19.` };
    }
    
    // Find the process
    const process = this.processes.find(p => p.pid === pid);
    
    if (!process) {
      return { success: false, output: `No process found with PID ${pid}` };
    }
    
    // Update the priority
    process.priority = priority;
    process.nice = priority;
    
    return {
      success: true,
      output: `Set priority of process ${process.name} (PID ${pid}) to ${priority}`
    };
  }
  
  /**
   * Simulates process scheduling and updates process states
   */
  scheduleProcesses() {
    // Increment system uptime
    this.uptime += 1;
    
    // Update each process
    for (let i = 0; i < this.processes.length; i++) {
      const process = this.processes[i];
      
      // Randomly change process state for some processes
      if (process.pid > 10 && Math.random() < 0.1) {
        // 10% chance to change state for non-system processes
        const stateValues = Object.values(this.PROCESS_STATES);
        const randomState = stateValues[Math.floor(Math.random() * (stateValues.length - 1))]; // Exclude zombie state
        process.state = randomState;
      }
      
      // Fluctuate CPU usage based on process state
      if (process.state === this.PROCESS_STATES.RUNNING) {
        // Randomize CPU usage fluctuation for running processes
        process.cpuPercent = Math.max(0, process.cpu + (Math.random() * 2 - 1) * process.cpu * 0.3);
      } else if (process.state === this.PROCESS_STATES.SLEEPING || process.state === this.PROCESS_STATES.WAITING) {
        process.cpuPercent = 0;
      } else if (process.state === this.PROCESS_STATES.ZOMBIE) {
        process.cpuPercent = 0;
        // Zombies eventually get cleaned up
        if (Math.random() < 0.2) {
          this.processes.splice(i, 1);
          i--;
          continue;
        }
      }
      
      // Calculate memory percentage based on total system memory (using 8GB as baseline)
      process.memoryPercent = (process.memory / 1024) / 8192 * 100;
      
      // Check if the process has reached its end time and should be terminated
      if (process.endTime && Date.now() >= process.endTime.getTime()) {
        // Mark as zombie first
        process.state = this.PROCESS_STATES.ZOMBIE;
        process.cpuPercent = 0;
        
        // 50% chance to fully remove the process in this cycle
        if (Math.random() < 0.5) {
          this.processes.splice(i, 1);
          i--;
          this.stats.totalKilled++;
        }
      }
    }
    
    // Randomly spawn new system processes
    if (Math.random() < 0.05) {
      // 5% chance to create a new background process
      const systemProcessNames = ['sshd', 'cron', 'rsyslog', 'dbus-daemon', 'dhclient'];
      const randomName = systemProcessNames[Math.floor(Math.random() * systemProcessNames.length)];
      this.createProcess(randomName, `/usr/sbin/${randomName}`, 0, 'root');
    }
    
    // Update stats
    this.stats.contextSwitches += Math.floor(Math.random() * 100);
  }
  
  /**
   * Formats the system uptime into a readable string
   * @returns {string} Formatted uptime
   */
  _formatUptime() {
    const days = Math.floor(this.uptime / 86400);
    const hours = Math.floor((this.uptime % 86400) / 3600);
    const minutes = Math.floor((this.uptime % 3600) / 60);
    
    let uptimeStr = '';
    if (days > 0) {
      uptimeStr += `${days} days, `;
    }
    
    uptimeStr += `${hours}:${minutes.toString().padStart(2, '0')}`;
    return uptimeStr;
  }
  
  /**
   * Formats a start time into a readable string
   * @param {Date} startTime - Process start time
   * @returns {string} Formatted start time
   */
  _formatStartTime(startTime) {
    const now = new Date();
    const timeDiff = now - startTime;
    
    // If process started less than 24 hours ago, show time only
    if (timeDiff < 86400000) {
      return startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Otherwise show date
    return startTime.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
  
  /**
   * Starts the process scheduler
   */
  startScheduler() {
    if (!this.schedulerInterval) {
      this.schedulerInterval = setInterval(() => this.scheduleProcesses(), 1000);
    }
  }
  
  /**
   * Stops the process scheduler
   */
  stopScheduler() {
    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval);
      this.schedulerInterval = null;
    }
  }
  
  /**
   * Clean up resources when destroying the manager
   */
  destroy() {
    this.stopScheduler();
  }
} 