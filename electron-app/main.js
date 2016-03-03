var app = require('app');  // Module to control application life.

var ipcMain = require('electron').ipcMain;
var notifier = require('node-notifier');



var BrowserWindow = require('browser-window');  // Module to create native browser window.

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  app.quit();
});

// This method will be called when Electron has done everything
// initialization and ready for creating browser windows.
app.on('ready', function() {
    
  ipcMain.on('exit', function(event, arg) {
    //app.quit();
    
    notifier.notify({
        'sound': true,
        'title': 'My notification',
        'message': 'Hello, there!'
    });
  });
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1150, height: 530});

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/ui.html');

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    mainWindow = null;
  });
});