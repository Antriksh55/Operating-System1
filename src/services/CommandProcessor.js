// Import our virtual file system and process manager services
import { VirtualFileSystem } from './VirtualFileSystem';
import { ProcessManager } from './ProcessManager';
import { HardwareSimulator } from './HardwareSimulator';

// Initialize our subsystems as singleton instances to ensure persistence
// This ensures the same instance is used across all command invocations
let fsInstance = null;
let processManagerInstance = null;
let hardwareSimulatorInstance = null;

// Helper function to get the filesystem instance
const getFs = () => {
  if (!fsInstance) {
    fsInstance = new VirtualFileSystem();
  }
  return fsInstance;
};

// Helper function to get the process manager instance
const getProcessManager = () => {
  if (!processManagerInstance) {
    processManagerInstance = new ProcessManager();
  }
  return processManagerInstance;
};

// Helper function to get the hardware simulator instance
const getHardwareSimulator = () => {
  if (!hardwareSimulatorInstance) {
    hardwareSimulatorInstance = new HardwareSimulator();
  }
  return hardwareSimulatorInstance;
};

// Command processing function that takes a command string and returns the result
export const processCommand = (commandString) => {
  // Get our service instances
  const fs = getFs();
  const processManager = getProcessManager();
  const hardwareSimulator = getHardwareSimulator();
  
  // Parse the command into command and arguments
  const args = commandString.trim().split(/\s+/);
  const command = args.shift().toLowerCase();

  // Execute the appropriate command
  switch (command) {
    case 'help':
      return handleHelp(args);
    
    // File system commands
    case 'ls':
      return handleLs(args);
    case 'cd':
      return handleCd(args);
    case 'mkdir':
      return handleMkdir(args);
    case 'touch':
      return handleTouch(args);
    case 'cat':
      return handleCat(args);
    case 'rm':
      return handleRm(args);
    case 'cp':
      return handleCp(args);
    case 'mv':
      return handleMv(args);
    case 'chmod':
      return handleChmod(args);
    case 'pwd':
      return handlePwd(args);
    case 'find':
      return handleFind(args);
    case 'grep':
      return handleGrep(args);
    case 'clear':
      return handleClear(args);
    case 'echo':
      return handleEcho(args);
    
    // Process commands
    case 'ps':
      return handlePs(args);
    case 'top':
      return handleTop(args);
    case 'kill':
      return handleKill(args);
    case 'nice':
      return handleNice(args);
    
    // Hardware commands
    case 'memory':
      return handleMemory(args);
    case 'cpu':
      return handleCpu(args);
    case 'disk':
      return handleDisk(args);
    case 'network':
      return handleNetwork(args);
    
    // Unknown command
    default:
      return {
        success: false,
        output: `Command not found: ${command}\nType 'help' to see available commands.`
      };
  }
};

