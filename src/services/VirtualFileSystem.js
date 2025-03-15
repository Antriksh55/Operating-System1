/**
 * VirtualFileSystem class simulates a hierarchical file system
 * with basic operations like creating files and directories,
 * navigation, and file content management.
 */
export class VirtualFileSystem {
  constructor() {
    // Try to load filesystem from localStorage first
    const savedFS = this._loadFromLocalStorage();
    
    if (savedFS) {
      this.fileSystem = savedFS.fileSystem;
      this.currentPath = savedFS.currentPath;
    } else {
      // Initialize the root filesystem structure if no saved state
      this.fileSystem = {
        '/': {
          type: 'directory',
          children: {
            'home': {
              type: 'directory',
              children: {
                'user': {
                  type: 'directory',
                  children: {
                    'Documents': {
                      type: 'directory',
                      children: {}
                    },
                    'Pictures': {
                      type: 'directory',
                      children: {}
                    },
                    'welcome.txt': {
                      type: 'file',
                      content: 'Welcome to the Virtual OS Simulator!\nType "help" to see available commands.',
                      permissions: 'rw-r--r--',
                      size: 72,
                      created: new Date(),
                      modified: new Date()
                    }
                  }
                }
              }
            },
            'bin': {
              type: 'directory',
              children: {
                'ls': { type: 'file', content: '#!/bin/bash\n# ls binary', permissions: 'rwxr-xr-x' },
                'mkdir': { type: 'file', content: '#!/bin/bash\n# mkdir binary', permissions: 'rwxr-xr-x' },
                'rm': { type: 'file', content: '#!/bin/bash\n# rm binary', permissions: 'rwxr-xr-x' }
              }
            },
            'etc': {
              type: 'directory',
              children: {
                'passwd': {
                  type: 'file',
                  content: 'root:x:0:0:root:/root:/bin/bash\nuser:x:1000:1000:user:/home/user:/bin/bash',
                  permissions: 'rw-r--r--'
                },
                'hostname': {
                  type: 'file',
                  content: 'virtual-os',
                  permissions: 'rw-r--r--'
                }
              }
            },
            'tmp': {
              type: 'directory',
              children: {}
            }
          }
        }
      };

      // Current working directory path (starting at /home/user)
      this.currentPath = '/home/user';
    }
    
    // Set up auto-save after operations
    this._setupAutoSave();
  }
  
  /**
   * Saves the current filesystem state to localStorage
   * @private
   */
  _saveToLocalStorage() {
    try {
      // Clone the filesystem to avoid saving methods
      const saveData = {
        fileSystem: JSON.parse(JSON.stringify(this.fileSystem)),
        currentPath: this.currentPath
      };
      
      // Save to localStorage
      localStorage.setItem('virtualFileSystem', JSON.stringify(saveData));
    } catch (error) {
      console.error('Failed to save filesystem to localStorage:', error);
    }
  }
  
  /**
   * Loads filesystem state from localStorage
   * @private
   * @returns {Object|null} Loaded filesystem or null if none exists
   */
  _loadFromLocalStorage() {
    try {
      const savedData = localStorage.getItem('virtualFileSystem');
      if (!savedData) return null;
      
      const parsedData = JSON.parse(savedData);
      
      // Convert date strings back to Date objects
      this._restoreDates(parsedData.fileSystem);
      
      return parsedData;
    } catch (error) {
      console.error('Failed to load filesystem from localStorage:', error);
      return null;
    }
  }
  
  /**
   * Recursively restores Date objects from strings in the loaded filesystem
   * @private
   * @param {Object} node - Current filesystem node
   */
  _restoreDates(node) {
    if (node.created) node.created = new Date(node.created);
    if (node.modified) node.modified = new Date(node.modified);
    
    if (node.type === 'directory' && node.children) {
      for (const [_, child] of Object.entries(node.children)) {
        this._restoreDates(child);
      }
    }
  }
  
  /**
   * Sets up autosave after operations
   * @private
   */
  _setupAutoSave() {
    // Wrap all methods that modify the filesystem to auto-save after execution
    const methodsToWrap = [
      'makeDirectory', 'createFile', 'writeFile', 'remove', 
      'changeDirectory', 'changePermissions'
    ];
    
    methodsToWrap.forEach(methodName => {
      const originalMethod = this[methodName];
      this[methodName] = (...args) => {
        const result = originalMethod.apply(this, args);
        
        // Save state after operation (only if operation was successful)
        if (result.success) {
          this._saveToLocalStorage();
        }
        
        return result;
      };
    });
  }

