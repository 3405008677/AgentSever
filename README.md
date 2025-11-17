# Agent Server

一个基于 Vite 的代理服务器，用于提供静态文件服务和代理请求。支持多项目部署，自动检测子目录，并提供灵活的 API 代理配置。

## 📋 目录

- [功能特性](#功能特性)
- [技术栈](#技术栈)
- [快速开始](#快速开始)
- [项目结构](#项目结构)
- [配置说明](#配置说明)
- [使用示例](#使用示例)
- [开发指南](#开发指南)
- [常见问题](#常见问题)
- [脚本命令](#脚本命令)

## ✨ 功能特性

- ✅ **多项目支持** - 自动检测根目录下的子目录，支持同时部署多个项目
- ✅ **静态文件服务** - 提供完整的静态文件服务，支持 HTML、CSS、JavaScript、图片等资源
- ✅ **API 代理** - 灵活的代理配置，将前端请求转发到后端服务器
- ✅ **自动路由** - 支持目录访问自动查找 `index.html`
- ✅ **MIME 类型支持** - 自动识别文件类型，设置正确的 Content-Type
- ✅ **相对路径处理** - 智能处理相对路径资源请求
- ✅ **开发友好** - 基于 Vite，提供快速的热重载和开发体验

## 🛠 技术栈

- **Vite** - 下一代前端构建工具
- **Node.js** - 运行时环境
- **mime-types** - MIME 类型识别

## 🚀 快速开始

### 前置要求

- Node.js >= 16.0.0
- npm >= 7.0.0

### 安装

```bash
# 克隆或下载项目
cd publicSever

# 安装依赖
npm install
```

### 基本使用

1. **准备项目文件**

   将打包后的项目（如 `dist`）放到当前根目录下：

   ```
   publicSever/
   ├── dist/              # 你的打包项目
   │   ├── index.html
   │   ├── assets/
   │   └── ...
   ├── package.json
   └── vite.config.js
   ```

2. **启动开发服务器**

   ```bash
   npm run dev
   ```

3. **访问项目**

   - 直接访问：`http://localhost:3100/dist/index.html`
   - 目录访问：`http://localhost:3100/dist/`（会自动查找 index.html）
   - 根路径：`http://localhost:3100/`（显示服务器信息）

## 📁 项目结构

```
publicSever/
├── dist/                    # 打包输出目录（可选）
├── node_modules/            # 依赖包
├── index.html              # 根路径入口页面
├── package.json            # 项目配置
├── vite.config.js          # Vite 配置文件
└── README.md              # 项目说明文档
```

## ⚙️ 配置说明

### 端口配置

默认端口是 `3100`，可以在 `vite.config.js` 中修改：

```javascript
server: {
  port: 3100,        // 修改为你想要的端口
  host: true,        // 允许外部访问
}
```

### 代理配置

在 `vite.config.js` 中配置代理规则：

```javascript
proxy: {
  // 代理所有以 /api 开头的请求
  '/api': {
    target: 'http://webapi.cn.map20000.com',  // 后端服务器地址
    changeOrigin: true,                       // 修改请求头中的 origin
    rewrite: (path) => path.replace(/^\/api/, ''),  // 重写请求路径
  },
  // 可以添加更多代理规则
  '/other-api': {
    target: 'http://localhost:8080',
    changeOrigin: true,
  },
}
```

#### 代理规则说明

- **`/api`** - 匹配所有以 `/api` 开头的请求
- **`target`** - 后端服务器地址
- **`changeOrigin`** - 修改请求头中的 origin，解决跨域问题
- **`rewrite`** - 重写请求路径（可选），用于去除或修改路径前缀

#### 代理示例

前端请求：
```javascript
fetch('/api/users')
```

实际代理到：
```
http://webapi.cn.map20000.com/users
```

### 排除目录

默认排除的目录：
- `node_modules`
- `.git`
- `.vite`
- 所有以 `.` 开头的隐藏目录

如需修改，编辑 `vite.config.js` 中的 `excludeDirs` 数组。

## 💡 使用示例

### 示例 1：单项目部署

```
publicSever/
└── dist/
    ├── index.html
    ├── assets/
    └── ...
```

访问：`http://localhost:3100/dist/`

### 示例 2：多项目部署

```
publicSever/
├── project-a/
│   ├── index.html
│   └── ...
├── project-b/
│   ├── index.html
│   └── ...
└── dist/
    ├── index.html
    └── ...
```

访问：
- `http://localhost:3100/project-a/`
- `http://localhost:3100/project-b/`
- `http://localhost:3100/dist/`

### 示例 3：API 请求

```javascript
// 前端代码
async function fetchUsers() {
  const response = await fetch('/api/users')
  const data = await response.json()
  return data
}
```

该请求会被代理到配置的后端服务器。

## 🔧 开发指南

### 开发模式

```bash
npm run dev
```

启动开发服务器，支持热重载。

### 构建项目

```bash
npm run build
```

构建当前项目（如果有构建配置）。

### 预览构建结果

```bash
npm run preview
```

预览构建后的项目。

## ❓ 常见问题

### 1. 端口被占用

如果端口 3100 已被占用，修改 `vite.config.js` 中的端口号：

```javascript
server: {
  port: 3000,  // 改为其他端口
}
```

### 2. CORS 跨域问题

确保：
- 后端服务器配置了正确的 CORS 头
- 代理配置中 `changeOrigin: true` 已设置
- 检查浏览器控制台的错误信息

### 3. 静态资源加载失败

- 确保资源路径正确
- 检查文件是否存在于对应目录
- 查看浏览器控制台的网络请求

### 4. 子目录无法访问

- 确保子目录名称不包含特殊字符
- 检查目录下是否有 `index.html` 文件
- 查看服务器控制台的错误信息

### 5. 代理请求失败

- 确认后端服务器正在运行
- 检查 `target` 地址是否正确
- 验证网络连接是否正常

## 📜 脚本命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建项目 |
| `npm run preview` | 预览构建结果 |

## 📝 注意事项

- ⚠️ 确保后端服务器正在运行
- ⚠️ 如果遇到 CORS 问题，确保后端服务器配置了正确的 CORS 头
- ⚠️ 子目录名称不要包含特殊字符（建议使用字母、数字、连字符）
- ⚠️ 生产环境建议使用专业的 Web 服务器（如 Nginx）

## 📄 许可证

本项目采用 MIT 许可证。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**最后更新**: 2024

