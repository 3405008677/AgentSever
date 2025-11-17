import { defineConfig } from 'vite'
import { resolve } from 'path'
import { readdirSync, statSync, existsSync, createReadStream } from 'fs'
import { fileURLToPath } from 'url'
import { lookup } from 'mime-types'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// 获取根目录下的所有子目录（排除 node_modules 等）
function getSubDirectories() {
  const rootDir = resolve(process.cwd())
  const dirs = []
  try {
    const entries = readdirSync(rootDir, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.isDirectory()) {
        // 排除一些不需要的目录（但保留 dist，因为用户可能使用它）
        const excludeDirs = ['node_modules', '.git', '.vite']
        if (!excludeDirs.includes(entry.name) && !entry.name.startsWith('.')) {
          dirs.push(entry.name)
        }
      }
    }
  } catch (err) {
    console.warn('无法读取目录:', err)
  }
  return dirs
}

export default defineConfig({
  server: {
    port: 3100,
    host: true,
    // 允许访问根目录外的文件
    fs: {
      allow: ['..'],
    },
    // 配置代理
    proxy: {
      // 代理所有以 /api 开头的请求
      '/api': {
        target: 'http://webapi.cn.map20000.com', // 修改为你的后端服务器地址
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      // 如果需要代理其他路径，可以继续添加
      // '/other-api': {
      //   target: 'http://localhost:8080',
      //   changeOrigin: true,
      // },
    },
  },
  // 配置静态文件服务
  publicDir: false, // 禁用默认的 public 目录
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
  // 自定义插件来处理静态文件服务
  plugins: [
    {
      name: 'static-files-server',
      configureServer(server) {
        // 在 Vite 中间件之前插入我们的中间件
        return () => {
          // 在数组开头插入中间件，确保优先执行
          server.middlewares.stack.unshift({
            route: '',
            handle: (req, res, next) => {
              const url = req.url?.split('?')[0] || ''
              const rootDir = resolve(process.cwd())
              
              // 跳过 Vite 内部请求和 API 代理请求
              if (url.startsWith('/@') || url.startsWith('/node_modules') || url.startsWith('/api')) {
                return next()
              }
              
              const subDirs = getSubDirectories()
              
              // 辅助函数：设置正确的 MIME 类型
              const getMimeType = (filePath) => {
                const ext = filePath.split('.').pop()?.toLowerCase()
                // 确保 JavaScript 文件使用正确的 MIME 类型
                if (ext === 'js' || ext === 'mjs') {
                  return 'application/javascript'
                }
                if (ext === 'json') {
                  return 'application/json'
                }
                if (ext === 'css') {
                  return 'text/css'
                }
                if (ext === 'html') {
                  return 'text/html'
                }
                return lookup(filePath) || 'application/octet-stream'
              }
              
              // 辅助函数：发送文件
              const sendFile = (filePath) => {
                if (!existsSync(filePath)) {
                  return false
                }
                const stats = statSync(filePath)
                if (!stats.isFile()) {
                  return false
                }
                
                const mimeType = getMimeType(filePath)
                // 对于 JavaScript 模块，确保使用正确的字符编码
                const contentType = mimeType === 'application/javascript' 
                  ? 'application/javascript; charset=utf-8' 
                  : mimeType
                res.setHeader('Content-Type', contentType)
                
                const stream = createReadStream(filePath)
                stream.pipe(res)
                stream.on('error', (err) => {
                  res.statusCode = 500
                  res.end('Error reading file')
                })
                return true
              }
              
              // 首先检查是否是直接访问子目录的请求（如 /dist/index.html）
              for (const dir of subDirs) {
                if (url.startsWith(`/${dir}/`) || url === `/${dir}`) {
                  let filePath = ''
                  
                  // 如果是目录访问，尝试返回 index.html
                  if (url === `/${dir}` || url === `/${dir}/`) {
                    filePath = resolve(rootDir, dir, 'index.html')
                    if (sendFile(filePath)) {
                      return
                    } else {
                      return next()
                    }
                  } else {
                    // 检查文件是否存在
                    filePath = resolve(rootDir, url.slice(1))
                    if (sendFile(filePath)) {
                      return
                    }
                  }
                }
              }
              
              // 如果直接路径不存在，检查是否在子目录中存在（处理相对路径问题）
              // 例如：/src/js/index.js 可能实际在 /dist/src/js/index.js
              if (url.startsWith('/') && !url.startsWith('/@')) {
                // 首先尝试从 Referer 头获取来源目录
                const referer = req.headers.referer || ''
                let targetDir = null
                
                // 从 Referer 中提取子目录名（如 http://localhost:3100/dist/index.html -> dist）
                for (const dir of subDirs) {
                  if (referer.includes(`/${dir}/`) || referer.includes(`/${dir}`)) {
                    targetDir = dir
                    break
                  }
                }
                
                // 如果找到了来源目录，优先在该目录中查找
                if (targetDir) {
                  const potentialPath = resolve(rootDir, targetDir, url.slice(1))
                  if (sendFile(potentialPath)) {
                    return
                  }
                }
                
                // 如果没找到来源目录或文件不存在，遍历所有子目录查找
                for (const dir of subDirs) {
                  const potentialPath = resolve(rootDir, dir, url.slice(1))
                  if (sendFile(potentialPath)) {
                    return
                  }
                }
              }
              
              next()
            },
          })
        }
      },
    },
  ],
})

