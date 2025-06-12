const fs = require('fs');
const path = require('path');
const { app } = require('electron');

class Settings {
  constructor() {
    this.settingsPath = path.join(app.getPath('userData'), 'settings.json');
    this.settings = this.loadSettings();
  }

  loadSettings() {
    try {
      if (fs.existsSync(this.settingsPath)) {
        const data = fs.readFileSync(this.settingsPath, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
    
    // Default settings
    return {
      markdownFolderPath: null
    };
  }

  saveSettings() {
    try {
      const dir = path.dirname(this.settingsPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.settingsPath, JSON.stringify(this.settings, null, 2));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  get(key) {
    return this.settings[key];
  }

  set(key, value) {
    this.settings[key] = value;
    this.saveSettings();
  }

  getMarkdownFolderPath() {
    return this.settings.markdownFolderPath;
  }

  setMarkdownFolderPath(folderPath) {
    this.settings.markdownFolderPath = folderPath;
    this.saveSettings();
  }
}

module.exports = Settings;