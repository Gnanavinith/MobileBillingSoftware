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
    win.loadURL("http://localhost:5173")
  } else {
    // Load built React files in production
    win.loadFile(path.join(__dirname, "../client/dist/index.html"))
  }
}

app.whenReady().then(() => {
  if (!isDev) {
    // Start backend server in production
    const serverPath = path.join(process.resourcesPath, "server", "server.js")
    serverProcess = spawn(process.execPath, [serverPath], {
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
