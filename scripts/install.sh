#!/bin/bash

# Universal CLI History MCP - Install Script

echo "📥 Universal CLI History MCP Installer"
echo "======================================="

# Detect OS
OS="$(uname -s)"
case "$OS" in
    Linux*)     OS=linux ;;
    Darwin*)    OS=macos ;;
    CYGWIN*)    OS=windows ;;
    MINGW*)     OS=windows ;;
    *)          OS=unknown ;;
esac

echo "✅ Detected OS: $OS"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed. Please install Node.js 18+ first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Error: Node.js 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install globally
echo "📦 Installing Universal CLI History MCP globally..."
npm install -g universal-cli-history-mcp

if [ $? -eq 0 ]; then
    echo "✅ Successfully installed!"

    # Find installation path
    INSTALL_PATH=$(npm root -g)/universal-cli-history-mcp/dist/index.js

    if [ -f "$INSTALL_PATH" ]; then
        echo ""
        echo "🔧 Configuration Instructions:"
        echo "============================="
        echo ""
        echo "Add the following to your Claude Desktop/Code configuration:"
        echo ""

        # Claude Desktop config
        case "$OS" in
            macos)
                CLAUDE_DESKTOP_CONFIG="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
                ;;
            linux)
                CLAUDE_DESKTOP_CONFIG="$HOME/.config/Claude/claude_desktop_config.json"
                ;;
            windows)
                CLAUDE_DESKTOP_CONFIG="$APPDATA\\Claude\\claude_desktop_config.json"
                ;;
            *)
                CLAUDE_DESKTOP_CONFIG="~/.config/Claude/claude_desktop_config.json"
                ;;
        esac

        echo "Claude Desktop ($CLAUDE_DESKTOP_CONFIG):"
        echo '{
  "mcpServers": {
    "universal-cli-history": {
      "command": "node",
      "args": ["'$INSTALL_PATH'"]
    }
  }
}'
        echo ""

        # Claude Code config
        case "$OS" in
            macos|linux)
                CLAUDE_CODE_CONFIG="$HOME/.config/claude-code/config.json"
                ;;
            windows)
                CLAUDE_CODE_CONFIG="$APPDATA\\claude-code\\config.json"
                ;;
            *)
                CLAUDE_CODE_CONFIG="~/.config/claude-code/config.json"
                ;;
        esac

        echo "Claude Code ($CLAUDE_CODE_CONFIG):"
        echo '{
  "mcpServers": {
    "universal-cli-history": {
      "command": "node",
      "args": ["'$INSTALL_PATH'"]
    }
  }
}'
        echo ""
        echo "📚 For more information, visit:"
        echo "   https://github.com/yourusername/universal-cli-history-mcp"

    else
        echo "⚠️  Warning: Could not find installation path. Please check npm global installation."
    fi

else
    echo "❌ Installation failed. Please check npm permissions or try with sudo."
    exit 1
fi