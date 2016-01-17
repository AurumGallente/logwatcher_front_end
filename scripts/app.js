'use strict';

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
            $scope.records = records.rows;            
            $scope.totalItems = parseInt(records.count);

        });
    };
    $scope.populate = function(data){
        $scope.errText = data.text;
    };
    $scope.pageChanged = function () {
        $scope.records = getRecords($scope.currentPage, $scope.perPage);
    };
    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
    };
    $scope.records = getRecords($scope.currentPage, $scope.perPage);
});
