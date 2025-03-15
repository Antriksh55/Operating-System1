/**
 * ProcessManager simulates process creation, management and scheduling
 * in an operating system.
 */
export class ProcessManager {
  constructor() {
    // Initialize with some system processes
    this.processes = [
      {
        pid: 1,
        name: 'init',
        state: 'running',
        priority: 0,
        cpu: 0.1,
        memory: '2MB',
        cpuPercent: 0.1,
        memoryPercent: 0.2,
        startTime: new Date(Date.now() - 3600000), // Started 1 hour ago
        user: 'root'
      },
      {
        pid: 2,
        name: 'system',
        state: 'running',
        priority: 0,
        cpu: 0.5,
        memory: '8MB',
        cpuPercent: 0.5,
        memoryPercent: 0.7,
        startTime: new Date(Date.now() - 3600000),
        user: 'root'
      },
      {
        pid: 345,
        name: 'shell',
        state: 'running',
        priority: 10,
        cpu: 0.2,
        memory: '4MB',
        cpuPercent: 0.2,
        memoryPercent: 0.4,
        startTime: new Date(Date.now() - 120000), // Started 2 minutes ago
        user: 'user'
      }
    ];
    
    this.nextPid = 1000;
    this.schedulerInterval = null;
    
    // Start the process scheduler
    this.startScheduler();
  }
  
  /**
   * Creates a new process
   * @param {string} name - Process name
   * @param {number} priority - Process priority (lower number = higher priority)
   * @param {string} user - User who created the process
   * @returns {Object} The created process
   */
  createProcess(name, priority = 10, user = 'user') {
    const pid = this.nextPid++;
    
    const process = {
      pid,
      name,
      state: 'running',
      priority,
      cpu: Math.random() * 2, // Random CPU usage between 0-2%
      memory: `${Math.floor(Math.random() * 50 + 1)}MB`, // Random memory usage
      cpuPercent: Math.random() * 2,
      memoryPercent: Math.random() * 1.5,
      startTime: new Date(),
      user
    };
    
    this.processes.push(process);
    return process;
  }
  
  /**
   * Terminates a process by PID
   * @param {number} pid - Process ID to terminate
   * @returns {boolean} Success status
   */
  killProcess(pid) {
    const index = this.processes.findIndex(p => p.pid === pid);
    
    if (index === -1) {
      throw new Error(`Process with PID ${pid} not found`);
    }
    
    // Don't allow killing system processes (PIDs 1-999)
    if (pid < 1000 && pid !== 345) { // Allow killing the shell for demo purposes
      throw new Error(`Cannot terminate system process with PID ${pid}`);
    }
    
    this.processes.splice(index, 1);
    return true;
  }
  
  /**
   * Returns a list of all processes
   * @returns {Array} Array of process objects
   */
  listProcesses() {
    return [...this.processes];
  }
  
  /**
   * Returns the top processes by CPU usage
   * @param {number} limit - Maximum number of processes to return
   * @returns {Array} Array of top processes
   */
  getTopProcesses(limit = 5) {
    // Sort by CPU usage and take the top ones
    return [...this.processes]
      .sort((a, b) => b.cpuPercent - a.cpuPercent)
      .slice(0, limit);
  }
  
  /**
   * Finds a process by PID
   * @param {number} pid - Process ID to find
   * @returns {Object|null} The process, or null if not found
   */
  getProcessByPid(pid) {
    return this.processes.find(p => p.pid === pid) || null;
  }
  
  /**
   * Changes the priority of a process
   * @param {number} pid - Process ID to modify
   * @param {number} priority - New priority value
   * @returns {boolean} Success status
   */
  setProcessPriority(pid, priority) {
    const process = this.getProcessByPid(pid);
    
    if (!process) {
      throw new Error(`Process with PID ${pid} not found`);
    }
    
    process.priority = priority;
    return true;
  }
  
  /**
   * Simulates process scheduling by updating CPU and memory usage
   * This is called periodically to simulate real OS behavior
   */
  scheduleProcesses() {
    this.processes.forEach(process => {
      // Simulate CPU fluctuation
      let cpuChange = (Math.random() - 0.5) * 0.5;
      
      // Cap CPU usage between 0.05% and 20%
      process.cpuPercent = Math.max(0.05, Math.min(20, process.cpuPercent + cpuChange));
      process.cpu = process.cpuPercent;
      
      // Randomly change process state occasionally
      if (Math.random() > 0.95) {
        const states = ['running', 'waiting', 'sleeping', 'stopped'];
        // Keep system processes running
        process.state = process.pid < 1000 ? 'running' : states[Math.floor(Math.random() * states.length)];
      }
      
      // Create some child processes occasionally
      if (Math.random() > 0.98 && this.processes.length < 15) {
        this.createProcess(`child_of_${process.name}`, process.priority + 5, process.user);
      }
      
      // Terminate some processes occasionally
      if (Math.random() > 0.98 && process.pid > 1000) {
        this.killProcess(process.pid);
      }
    });
  }
  
  /**
   * Starts the process scheduler
   */
  startScheduler() {
    if (this.schedulerInterval) return;
    
    this.schedulerInterval = setInterval(() => {
      this.scheduleProcesses();
    }, 3000); // Update every 3 seconds
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
   * Clean up when destroying the manager
   */
  destroy() {
    this.stopScheduler();
  }
} 