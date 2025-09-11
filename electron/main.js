const { app, BrowserWindow } = require("electron")
const path = require("path")
const { spawn } = require("child_process")

const isDev = !app.isPackaged
let serverProcess

function createWindow() {
  const win = new BrowserWindow({
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
    win.loadURL(devUrl)
  } else {
    // Load built React files in production (copied into resources)
    win.loadFile(path.join(process.resourcesPath, "client", "dist", "index.html"))
  }
}

app.whenReady().then(() => {
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
    serverProcess = spawn(process.execPath, [serverPath], {
      env: { ...process.env, PORT: port },
      stdio: "inherit"
    })
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
