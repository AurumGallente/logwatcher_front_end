$(document).ready(function(){
    var recordid;
    var worker = new SharedWorker('scripts/worker.js');
    recordid = localStorage.getItem('recordid');
    if(!parseInt(recordid)){
        recordid = 0;
        localStorage.setItem('recordid', recordid);
    }
    if(Notification.permission!=='granted'){
        Notification.requestPermission(function (permission) {});
    }

    worker.port.start();
    worker.port.postMessage({recordid:recordid});
    worker.port.addEventListener("message", function(e) {
      localStorage.setItem("recordid", e.data);
      console.log(e.data);
      console.log(JSON.parse(e.data));
    });
});