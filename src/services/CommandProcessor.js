// Import our virtual file system and process manager services
import { VirtualFileSystem } from './VirtualFileSystem';
import { ProcessManager } from './ProcessManager';
import { HardwareSimulator } from './HardwareSimulator';

// Initialize our subsystems
const fs = new VirtualFileSystem();
const processManager = new ProcessManager();
const hardwareSimulator = new HardwareSimulator();

// Command processing function that takes a command string and returns the result
export const processCommand = (commandString) => {
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

Process Management:
  ps                      - List running processes
  top                     - Display system processes
  kill <pid>              - Terminate a process
  nice <priority> <pid>   - Change process priority

Hardware Monitoring:
  memory                  - Display memory usage
  cpu                     - Display CPU usage
  disk                    - Display disk usage
  network                 - Display network info

Type 'help <command>' for more details on a specific command.
`
  };
};

// File system command handlers
const handleLs = (args) => {
  try {
    const path = args.length > 0 ? args[0] : '.';
    const files = fs.listDirectory(path);
    return {
      success: true,
      output: files.length > 0 ? files : ['Directory is empty']
    };
  } catch (error) {
    return {
      success: false,
      output: `ls: ${error.message}`
    };
  }
};

const handleCd = (args) => {
  if (args.length === 0) {
    return {
      success: false,
      output: 'cd: missing directory argument'
    };
  }
  
  try {
    fs.changeDirectory(args[0]);
    return {
      success: true,
      output: `Changed to ${fs.getCurrentDirectory()}`
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
    fs.makeDirectory(args[0]);
    return {
      success: true,
      output: `Created directory: ${args[0]}`
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
      output: 'touch: missing file name'
    };
  }
  
  try {
    fs.createFile(args[0]);
    return {
      success: true,
      output: `Created file: ${args[0]}`
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
      output: 'cat: missing file name'
    };
  }
  
  try {
    const content = fs.readFile(args[0]);
    return {
      success: true,
      output: content || '(empty file)'
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
      output: 'rm: missing file or directory name'
    };
  }
  
  try {
    fs.remove(args[0]);
    return {
      success: true,
      output: `Removed: ${args[0]}`
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
    const processes = processManager.listProcesses();
    if (processes.length === 0) {
      return {
        success: true,
        output: ['No processes running']
      };
    }
    
    // Format output
    const output = [
      'PID   STATE      NAME           CPU   MEMORY',
      '------------------------------------------------'
    ];
    
    processes.forEach(proc => {
      output.push(`${proc.pid.toString().padEnd(5)} ${proc.state.padEnd(10)} ${proc.name.padEnd(15)} ${proc.cpu.toString().padEnd(5)} ${proc.memory}`);
    });
    
    return {
      success: true,
      output
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
    const cpuUsage = hardwareSimulator.getCpuUsage();
    const memoryUsage = hardwareSimulator.getMemoryUsage();
    const processes = processManager.getTopProcesses();
    
    const output = [
      `CPU Usage: ${cpuUsage}%`,
      `Memory Usage: ${memoryUsage.used}MB / ${memoryUsage.total}MB (${memoryUsage.percentage}%)`,
      '',
      'TOP PROCESSES:',
      'PID   NAME           CPU%  MEM%',
      '--------------------------------'
    ];
    
    processes.forEach(proc => {
      output.push(`${proc.pid.toString().padEnd(5)} ${proc.name.padEnd(15)} ${proc.cpuPercent.toString().padEnd(5)} ${proc.memoryPercent}`);
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
      output: 'kill: missing process ID'
    };
  }
  
  try {
    const pid = parseInt(args[0], 10);
    if (isNaN(pid)) {
      return {
        success: false,
        output: 'kill: invalid process ID'
      };
    }
    
    processManager.killProcess(pid);
    return {
      success: true,
      output: `Process ${pid} terminated`
    };
  } catch (error) {
    return {
      success: false,
      output: `kill: ${error.message}`
    };
  }
};

// Hardware command handlers
const handleMemory = (args) => {
  try {
    const memoryInfo = hardwareSimulator.getDetailedMemoryInfo();
    
    return {
      success: true,
      output: [
        'MEMORY INFORMATION:',
        `Total: ${memoryInfo.total}MB`,
        `Used: ${memoryInfo.used}MB (${memoryInfo.percentage}%)`,
        `Free: ${memoryInfo.free}MB`,
        '',
        'MEMORY ALLOCATION:',
        `System: ${memoryInfo.system}MB`,
        `User Processes: ${memoryInfo.userProcesses}MB`,
        `Cached: ${memoryInfo.cached}MB`,
        `Buffers: ${memoryInfo.buffers}MB`
      ]
    };
  } catch (error) {
    return {
      success: false,
      output: `memory: ${error.message}`
    };
  }
};

const handleCpu = (args) => {
  try {
    const cpuInfo = hardwareSimulator.getDetailedCpuInfo();
    
    return {
      success: true,
      output: [
        'CPU INFORMATION:',
        `Model: ${cpuInfo.model}`,
        `Cores: ${cpuInfo.cores}`,
        `Clock Speed: ${cpuInfo.clockSpeed}GHz`,
        '',
        'CPU USAGE:',
        `Current Usage: ${cpuInfo.usage.current}%`,
        `Average (1 min): ${cpuInfo.usage.average1min}%`,
        `Average (5 min): ${cpuInfo.usage.average5min}%`,
        '',
        'LOAD DISTRIBUTION:',
        `User: ${cpuInfo.distribution.user}%`,
        `System: ${cpuInfo.distribution.system}%`,
        `I/O Wait: ${cpuInfo.distribution.io}%`,
        `Idle: ${cpuInfo.distribution.idle}%`
      ]
    };
  } catch (error) {
    return {
      success: false,
      output: `cpu: ${error.message}`
    };
  }
};

// New command handlers
const handleCp = (args) => {
  if (args.length < 2) {
    return { success: false, output: 'Usage: cp <source> <destination>' };
  }
  
  try {
    const source = args[0];
    const destination = args[1];
    
    // Read the source file
    const result = fs.readFile(source);
    if (!result.success) {
      return result;
    }
    
    // Create or overwrite the destination file
    return fs.writeFile(destination, result.content);
  } catch (error) {
    return { success: false, output: `cp: ${error.message}` };
  }
};

const handleMv = (args) => {
  if (args.length < 2) {
    return { success: false, output: 'Usage: mv <source> <destination>' };
  }
  
  try {
    const source = args[0];
    const destination = args[1];
    
    // Copy the file
    const copyResult = handleCp([source, destination]);
    if (!copyResult.success) {
      return copyResult;
    }
    
    // If copy successful, remove the source
    return fs.remove(source);
  } catch (error) {
    return { success: false, output: `mv: ${error.message}` };
  }
};

const handleChmod = (args) => {
  if (args.length < 2) {
    return { success: false, output: 'Usage: chmod <permissions> <file>' };
  }
  
  try {
    const permissions = args[0];
    const filepath = args[1];
    
    return fs.changePermissions(filepath, permissions);
  } catch (error) {
    return { success: false, output: `chmod: ${error.message}` };
  }
};

const handlePwd = () => {
  try {
    const currentDir = fs.getCurrentDirectory();
    return { success: true, output: currentDir };
  } catch (error) {
    return { success: false, output: `pwd: ${error.message}` };
  }
};

const handleFind = (args) => {
  if (args.length < 3 || args[1] !== '-name') {
    return { success: false, output: 'Usage: find <directory> -name <pattern>' };
  }
  
  try {
    const directory = args[0];
    const pattern = args[2];
    
    return fs.findFiles(directory, pattern);
  } catch (error) {
    return { success: false, output: `find: ${error.message}` };
  }
};

const handleGrep = (args) => {
  if (args.length < 2) {
    return { success: false, output: 'Usage: grep <pattern> <file>' };
  }
  
  try {
    const pattern = args[0];
    const filepath = args[1];
    
    // Read the file
    const readResult = fs.readFile(filepath);
    if (!readResult.success) {
      return readResult;
    }
    
    // Search for pattern in content
    const regex = new RegExp(pattern, 'g');
    const lines = readResult.content.split('\n');
    const matches = lines.filter(line => regex.test(line));
    
    if (matches.length === 0) {
      return { success: true, output: '' };
    }
    
    return { success: true, output: matches.join('\n') };
  } catch (error) {
    return { success: false, output: `grep: ${error.message}` };
  }
};

const handleNice = (args) => {
  if (args.length < 2) {
    return { success: false, output: 'Usage: nice <priority> <pid>' };
  }
  
  try {
    const priority = parseInt(args[0], 10);
    const pid = parseInt(args[1], 10);
    
    if (isNaN(priority) || isNaN(pid)) {
      return { success: false, output: 'nice: priority and pid must be numbers' };
    }
    
    return processManager.setProcessPriority(pid, priority);
  } catch (error) {
    return { success: false, output: `nice: ${error.message}` };
  }
};

const handleDisk = () => {
  try {
    const diskInfo = hardwareSimulator.getDetailedStorageInfo();
    return { success: true, output: diskInfo };
  } catch (error) {
    return { success: false, output: `disk: ${error.message}` };
  }
};

const handleNetwork = () => {
  try {
    const networkInfo = hardwareSimulator.getDetailedNetworkInfo();
    return { success: true, output: networkInfo };
  } catch (error) {
    return { success: false, output: `network: ${error.message}` };
  }
}; 