// Help command - show available commands
const handleHelp = (args) => {
  // If a specific command is provided, show help for that command
  if (args.length > 0) {
    const command = args[0].toLowerCase();
    switch (command) {
      case 'ls':
        return { success: true, output: 'ls [directory] - List contents of a directory' };
      case 'cd':
        return { success: true, output: 'cd [directory] - Change current directory' };
      case 'mkdir':
        return { success: true, output: 'mkdir <directory> - Create a new directory' };
      case 'touch':
        return { success: true, output: 'touch <file> - Create a new empty file' };
      case 'cat':
        return { success: true, output: 'cat <file> - Display contents of a file' };
      case 'rm':
        return { success: true, output: 'rm [-r] <path> - Remove a file or directory (-r for recursive)' };
      case 'cp':
        return { success: true, output: 'cp <source> <destination> - Copy a file or directory' };
      case 'mv':
        return { success: true, output: 'mv <source> <destination> - Move/rename a file or directory' };
      case 'chmod':
        return { success: true, output: 'chmod <permissions> <file> - Change file permissions (e.g. chmod 755 file.txt)' };
      case 'pwd':
        return { success: true, output: 'pwd - Print current working directory' };
      case 'find':
        return { success: true, output: 'find <directory> -name <pattern> - Find files matching pattern' };
      case 'grep':
        return { success: true, output: 'grep <pattern> <file> - Search for pattern in file' };
      case 'clear':
        return { success: true, output: 'clear - Clear the terminal screen' };
      case 'echo':
        return { success: true, output: 'echo [text] - Display a line of text' };
      case 'ps':
        return { success: true, output: 'ps - List running processes' };
      case 'top':
        return { success: true, output: 'top - Display system processes in real time' };
      case 'kill':
        return { success: true, output: 'kill <pid> - Terminate a process by ID' };
      case 'nice':
        return { success: true, output: 'nice <priority> <pid> - Change process priority' };
      case 'memory':
        return { success: true, output: 'memory - Display memory usage statistics' };
      case 'cpu':
        return { success: true, output: 'cpu - Display CPU usage statistics' };
      case 'disk':
        return { success: true, output: 'disk - Display disk usage statistics' };
      case 'network':
        return { success: true, output: 'network - Display network interface statistics' };
      default:
        return { success: false, output: `No help available for: ${command}` };
    }
  }

  // Otherwise show general help
  return {
    success: true,
    output: `
Available commands:

File System:
  ls [directory]          - List contents of a directory
  cd [directory]          - Change current directory
  mkdir <directory>       - Create a new directory
  touch <file>            - Create a new empty file
  cat <file>              - Display contents of a file
  rm [-r] <path>          - Remove a file or directory
  cp <source> <dest>      - Copy a file or directory
  mv <source> <dest>      - Move/rename a file or directory
  chmod <perm> <file>     - Change file permissions
  pwd                     - Print working directory
  find <dir> -name <pat>  - Find files matching pattern
  grep <pattern> <file>   - Search for pattern in file
  clear                   - Clear the terminal screen
  echo [text]             - Display a line of text

Process Management:
  ps                      - List running processes
  top                     - Display system processes
  kill <pid>              - Terminate a process
  nice <priority> <pid>   - Change process priority

Hardware Monitoring:
  memory                  - Display memory usage statistics
  cpu                     - Display CPU usage statistics
  disk                    - Display disk usage statistics
  network                 - Display network interface statistics

Type 'help <command>' for more details on a specific command.
`
  };
};

// File system command handlers
const handleLs = (args) => {
  try {
    const fs = getFs();
    const path = args.length > 0 ? args[0] : '.';
    
    // For debugging purposes, show the current directory
    const curDirResult = fs.getCurrentDirectory();
    const currentDir = curDirResult.success ? curDirResult.path : 'unknown';
    
    const result = fs.listDirectory(path);
    
    if (!result.success) {
      return {
        success: false,
        output: `ls: ${result.error}`
      };
    }
    
    // Format the output to include file types and permissions
    const formattedOutput = result.files.map(file => {
      const type = file.type === 'directory' ? 'd' : '-';
      const perms = file.permissions || (file.type === 'directory' ? 'rwxr-xr-x' : 'rw-r--r--');
      const size = file.size || '0';
      const modified = file.modified ? new Date(file.modified).toLocaleString() : '';
      
      return `${type}${perms} ${size.toString().padStart(8)} ${modified.padEnd(20)} ${file.name}${file.type === 'directory' ? '/' : ''}`;
    });
    
    // Add the current path in the output for clarity
    const headerOutput = [`Current directory: ${currentDir}`, 'Listing:'];
    
    return {
      success: true,
      output: headerOutput.concat(formattedOutput.length > 0 ? formattedOutput : ['Directory is empty'])
    };
  } catch (error) {
    return {
      success: false,
      output: `ls: ${error.message}`
    };
  }
};

