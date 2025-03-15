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
    
    // Process commands
    case 'ps':
      return handlePs(args);
    case 'top':
      return handleTop(args);
    case 'kill':
      return handleKill(args);
    
    // Hardware commands
    case 'memory':
      return handleMemory(args);
    case 'cpu':
      return handleCpu(args);
    
    // Unknown command
    default:
      return {
        success: false,
        output: `Command not found: ${command}. Type 'help' for a list of available commands.`
      };
  }
};

// Help command
const handleHelp = (args) => {
  if (args.length === 0) {
    return {
      success: true,
      output: [
        'Available commands:',
        '  help [command]   - Display help information',
        '',
        'File System:',
        '  ls [dir]         - List directory contents',
        '  cd <dir>         - Change the current directory',
        '  mkdir <dir>      - Create a new directory',
        '  touch <file>     - Create a new file',
        '  cat <file>       - Display file contents',
        '  rm <file/dir>    - Remove a file or directory',
        '',
        'Process Management:',
        '  ps               - List all processes',
        '  top              - Display system tasks',
        '  kill <pid>       - Terminate a process',
        '',
        'Hardware:',
        '  memory           - Display memory usage',
        '  cpu              - Display CPU information',
      ]
    };
  } else {
    // Specific command help
    const helpCommand = args[0].toLowerCase();
    
    // This could be expanded with more detailed help for each command
    return {
      success: true,
      output: `Help for command '${helpCommand}': Not implemented yet. Try 'help' for general help.`
    };
  }
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