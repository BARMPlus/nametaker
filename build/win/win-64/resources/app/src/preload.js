const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  getXlsxFiles: () => ipcRenderer.invoke("get-xlsx-files"),
});
