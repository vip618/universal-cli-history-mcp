#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

interface CLIHistory {
  tool: string;
  command: string;
  timestamp: Date;
  workingDirectory: string;
  exitCode?: number;
}

class UniversalCLIHistoryMCPServer {
  private server: Server;
  private history: CLIHistory[] = [];

  constructor() {
    this.server = new Server(
      {
        name: "universal-cli-history",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupResourceHandlers();
    this.setupErrorHandlers();
    this.loadExistingHistory();
  }

  private async loadExistingHistory() {
    // 加载各种CLI工具的历史记录
    await this.loadShellHistory();
    await this.loadGitHistory();
    await this.loadNodeHistory();
    await this.loadPythonHistory();
    await this.loadDockerHistory();
    await this.loadSystemHistory();
  }

  private async loadShellHistory() {
    const shells = [
      { name: 'bash', file: '.bash_history' },
      { name: 'zsh', file: '.zsh_history' },
      { name: 'fish', file: '.local/share/fish/fish_history' },
      { name: 'powershell', file: 'AppData/Roaming/Microsoft/Windows/PowerShell/PSReadLine/ConsoleHost_history.txt' }
    ];

    for (const shell of shells) {
      try {
        const shellPath = path.join(os.homedir(), shell.file);
        const content = await fs.readFile(shellPath, 'utf-8');
        const commands = content.split('\n').filter(cmd => cmd.trim());

        commands.forEach(command => {
          this.history.push({
            tool: shell.name,
            command: command.trim(),
            timestamp: new Date(),
            workingDirectory: os.homedir()
          });
        });
      } catch (error) {
        // 跳过不存在的历史文件
      }
    }
  }

  private async loadGitHistory() {
    try {
      // 查找git历史记录
      const gitLog = await this.executeCommand('git log --oneline -n 50');
      if (gitLog) {
        const commits = gitLog.split('\n').filter(line => line.trim());
        commits.forEach(commit => {
          this.history.push({
            tool: 'git',
            command: `git ${commit}`,
            timestamp: new Date(),
            workingDirectory: process.cwd()
          });
        });
      }
    } catch (error) {
      // 没有git仓库
    }
  }

  private async loadNodeHistory() {
    try {
      const nodeReplHistory = path.join(os.homedir(), '.node_repl_history');
      const content = await fs.readFile(nodeReplHistory, 'utf-8');
      const commands = content.split('\n').filter(cmd => cmd.trim());

      commands.forEach(command => {
        this.history.push({
          tool: 'node',
          command: command.trim(),
          timestamp: new Date(),
          workingDirectory: os.homedir()
        });
      });
    } catch (error) {
      // 没有Node.js REPL历史
    }
  }

  private async loadPythonHistory() {
    try {
      const pythonHistory = path.join(os.homedir(), '.python_history');
      const content = await fs.readFile(pythonHistory, 'utf-8');
      const commands = content.split('\n').filter(cmd => cmd.trim());

      commands.forEach(command => {
        this.history.push({
          tool: 'python',
          command: command.trim(),
          timestamp: new Date(),
          workingDirectory: os.homedir()
        });
      });
    } catch (error) {
      // 没有Python历史
    }
  }

  private async loadDockerHistory() {
    try {
      const bashHistory = path.join(os.homedir(), '.bash_history');
      const content = await fs.readFile(bashHistory, 'utf-8');
      const dockerCommands = content.split('\n')
        .filter(cmd => cmd.trim().startsWith('docker'))
        .slice(-20); // 最近20个docker命令

      dockerCommands.forEach(command => {
        this.history.push({
          tool: 'docker',
          command: command.trim(),
          timestamp: new Date(),
          workingDirectory: os.homedir()
        });
      });
    } catch (error) {
      // 没有bash历史
    }
  }

  private async loadSystemHistory() {
    // 加载系统命令历史
    const commonCommands = [
      'ls', 'cd', 'pwd', 'cat', 'grep', 'find', 'mkdir', 'rm', 'cp', 'mv',
      'npm', 'yarn', 'pip', 'apt', 'brew', 'curl', 'wget'
    ];

    try {
      const bashHistory = path.join(os.homedir(), '.bash_history');
      const content = await fs.readFile(bashHistory, 'utf-8');
      const allCommands = content.split('\n').filter(cmd => cmd.trim());

      // 提取最近100个系统命令
      const recentCommands = allCommands.slice(-100);

      recentCommands.forEach(command => {
        const tool = this.detectTool(command);
        if (tool) {
          this.history.push({
            tool,
            command: command.trim(),
            timestamp: new Date(),
            workingDirectory: os.homedir()
          });
        }
      });
    } catch (error) {
      // 没有bash历史
    }
  }

  private detectTool(command: string): string {
    const commandMap: { [key: string]: string } = {
      'git': 'git',
      'docker': 'docker',
      'npm': 'npm',
      'yarn': 'yarn',
      'node': 'node',
      'python': 'python',
      'pip': 'pip',
      'apt': 'apt',
      'brew': 'brew',
      'curl': 'curl',
      'wget': 'wget',
      'ssh': 'ssh',
      'scp': 'scp',
      'rsync': 'rsync'
    };

    const firstWord = command.split(' ')[0];
    return commandMap[firstWord] || 'shell';
  }

  private async executeCommand(cmd: string): Promise<string | null> {
    try {
      const { exec } = await import('child_process');
      return new Promise((resolve) => {
        exec(cmd, (error, stdout, stderr) => {
          if (error) {
            resolve(null);
          } else {
            resolve(stdout);
          }
        });
      });
    } catch (error) {
      return null;
    }
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "list_history",
            description: "列出所有CLI工具的历史命令",
            inputSchema: {
              type: "object",
              properties: {
                tool: {
                  type: "string",
                  description: "特定工具名称 (git, docker, npm, node, python, shell等)"
                },
                limit: {
                  type: "number",
                  description: "限制返回的命令数量"
                }
              }
            }
          },
          {
            name: "search_history",
            description: "搜索历史命令",
            inputSchema: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "搜索关键词"
                },
                tool: {
                  type: "string",
                  description: "特定工具名称"
                }
              },
              required: ["query"]
            }
          },
          {
            name: "get_tool_stats",
            description: "获取各工具的使用统计",
            inputSchema: {
              type: "object",
              properties: {}
            }
          },
          {
            name: "execute_command",
            description: "执行CLI命令并记录到历史",
            inputSchema: {
              type: "object",
              properties: {
                command: {
                  type: "string",
                  description: "要执行的命令"
                },
                tool: {
                  type: "string",
                  description: "工具名称"
                }
              },
              required: ["command"]
            }
          }
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "list_history":
            return await this.handleListHistory(args as any);
          case "search_history":
            return await this.handleSearchHistory(args as any);
          case "get_tool_stats":
            return await this.handleGetToolStats();
          case "execute_command":
            return await this.handleExecuteCommand(args as any);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    });
  }

  private setupResourceHandlers() {
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: "cli-history://all",
            mimeType: "application/json",
            name: "All CLI History",
            description: "所有CLI工具的历史命令"
          },
          {
            uri: "cli-history://stats",
            mimeType: "application/json",
            name: "CLI Usage Statistics",
            description: "各工具使用统计"
          }
        ],
      };
    });

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      if (uri === "cli-history://all") {
        return {
          contents: [
            {
              uri: uri,
              mimeType: "application/json",
              text: JSON.stringify(this.history, null, 2),
            },
          ],
        };
      }

      if (uri === "cli-history://stats") {
        const stats = this.calculateStats();
        return {
          contents: [
            {
              uri: uri,
              mimeType: "application/json",
              text: JSON.stringify(stats, null, 2),
            },
          ],
        };
      }

      throw new Error(`Unknown resource: ${uri}`);
    });
  }

  private setupErrorHandlers() {
    this.server.onerror = (error) => {
      console.error("[MCP Error]", error);
    };

    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private calculateStats() {
    const toolCounts: { [tool: string]: number } = {};

    this.history.forEach(entry => {
      toolCounts[entry.tool] = (toolCounts[entry.tool] || 0) + 1;
    });

    return {
      totalCommands: this.history.length,
      tools: toolCounts,
      mostUsedTool: Object.keys(toolCounts).reduce((a, b) =>
        toolCounts[a] > toolCounts[b] ? a : b
      )
    };
  }

  private async handleListHistory(args: { tool?: string; limit?: number }): Promise<any> {
    let filteredHistory = this.history;

    if (args.tool) {
      filteredHistory = filteredHistory.filter(entry =>
        entry.tool.toLowerCase().includes(args.tool!.toLowerCase())
      );
    }

    const limitedHistory = args.limit ?
      filteredHistory.slice(-args.limit) :
      filteredHistory.slice(-50); // 默认显示最近50条

    return {
      content: [
        {
          type: "text",
          text: `找到 ${limitedHistory.length} 条命令:\n\n` +
            limitedHistory.map(entry =>
              `[${entry.tool}] ${entry.command} (${entry.timestamp.toLocaleString()})`
            ).join('\n')
        },
      ],
    };
  }

  private async handleSearchHistory(args: { query: string; tool?: string }): Promise<any> {
    let filteredHistory = this.history;

    if (args.tool) {
      filteredHistory = filteredHistory.filter(entry =>
        entry.tool.toLowerCase().includes(args.tool!.toLowerCase())
      );
    }

    const results = filteredHistory.filter(entry =>
      entry.command.toLowerCase().includes(args.query.toLowerCase())
    );

    return {
      content: [
        {
          type: "text",
          text: `搜索 "${args.query}" 找到 ${results.length} 条匹配命令:\n\n` +
            results.map(entry =>
              `[${entry.tool}] ${entry.command}`
            ).join('\n')
        },
      ],
    };
  }

  private async handleGetToolStats(): Promise<any> {
    const stats = this.calculateStats();

    return {
      content: [
        {
          type: "text",
          text: `CLI工具使用统计:\n` +
            `总命令数: ${stats.totalCommands}\n` +
            `最常用工具: ${stats.mostUsedTool}\n\n` +
            `各工具使用次数:\n` +
            Object.entries(stats.tools)
              .map(([tool, count]) => `- ${tool}: ${count} 次`)
              .join('\n')
        },
      ],
    };
  }

  private async handleExecuteCommand(args: { command: string; tool?: string }): Promise<any> {
    const tool = args.tool || this.detectTool(args.command);

    // 记录到历史
    this.history.push({
      tool,
      command: args.command,
      timestamp: new Date(),
      workingDirectory: process.cwd()
    });

    // 执行命令
    const result = await this.executeCommand(args.command);

    return {
      content: [
        {
          type: "text",
          text: `执行命令: ${args.command}\n\n输出:\n${result || '命令执行完成'}`
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Universal CLI History MCP server running on stdio");
  }
}

const server = new UniversalCLIHistoryMCPServer();
server.run().catch(console.error);