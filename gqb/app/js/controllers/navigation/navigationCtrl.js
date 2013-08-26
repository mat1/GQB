'use strict';

gqb.ctrls.controller('NavigationCtrl', function($scope, $location, QueryBuilder) {
  $scope.navClass = function(page) {
    var currentRoute = $location.path().substring(1) || 'home';
    return page === currentRoute ? 'active' : '';
  };
  
  $scope.resetQuery = function() {
    QueryBuilder.init();
  };
});