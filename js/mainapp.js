var https = require('https');
var fs = require('fs');
var notifier = require('node-notifier');
var path = require('path');
var ipcRenderer = require('electron').ipcRenderer;

function quit() {
    ipcRenderer.send('quit', 'ping');
};

function minimize() {
    ipcRenderer.send('minimize', 'ping');
};

//run check
function start() {
var str;

    //send configuration ack for api from main process
    ipcRenderer.send('configack', 'conf');
    
    //receive configuration
    ipcRenderer.on('configans', function (event, pConfig) {
      
        //write to object
        var options = {
            "hostname": pConfig.api.url,
            "rejectUnauthorized": false,
            "path": "/v1/objects/services",
            "port": pConfig.api.port,
            "method": 'GET',
            "headers": "application/json",
            "auth": pConfig.api.user + ":" + pConfig.api.pass
        };

        //add refrash site
        var meta = document.createElement('meta');
        meta.httpEquiv = "Refresh";
        meta.content = pConfig.refresh;
        document.getElementsByTagName('head')[0].appendChild(meta);

        callback = function (response) {
            
            //check status of api site
            if(response.statusCode !== 200){
              alert("Cannot connect to monitoring site.\nStatusCode: " + response.statusCode + "\nUser or password is incorrect. Exit");
              ipcRenderer.send('quit', 'quit');
            } else {
                          response.on('data', function (chunk) {
                if (str !== undefined) {
                    str += chunk;
                } else {
                    str = chunk;
                }
            });
            
            response.on('end', function () {
                
                //parse json, from api site
                var test = JSON.parse(str);
                var arr = test.results;
                var stateText;
                var alertSet = false;
                
                //for loop services
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
                    
                    //check state of service if unknown, error, warning or pending
                    if (state !== 0 && ack === 0 && downtime === false) {

                        sendipc(name, true, server, servicename);

                        if (state === 1) {
                            stateText = "Warning";
                            writeRow("warn", server, servicename, output, options);
                        }
                        if (state === 2) {
                            stateText = "Error";
                            writeRow("err", server, servicename, output, options);
                        }
                        if (state === 3) {
                            stateText = "Unknown";
                            writeRow("unkn", server, servicename, output, options);
                        }
                        if (state === 99) {
                            stateText = "Pending";
                            writeRow("pend", server, servicename, output, options);
                        }
                    } else {
                        sendipc(name, false, server, servicename);
                    }
                }

            });
            }

        };
        
        //make https request
        var req = https.request(options, callback).on('error', function (err) {
            alert("Cannot connect to " + options.hostname + ".Exit");
            quit();
        }).end();
    });
}

//func to send a service information to main process
function sendipc(pName, pStat, pServer, pServicename) {
    var obAlert = {
        "name": pName,
        "state": pStat,
        "server": pServer,
        "servicename": pServicename
    };

    ipcRenderer.send('alertArr', obAlert);
}

//create html site index.html
function writeRow(pState, pServer, pServiceName, pOutput, pOptions) {
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
    pServicename.className += ' maxwidth270px';

    var pOutputPara = document.createElement('p');
    var pOuptputText = document.createTextNode(pOutput);
    pOutputPara.appendChild(pOuptputText);
    cOutput.appendChild(pOutputPara);
    pOutputPara.className += ' maxwidth600px';

    var Servicelink = "http://" + pOptions.hostname + "/icingaweb2/monitoring/service/show?host=" + pServer + "&service=" + pServiceName;
    var pButton = document.createElement('BUTTON');
    var pButtonText = document.createTextNode("Open in browser");
    pButton.onclick = function () {
        openLink(Servicelink);
    };
    pButton.appendChild(pButtonText);
    pButton.className += "btn btn-default";
    cLink.appendChild(pButton);
}

//function to open link (if click button "open in browser") in default system browser
function openLink(pServicelink) {
    var shell = require('electron').shell;
    shell.openExternal(pServicelink);
}