const handleCd = (args) => {
  try {
    const fs = getFs();
    const path = args.length > 0 ? args[0] : '~';
    
    // Store the old path for reference
    const oldPathResult = fs.getCurrentDirectory();
    const oldPath = oldPathResult.success ? oldPathResult.path : 'unknown';
    
    const result = fs.changeDirectory(path);
    
    if (!result.success) {
      return {
        success: false,
        output: `cd: ${result.error}`
      };
    }
    
    // Get the new path to show feedback
    const newPathResult = fs.getCurrentDirectory();
    const newPath = newPathResult.success ? newPathResult.path : 'unknown';
    
    // Provide feedback only if explicitly requested
    if (args.includes('-v') || args.includes('--verbose')) {
      return {
        success: true,
        output: `Changed directory from ${oldPath} to ${newPath}`
      };
    }
    
    // Standard cd behavior is to be silent on success
    return {
      success: true,
      output: null
    };
  } catch (error) {
    return {
      success: false,
      output: `cd: ${error.message}`
    };
  }
};

const handleMkdir = (args) => {
  if (args.length === 0) {
    return {
      success: false,
      output: 'mkdir: missing directory name'
    };
  }
  
  try {
    const fs = getFs();
    const result = fs.makeDirectory(args[0]);
    
    if (!result.success) {
      return {
        success: false,
        output: `mkdir: ${result.error}`
      };
    }
    
    return {
      success: true,
      output: result.message || `Created directory: ${args[0]}`
    };
  } catch (error) {
    return {
      success: false,
      output: `mkdir: ${error.message}`
    };
  }
};

const handleTouch = (args) => {
  if (args.length === 0) {
    return {
      success: false,
      output: 'touch: missing file operand'
    };
  }
  
  try {
    const fs = getFs();
    const result = fs.createFile(args[0], '');
    
    if (!result.success) {
      return {
        success: false,
        output: `touch: ${result.error}`
      };
    }
    
    return {
      success: true,
      output: result.message || `Created file: ${args[0]}`
    };
  } catch (error) {
    return {
      success: false,
      output: `touch: ${error.message}`
    };
  }
};

const handleCat = (args) => {
  if (args.length === 0) {
    return {
      success: false,
      output: 'cat: missing file operand'
    };
  }
  
  try {
    const fs = getFs();
    const result = fs.readFile(args[0]);
    
    if (!result.success) {
      return {
        success: false,
        output: `cat: ${result.error}`
      };
    }
    
    return {
      success: true,
      output: result.content ? result.content.split('\n') : ['']
    };
  } catch (error) {
    return {
      success: false,
      output: `cat: ${error.message}`
    };
  }
};

const handleRm = (args) => {
  if (args.length === 0) {
    return {
      success: false,
      output: 'rm: missing operand'
    };
  }
  
  let recursive = false;
  let filteredArgs = [...args];
  
  // Check for recursive flag
  if (args.includes('-r') || args.includes('-R') || args.includes('--recursive')) {
    recursive = true;
    filteredArgs = filteredArgs.filter(arg => arg !== '-r' && arg !== '-R' && arg !== '--recursive');
  }
  
  if (filteredArgs.length === 0) {
    return {
      success: false,
      output: 'rm: missing operand'
    };
  }
  
  try {
    const fs = getFs();
    const path = filteredArgs[0];
    const result = fs.remove(path, recursive);
    
    if (!result.success) {
      return {
        success: false,
        output: `rm: ${result.error}`
      };
    }
    
    return {
      success: true,
      output: result.message || `removed '${path}'`
    };
  } catch (error) {
    return {
      success: false,
      output: `rm: ${error.message}`
    };
  }
};

