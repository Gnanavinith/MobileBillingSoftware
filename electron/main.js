const { app, BrowserWindow } = require("electron")
const path = require("path")
const { spawn } = require("child_process")
const http = require("http")
const fs = require("fs")

const isDev = !app.isPackaged
let serverProcess
let mainWindow

// Ensure single instance
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
}

function createWindow() {
  if (mainWindow) return
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js") // optional if using IPC
    },
  })

  if (isDev) {
    // Load Vite dev server in dev mode
    const devUrl = process.env.ELECTRON_START_URL || "http://localhost:5173"
    mainWindow.loadURL(devUrl)
  } else {
    // Load built React files in production (copied into resources)
    mainWindow.loadFile(path.join(process.resourcesPath, "client", "dist", "index.html"))
  }
}

function waitForServerReady(url, { retries = 100, intervalMs = 500 } = {}) {
  return new Promise((resolve, reject) => {
    let attempts = 0
    console.log(`Checking server at ${url}...`)
    const check = () => {
      attempts++
      console.log(`Attempt ${attempts}/${retries}`)
      const req = http.get(url, (res) => {
        console.log(`Server responded with status: ${res.statusCode}`)
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 500) {
          res.resume()
          return resolve(true)
        }
        res.resume()
        if (attempts >= retries) return reject(new Error('Server not ready'))
        setTimeout(check, intervalMs)
      })
      req.on('error', (err) => {
        console.log(`Connection error: ${err.message}`)
        if (attempts >= retries) return reject(new Error('Server not ready'))
        setTimeout(check, intervalMs)
      })
      req.setTimeout(2000, () => {
        req.destroy()
        if (attempts >= retries) return reject(new Error('Server not ready'))
        setTimeout(check, intervalMs)
      })
    }
    check()
  })
}

app.whenReady().then(async () => {
  const port = process.env.PORT || '5000'
  if (isDev) {
    // Start backend server in development if not already running
    const serverPath = path.join(__dirname, "../server/server.js")
    serverProcess = spawn(process.execPath, [serverPath], {
      env: { ...process.env, PORT: port },
      stdio: "inherit"
    })
  } else {
    // Start backend server in production (expects server folder packaged into resources)
    const serverPath = path.join(process.resourcesPath, "server", "server.js")
    const logDir = app.getPath('userData')
    try { fs.mkdirSync(logDir, { recursive: true }) } catch {}
    const logFile = path.join(logDir, 'server.log')
    const out = fs.createWriteStream(logFile, { flags: 'a' })
    
    console.log('Starting server from:', serverPath)
    console.log('Log file:', logFile)
    console.log('Port:', port)
    
    serverProcess = spawn(process.execPath, [serverPath], {
      env: { ...process.env, PORT: port },
      stdio: ["ignore", "pipe", "pipe"],
      cwd: path.join(process.resourcesPath, "server")
    })
    
    serverProcess.stdout.on('data', (data) => {
      console.log('Server stdout:', data.toString())
      out.write(data)
    })
    
    serverProcess.stderr.on('data', (data) => {
      console.error('Server stderr:', data.toString())
      out.write(data)
    })
    
    serverProcess.on('error', (err) => {
      console.error('Failed to start server:', err)
    })
    
    serverProcess.on('exit', (code) => {
      console.log('Server exited with code:', code)
    })
  }

  try {
    console.log('Waiting for server to be ready...')
    await waitForServerReady(`http://127.0.0.1:${port}/api/health`)
    console.log('Server is ready!')
  } catch (err) {
    console.error('Server not ready after timeout:', err.message)
    // Show error to user
    const { dialog } = require('electron')
    dialog.showErrorBox('Server Error', 'Backend server failed to start. Please check MongoDB is running and try again.')
  }
  createWindow()
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})

app.on("will-quit", () => {
  if (serverProcess) serverProcess.kill()
})
