# Self-Reminder Widget

A productivity-focused Electron desktop widget that displays daily reminders from your markdown notes. The app automatically rotates content each day to keep important concepts and practices visible throughout your workday.

![Self-Reminder Widget](https://img.shields.io/badge/platform-macOS%20%7C%20Linux-blue)
![Electron](https://img.shields.io/badge/Electron-v36.4.0-47848f)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

- **Daily Content Rotation**: Automatically displays different content each day using date-based seeding
- **YAML Frontmatter Support**: Renders metadata (Type, Status, tags) with styled badges
- **Interactive Controls**: 
  - Refresh button for random content selection
  - Folder selection for choosing markdown directories
- **Native Styling**: macOS-native appearance with blur effects and system typography
- **Background Operation**: Runs continuously with minimal system impact
- **Auto-start Support**: Can be configured to launch at system startup
- **Obsidian Link Support**: Renders internal `[[links]]` from Obsidian-style markdown

## Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/self-reminder-widget.git
   cd self-reminder-widget
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the application:
   ```bash
   npm start
   ```

### Building for Distribution

#### macOS
```bash
npm run build
```
This creates a `.dmg` file in the `dist/` folder.

#### Linux
```bash
npm run build
```
This creates an `.AppImage` or `.deb` file in the `dist/` folder.

## Usage

### First Launch

1. Launch the application
2. Click the folder button (📁) in the widget header
3. Select a folder containing your markdown files
4. The widget will display content from your selected folder

### Daily Operation

- Content automatically changes each day at midnight
- Click the refresh button (↻) for a random note anytime
- The widget stays visible and updates throughout the day

### Markdown File Format

Your markdown files should include YAML frontmatter for best results:

```markdown
---
Type: note
Status: active
tags: [#productivity, #goals, #workflow]
---

# Your Content Here

This is your productivity reminder content...
```

### Auto-Start Setup

#### macOS
1. Build and install the app
2. Open System Settings → General → Login Items
3. Add "Self-Reminder Widget" from Applications
4. Enable launch at startup

#### Linux
Create a `.desktop` file in `~/.config/autostart/`:
```ini
[Desktop Entry]
Type=Application
Exec=/path/to/self-reminder-widget
Name=Self-Reminder Widget
Comment=Daily productivity reminders
X-GNOME-Autostart-enabled=true
```

## Configuration

The app stores your folder selection preferences automatically. Settings are preserved between sessions.

## Development

### Project Structure

- `main.js` - Electron main process
- `renderer.js` - Renderer process with markdown parsing
- `index.html` - Widget structure
- `style.css` - Native styling
- `settings.js` - Configuration management

### Key Technologies

- Electron for cross-platform desktop app
- marked.js for markdown rendering
- js-yaml for frontmatter parsing
- Native CSS for system integration

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with Electron
- Markdown parsing by marked.js
- YAML parsing by js-yaml
- Inspired by productivity workflows and daily reminder practices