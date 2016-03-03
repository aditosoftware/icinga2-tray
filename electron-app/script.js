//Script

var ipcRenderer = require('electron').ipcRenderer;

function readConfigurationDevice () {
  
  var deviceAddress = document.getElementById("address");
  var authtoken = document.getElementById("authtoken");
  var numberLeds = document.getElementById("ledsnumber");
  var buttonConfig = document.getElementById("readConfigButton");
  
  if(checkconfig(deviceAddress.value, authtoken.value, numberLeds.value)){
      buttonConfig.className = "btn btn-success"
  } else {
      buttonConfig.className = "btn btn-danger"
  }
    
};

function test(){
    alert("Test");
}

function checkconfig(pAddress, pAuth, pNumleds){
  var formIpAddress = document.getElementById("ipaddform");
  var formAuth = document.getElementById("authform");
  var formLeds = document.getElementById("numbersledform")
  
  if(!ValidateIPaddress(pAddress)){
      formIpAddress.className += " has-error";
      return false;      
  } else {
      formIpAddress.className = "form-group";
  }
  
  if(pAuth.length == 0){
      formAuth.className += " has-error";
      return false;
  } else {
      formAuth.className = "form-group";
  }
  
  if(pNumleds.length == 0){
      formLeds.className += " has-error";
      return false;
  } else {
      formLeds.className = "form-group";
  }
  
  return true;
}

function ValidateIPaddress(ipaddress){  
    if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddress)){
        return true;
    } else {
        return false;
    }    
}  

function exit() {
    ipcRenderer.send('exit', 'ping');
}