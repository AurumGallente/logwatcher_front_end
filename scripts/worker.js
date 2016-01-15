importScripts('backendConfig.js');
var port;
var lastRecord;
function getData(){
        var XHR = ("onload" in new XMLHttpRequest()) ? XMLHttpRequest : XDomainRequest;
        var xhr = new XHR();
        xhr.open('POST', backendUrl, true);
        xhr.setRequestHeader('content-type', 'application/json');
        xhr.onload = function() {
            lastRecord = this.responseText.record;
          port.postMessage( this.responseText );               
        } 
        xhr.send(JSON.stringify({lr:lastRecord}));        
        xhr.onerror = function(){
            port.postMessage(this.status);
        }
}
onconnect = function(e) {
    port = e.ports[0];

    port.addEventListener('message', function(e) {
        lastRecord = e.data;
        //getData(port);
    });    
    port.start(); // Required when using addEventListener. Otherwise called implicitly by onmessage setter.
}
setInterval(getData, workerinterval);

