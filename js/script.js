var https = require('https');
var fs = require('fs');
var notifier = require('node-notifier');
var path = require('path');
var ipcRenderer = require('electron').ipcRenderer;

var configpath = __dirname + "/config.json";
if (!fs.existsSync(configpath)) {
  alert("Config.yml not found.Exit");
  quit();
}

var serverconfig = JSON.parse(fs.readFileSync(configpath, 'utf-8'));

if (serverconfig.api.user !== undefined && serverconfig.api.pass !== undefined && serverconfig.api.port !== undefined && serverconfig.api.url !== undefined && serverconfig.refreshtime !== undefined) {
  var user = serverconfig.api.user;
  var pass = serverconfig.api.pass;
  var port = serverconfig.api.port;
  var url = serverconfig.api.url;
  var refresh = serverconfig.refreshtime;
  console.log("config ok");
} else {
  alert("error in config.yml, string not found.Exit");
  quit();
}


var options = {
  "hostname": url,
  "rejectUnauthorized": false,
  "path": "/v1/objects/services",
  "port": port,
  "method": 'GET',
  "headers": "application/json",
  "auth": user + ":" + pass
};

function quit() {
  ipcRenderer.send('exit', 'ping');
}

function sendipc(pName, pStat, pServer, pServicename) {
  var obAlert = {
    "name": pName,
    "state": pStat,
    "server": pServer,
    "servicename": pServicename
  };

  ipcRenderer.send('asynchronous-message', obAlert);
}

function start() {
  var str;

  //add refrash site
  var meta = document.createElement('meta');
  meta.httpEquiv = "Refresh";
  meta.content = refresh;
  document.getElementsByTagName('head')[0].appendChild(meta);

  callback = function (response) {

    response.on('data', function (chunk) {
      if (str !== undefined) {
        str += chunk;
      } else {
        str = chunk;
      }
    });

    response.on('end', function () {

      var test = JSON.parse(str);
      var arr = test.results;
      var stateText;
      var alertSet = false;

      for (var i = 0; i < arr.length; i++) {
        var sObj = arr[i];
        var last_check_result = sObj.attrs.last_state;
        var state = sObj.attrs.last_check_result.state;
        var ack = sObj.attrs.acknowledgement;
        var servicename = sObj.attrs.name;
        var server = sObj.attrs.host_name;
        var downtime = sObj.attrs.last_in_downtime;
        var output = sObj.attrs.last_check_result.output;
        var name = sObj.attrs.__name;

        if (state !== 0 && ack === 0 && downtime === false) {

          sendipc(name, true, server, servicename);

          if (state === 1) {
            stateText = "Warning";
            writeRow("warn", server, servicename, output);
          }
          if (state === 2) {
            stateText = "Error";
            writeRow("err", server, servicename, output);
          }
          if (state === 3) {
            stateText = "Unknown";
            writeRow("unkn", server, servicename, output);
          }
          if (state === 99){
              stateText = "Pending";
              writeRow("pend", server, servicename, output);
          }
        } else {
          sendipc(name, false, server, servicename);
        }
      }

    });
  };

  var req = https.request(options, callback).on('error', function (err) {
    alert("Cannot connect to " + options.hostname + ".Exit");
    quit();    
  }).end();
}

function writeRow(pState, pServer, pServiceName, pOutput) {
  var state = pState;
  var statesymbol;

  if (pState === "err") {
    sClass = "danger";
    statesymbol = "glyphicon glyphicon-remove-sign red";
  }
  ;
  if (pState === "warn") {
    sClass = "warning";
    statesymbol = "glyphicon glyphicon-exclamation-sign orange";
  }
  ;
  if (pState === "unkn") {
    sClass = "info";
    statesymbol = "glyphicon glyphicon-question-sign";
  }
  if (pState === "pend") {
      sClass = 'warn';
      statesymbol = "glyphicon glyphicon-exclamation-sign orange";
  }

  var table = document.getElementById("infotable");
  var rowCount = table.rows.length;
  var row = table.insertRow(rowCount);
  row.className += sClass;

  var cState = row.insertCell(0);
  var cServername = row.insertCell(1);
  var cServicename = row.insertCell(2);
  var cOutput = row.insertCell(3);
  var cLink = row.insertCell(4);

  var tSpan = document.createElement('span');
  cState.appendChild(tSpan);
  tSpan.className += statesymbol;

  var pServername = document.createElement('p');
  var pServernameText = document.createTextNode(pServer);
  pServername.appendChild(pServernameText);
  cServername.appendChild(pServername);

  var pServicename = document.createElement('p');
  var pServicenameText = document.createTextNode(pServiceName);
  pServicename.appendChild(pServicenameText);
  cServicename.appendChild(pServicename);

  var pOuptput = document.createElement('p');
  var pOuptputText = document.createTextNode(pOutput);
  pOuptput.appendChild(pOuptputText);
  cOutput.appendChild(pOuptput);

  var Servicelink = "http://" + options.hostname + "/icingaweb2/monitoring/service/show?host=" + pServer + "&service=" + pServiceName;
  var pButton = document.createElement('BUTTON');
  var pButtonText = document.createTextNode("Open in browser");
  pButton.onclick = function () {
    openLink(Servicelink);
  };
  pButton.appendChild(pButtonText);
  pButton.className += "btn btn-default";
  cLink.appendChild(pButton);
}

function openLink(pServicelink) {
  var shell = require('electron').shell;
  shell.openExternal(pServicelink);
}