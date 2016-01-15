'use strict';
var worker = new SharedWorker('scripts/worker.js');
function insertWorker(){
    worker.port.postMessage(localStorage.getItem('recordid'));
    //console.log(localStorage.getItem('recordid'));
}
var app = angular.module('app', ['ui.router', 'ngResource', 'ui.bootstrap'])
        .constant('backend', {
            url: backendUrl
        })
        .config(function ($stateProvider, $urlRouterProvider) {
            $urlRouterProvider.otherwise("/404");
            $stateProvider
                    .state('index', {
                        url: '/',
                        templateUrl: "/views/index.html",
                        controller: 'indexCtrl'
                    })
                    .state('404', {
                        url: "/404",
                        templateUrl: "views/404.html"
                    });
        })
        .config(function ($sceDelegateProvider, backend) {
            $sceDelegateProvider.resourceUrlWhitelist([
                'self',
                backend.url
            ]);
        })
        .factory('recordsService', function (backend, $resource) {
            return $resource(backend.url, null, {'update': {method: 'PUT'}});
        })
;

app.controller('indexCtrl', function ($scope,  $location, $stateParams, backend, $http, recordsService) {
    $scope.currentPage = 1;
    $scope.maxSize = 10;
    $scope.perPage = 10;
    var getRecords = function (page, perPage) {
        return recordsService.get({page: page, perPage: perPage}, function (records) {
            var max=localStorage.getItem('recordid');
            //console.log('max is '+max);
            max = (max==undefined)? 0 : max;
            $scope.records = records.rows;
            for(var i=0;i<=records.rows.length-1;i++){
                //console.log(records.rows[i]['id']);
                if(records.rows[i]['id']>max){
                    //alert(records.rows[i]['id']);
                    //alert(max);
                    max = records.rows[i]['id'];
                }
            }
            //console.log('max is '+max);
            localStorage.setItem('recordid', max);
            insertWorker();
            $scope.totalItems = parseInt(records.count);
        });
    };
    $scope.pageChanged = function () {
        $scope.records = getRecords($scope.currentPage, $scope.perPage);
    };
    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
    };
    $scope.records = getRecords($scope.currentPage, $scope.perPage);
});
$(document).ready(function(){
    var permittion = false;
    if (!(Notification.permission === "granted")) {
        Notification.requestPermission(function (permission) {      
          if (permission === "granted") {
                permittion = true;
            //var notification = new Notification("Hi there!");
          }
        })    
    } else {
        permittion = true;
    };

    var recordid = localStorage.getItem('recordid');
    recordid = (recordid) ? recordid : 0;
    localStorage.setItem('recordid', recordid);    
           
    worker.port.onmessage = function(e) {
        var textContent = JSON.parse(e.data);
        console.log(textContent.record);
        if(permittion && (textContent.count>0)){
            var notification = new Notification('Мониторинг ошибок', {body: textContent.count+" новых ошибок", icon: 'icons/Error.png'});
            console.log(textContent);
            console.log(recordid);
            localStorage.setItem('recordid', textContent.record.id);
            worker.port.postMessage(recordid);
        }
    }
    worker.port.start(); 
    worker.port.postMessage(recordid);
    setInterval(insertWorker, 20000);
});