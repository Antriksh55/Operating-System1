/**
 * VirtualFileSystem class simulates a hierarchical file system
 * with basic operations like creating files and directories,
 * navigation, and file content management.
 */
export class VirtualFileSystem {
  constructor() {
    // Initialize the root filesystem structure
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
    // Handle '..' (parent directory)
    if (relativePath === '..') {
      const baseComponents = basePath.split('/').filter(c => c !== '');
      if (baseComponents.length > 0) {
        baseComponents.pop();
      }
      return '/' + baseComponents.join('/');
    }
    
    // Handle '.' (current directory)
    if (relativePath === '.') {
      return basePath;
    }
    
    // Join the paths
    return basePath + (basePath.endsWith('/') ? '' : '/') + relativePath;
  }

  /**
   * Gets a node (directory or file) at a specific path
   * @param {string} path - Path to the node
   * @returns {Object} The node at the path
   */
  _getNodeAtPath(path) {
    // Handle root directory
    if (path === '/') {
      return this.fileSystem['/'];
    }
    
    const components = this._parsePath(path);
    let current = this.fileSystem['/'];
    
    // Traverse the path
    for (let i = 0; i < components.length; i++) {
      const component = components[i];
      
      // Make sure the current node is a directory
      if (current.type !== 'directory') {
        throw new Error(`${components.slice(0, i).join('/')} is not a directory`);
      }
      
      // Check if the component exists in the current directory
      if (!current.children[component]) {
        throw new Error(`${component} does not exist`);
      }
      
      current = current.children[component];
    }
    
    return current;
  }

  /**
   * Gets a reference to the parent directory of a path
   * @param {string} path - Path to get the parent of
   * @returns {Object} The parent directory and the basename
   */
  _getParentAndBasename(path) {
    const components = this._parsePath(path);
    const basename = components.pop();
    let parent = this.fileSystem['/'];
    
    // Traverse to the parent
    for (const component of components) {
      if (!parent.children[component] || parent.children[component].type !== 'directory') {
        throw new Error(`Directory does not exist: ${component}`);
      }
      parent = parent.children[component];
    }
    
    return { parent, basename };
  }

  /**
   * Lists the contents of a directory
   * @param {string} path - Path to the directory (default: current directory)
   * @returns {string[]} Array of items in the directory
   */
  listDirectory(path = '.') {
    try {
      const targetPath = path === '.' ? this.currentPath : path;
      const node = this._getNodeAtPath(targetPath);
      
      if (node.type !== 'directory') {
        throw new Error(`${path} is not a directory`);
      }
      
      // Return the list of files and directories
      return Object.entries(node.children).map(([name, item]) => {
        return `${item.type === 'directory' ? 'd' : '-'}${item.permissions || 'rwxr-xr-x'} ${name}${item.type === 'directory' ? '/' : ''}`;
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Changes the current directory
   * @param {string} path - Path to change to
   */
  changeDirectory(path) {
    try {
      // Handle special case for root
      if (path === '/') {
        this.currentPath = '/';
        return;
      }
      
      // Handle special case for home
      if (path === '~') {
        this.currentPath = '/home/user';
        return;
      }
      
      // Handle parent directory
      if (path === '..') {
        const components = this.currentPath.split('/').filter(c => c !== '');
        if (components.length > 0) {
          components.pop();
          this.currentPath = '/' + components.join('/');
        }
        return;
      }
      
      // Get absolute path
      let targetPath = path;
      if (!path.startsWith('/') && !path.startsWith('~')) {
        targetPath = this._joinPaths(this.currentPath, path);
      } else if (path.startsWith('~')) {
        targetPath = path.replace('~', '/home/user');
      }
      
      // Check if directory exists
      const node = this._getNodeAtPath(targetPath);
      if (node.type !== 'directory') {
        throw new Error(`${path} is not a directory`);
      }
      
      this.currentPath = targetPath;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Creates a new directory
   * @param {string} path - Path to the new directory
   */
  makeDirectory(path) {
    try {
      const { parent, basename } = this._getParentAndBasename(path);
      
      if (parent.children[basename]) {
        throw new Error(`${basename} already exists`);
      }
      
      parent.children[basename] = {
        type: 'directory',
        children: {},
        permissions: 'rwxr-xr-x',
        created: new Date(),
        modified: new Date()
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Creates a new file
   * @param {string} path - Path to the new file
   * @param {string} content - Initial content of the file (default: empty)
   */
  createFile(path, content = '') {
    try {
      const { parent, basename } = this._getParentAndBasename(path);
      
      if (parent.children[basename]) {
        throw new Error(`${basename} already exists`);
      }
      
      parent.children[basename] = {
        type: 'file',
        content: content,
        permissions: 'rw-r--r--',
        size: content.length,
        created: new Date(),
        modified: new Date()
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Reads a file's content
   * @param {string} path - Path to the file
   * @returns {string} The content of the file
   */
  readFile(path) {
    try {
      const node = this._getNodeAtPath(path);
      
      if (node.type !== 'file') {
        throw new Error(`${path} is not a file`);
      }
      
      return node.content;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Writes content to a file
   * @param {string} path - Path to the file
   * @param {string} content - Content to write
   */
  writeFile(path, content) {
    try {
      const node = this._getNodeAtPath(path);
      
      if (node.type !== 'file') {
        throw new Error(`${path} is not a file`);
      }
      
      node.content = content;
      node.size = content.length;
      node.modified = new Date();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Removes a file or directory
   * @param {string} path - Path to the file or directory
   */
  remove(path) {
    try {
      const { parent, basename } = this._getParentAndBasename(path);
      
      if (!parent.children[basename]) {
        throw new Error(`${basename} does not exist`);
      }
      
      // Check if it's a non-empty directory
      if (parent.children[basename].type === 'directory' && 
          Object.keys(parent.children[basename].children).length > 0) {
        throw new Error(`${basename} is not empty. Use rm -r to remove directories recursively.`);
      }
      
      delete parent.children[basename];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Gets the current working directory
   * @returns {string} The current directory path
   */
  getCurrentDirectory() {
    return this.currentPath;
  }
}