  /**
   * Parse a path into its components
   * @param {string} path - The path to parse
   * @returns {string[]} Array of path components
   */
  _parsePath(path) {
    // Handle '~' as home directory
    if (path === '~' || path.startsWith('~/')) {
      path = path.replace('~', '/home/user');
    }
    
    // Handle absolute vs relative paths
    let absolutePath = path;
    if (!path.startsWith('/')) {
      absolutePath = this._joinPaths(this.currentPath, path);
    }
    
    // Split path into components and clean up
    const components = absolutePath.split('/').filter(c => c !== '');
    return components;
  }

  /**
   * Join two paths together
   * @param {string} basePath - The base path
   * @param {string} relativePath - The relative path to add
   * @returns {string} The joined path
   */
  _joinPaths(basePath, relativePath) {
    // Handle special case for current directory
    if (relativePath === '.') {
      return basePath;
    }
    
    // Split the relative path to handle multiple components
    const components = relativePath.split('/');
    let result = basePath;
    
    for (const component of components) {
      // Skip empty components
      if (!component || component === '.') {
        continue;
      }
      
      // Handle parent directory references
      if (component === '..') {
        // Split the current result and remove the last component
        const resultComponents = result.split('/').filter(c => c !== '');
        if (resultComponents.length > 0) {
          resultComponents.pop();
        }
        result = '/' + resultComponents.join('/');
      } else {
        // Add the component to the path
        result = result + (result.endsWith('/') ? '' : '/') + component;
      }
    }
    
    return result;
  }

