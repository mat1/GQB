'use strict';

describe('Service', function() {
  beforeEach(module('gqb.services'));

  describe('Query Builder', function() {
    it('should add a node and an edge', inject(function(QueryBuilder) {
      QueryBuilder.addNode('Package');
      QueryBuilder.addEdge('Test');

      var query = QueryBuilder.getQuery();

      expect(query.elements[0].name).toEqual('Package');
      expect(query.elements[1].name).toEqual('Test');
      expect(QueryBuilder.getActiveQmNode().id).toEqual(0);
    }));

    it('should throw an error', inject(function(QueryBuilder) {
      expect(function() {
        QueryBuilder.addNode('Package');
        QueryBuilder.addNode('Package');
      }).toThrow(new Error('You have to add an edge before you can add a node.'));
    }));

    it('should add an property filter to the node package', inject(function(QueryBuilder, QM) {
      var id = QueryBuilder.addNode('Package');
      var filter = [new QM.PropertyExpr('OBJECT_NAME', QM.RelOpr.EQUAL, 'krqfrei0'),
        new QM.BoolExpr(QM.BoolOpr.AND),
        new QM.PropertyExpr('Key', QM.RelOpr.NOT_EQUAL, '12')];

      QueryBuilder.setFilter(id, filter);
      var query = QueryBuilder.getQuery();

      expect(query.elements[0].filter.length).toEqual(3);
      expect(query.elements[0].filter[0].property).toEqual('OBJECT_NAME');
    }));

    it('should return the property filter for the node package', inject(function(QueryBuilder, QM) {
      var id = QueryBuilder.addNode('Package');
      var filter = [new QM.PropertyExpr('OBJECT_NAME', QM.RelOpr.EQUAL, 'krqfrei0'),
        new QM.BoolExpr(QM.BoolOpr.AND),
        new QM.PropertyExpr('Key', QM.RelOpr.NOT_EQUAL, '12')];
      QueryBuilder.setFilter(id, filter);

      var properties = QueryBuilder.getPropertyFilter(id);

      expect(properties.length).toEqual(3);
      expect(properties[0].property).toEqual('OBJECT_NAME');
    }));

    it('should remove the node PckService and all following elements', inject(function(QueryBuilder) {
      QueryBuilder.addNode('Package');
      QueryBuilder.addEdge('Bla');
      QueryBuilder.addNode('PckService');
      QueryBuilder.addEdge('Test');

      QueryBuilder.removeNode(2);
      var query = QueryBuilder.getQuery();

      expect(query.elements.length).toEqual(1);
      expect(QueryBuilder.getActiveQmNode().id).toEqual(0);
    }));

    it('should remove the node Package and all following elements', inject(function(QueryBuilder) {
      QueryBuilder.addNode('Package');
      QueryBuilder.addEdge('Bla');
      QueryBuilder.addNode('PckService');
      QueryBuilder.addEdge('Test');

      QueryBuilder.removeNode(0);
      var query = QueryBuilder.getQuery();

      expect(query.elements.length).toEqual(0);
    }));

    it('should remove the edge before node pckservice', inject(function(QueryBuilder) {
      QueryBuilder.addNode('Package');
      QueryBuilder.addEdge('Bla');
      QueryBuilder.addNode('PckService');
      QueryBuilder.addEdge('Test');

      QueryBuilder.removeNode(2);
      var query = QueryBuilder.getQuery();

      expect(query.elements.length).toEqual(1);
    }));

    it('should remove the property key and the bool expr', inject(function(QueryBuilder, QM) {
      var id = QueryBuilder.addNode('Package');
      var filter = [new QM.PropertyExpr('OBJECT_NAME', QM.RelOpr.EQUAL, 'krqfrei0'),
        new QM.BoolExpr(QM.BoolOpr.AND),
        new QM.PropertyExpr('Key', QM.RelOpr.NOT_EQUAL, '12')];
      QueryBuilder.setFilter(id, filter);

      QueryBuilder.removeExpr(3);
      var query = QueryBuilder.getQuery();

      expect(query.elements.length).toEqual(1);
      expect(query.elements[0].filter.length).toEqual(1);
      expect(query.elements[0].filter[0].id).toEqual(1);
    }));

    it('should remove the property object and the bool expr', inject(function(QueryBuilder, QM) {
      var id = QueryBuilder.addNode('Package');
      var filter = [new QM.PropertyExpr('OBJECT_NAME', QM.RelOpr.EQUAL, 'krqfrei0'),
        new QM.BoolExpr(QM.BoolOpr.AND),
        new QM.PropertyExpr('Key', QM.RelOpr.NOT_EQUAL, '12')];
      QueryBuilder.setFilter(id, filter);

      QueryBuilder.removeExpr(1);
      var query = QueryBuilder.getQuery();

      expect(query.elements.length).toEqual(1);
      expect(query.elements[0].filter.length).toEqual(1);
      expect(query.elements[0].filter[0].id).toEqual(3);
    }));

    it('should add a sub query', inject(function(QueryBuilder, QM) {
      var id = QueryBuilder.addNode('Package');
      var filter = [new QM.PropertyExpr('OBJECT_NAME', QM.RelOpr.EQUAL, 'krqfrei0')];
      QueryBuilder.setFilter(id, filter);

      QueryBuilder.startSubQuery();
      QueryBuilder.addEdge('Bluber');
      QueryBuilder.addNode('Bla');
      QueryBuilder.finishSubQuery();

      QueryBuilder.addEdge('Test');
      QueryBuilder.addNode('TestNode');

      var query = QueryBuilder.getQuery();

      expect(query.elements[0].id).toEqual(0);
      expect(query.elements[0].subQuery[0].name).toEqual('Bluber');
      expect(QueryBuilder.getActiveQmNode().id).toEqual(5);
    }));

    it('should add two branches', inject(function(QueryBuilder, QM) {
      QueryBuilder.addNode('Package');

      QueryBuilder.startBranch();
      QueryBuilder.addEdge('Test');
      QueryBuilder.addNode('Bla');
      QueryBuilder.finishBranch();

      QueryBuilder.startBranch();
      QueryBuilder.addEdge('Other Edge');
      QueryBuilder.addNode('Bla');
      QueryBuilder.finishBranch();

      var query = QueryBuilder.getQuery();
      var packageNode = query.elements[0];

      expect(query.elements.length).toEqual(1);
      expect(packageNode.branches.length).toEqual(2);
      expect(packageNode.branches[0][0].name).toEqual('Test');
      expect(packageNode.branches[1][0].name).toEqual('Other Edge');
    }));

    it('should add a branches and remove it', inject(function(QueryBuilder, QM) {
      QueryBuilder.addNode('Package');

      QueryBuilder.startBranch();
      var idToRemove = QueryBuilder.addEdge('Test');
      QueryBuilder.addNode('Bla');
      QueryBuilder.finishBranch();
      
      QueryBuilder.removeNode(idToRemove);
      
      var query = QueryBuilder.getQuery();

      expect(query.elements.length).toEqual(1);
    }));

  });
});
