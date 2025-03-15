# Virtual OS Simulator

A web-based virtual operating system simulator that provides an interactive, command-line interface (CLI) environment. This simulator serves as an educational tool to demonstrate fundamental operating system concepts, including hardware management, file system operations, and process scheduling.

## Features

- **Interactive CLI Environment** - A terminal-like interface that accepts user commands
- **Virtual File System** - Create, navigate, and manage files and directories
- **Process Management** - View and manage simulated processes
- **Hardware Monitoring** - Visualize CPU and memory usage
- **Educational Content** - Learn OS concepts through tooltips and built-in help

## Technologies Used

- React (v19+) - Modern UI framework
- Tailwind CSS - Utility-first CSS framework
- JavaScript (ES6+) - Core programming language
- Vite - Frontend build tool

## Getting Started

### Prerequisites

- Node.js (v16+)
- pnpm package manager

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/os-simulator.git
   cd os-simulator
   ```

2. Install dependencies
   ```
   pnpm install
   ```

3. Start the development server
   ```
   pnpm dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Available Commands

In the virtual terminal, you can use the following commands:

### File System Commands

- `ls [dir]` - List directory contents
- `cd <dir>` - Change the current directory
- `mkdir <dir>` - Create a new directory
- `touch <file>` - Create a new file
- `cat <file>` - Display file contents
- `rm <file/dir>` - Remove a file or directory

### Process Management Commands

- `ps` - List all processes
- `top` - Display system tasks
- `kill <pid>` - Terminate a process

### Hardware Commands

- `memory` - Display memory usage
- `cpu` - Display CPU information

### Other Commands

- `help [command]` - Display help information

## Project Structure

```
os-simulator/
├── src/
│   ├── components/
│   │   ├── Terminal/           # Terminal UI components
│   │   ├── Sidebar/            # Sidebar navigation
│   │   └── HelpPanel/          # Help documentation
│   │   
│   ├── services/
│   │   ├── CommandProcessor.js # Processes CLI commands
│   │   ├── VirtualFileSystem.js # File system simulation
│   │   ├── ProcessManager.js   # Process management
│   │   └── HardwareSimulator.js # Hardware monitoring
│   │   
│   ├── App.jsx                 # Main app component
│   └── main.jsx                # Entry point
├── public/                     # Static assets
└── index.html                  # HTML template
```

## Educational Value

This simulator is designed to help users understand:

- How file systems organize and manage data
- How operating systems manage processes and resources
- The relationship between hardware and software components
- Basic command-line operations and navigation

## Future Enhancements

- Process scheduling visualization
- Memory allocation visualization
- Network simulation
- User permissions and access control
- Multi-user environment

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- This project was created for educational purposes
- Inspired by classic CLI-based operating systems and modern web technologies
