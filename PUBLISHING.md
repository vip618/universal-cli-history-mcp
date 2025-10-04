# Publishing Guide

This guide will help you publish the Universal CLI History MCP server to npm and GitHub.

## Prerequisites

1. **npm account** - Create one at [npmjs.com](https://www.npmjs.com/signup)
2. **GitHub account** - Create one at [github.com](https://github.com/signup)
3. **Node.js 18+** - Install from [nodejs.org](https://nodejs.org/)

## Publishing Steps

### 1. Update Package Information

Edit `package.json` with your information:
- `name`: Choose a unique package name
- `author`: Your name and email
- `repository.url`: Your GitHub repository URL
- `bugs.url`: Your GitHub issues URL
- `homepage`: Your GitHub repository homepage

### 2. Create GitHub Repository

```bash
# Initialize git
cd universal-cli-history-mcp
git init
git add .
git commit -m "Initial commit"

# Create repository on GitHub and push
git remote add origin https://github.com/yourusername/universal-cli-history-mcp.git
git branch -M main
git push -u origin main
```

### 3. Set up npm Authentication

```bash
# Login to npm
npm login

# Or use environment variable for CI/CD
export NPM_TOKEN=your_npm_token_here
```

### 4. Publish to npm

```bash
# Build the project
npm run build

# Publish to npm
npm publish

# For testing (publishes to local registry)
npm publish --dry-run
```

### 5. Create GitHub Release

1. Go to your GitHub repository
2. Click "Releases"
3. Click "Draft a new release"
4. Tag version: `v1.0.0`
5. Release title: `v1.0.0 - Universal CLI History MCP`
6. Add release notes
7. Publish release

## Configuration for Users

### Installation

Users can install via npm:

```bash
npm install -g universal-cli-history-mcp
```

### Configuration

Users need to configure their Claude Desktop/Code:

**Claude Desktop** (`~/Library/Application Support/Claude/claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "universal-cli-history": {
      "command": "node",
      "args": ["/usr/local/lib/node_modules/universal-cli-history-mcp/dist/index.js"]
    }
  }
}
```

**Claude Code** (`~/.config/claude-code/config.json`):
```json
{
  "mcpServers": {
    "universal-cli-history": {
      "command": "node",
      "args": ["/usr/local/lib/node_modules/universal-cli-history-mcp/dist/index.js"]
    }
  }
}
```

## Features to Highlight

- ✅ Supports all CLI tools (bash, zsh, git, docker, npm, python, etc.)
- ✅ Search and filter command history
- ✅ Usage statistics and analytics
- ✅ Execute commands directly
- ✅ Cross-platform compatibility
- ✅ Automatic tool detection

## Version Management

Use semantic versioning:
- **MAJOR**: Breaking changes
- **MINOR**: New features
- **PATCH**: Bug fixes

Update version in `package.json` before publishing.

## Testing Before Publishing

```bash
# Test locally
npm run build
npm start

# Test installation
npm pack
npm install -g universal-cli-history-mcp-1.0.0.tgz
```

## Troubleshooting

### Common Issues

1. **Permission denied**: Use `sudo` or configure npm properly
2. **Package name taken**: Choose a different name
3. **Build fails**: Check TypeScript configuration
4. **MCP not loading**: Verify path in configuration

### Support

- Create issues on GitHub
- Update documentation
- Respond to user feedback

## Marketing

1. Add to MCP registry
2. Share on social media
3. Write blog post
4. Submit to relevant communities

## License

This project is licensed under MIT License - see [LICENSE](LICENSE) file for details.