// Process management command handlers
const handlePs = (args) => {
  try {
    const processManager = getProcessManager();
    const result = processManager.listProcesses();
    
    if (!result.success) {
      return {
        success: false,
        output: `ps: ${result.output || 'Failed to list processes'}`
      };
    }
    
    const processes = result.processes;
    
    // Format the output like the real ps command
    const headers = ['PID', 'USER', 'STATE', '%CPU', 'MEM', 'START', 'COMMAND'];
    const formattedOutput = [headers.join('\t')];
    
    processes.forEach(proc => {
      const row = [
        proc.pid,
        proc.user,
        proc.state,
        proc.cpuPercent.toFixed(1),
        `${Math.round(proc.memory / 1024)}M`,
        new Date(proc.startTime).toLocaleTimeString(),
        proc.command.length > 40 ? proc.command.substring(0, 37) + '...' : proc.command
      ];
      formattedOutput.push(row.join('\t'));
    });
    
    return {
      success: true,
      output: formattedOutput
    };
  } catch (error) {
    return {
      success: false,
      output: `ps: ${error.message}`
    };
  }
};

const handleTop = (args) => {
  try {
    const processManager = getProcessManager();
    const hardwareSimulator = getHardwareSimulator();
    
    // Get CPU, memory, and process information
    const cpuResult = hardwareSimulator.getCpuUsage();
    const memResult = hardwareSimulator.getMemoryUsage();
    const processResult = processManager.getTopProcesses();
    
    if (!cpuResult.success || !memResult.success || !processResult.success) {
      return {
        success: false,
        output: 'top: Error fetching system information'
      };
    }
    
    const cpuUsage = cpuResult.usage;
    const memoryUsage = memResult;
    const processes = processResult.processes;
    const stats = processResult.stats || {};
    
    const output = [
      `OS Simulator - ${new Date().toLocaleString()}`,
      `Uptime: ${hardwareSimulator.getUptime()}`,
      '',
      `Tasks: ${stats.total || processes.length} total, ${stats.running || 0} running, ${stats.sleeping || 0} sleeping, ${stats.stopped || 0} stopped`,
      `CPU Usage: ${cpuUsage.toFixed(1)}%`,
      `Memory Usage: ${memoryUsage.used}MB / ${memoryUsage.total}MB (${memoryUsage.percentage.toFixed(1)}%)`,
      '',
      'TOP PROCESSES:',
      'PID   NAME           CPU%  MEM%  STATE     USER',
      '-----------------------------------------------'
    ];
    
    processes.forEach(proc => {
      output.push(`${proc.pid.toString().padEnd(5)} ${proc.name.padEnd(15)} ${proc.cpuPercent.toFixed(1).padEnd(5)} ${proc.memoryPercent.toFixed(1).padEnd(5)} ${proc.state.padEnd(9)} ${proc.user}`);
    });
    
    return {
      success: true,
      output
    };
  } catch (error) {
    return {
      success: false,
      output: `top: ${error.message}`
    };
  }
};

const handleKill = (args) => {
  if (args.length === 0) {
    return {
      success: false,
      output: 'kill: usage: kill [-s signal | -p] pid'
    };
  }
  
  try {
    const processManager = getProcessManager();
    const pid = parseInt(args[0], 10);
    
    if (isNaN(pid)) {
      return {
        success: false,
        output: `kill: illegal pid: ${args[0]}`
      };
    }
    
    const result = processManager.killProcess(pid);
    
    if (!result.success) {
      return {
        success: false,
        output: result.output || `Failed to kill process ${pid}`
      };
    }
    
    return {
      success: true,
      output: result.output || `Terminated process ${pid}`
    };
  } catch (error) {
    return {
      success: false,
      output: `kill: ${error.message}`
    };
  }
};

