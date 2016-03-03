var app = require('app');  // Module to control application life.
var BrowserWindow = require('browser-window');  // Module to create native browser window.
var path = require('path');

var ipcMain = require('electron').ipcMain;

var notifier = require('node-notifier');
var menubar = require('menubar');
var alertArr = [];

var mb = new menubar({
  "tooltip": "program running in tray",
  "width": 800,
  "height": 300,
  "show-dock-icon": true,
  "preload-window": true,
  icon: __dirname + '/img/logo.png'
});



mb.on('ready', function ready() {
  // Report crashes to our server.
  //require('crash-reporter').start();

  ipcMain.on('quit', function () {
    alert("Test");
  });

  ipcMain.on('exit', function (event, arg) {
    app.quit();
  });
  
  ipcMain.on('info', function (event, arg){
    console.log(arg);
  });

  ipcMain.on('asynchronous-message', function (event, arg) {

    var name = arg.name;
    var stat = arg.state;
    var server = arg.server;
    var servicename = arg.servicename;

    //console.log(arg.state);
    if (stat == true) {

      //Error,warning,unknown
      var aInfo = alertArr.indexOf(name);
      if (aInfo >= 0) { //found
        console.log("found ", stat);
      } else {
        console.log("add to arr :", name);
        alertArr.push(name);

        notifier.notify({
          title: "Server: " + server,
          message: "Error: " + servicename,
          icon: path.join(__dirname, '/img/attention.png'), // Absolute path (doesn't work on balloons) 
          sound: true, // Only Notification Center or Windows Toasters 
          wait: true // Wait with callback, until user action is taken against notification 
        }, function (err, response) {
          // Response is response from notification 
        });

        notifier.on('click', function (notifierObject, options) {
          //console.log("click 1");
        });

        notifier.on('timeout', function (notifierObject, options) {
          console.log("click 2");
        });
      }
    } else { //delete from error arr
      var aInfo = alertArr.indexOf(arg.name);
      if (aInfo >= 0) { //found
        console.log("found in err arr. delete: ", alertArr[aInfo]);
        alertArr.splice(aInfo);

        notifier.notify({
          title: "Server: " + server,
          message: "Ok: " + servicename,
          icon: path.join(__dirname, '/img/okay.png'), // Absolute path (doesn't work on balloons) 
          sound: true, // Only Notification Center or Windows Toasters 
          wait: true // Wait with callback, until user action is taken against notification 
        }, function (err, response) {
          // Response is response from notification 
        });

        notifier.on('click', function (notifierObject, options) {
          //console.log("click 1");
        });

        notifier.on('timeout', function (notifierObject, options) {
          //console.log("click 2");
        });
      }
      ;
    }

  });

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is GCed.
  var mainWindow = null;

// Quit when all windows are closed.
  app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform != 'darwin') {
      app.quit();
    }
  });

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
  app.on('ready', function () {
    // Create the browser window.
    mainWindow = new BrowserWindow({
      resizable: false,
      width: 800,
      height: 300,
      icon: __dirname + '/img/logo.png',
      autoHideMenuBar: true});

    // and load the index.html of the app.
    mainWindow.loadUrl('file://' + __dirname + '/index.html');

    // Open the devtools.
    mainWindow.openDevTools();

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time

      // when you should delete the corresponding element.
      mainWindow = null;
    });
  });
});