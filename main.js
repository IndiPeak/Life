const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('node:path')
const fs = require('node:fs')
const os = require('os')

const dataPath = path.join(os.homedir + '/OwnLifeData', 'data.dt')

const createWindow = () => {
  const win = new BrowserWindow({
    width: 900,
	height: 615,
	minWidth: 900,
	minHeight: 610,
	autoHideMenuBar: true,
	titleBarStyle: 'hidden',
	hasShadow: true,
	titleBarOverlay: {
		color: '#0D0D0D',
		symbolColor: '#A6A6A6',
	},
	// icon: 'f_ico/icons/win/icon.ico',
	backgroundColor: "#0D0D0D",
	webPreferences: {
		sandbox: false,
		contextIsolation: false,
		preload: path.join(__dirname, 'start.js')
	}
  })

  if (fs.existsSync(dataPath)){
	win.loadFile('main.html')
  }
  else {
	win.loadFile('start.html')
  }
  win.webContents.openDevTools()
}

app.whenReady().then(() => {
  createWindow()
})

ipcMain.on('loadHTML', async (event, fpath) => {
	BrowserWindow.getAllWindows()[0].loadFile(path.join(__dirname, fpath))
})