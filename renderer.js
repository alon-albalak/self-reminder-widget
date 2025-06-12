console.log('Simple renderer starting...');

// Test Node.js module access
let fs, path, marked, yaml, ipcRenderer;
try {
  fs = require('fs');
  path = require('path');
  marked = require('marked');
  yaml = require('js-yaml');
  ipcRenderer = require('electron').ipcRenderer;
  console.log('All modules loaded successfully');
} catch (e) {
  console.error('Failed to load modules:', e);
}

function parseYamlFrontmatter(content) {
  const yamlRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(yamlRegex);
  
  if (!match) {
    return { frontmatter: null, content: content };
  }
  
  try {
    const frontmatter = yaml ? yaml.load(match[1]) : null;
    return { frontmatter, content: match[2] };
  } catch (e) {
    console.error('Error parsing YAML frontmatter:', e);
    return { frontmatter: null, content: content };
  }
}

function renderFrontmatter(frontmatter) {
  if (!frontmatter) return '';
  
  let html = '<div class="frontmatter">';
  
  for (const [key, value] of Object.entries(frontmatter)) {
    html += `<div class="frontmatter-item">`;
    html += `<span class="frontmatter-key">${key}:</span>`;
    
    if (Array.isArray(value)) {
      html += '<div class="frontmatter-values">';
      value.forEach(item => {
        const displayValue = typeof item === 'string' && item.startsWith('#') 
          ? `<span class="tag">${item}</span>`
          : `<span class="value">${item}</span>`;
        html += displayValue;
      });
      html += '</div>';
    } else {
      const displayValue = typeof value === 'string' && value.startsWith('#')
        ? `<span class="tag">${value}</span>`
        : `<span class="value">${value}</span>`;
      html += displayValue;
    }
    
    html += '</div>';
  }
  
  html += '</div>';
  return html;
}

function processObsidianLinks(text) {
  // Process [[filename|displaytext]] format first
  text = text.replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '<span class="internal-link" data-target="$1">$2</span>');
  
  // Process [[filename]] format
  text = text.replace(/\[\[([^\]]+)\]\]/g, '<span class="internal-link" data-target="$1">$1</span>');
  
  return text;
}

function simpleMarkdown(text) {
  // Simple markdown fallback (Obsidian links already processed)
  return text
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/`(.*?)`/gim, '<code>$1</code>')
    .replace(/\n\n/gim, '</p><p>')
    .replace(/\n/gim, '<br>')
    .replace(/^(.+)$/gim, '<p>$1</p>');
}

async function loadContent(forceRandom = false) {
  const container = document.getElementById('markdown-container');
  const dateElement = document.getElementById('current-date');
  
  if (!container) {
    console.error('Container not found');
    return;
  }
  
  // Update date
  if (dateElement) {
    const now = new Date();
    const options = { month: 'short', day: 'numeric', weekday: 'short' };
    dateElement.textContent = now.toLocaleDateString('en-US', options);
  }
  
  // Try to load markdown files
  if (!fs || !path || !ipcRenderer) {
    container.innerHTML = '<p><strong>Error:</strong> Node.js modules not available</p>';
    return;
  }
  
  try {
    // Get configured markdown folder path
    const markdownDir = await ipcRenderer.invoke('get-markdown-folder');
    console.log('Configured markdown directory:', markdownDir);
    
    if (!markdownDir) {
      container.innerHTML = '<p><em>No markdown folder selected.</em><br><small>Click the folder button to select a folder containing .md files.</small></p>';
      return;
    }
    
    if (!fs.existsSync(markdownDir)) {
      container.innerHTML = '<p><strong>Error:</strong> Selected markdown folder does not exist.</p><p><small>Click the folder button to select a new folder.</small></p>';
      return;
    }
    
    const files = fs.readdirSync(markdownDir).filter(f => f.endsWith('.md'));
    console.log('Found files:', files);
    
    if (files.length === 0) {
      container.innerHTML = '<p><em>No markdown files found in markdown/ directory</em></p>';
      return;
    }
    
    let index;
    if (forceRandom) {
      // Pick truly random file
      index = Math.floor(Math.random() * files.length);
      console.log('Using random index:', index);
    } else {
      // Pick file based on date
      const seed = new Date().toISOString().split('T')[0];
      const hash = Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0);
      index = hash % files.length;
      console.log('Using date-based index:', index);
    }
    
    const filePath = path.join(markdownDir, files[index]);
    console.log('Reading file:', filePath);
    
    const content = fs.readFileSync(filePath, 'utf8');
    console.log('File content loaded, length:', content.length);
    
    // Parse YAML frontmatter
    const { frontmatter, content: markdownContent } = parseYamlFrontmatter(content);
    
    // Extract filename without extension for title
    const filename = path.basename(files[index], '.md');
    const titleHtml = `<h1 class="file-title">${filename}</h1>`;
    
    // Process Obsidian internal links first
    const processedContent = processObsidianLinks(markdownContent);
    
    // Process markdown
    let html;
    if (marked && typeof marked === 'function') {
      html = marked(processedContent);
    } else {
      html = simpleMarkdown(processedContent);
    }
    
    // Combine title, frontmatter and content
    const frontmatterHtml = renderFrontmatter(frontmatter);
    container.innerHTML = titleHtml + frontmatterHtml + html;
    console.log('Content rendered successfully');
    
  } catch (err) {
    console.error('Error loading content:', err);
    container.innerHTML = `<p><strong>Error:</strong> ${err.message}</p>`;
  }
}

async function selectFolder() {
  if (!ipcRenderer) {
    console.error('IPC renderer not available');
    return;
  }
  
  try {
    const folderPath = await ipcRenderer.invoke('select-folder');
    if (folderPath) {
      console.log('Selected folder:', folderPath);
      await loadContent(); // Reload content with new folder
    }
  } catch (error) {
    console.error('Error selecting folder:', error);
  }
}

// Initialize when DOM is ready
setTimeout(async () => {
  console.log('Initializing content...');
  await loadContent();
  
  // Add refresh button event listener
  const refreshBtn = document.getElementById('refresh-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      console.log('Refresh button clicked');
      loadContent(true); // Force random selection
    });
  }
  
  // Add folder button event listener
  const folderBtn = document.getElementById('folder-btn');
  if (folderBtn) {
    folderBtn.addEventListener('click', () => {
      console.log('Folder button clicked');
      selectFolder();
    });
  }
}, 100);