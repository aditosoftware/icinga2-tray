var fs = require('fs');
var ipcRenderer = require('electron').ipcRenderer;

function quit() {
  ipcRenderer.send('quit', "quit");
}

//read configuration 
function readConfig() {
  
  //create object with configuration information
  var configInputObj = {
    api: {
      url: "",
      port: "",
      user: "",
      pass: ""
    },
    refreshtime: ""
  };

  //read input
  var urlinput = document.getElementById('urlinput');
  var urlform = document.getElementById('urlform');
  var portinput = document.getElementById('portinput');
  var userinput = document.getElementById('userinput');
  var userform = document.getElementById('userform');
  var passinput = document.getElementById('inputpass');
  var passform = document.getElementById('passform');
  var refreshinput = document.getElementById('refreshinput');

  //check input if empty
  if (urlinput.value.length == 0 || userinput.value.length == 0 || passinput.value.length == 0) {
    urlform.className += ' has-error';
    userform.className += ' has-error';
    passform.className += ' has-error';
    alert("Check fields again. Empty?");
  } else {

    if (portinput.value.length == 0) {
      configInputObj.api.port = '5665';
    } else {
      configInputObj.api.port = portinput.value;
    }

    if (refreshinput.value.length == 0) {
      configInputObj.refreshtime = '120';
    } else {
      configInputObj.refreshtime = refreshinput.value;
    }

    configInputObj.api.url = urlinput.value;
    configInputObj.api.user = userinput.value;
    configInputObj.api.pass = passinput.value;

    //send configurations object to main process
    ipcRenderer.send('configuration', configInputObj);

  }
}