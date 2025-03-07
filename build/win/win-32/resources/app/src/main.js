const {
  app,
  BrowserWindow,
  ipcMain,
} = require('electron')
const fs = require('fs')
const path = require('path')
const xlsx = require('./xlsx')

let mainWindow

function createWindow() {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    fullscreen: false,
    frame: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'), // 预加载脚本
    },
  })

  // 自动打开 DevTools
  if (process.env.NODE_ENV === 'development') mainWindow.webContents.openDevTools({ mode: 'right' })

  mainWindow.maximize();

  // 加载应用的主页面
  mainWindow.loadFile(path.join(__dirname, 'index.html'))

  // 当窗口关闭时清空引用
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // macos dev 模式下修改图标
  if (process.platform === 'darwin') {
    app.dock.setIcon(path.join(__dirname, '../icons', 'icon.png'))
  }
}

// 这段程序将会在 Electron 结束初始化
// 和创建浏览器窗口的时候调用
// 部分 API 在 ready 事件触发后才能使用。
app.whenReady()
  .then(() => {
    createWindow()

    app.on('activate', () => {
      // 在 macOS 系统内, 如果没有已开启的应用窗口
      // 点击托盘图标时通常会重新创建一个新窗口
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })

// 除了 macOS 外，当所有窗口都被关闭的时候退出程序。 因此, 通常
// 对应用程序和它们的菜单栏来说应该时刻保持激活状态,
// 直到用户使用 Cmd + Q 明确退出
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// 监听渲染进程请求，读取 .xlsx 文件
ipcMain.handle('get-xlsx-files', async () => {

  /**
   * 获取应用程序所在的根目录（.app 或 .exe 所在的目录）
   * @returns {string} 应用程序同级目录（可用于查找 files 文件夹）
   */
  const getAppRootDirectory = () => {
    let exePath = app.getPath('exe') // 获取可执行文件路径
    let currentDir = path.dirname(exePath) // 初始目录

    if (process.platform === 'darwin') {
      // macOS: 递归查找 .app 目录
      while (!currentDir.endsWith('.app') && currentDir !== path.dirname(currentDir)) {
        currentDir = path.dirname(currentDir)
      }
      return path.dirname(currentDir) // 返回 .app 外部目录
    }

    // Windows / Linux: 直接返回 exe 所在目录
    return currentDir
  }

  /**
   * 获取 files 目录路径
   * @returns {string} files 文件夹的完整路径
   */
  function getFilesFolderPath() {

    return path.join(process.env.NODE_ENV === 'development' ? path.join(__dirname, '..') : getAppRootDirectory(), 'files')
  }

  /**
   * 获取 files 目录下的所有 Excel 文件
   * @returns {string[]} Excel 文件路径数组
   */
  function getExcelFiles() {
    const filesFolderPath = getFilesFolderPath()

    if (!fs.existsSync(filesFolderPath)) {
      return []
    }

    return fs.readdirSync(filesFolderPath)
      .filter(file => file.endsWith('.xlsx') || file.endsWith('.xls'))
      .map(file => path.join(filesFolderPath, file))
  }

  const readExcelFile = (filePath) => {
    const workbook = xlsx.readFile(filePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 })
    const headers = jsonData[0].map(h => (h || '').toString()
      .trim()
      .toLowerCase())
    const nameColIndex = headers.findIndex(h =>
      h.includes('姓名') || h.includes('name') || h.includes('学生'),
    )
    if (nameColIndex === -1) {
      return []
    }
    const formatData = jsonData
      .slice(1)
      .map(row => row[nameColIndex])
      .map(name => name && name.toString()
        .trim())
      .filter(name => !!name)

    if (formatData.length === 0) {
      return []
    }
    return formatData
  }

  try {
    const files = getExcelFiles()
    const fileData = files.map(file => ({
      fileName: `${path.basename(file)}(内置)`,
      data: readExcelFile(file),
    }))
    return {
      fileFolderPath: getFilesFolderPath(),
      files: fileData,
    }
  } catch (error) {
    return []
  }
})
