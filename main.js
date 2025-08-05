const { app, BrowserWindow } = require('electron')

const createWindow = () => {
  const win = new BrowserWindow({
    width: 900,
		height: 600,
		minWidth: 700,
		minHeight: 500,
		autoHideMenuBar: true,
		titleBarStyle: 'hidden',
		titleBarOverlay: {
			color: '#0D0D0D',
			symbolColor: '#A6A6A6',
		},
  })

  win.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow()
})