// Hardware monitoring command handlers
const handleMemory = (args) => {
  try {
    const hardwareSimulator = getHardwareSimulator();
    
    // Show detailed info if arguments provided, otherwise simple view
    if (args.length > 0) {
      const detailedResult = hardwareSimulator.getDetailedMemoryInfo();
      
      if (!detailedResult.success) {
        return {
          success: false,
          output: `memory: ${detailedResult.error}`
        };
      }
      
      const memInfo = detailedResult.info;
      
      // Format similar to 'free -h' command
      const output = [
        'Memory Information:',
        '--------------------------------------------------------------------------------',
        `Total: ${memInfo.total} MB`,
        `Used: ${memInfo.used} MB (${memInfo.percentage.toFixed(1)}%)`,
        `Free: ${memInfo.free} MB`,
        `Cached: ${memInfo.cached} MB`,
        `Buffers: ${memInfo.buffers} MB`,
        '',
        'Swap:',
        `Total: ${memInfo.swapTotal} MB`,
        `Used: ${memInfo.swapUsed} MB (${(memInfo.swapUsed / memInfo.swapTotal * 100).toFixed(1)}%)`,
        `Free: ${memInfo.swapFree} MB`,
        '',
        'Memory Allocations:',
        `System: ${memInfo.system} MB`,
        `User Processes: ${memInfo.userProcesses} MB`,
        `Shared: ${memInfo.shared} MB`,
        '',
        'Hardware Info:',
        `Technology: ${memInfo.technology}`,
        `Speed: ${memInfo.speed} MHz`,
        `Channels: ${memInfo.channels}`
      ];
      
      return {
        success: true,
        output
      };
    } else {
      // Simple memory info
      const result = hardwareSimulator.getMemoryUsage();
      
      if (!result.success) {
        return {
          success: false,
          output: `memory: ${result.error}`
        };
      }
      
      // Create a visual memory bar
      const usedPercentage = result.percentage;
      const barLength = 50; // characters
      const usedChars = Math.round((usedPercentage / 100) * barLength);
      const bar = '[' + '#'.repeat(usedChars) + ' '.repeat(barLength - usedChars) + ']';
      
      const output = [
        `Memory Usage: ${result.used} MB / ${result.total} MB (${usedPercentage.toFixed(1)}%)`,
        bar,
        `Free: ${result.free} MB`
      ];
      
      return {
        success: true,
        output
      };
    }
  } catch (error) {
    return {
      success: false,
      output: `memory: ${error.message}`
    };
  }
};

const handleCpu = (args) => {
  try {
    const hardwareSimulator = getHardwareSimulator();
    
    // Show detailed info if arguments provided, otherwise simple view
    if (args.length > 0) {
      const detailedResult = hardwareSimulator.getDetailedCpuInfo();
      
      if (!detailedResult.success) {
        return {
          success: false,
          output: `cpu: ${detailedResult.error}`
        };
      }
      
      const cpuInfo = detailedResult.info;
      
      // Format as detailed CPU info
      const output = [
        'CPU Information:',
        '--------------------------------------------------------------------------------',
        `Model: ${cpuInfo.model}`,
        `Architecture: ${cpuInfo.architecture}`,
        `Cores: ${cpuInfo.cores}`,
        `Threads: ${cpuInfo.threads}`,
        `Clock Speed: ${cpuInfo.clockSpeed} GHz`,
        '',
        'Cache:',
        `L1 Cache: ${cpuInfo.cache.l1}`,
        `L2 Cache: ${cpuInfo.cache.l2}`,
        `L3 Cache: ${cpuInfo.cache.l3}`,
        '',
        'Usage:',
        `Current: ${cpuInfo.usage.current.toFixed(1)}%`,
        `Average (1 min): ${cpuInfo.usage.average1min.toFixed(1)}%`,
        `Average (5 min): ${cpuInfo.usage.average5min.toFixed(1)}%`,
        `Temperature: ${cpuInfo.temperature}°C`,
        '',
        'Utilization:',
        `User: ${cpuInfo.distribution.user}%`,
        `System: ${cpuInfo.distribution.system}%`,
        `I/O Wait: ${cpuInfo.distribution.io}%`,
        `Idle: ${cpuInfo.distribution.idle}%`,
        '',
        'Core Details:'
      ];
      
      // Add per-core information
      cpuInfo.perCore.forEach((core, i) => {
        output.push(`Core ${i}: ${core.usage.toFixed(1)}% (${core.temperature}°C)`);
      });
      
      return {
        success: true,
        output
      };
    } else {
      // Simple CPU info
      const result = hardwareSimulator.getCpuUsage();
      
      if (!result.success) {
        return {
          success: false,
          output: `cpu: ${result.error}`
        };
      }
      
      // Create a visual CPU usage bar
      const barLength = 50; // characters
      const usedChars = Math.round((result.usage / 100) * barLength);
      const bar = '[' + '#'.repeat(usedChars) + ' '.repeat(barLength - usedChars) + ']';
      
      const output = [
        `CPU Usage: ${result.usage.toFixed(1)}%`,
        bar
      ];
      
      return {
        success: true,
        output
      };
    }
  } catch (error) {
    return {
      success: false,
      output: `cpu: ${error.message}`
    };
  }
};

