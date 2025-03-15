import React, { useState } from 'react';

const HelpPanel = ({ onClose }) => {
  const [activeSection, setActiveSection] = useState('commands');

  const helpContent = {
    commands: {
      title: 'Available Commands',
      content: [
        { 
          command: 'help', 
          description: 'Display this help message', 
          usage: 'help [command]' 
        },
        { 
          command: 'ls', 
          description: 'List directory contents', 
          usage: 'ls [options] [directory]' 
        },
        { 
          command: 'cd', 
          description: 'Change the current directory', 
          usage: 'cd [directory]' 
        },
        { 
          command: 'mkdir', 
          description: 'Create a new directory', 
          usage: 'mkdir [options] directory' 
        },
        { 
          command: 'touch', 
          description: 'Create a new, empty file', 
          usage: 'touch [options] file' 
        },
        { 
          command: 'cat', 
          description: 'Display file contents', 
          usage: 'cat [options] file' 
        },
        { 
          command: 'rm', 
          description: 'Remove files or directories', 
          usage: 'rm [-r] file' 
        },
        { 
          command: 'cp', 
          description: 'Copy files or directories', 
          usage: 'cp source destination' 
        },
        { 
          command: 'mv', 
          description: 'Move/rename files or directories', 
          usage: 'mv source destination' 
        },
        { 
          command: 'chmod', 
          description: 'Change file permissions', 
          usage: 'chmod permissions file' 
        },
        { 
          command: 'pwd', 
          description: 'Print current working directory', 
          usage: 'pwd' 
        },
        { 
          command: 'find', 
          description: 'Search for files matching a pattern', 
          usage: 'find directory -name pattern' 
        },
        { 
          command: 'grep', 
          description: 'Search for a pattern in file(s)', 
          usage: 'grep pattern file' 
        },
        { 
          command: 'ps', 
          description: 'Report process status', 
          usage: 'ps [options]' 
        },
        { 
          command: 'top', 
          description: 'Display system tasks', 
          usage: 'top' 
        },
        { 
          command: 'kill', 
          description: 'Terminate a process by PID', 
          usage: 'kill pid' 
        },
        { 
          command: 'nice', 
          description: 'Change process priority', 
          usage: 'nice priority pid' 
        },
        { 
          command: 'memory', 
          description: 'Display memory usage', 
          usage: 'memory' 
        },
        { 
          command: 'cpu', 
          description: 'Display CPU information', 
          usage: 'cpu' 
        },
        { 
          command: 'disk', 
          description: 'Display disk usage statistics', 
          usage: 'disk' 
        },
        { 
          command: 'network', 
          description: 'Display network interface information', 
          usage: 'network' 
        }
      ]
    },
    concepts: {
      title: 'OS Concepts',
      content: [
        {
          concept: 'Process Scheduling',
          description: 'Process scheduling is the method by which work is assigned to resources that complete the work. The OS scheduler allocates CPU time for each process, optimizing for criteria like response time, throughput, and resource utilization.'
        },
        {
          concept: 'File Systems',
          description: 'File systems organize how data is stored and retrieved. They manage files, directories, permissions, and provide hierarchical structure to data storage.'
        },
        {
          concept: 'Memory Management',
          description: 'Memory management tracks every memory location, manages allocation and deallocation of memory space, and ensures that processes don\'t interfere with each other\'s memory.'
        },
        {
          concept: 'CPU Resource Allocation',
          description: 'CPU scheduling determines which processes run when and for how long, balancing performance, fairness, and system responsiveness.'
        },
        {
          concept: 'File Permissions',
          description: 'File permissions control which users can read, write, or execute files. In Unix-like systems, permissions are represented using a combination of letters (r, w, x) or octal numbers (e.g., 755).'
        },
        {
          concept: 'Process States',
          description: 'Processes can exist in different states: running (executing on CPU), waiting (for an event or resource), ready (waiting to be scheduled), stopped (paused), or zombie (terminated but entry remains in process table).'
        },
        {
          concept: 'I/O Operations',
          description: 'Input/Output operations handle data transfer between the computer and external devices. The OS manages I/O requests, buffering, and device drivers.'
        }
      ]
    },
    tutorial: {
      title: 'Getting Started Tutorial',
      content: `
        <h3 class="text-lg font-bold mb-2">Welcome to the Virtual OS Simulator!</h3>
        <p class="mb-2">This simulator allows you to experiment with common operating system concepts through a command-line interface.</p>
        
        <h4 class="font-bold mt-4 mb-1">Basic Navigation</h4>
        <p class="mb-2">Start by trying these commands:</p>
        <ul class="list-disc pl-5 mb-3">
          <li><code>pwd</code> - Shows your current directory</li>
          <li><code>ls</code> - Shows all files in the current directory</li>
          <li><code>cd Documents</code> - Changes to the Documents directory</li>
          <li><code>mkdir NewFolder</code> - Creates a new directory</li>
        </ul>
        
        <h4 class="font-bold mt-4 mb-1">Working with Files</h4>
        <p class="mb-2">Try creating and manipulating files:</p>
        <ul class="list-disc pl-5 mb-3">
          <li><code>touch hello.txt</code> - Creates a new empty file</li>
          <li><code>cat hello.txt</code> - Displays the file contents</li>
          <li><code>cp hello.txt hello_copy.txt</code> - Copies a file</li>
          <li><code>mv hello_copy.txt renamed.txt</code> - Renames a file</li>
          <li><code>chmod 755 hello.txt</code> - Changes file permissions</li>
          <li><code>find . -name "*.txt"</code> - Finds all .txt files</li>
        </ul>
        
        <h4 class="font-bold mt-4 mb-1">Process Management</h4>
        <p class="mb-2">Try these commands to work with processes:</p>
        <ul class="list-disc pl-5 mb-3">
          <li><code>ps</code> - Shows running processes</li>
          <li><code>top</code> - Shows real-time process activity</li>
          <li><code>kill 1234</code> - Terminates process with PID 1234</li>
          <li><code>nice 10 1234</code> - Changes priority of process 1234</li>
        </ul>
        
        <h4 class="font-bold mt-4 mb-1">System Information</h4>
        <p class="mb-2">Try these commands to see system information:</p>
        <ul class="list-disc pl-5 mb-3">
          <li><code>memory</code> - Shows memory usage</li>
          <li><code>cpu</code> - Shows CPU usage and information</li>
          <li><code>disk</code> - Shows disk usage statistics</li>
          <li><code>network</code> - Shows network interfaces and activity</li>
        </ul>

        <h4 class="font-bold mt-4 mb-1">Try switching to the Hardware and Processes tabs</h4>
        <p class="mb-2">The UI also provides graphical interfaces for:</p>
        <ul class="list-disc pl-5 mb-3">
          <li>Hardware monitoring with real-time graphs and statistics</li>
          <li>Process management with the ability to create, inspect, and terminate processes</li>
        </ul>
      `
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-800 w-3/4 max-w-4xl h-3/4 rounded-lg shadow-2xl overflow-hidden">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="bg-gray-900 p-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Help & Documentation</h2>
            <button 
              onClick={onClose}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
            >
              Close
            </button>
          </div>
          
          {/* Navigation Tabs */}
          <div className="bg-gray-800 px-4 border-b border-gray-700">
            <div className="flex">
              <button 
                className={`py-3 px-4 ${activeSection === 'commands' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
                onClick={() => setActiveSection('commands')}
              >
                Commands
              </button>
              <button 
                className={`py-3 px-4 ${activeSection === 'concepts' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
                onClick={() => setActiveSection('concepts')}
              >
                OS Concepts
              </button>
              <button 
                className={`py-3 px-4 ${activeSection === 'tutorial' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
                onClick={() => setActiveSection('tutorial')}
              >
                Tutorial
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-auto p-6 bg-gray-700 text-white">
            <h3 className="text-xl font-bold mb-4">{helpContent[activeSection].title}</h3>
            
            {activeSection === 'commands' && (
              <div className="space-y-2">
                <p className="mb-4">Below are the available commands in the OS Simulator:</p>
                <table className="w-full">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="text-left p-2">Command</th>
                      <th className="text-left p-2">Description</th>
                      <th className="text-left p-2">Usage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {helpContent.commands.content.map((cmd, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-800 bg-opacity-40' : ''}>
                        <td className="p-2 font-mono">{cmd.command}</td>
                        <td className="p-2">{cmd.description}</td>
                        <td className="p-2 font-mono">{cmd.usage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {activeSection === 'concepts' && (
              <div className="space-y-6">
                {helpContent.concepts.content.map((concept, index) => (
                  <div key={index} className="bg-gray-800 bg-opacity-40 p-4 rounded">
                    <h4 className="font-bold text-lg mb-2">{concept.concept}</h4>
                    <p>{concept.description}</p>
                  </div>
                ))}
              </div>
            )}
            
            {activeSection === 'tutorial' && (
              <div 
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: helpContent.tutorial.content }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPanel; 