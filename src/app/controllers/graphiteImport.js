define([
  'angular',
  'app',
  'lodash',
  'kbn'
],
function (angular) {
  'use strict';

  var module = angular.module('grafana.controllers');

  module.controller('GraphiteImportCtrl', function($scope, $rootScope, $timeout, datasourceSrv, $location) {

    $scope.init = function() {
      $scope.datasources = datasourceSrv.getMetricSources();
      $scope.setDatasource(null);
    };

    $scope.setDatasource = function(datasource) {
      $scope.datasource = datasourceSrv.get(datasource);

      if (!$scope.datasource) {
        $scope.error = "Cannot find datasource " + datasource;
        return;
      }
    };

    $scope.listAll = function(query) {
      delete $scope.error;
      $scope.datasource.listDashboards(query)
        .then(function(results) {
          $scope.dashboards = results;
        })
        .then(null, function(err) {
          $scope.error = err.message || 'Error while fetching list of dashboards';
        });
    };

    $scope.import = function(id) {
      delete $scope.error;

      $scope.datasource.loadDashboard(id)
        .then(function(dashboard) {
          $location.search({});
          $location.path(dashboard.url);
        })
        .then(null, function(err) {
          $scope.error = err.message || 'Failed to import dashboard';
        });
    };

  });

});