const handleDisk = (args) => {
  try {
    const hardwareSimulator = getHardwareSimulator();
    const result = hardwareSimulator.getDetailedStorageInfo();
    
    if (!result.success) {
      return {
        success: false,
        output: `disk: ${result.error}`
      };
    }
    
    const storageInfo = result.info;
    
    const output = [
      'Storage Information:',
      '--------------------------------------------------------------------------------',
      `Total: ${storageInfo.total.toFixed(1)} GB`,
      `Used: ${storageInfo.used.toFixed(1)} GB (${storageInfo.percentage.toFixed(1)}%)`,
      `Free: ${storageInfo.free.toFixed(1)} GB`,
      '',
      'Disk Activity:',
      `Reads: ${storageInfo.activity.reads.toFixed(1)} MB/s`,
      `Writes: ${storageInfo.activity.writes.toFixed(1)} MB/s`,
      `Read IOPS: ${storageInfo.activity.iops.reads}`,
      `Write IOPS: ${storageInfo.activity.iops.writes}`,
      '',
      'Devices:',
      'Name       Model                      Type  Size     Interface  Speed'
    ];
    
    // Add device information
    storageInfo.devices.forEach(device => {
      output.push(`${device.name.padEnd(10)} ${device.model.padEnd(25)} ${device.type.padEnd(5)} ${device.size.toFixed(1).padEnd(8)} ${device.interface.padEnd(10)} ${device.speed}`);
    });
    
    output.push('');
    output.push('Partitions:');
    output.push('Device      Mount Point        Size     Used     Free     Use%');
    
    // Add partition information
    storageInfo.partitions.forEach(partition => {
      output.push(`${partition.name.padEnd(11)} ${partition.mountPoint.padEnd(18)} ${partition.size.toFixed(1).padEnd(8)} ${partition.used.toFixed(1).padEnd(8)} ${partition.free.toFixed(1).padEnd(8)} ${partition.percentage.toFixed(1)}%`);
    });
    
    return {
      success: true,
      output
    };
  } catch (error) {
    return {
      success: false,
      output: `disk: ${error.message}`
    };
  }
};

const handleNetwork = (args) => {
  try {
    const hardwareSimulator = getHardwareSimulator();
    const result = hardwareSimulator.getDetailedNetworkInfo();
    
    if (!result.success) {
      return {
        success: false,
        output: `network: ${result.error}`
      };
    }
    
    const networkInfo = result.info;
    
    const output = [
      'Network Information:',
      '--------------------------------------------------------------------------------',
      `Hostname: ${networkInfo.hostname}`,
      `Domain: ${networkInfo.domain}`,
      '',
      'Interfaces:',
      'Name       Type       Status      Speed     IPv4            MAC Address          RX/TX'
    ];
    
    // Add interface information
    networkInfo.interfaces.forEach(iface => {
      const rxRate = iface.download.current.toFixed(2) + ' MB/s';
      const txRate = iface.upload.current.toFixed(2) + ' MB/s';
      const speed = iface.speed ? iface.speed + ' Mbps' : 'N/A';
      
      output.push(`${iface.name.padEnd(10)} ${iface.type.padEnd(10)} ${iface.status.padEnd(11)} ${speed.padEnd(10)} ${iface.ipv4.padEnd(15)} ${iface.mac.padEnd(20)} ${rxRate}/${txRate}`);
      
      // Add packet statistics if the interface is active
      if (iface.status === 'connected') {
        output.push(`  RX packets: ${iface.rx_packets}, errors: ${iface.errors}, dropped: ${iface.dropped}`);
        output.push(`  TX packets: ${iface.tx_packets}, errors: 0, dropped: 0`);
        output.push('');
      }
    });
    
    return {
      success: true,
      output
    };
  } catch (error) {
    return {
      success: false,
      output: `network: ${error.message}`
    };
  }
};

