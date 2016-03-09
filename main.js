var app = require('app');  // Module to control application life.
var BrowserWindow = require('browser-window');  // Module to create native browser window.
var ipcMain = require('electron').ipcMain;
var path = require('path');
var notifier = require('node-notifier');
var fs = require('fs');
var electron = require('electron');
var Menu = electron.Menu;
var Tray = electron.Tray;
var alertArr = [];
var heightNew;


ipcMain.on('quit', function () {
  app.quit();
});

ipcMain.on('minimize', function () {
  mainWindow.hide();
});

//if receive service object
ipcMain.on('alertArr', function (event, arg) {

  var name = arg.name;
  var stat = arg.state;
  var server = arg.server;
  var servicename = arg.servicename;

  //if service object state true (!= ok)
  if (stat == true) {

    //Error,warning,unknown
    var aInfo = alertArr.indexOf(name); //search in array
    if (aInfo >= 0) { //found
      console.log("found ", stat); //if found, do nothing
      resize(); //resize window
    } else {
      resize(); //resize window
      console.log("add to arr :", name); 
      alertArr.push(name); //add service to array. This service is not ok

      //create system notification
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
        mainWindow.show();
      });
    }
  } else { //delete from error arr
    resize();
    var aInfo = alertArr.indexOf(arg.name); //search in array
    if (aInfo >= 0) { //if found, delete from array
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
    }
    ;
  }
});

//resize mainWindow
function resize () {
  var sizeNow = mainWindow.getSize();
  var width = sizeNow[0];
  var height = sizeNow[1];

  var heightNew = (alertArr.length + 1) * 55;

  mainWindow.setSize(width, heightNew, true);

};

//start app
function startMainApp(pConfig) {
  console.log("Start app");

  //define mainWindow
  mainWindow = new BrowserWindow({
    resizable: true,
    width: 1200,
    height: 55,
    icon: __dirname + '/img/logo.png',
    autoHideMenuBar: true,
    frame: false,
    show: false
  });

  //create window with index.html
  mainWindow.loadURL('file://' + __dirname + '/index.html');
  
  //if receive config aknowlege from mainWindow
  ipcMain.on('configack', function (event) {
    mainWindow.webContents.send('configans', pConfig);
  });

  var show = false;
  var appTray = null;
  
  //create tray object
  appTray = new Tray('img/logo.png');
  var contextMenu = Menu.buildFromTemplate([
    {
      label: "Hide",
      click: function () {
        mainWindow.hide();
      }
    },
    {
      label: 'Quit',
      click: function () {
        app.quit();
      }
    }
  ]);
  appTray.setToolTip('This is my application.');
  appTray.setContextMenu(contextMenu);
  appTray.on('click', function () {
    if (show) {
      mainWindow.hide();
      show = false;
    } else {
      mainWindow.show();
      show = true;
    }

  });
}
;

app.on('ready', function () {

  //check if config.json exist
  var configpath = __dirname + "/config.json";
  if (!fs.existsSync(configpath)) {
    console.log("config.json not found");
    
    //define configuration dialog window
    var confWindow = new BrowserWindow({
      width: 300,
      height: 520,
      show: true,
      icon: __dirname + '/img/conf.png',
      autoHideMenuBar: true,
      frame: false
    });
    //load configuration dialog window
    confWindow.loadURL('file://' + __dirname + '/configuration.html');

    ipcMain.on('configuration', function (event, configObj) {
      confWindow.hide();

      //var configToJson = JSON.stringify(configObj)
      fs.writeFile(configpath, JSON.stringify(configObj, null, 2), 'utf-8', function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("file write successful");
          startMainApp(configObj);
        }
      });
    });

  } else { //config.json exist
    var configObj = JSON.parse(fs.readFileSync(configpath, 'utf-8'));
    startMainApp(configObj);
  }
});