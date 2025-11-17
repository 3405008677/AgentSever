# Public Server

一个基于 Vite 的代理服务器，用于提供静态文件服务和代理请求。

## 功能特性

- ✅ 提供静态文件服务，支持从根目录下的子目录访问打包后的项目
- ✅ 配置代理，将页面请求转发到后端服务器
- ✅ 自动检测根目录下的子目录
- ✅ 支持通过 `localhost:3100/项目名/index.html` 访问

## 安装

```bash
npm install
```

## 使用

1. 将打包后的项目（如 `dite`）放到当前根目录下：
   ```
   publicSever/
   ├── dite/
   │   ├── index.html
   │   ├── assets/
   │   └── ...
   ├── package.json
   └── vite.config.js
   ```

2. 启动开发服务器：
   ```bash
   npm run dev
   ```

3. 访问项目：
   - 打开浏览器访问 `http://localhost:3100/dite/index.html`
   - 或者直接访问 `http://localhost:3100/dite/`（会自动查找 index.html）

## 配置代理

在 `vite.config.js` 中配置代理规则：

```javascript
proxy: {
  '/api': {
    target: 'http://localhost:8080', // 修改为你的后端服务器地址
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, ''),
  },
}
```

### 代理规则说明

- `/api` - 匹配所有以 `/api` 开头的请求
- `target` - 后端服务器地址
- `changeOrigin` - 修改请求头中的 origin
- `rewrite` - 重写请求路径（可选）

### 示例

如果页面中发起请求：
```javascript
fetch('/api/users')
```

会被代理到：
```
http://localhost:8080/users
```

## 端口配置

默认端口是 `3100`，可以在 `vite.config.js` 中修改：

```javascript
server: {
  port: 3100, // 修改为你想要的端口
}
```

## 注意事项

- 确保后端服务器正在运行
- 如果遇到 CORS 问题，确保后端服务器配置了正确的 CORS 头
- 子目录名称不要包含特殊字符