const handleNice = (args) => {
  if (args.length < 2) {
    return {
      success: false,
      output: 'nice: Usage: nice -n <priority> <pid>'
    };
  }
  
  try {
    const processManager = getProcessManager();
    let priority, pid;
    
    // Parse command format: nice -n priority pid
    if (args[0] === '-n') {
      if (args.length < 3) {
        return {
          success: false,
          output: 'nice: missing priority and pid operands'
        };
      }
      priority = parseInt(args[1], 10);
      pid = parseInt(args[2], 10);
    } else {
      // Alternative format: nice priority pid
      priority = parseInt(args[0], 10);
      pid = parseInt(args[1], 10);
    }
    
    // Validate inputs
    if (isNaN(priority)) {
      return {
        success: false,
        output: `nice: invalid priority '${args[1]}'`
      };
    }
    
    if (isNaN(pid)) {
      return {
        success: false,
        output: `nice: invalid pid '${args[2]}'`
      };
    }
    
    // Validate priority range
    if (priority < -20 || priority > 19) {
      return {
        success: false,
        output: 'nice: priority must be between -20 and 19'
      };
    }
    
    const result = processManager.setProcessPriority(pid, priority);
    
    if (!result.success) {
      return {
        success: false,
        output: result.output || `Failed to set priority for process ${pid}`
      };
    }
    
    return {
      success: true,
      output: result.output || `Set priority of process ${pid} to ${priority}`
    };
  } catch (error) {
    return {
      success: false,
      output: `nice: ${error.message}`
    };
  }
};

// New command handlers
const handleCp = (args) => {
  if (args.length < 2) {
    return {
      success: false,
      output: 'cp: missing destination file operand'
    };
  }
  
  try {
    const fs = getFs();
    const source = args[0];
    const destination = args[1];
    
    // First, read the content from the source file
    const readResult = fs.readFile(source);
    
    if (!readResult.success) {
      return {
        success: false,
        output: `cp: cannot stat '${source}': ${readResult.error}`
      };
    }
    
    // Then, create the destination file with the same content
    const writeResult = fs.createFile(destination, readResult.content);
    
    if (!writeResult.success) {
      return {
        success: false,
        output: `cp: cannot create regular file '${destination}': ${writeResult.error}`
      };
    }
    
    return {
      success: true,
      output: `'${source}' -> '${destination}'`
    };
  } catch (error) {
    return {
      success: false,
      output: `cp: ${error.message}`
    };
  }
};

const handleMv = (args) => {
  if (args.length < 2) {
    return {
      success: false,
      output: 'mv: missing destination file operand'
    };
  }
  
  try {
    const fs = getFs();
    const source = args[0];
    const destination = args[1];
    
    // First, read the content from the source file
    const readResult = fs.readFile(source);
    
    if (!readResult.success) {
      return {
        success: false,
        output: `mv: cannot stat '${source}': ${readResult.error}`
      };
    }
    
    // Then, create the destination file with the same content
    const writeResult = fs.createFile(destination, readResult.content);
    
    if (!writeResult.success) {
      return {
        success: false,
        output: `mv: cannot create regular file '${destination}': ${writeResult.error}`
      };
    }
    
    // Finally, remove the source file
    const removeResult = fs.remove(source);
    
    if (!removeResult.success) {
      return {
        success: false,
        output: `mv: cannot remove '${source}': ${removeResult.error}`
      };
    }
    
    return {
      success: true,
      output: `'${source}' -> '${destination}'`
    };
  } catch (error) {
    return {
      success: false,
      output: `mv: ${error.message}`
    };
  }
};

