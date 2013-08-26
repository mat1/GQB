'use strict';

describe('Controllers', function() {

  beforeEach(module('gqb.services'));
  beforeEach(module('gqb.controllers'));

  describe('BreadcrumbsCtrl', function() {
    var scope, ctrl;

    beforeEach(inject(function($rootScope, $controller) {
      scope = $rootScope.$new();
      ctrl = $controller('BreadcrumbsCtrl', {$scope: scope});
    }));

    it('breadcrumbs should be empty at the beginning', function() {
      expect(scope.breadcrumbs).toEqual([]);
    });

    it('adds a node to the breadcrumbs', inject(function(QueryBuilder) {
      QueryBuilder.addNode('Test');
      expect(scope.breadcrumbs.length).toEqual(1);
      expect(scope.breadcrumbs[0].name).toEqual('Test');
    }));

    it('adds a node and a sub query to the breadcrumbs', inject(function(QueryBuilder) {
      QueryBuilder.addNode('Node 1');
      QueryBuilder.startSubQuery();
      QueryBuilder.addEdge('Edge');
      QueryBuilder.addNode('Node 2');
      
      expect(scope.breadcrumbs.length).toEqual(5);
      expect(scope.breadcrumbs[0].name).toEqual('Node 1');
      expect(scope.breadcrumbs[1].name).toEqual('Sub(');
      expect(scope.breadcrumbs[4].name).toEqual(')');
    }));

  });
});