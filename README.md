# Universal CLI History MCP Server

一个通用的 MCP 服务器，用于管理和搜索**所有 CLI 命令行工具**的历史记录。

## 🚀 **支持的工具**

### **Shell 工具**
- **bash** - `.bash_history`
- **zsh** - `.zsh_history`
- **fish** - `fish_history`
- **PowerShell** - `ConsoleHost_history.txt`

### **开发工具**
- **git** - git commit 历史
- **Node.js** - `.node_repl_history`
- **Python** - `.python_history`
- **npm/yarn** - package manager 命令

### **系统工具**
- **docker** - docker 相关命令
- **apt/brew** - 包管理器
- **curl/wget** - 网络工具
- **ssh/scp** - 远程连接
- **rsync** - 文件同步

### **通用命令**
- **ls, cd, pwd, cat, grep, find**
- **mkdir, rm, cp, mv**
- 所有其他系统命令

## 🔧 **功能特性**

### **list_history** - 列出历史命令
- 查看所有 CLI 工具的历史命令
- 按工具过滤：`git`, `docker`, `npm`, `node`, `python`, `shell` 等
- 限制返回数量

### **search_history** - 搜索历史命令
- 在所有历史命令中搜索关键词
- 按工具过滤搜索范围

### **get_tool_stats** - 使用统计
- 查看各工具的使用频率
- 统计总命令数
- 识别最常用工具

### **execute_command** - 执行命令
- 执行 CLI 命令并自动记录到历史
- 自动识别工具类型

## 📊 **可用资源**

### **cli-history://all**
获取所有 CLI 历史命令的 JSON 格式数据。

### **cli-history://stats**
获取各工具使用统计的 JSON 数据。

## 🛠️ **安装配置**

### 1. 通过 npm 安装（推荐）
```bash
npm install -g universal-cli-history-mcp
```

### 2. 从源码安装
```bash
cd universal-cli-history-mcp
npm install
npm run build
```

### 3. 配置 Claude Desktop/Code

**Windows 配置：**
```json
{
  "mcpServers": {
    "universal-cli-history": {
      "command": "node",
      "args": ["C:\\Users\\gretc\\AppData\\Roaming\\npm\\node_modules\\universal-cli-history-mcp\\dist\\index.js"]
    }
  }
}
```

**macOS/Linux 配置：**
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

**使用环境变量（跨平台）：**
```json
{
  "mcpServers": {
    "universal-cli-history": {
      "command": "node",
      "args": ["%APPDATA%/npm/node_modules/universal-cli-history-mcp/dist/index.js"]
    }
  }
}
```

**💡 提示：** 使用 `npm root -g` 命令查找你的全局安装路径。

## 🚨 **故障排除**

### **常见问题**

1. **MCP error -32000: Connection closed**
   - 检查路径是否正确
   - 确保使用双反斜杠或正斜杠
   - 重启 Claude Desktop/Code

2. **找不到工具**
   - 运行 `npm install -g universal-cli-history-mcp` 重新安装
   - 验证安装：`npm list -g universal-cli-history-mcp`

3. **权限错误**
   - Windows: 以管理员身份运行命令提示符
   - macOS/Linux: 使用 `sudo npm install -g universal-cli-history-mcp`

### **验证安装**
```bash
# 检查是否安装成功
npm list -g universal-cli-history-mcp

# 测试 MCP 服务器
node "C:\Users\gretc\AppData\Roaming\npm\node_modules\universal-cli-history-mcp\dist\index.js"
```

## 🔍 **使用示例**

### 查看最近命令
```
list_history { "limit": 20 }
```

### 搜索 Git 命令
```
search_history { "query": "commit", "tool": "git" }
```

### 查看统计
```
get_tool_stats {}
```

### 执行命令
```
execute_command { "command": "git status" }
```

## 📁 **项目结构**

```
universal-cli-history-mcp/
├── src/
│   └── index.ts          # 主服务器文件
├── dist/                 # 编译输出
├── package.json
├── tsconfig.json
└── README.md
```

## 🔄 **自动检测**

服务器会自动检测和加载：
- 各种 shell 的历史文件
- Git 仓库的提交历史
- Node.js/Python REPL 历史
- 系统命令历史
- Docker 相关命令

## ⚡ **开发**

### 运行开发版本
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 启动生产版本
```bash
npm start
```

## 📝 **许可证**

MIT