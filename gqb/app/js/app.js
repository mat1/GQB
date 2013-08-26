'use strict';

var app = angular.module('gqb', ['ui.compat', 'gqb.services', 'gqb.directives', 'gqb.controllers']);

// Namespaces
var gqb = {};
gqb.ctrls = angular.module('gqb.controllers', []);
gqb.directives = angular.module('gqb.directives', []);
gqb.services = angular.module('gqb.services', []);

// Configuration
app.constant('WEBSERVICE_URL', 'https://YOURWEBSERVICE');

// Dsl Generator
gqb.services.factory('DslGenerator', function(TrailsDslGenerator) {
  return TrailsDslGenerator;
});

// Routing
app.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider.state('query', {
    url: '/query',
    views: {
      '': {
        templateUrl: 'partials/query/layout.html'
      },
      'graph@query': {
        templateUrl: 'partials/query/graph.html'
      },
      'propertyFilter@query': {
        templateUrl: 'partials/query/propertyFilter.html'
      },
      'queryField@query': {
        templateUrl: 'partials/query/queryField.html'
      },
      'breadcrumbs@query': {
        templateUrl: 'partials/query/breadcrumbs.html'
      },
      'resultView@query': {
        templateUrl: 'partials/query/resultView.html'
      }
    }
  });
  $stateProvider.state('admin', {
    url: '/admin',
    views: {
      '': {
        templateUrl: 'partials/admin/layout.html'
      }
    }
  });
  $stateProvider.state('help', {
    url: '/help',
    views: {
      '': {
        templateUrl: 'partials/help/layout.html'
      }
    }
  });

  $urlRouterProvider.otherwise('/query');
});
