importScripts('backendConfig.js');
var lastRecord;
var count;
var ports;

function getData(){
        var XHR = ("onload" in new XMLHttpRequest()) ? XMLHttpRequest : XDomainRequest;
        var xhr = new XHR();
        xhr.open('POST', backendUrl, true);
        xhr.setRequestHeader('content-type', 'application/json');
        xhr.onload = function() {
              lastRecord = (lastRecord==undefined) ? 0 : lastRecord;
              count = Math.abs(lastRecord - JSON.parse(this.responseText).lastid);
              lastRecord = JSON.parse(this.responseText).lastid;
              for(var i=0,l=ports.length; i<l; i++) { 
                ports[i].postMessage(lastRecord);
              }
              var data = JSON.parse(this.responseText);
              if(count!=0){
                var notification = new Notification("Есть новые уведомления",{body: count+" новых ошибок", icon: '../icons/Error.png',dir : "ltr", tag:'tag'});                
              }

                            
          //port.postMessage( this.responseText );               
        }     
        xhr.onerror = function(){
            port.postMessage(this.status);
        }
        xhr.send(JSON.stringify({lr:lastRecord}));
}  
  function onmessage(e) {
    lastRecord = JSON.parse(e.data.recordid);
    //var notification = new Notification(lastRecord);
    if(Notification.permission==='granted'){        
         setInterval(getData, workerinterval);       
    } 
    
  }
  self.onconnect = function(e) {
      ports = e.ports;
      for(var i=0,l=e.ports.length; i<l; i++) {
        e.ports[i].addEventListener('message', onmessage);
        e.ports[i].start(); // Required when using addEventListener. Otherwise called implicitly by onmessage setter.
        //e.ports[i].postMessage('u 1');        
      }
  }