const handleChmod = (args) => {
  if (args.length < 2) {
    return {
      success: false,
      output: 'chmod: missing operand'
    };
  }
  
  try {
    const fs = getFs();
    const mode = args[0];
    const path = args[1];
    
    const result = fs.changePermissions(path, mode);
    
    if (!result.success) {
      return {
        success: false,
        output: `chmod: ${result.error}`
      };
    }
    
    return {
      success: true,
      output: result.message || `mode of '${path}' changed to ${mode}`
    };
  } catch (error) {
    return {
      success: false,
      output: `chmod: ${error.message}`
    };
  }
};

const handlePwd = (args) => {
  try {
    const fs = getFs();
    const result = fs.getCurrentDirectory();
    
    if (!result.success) {
      return {
        success: false,
        output: `pwd: ${result.error}`
      };
    }
    
    return {
      success: true,
      output: result.path
    };
  } catch (error) {
    return {
      success: false,
      output: `pwd: ${error.message}`
    };
  }
};

const handleFind = (args) => {
  if (args.length < 2) {
    return {
      success: false,
      output: 'Usage: find [path] -name [pattern]'
    };
  }
  
  try {
    const fs = getFs();
    const directory = args[0];
    
    // Check if using -name flag
    if (args[1] !== '-name') {
      return {
        success: false,
        output: 'find: missing arguments to -name'
      };
    }
    
    const pattern = args[2];
    
    if (!pattern) {
      return {
        success: false,
        output: 'find: missing argument to -name'
      };
    }
    
    const result = fs.findFiles(directory, pattern);
    
    if (!result.success) {
      return {
        success: false,
        output: `find: ${result.error}`
      };
    }
    
    return {
      success: true,
      output: result.files.length > 0 ? result.files : ['No matching files found']
    };
  } catch (error) {
    return {
      success: false,
      output: `find: ${error.message}`
    };
  }
};

const handleGrep = (args) => {
  if (args.length < 2) {
    return {
      success: false,
      output: 'Usage: grep [pattern] [file...]'
    };
  }
  
  try {
    const fs = getFs();
    const pattern = args[0];
    const filePath = args[1];
    
    // Read the file
    const result = fs.readFile(filePath);
    
    if (!result.success) {
      return {
        success: false,
        output: `grep: ${filePath}: ${result.error}`
      };
    }
    
    // Match lines containing the pattern
    const lines = result.content.split('\n');
    const matchingLines = lines.filter(line => line.includes(pattern));
    
    return {
      success: true,
      output: matchingLines.length > 0 ? 
        matchingLines.map(line => `${filePath}: ${line}`) : 
        [`No matches found in ${filePath}`]
    };
  } catch (error) {
    return {
      success: false,
      output: `grep: ${error.message}`
    };
  }
};

// New clear command to clear the terminal
const handleClear = (args) => {
  // Check for help flag
  if (args.includes('--help') || args.includes('-h')) {
    return {
      success: true,
      output: [
        'Usage: clear [OPTION]',
        'Clear the terminal screen.',
        '',
        'Options:',
        '  -h, --help     display this help and exit',
        '  -x, --no-title preserve the title bar',
        '  -s, --scroll   scroll to bottom of screen',
        '',
        'Without any options, the clear command clears the entire terminal screen.'
      ]
    };
  }
  
  // Return a special command result with clear flag
  return {
    success: true,
    output: '',
    clear: true,
    preserveTitle: args.includes('-x') || args.includes('--no-title'),
    scrollToBottom: args.includes('-s') || args.includes('--scroll')
  };
};

// New echo command
const handleEcho = (args) => {
  if (args.length === 0) {
    return { success: true, output: '' };
  }
  
  // Join all arguments to form the text to echo
  const text = args.join(' ');
  return { success: true, output: text };
}; 