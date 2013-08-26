'use strict';

describe('Controllers', function() {

  beforeEach(module('gqb.services'));
  beforeEach(module('gqb.controllers'));

  describe('QueryFieldCtrl', function() {
    var scope, ctrl;

    beforeEach(inject(function($rootScope, $controller) {
      scope = $rootScope.$new();
      ctrl = $controller('QueryFieldCtrl', {$scope: scope});
    }));

    it('adds a node and generates the query', inject(function(QueryBuilder, TrailsDslGenerator, Event) {
      QueryBuilder.addNode('Test');
      
      var dsl = TrailsDslGenerator.generateDsl(QueryBuilder.getQuery());
      Event.notifyDslChanged(dsl);
      
      expect(scope.query).toEqual('(V(Test)).take(50)');
    }));

  });
});