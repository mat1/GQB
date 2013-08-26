'use strict';

gqb.ctrls.controller('AdminCtrl', function($scope, TrailsWebService, Event) {
  TrailsWebService.getSchema(function(data) {
    $scope.graph = data;
  });

  $scope.saveLayout = function() {
    Event.notifySaveLayout();
  };
});