  /**
   * Gets a node (directory or file) at a specific path
   * @param {string} path - Path to the node
   * @returns {Object} The node at the path or error
   */
  _getNodeAtPath(path) {
    try {
      // Handle root directory
      if (path === '/') {
        return { success: true, node: this.fileSystem['/'] };
      }
      
      const components = this._parsePath(path);
      let current = this.fileSystem['/'];
      
      // Traverse the path
      for (let i = 0; i < components.length; i++) {
        const component = components[i];
        
        // Make sure the current node is a directory
        if (current.type !== 'directory') {
          return { 
            success: false, 
            error: `'${components.slice(0, i).join('/')}' is not a directory` 
          };
        }
        
        // Check if the component exists in the current directory
        if (!current.children[component]) {
          return { 
            success: false, 
            error: `'${component}' does not exist` 
          };
        }
        
        current = current.children[component];
      }
      
      return { success: true, node: current };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Gets a reference to the parent directory of a path
   * @param {string} path - Path to get the parent of
   * @returns {Object} The parent directory and the basename
   */
  _getParentAndBasename(path) {
    try {
      const components = this._parsePath(path);
      const basename = components.pop();
      let parent = this.fileSystem['/'];
      
      // Traverse to the parent
      for (const component of components) {
        if (!parent.children[component] || parent.children[component].type !== 'directory') {
          return {
            success: false,
            error: `Directory does not exist: ${component}`
          };
        }
        parent = parent.children[component];
      }
      
      return { success: true, parent, basename };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Lists the contents of a directory
   * @param {string} path - Path to the directory (default: current directory)
   * @returns {Object} Success flag and files list or error message
   */
  listDirectory(path = '.') {
    try {
      // Properly resolve the target path
      const targetPath = path === '.' ? this.currentPath : path;
      const nodeResult = this._getNodeAtPath(targetPath);
      
      if (!nodeResult.success) {
        return nodeResult;
      }
      
      const node = nodeResult.node;
      
      if (node.type !== 'directory') {
        return {
          success: false,
          error: `'${path}' is not a directory`
        };
      }
      
      // Return the list of files and directories with metadata
      const files = Object.entries(node.children).map(([name, item]) => {
        return {
          name,
          type: item.type,
          permissions: item.permissions || (item.type === 'directory' ? 'drwxr-xr-x' : '-rw-r--r--'),
          size: item.size || 0,
          modified: item.modified || new Date()
        };
      });
      
      return {
        success: true,
        files
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Changes the current directory
   * @param {string} path - Path to change to
   * @returns {Object} Success flag and message or error
   */
  changeDirectory(path) {
    try {
      // Handle special case for root
      if (path === '/') {
        this.currentPath = '/';
        return {
          success: true,
          message: 'Changed to /'
        };
      }
      
      // Handle special case for home
      if (path === '~') {
        this.currentPath = '/home/user';
        return {
          success: true,
          message: 'Changed to /home/user'
        };
      }
      
      // Handle parent directory
      if (path === '..') {
        const components = this.currentPath.split('/').filter(c => c !== '');
        if (components.length > 0) {
          components.pop();
          this.currentPath = '/' + components.join('/');
          return {
            success: true,
            message: `Changed to ${this.currentPath}`
          };
        }
        return {
          success: true,
          message: 'Changed to /'
        };
      }
      
      // Get absolute path
      let targetPath = path;
      if (!path.startsWith('/') && !path.startsWith('~')) {
        targetPath = this._joinPaths(this.currentPath, path);
      } else if (path.startsWith('~')) {
        targetPath = path.replace('~', '/home/user');
      }
      
      // Check if directory exists
      const nodeResult = this._getNodeAtPath(targetPath);
      
      if (!nodeResult.success) {
        return nodeResult;
      }
      
      const node = nodeResult.node;
      
      if (node.type !== 'directory') {
        return {
          success: false,
          error: `'${path}' is not a directory`
        };
      }
      
      this.currentPath = targetPath;
      
      return {
        success: true,
        message: `Changed to ${targetPath}`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Creates a new directory
   * @param {string} path - Path to the new directory
   * @returns {Object} Success flag and message or error
   */
  makeDirectory(path) {
    try {
      const { success, parent, basename, error } = this._getParentAndBasename(path);
      
      if (!success) {
        return { success, error };
      }
      
      // Make sure parent is a directory
      if (parent.type !== 'directory') {
        return {
          success: false,
          error: `Cannot create directory: parent is not a directory`
        };
      }
      
      // Check if the directory already exists
      if (parent.children[basename]) {
        return {
          success: false,
          error: `Cannot create directory '${basename}': File exists`
        };
      }
      
      // Create the directory
      const now = new Date();
      parent.children[basename] = {
        type: 'directory',
        children: {},
        permissions: 'drwxr-xr-x',
        size: 0,
        created: now,
        modified: now
      };
      
      return {
        success: true,
        message: `Directory created: ${basename}`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Creates a new file
   * @param {string} path - Path to the new file
   * @param {string} content - Initial content (default: empty)
   * @returns {Object} Success flag and message or error
   */
  createFile(path, content = '') {
    try {
      const { success, parent, basename, error } = this._getParentAndBasename(path);
      
      if (!success) {
        return { success, error };
      }
      
      // Check if parent is a directory
      if (parent.type !== 'directory') {
        return {
          success: false,
          error: `Cannot create file: parent is not a directory`
        };
      }
      
      // Create or update the file
      const now = new Date();
      const fileExists = parent.children[basename] !== undefined;
      
      parent.children[basename] = {
        type: 'file',
        content,
        permissions: 'rw-r--r--',
        size: content.length,
        created: fileExists ? parent.children[basename]?.created || now : now,
        modified: now
      };
      
      return {
        success: true,
        message: fileExists ? `File updated: ${basename}` : `File created: ${basename}`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Reads a file
   * @param {string} path - Path to the file
   * @returns {Object} Success flag and file content or error
   */
  readFile(path) {
    try {
      const nodeResult = this._getNodeAtPath(path);
      
      if (!nodeResult.success) {
        return nodeResult;
      }
      
      const node = nodeResult.node;
      
      if (node.type !== 'file') {
        return {
          success: false,
          error: `'${path}' is not a file`
        };
      }
      
      return {
        success: true,
        content: node.content
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Writes content to a file
   * @param {string} path - Path to the file
   * @param {string} content - Content to write
   * @returns {Object} Success flag and message or error
   */
  writeFile(path, content) {
    try {
      const { success, parent, basename, error } = this._getParentAndBasename(path);
      
      if (!success) {
        return { success, error };
      }
      
      // Check if file exists
      const fileExists = parent.children[basename] && parent.children[basename].type === 'file';
      
      // Create or update the file
      parent.children[basename] = {
        type: 'file',
        content,
        permissions: fileExists ? parent.children[basename].permissions : 'rw-r--r--',
        size: content.length,
        created: fileExists ? parent.children[basename].created : new Date(),
        modified: new Date()
      };
      
      return {
        success: true,
        message: `File written: ${basename}`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Removes a file or directory
   * @param {string} path - Path to remove
   * @param {boolean} recursive - Whether to remove directories recursively
   * @returns {Object} Success flag and message or error
   */
  remove(path, recursive = false) {
    try {
      const { success, parent, basename, error } = this._getParentAndBasename(path);
      
      if (!success) {
        return { success, error };
      }
      
      // Check if the path exists
      if (!parent.children[basename]) {
        return {
          success: false,
          error: `Cannot remove '${basename}': No such file or directory`
        };
      }
      
      // Check if trying to remove a directory without recursive flag
      if (parent.children[basename].type === 'directory' && !recursive) {
        // Check if directory is empty
        const isEmpty = Object.keys(parent.children[basename].children).length === 0;
        
        if (!isEmpty) {
          return {
            success: false,
            error: `Cannot remove '${basename}': Directory not empty (use -r for recursive deletion)`
          };
        }
      }
      
      // Remove the item
      delete parent.children[basename];
      
      return {
        success: true,
        message: `Removed: ${basename}`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Gets the current working directory
   * @returns {Object} Success flag and current directory path
   */
  getCurrentDirectory() {
    return {
      success: true,
      path: this.currentPath
    };
  }

  /**
   * Changes file permissions
   * @param {string} path - Path to the file
   * @param {string} permissions - New permissions (e.g., "755", "rw-r--r--")
   * @returns {Object} Success flag and message or error
   */
  changePermissions(path, permissions) {
    try {
      const nodeResult = this._getNodeAtPath(path);
      
      if (!nodeResult.success) {
        return nodeResult;
      }
      
      const node = nodeResult.node;
      
      // Handle numeric permissions (e.g., 755)
      if (/^\d+$/.test(permissions)) {
        const perms = parseInt(permissions, 8);
        const symbolic = [
          (perms & 0o400 ? 'r' : '-') + (perms & 0o200 ? 'w' : '-') + (perms & 0o100 ? 'x' : '-'),
          (perms & 0o40 ? 'r' : '-') + (perms & 0o20 ? 'w' : '-') + (perms & 0o10 ? 'x' : '-'),
          (perms & 0o4 ? 'r' : '-') + (perms & 0o2 ? 'w' : '-') + (perms & 0o1 ? 'x' : '-')
        ].join('');
        
        node.permissions = symbolic;
      } else {
        // Handle symbolic permissions (e.g., "rw-r--r--")
        if (!/^[rwx-]{9}$/.test(permissions)) {
          return {
            success: false,
            error: 'Invalid permission format'
          };
        }
        
        node.permissions = permissions;
      }
      
      return {
        success: true,
        message: `Changed permissions of ${path} to ${node.permissions}`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Find files matching a pattern
   * @param {string} startDir - Directory to start the search from
   * @param {string} pattern - Pattern to match (glob-like)
   * @returns {Object} Success flag and list of matching files or error
   */
  findFiles(startDir, pattern) {
    try {
      const startDirResult = this._getNodeAtPath(startDir);
      
      if (!startDirResult.success) {
        return startDirResult;
      }
      
      const startNode = startDirResult.node;
      
      if (startNode.type !== 'directory') {
        return {
          success: false,
          error: `'${startDir}' is not a directory`
        };
      }
      
      const matches = [];
      const patternRegex = new RegExp(`^${pattern.replace(/\*/g, '.*').replace(/\?/g, '.')}$`);
      
      // Recursive function to search for files
      const findMatchingFiles = (node, currentPath) => {
        for (const [name, item] of Object.entries(node.children)) {
          const itemPath = `${currentPath}${currentPath === '/' ? '' : '/'}${name}`;
          
          if (patternRegex.test(name)) {
            matches.push(itemPath);
          }
          
          if (item.type === 'directory') {
            findMatchingFiles(item, itemPath);
          }
        }
      };
      
      findMatchingFiles(startNode, startDir === '/' ? '/' : startDir);
      
      return {
        success: true,
        files: matches
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check if a file exists
   * @param {string} path - Path to check
   * @returns {Object} Success flag and exists boolean or error
   */
  fileExists(path) {
    try {
      const nodeResult = this._getNodeAtPath(path);
      return {
        success: true,
        exists: nodeResult.success
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get file details
   * @param {string} path - Path to the file
   * @returns {Object} Success flag and file details or error
   */
  getFileDetails(path) {
    try {
      const nodeResult = this._getNodeAtPath(path);
      
      if (!nodeResult.success) {
        return nodeResult;
      }
      
      const node = nodeResult.node;
      const { basename } = this._getParentAndBasename(path);
      
      return {
        success: true,
        details: {
          name: basename,
          type: node.type,
          permissions: node.permissions || 'rwxr-xr-x',
          size: node.size || 0,
          created: node.created || new Date(),
          modified: node.modified || new Date(),
          isDirectory: node.type === 'directory'
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}