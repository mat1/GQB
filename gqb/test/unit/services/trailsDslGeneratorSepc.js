'use strict';

describe('Service', function() {
  beforeEach(module('gqb.services'));

  var edges = [
    {
      "name": "_Employer_",
      "fromSchemaNode": "User",
      "toSchemaNode": "Bank"
    },
    {
      "name": "_Team_",
      "fromSchemaNode": "User",
      "toSchemaNode": "Team"
    },
    {
      "name": "_SDPOwner_",
      "fromSchemaNode": "Ticket",
      "toSchemaNode": "User"
    },
    {
      "name": "_Submitter_",
      "fromSchemaNode": "Ticket",
      "toSchemaNode": "User"
    }
  ];
  var nodes = [
    {
      "name": "Bank"
    },
    {
      "name": "User"
    },
    {
      "name": "Team"
    },
    {
      "name": "Ticket"
    }
  ];
  var properties = [
    {
      "name": "Key",
      "propertyType": "Long"
    },
    {
      "name": "Abbr",
      "propertyType": "String"
    },
    {
      "name": "Date",
      "propertyType": "DateTime"
    },
    {
      "name": "RequestedPriority",
      "propertyType": "Enum:Priority"
    }
  ];

  var enums = [
    {
      "name": "ch.finnova.babelfish.FinnovaSchema.Priority",
      "values": [
        "High",
        "Kill",
        "Low",
        "Medium"
      ]
    }
  ];

  /* Graph Mock Object */
  beforeEach(module(function($provide) {
    $provide.factory('Graph', function() {
      var Graph = {};

      Graph.getEdgeByName = function(name) {
        return _.findWhere(edges, {name: name});
      };

      Graph.getNodeByName = function(name) {
        return _.findWhere(nodes, {name: name});
      };

      return Graph;
    });
  }));

  beforeEach(inject(function(Enums) {
    Enums.init(enums);
  }));

  describe('Trails Dsl Generator', function() {

    it('generates a simple query from bank to user', inject(function(TrailsDslGenerator, QueryBuilder) {
      QueryBuilder.addNode('Bank');
      QueryBuilder.addEdge('_Employer_');
      QueryBuilder.addNode('User');

      var dsl = TrailsDslGenerator.generateDsl(QueryBuilder.getQuery());

      expect(dsl).toEqual('(V(Bank) ~ inE(_Employer_) ~ outV).take(50)');
    }));

    it('generates a simple query from team to bank', inject(function(TrailsDslGenerator, QueryBuilder) {
      QueryBuilder.addNode('Team');
      QueryBuilder.addEdge('_Team_');
      QueryBuilder.addNode('User');
      QueryBuilder.addEdge('_Employer_');
      QueryBuilder.addNode('Bank');

      var dsl = TrailsDslGenerator.generateDsl(QueryBuilder.getQuery());

      expect(dsl).toEqual('(V(Team) ~ inE(_Team_) ~ outV ~ outE(_Employer_) ~ inV).take(50)');
    }));

    it('generates a query with a filter', inject(function(TrailsDslGenerator, QueryBuilder, QM) {
      QueryBuilder.addNode('Bank');

      var filter = [new QM.PropertyExpr(properties[0], QM.RelOpr.GREATER, '23'),
        new QM.BoolExpr(QM.BoolOpr.AND),
        new QM.PropertyExpr(properties[0], QM.RelOpr.LESS, '30')];
      QueryBuilder.setFilter(0, filter);

      QueryBuilder.addEdge('_Employer_');
      QueryBuilder.addNode('User');

      var dsl = TrailsDslGenerator.generateDsl(QueryBuilder.getQuery());

      expect(dsl).toEqual('(V(Bank) ~ (get(Bank.Key).filterV(_ > 23L) ~ get(Bank.Key).filterV(_ < 30L)) ~ inE(_Employer_) ~ outV).take(50)');
    }));

    it('generates a query with a sub query', inject(function(TrailsDslGenerator, QueryBuilder, QM) {
      QueryBuilder.addNode('Bank');

      var filter = [new QM.PropertyExpr(properties[0], QM.RelOpr.GREATER, '23'),
        new QM.BoolExpr(QM.BoolOpr.AND),
        new QM.PropertyExpr(properties[0], QM.RelOpr.LESS, '30')];
      QueryBuilder.setFilter(0, filter);

      QueryBuilder.startSubQuery();
      QueryBuilder.addEdge('_Employer_');
      QueryBuilder.addNode('User');
      QueryBuilder.finishSubQuery();

      var dsl = TrailsDslGenerator.generateDsl(QueryBuilder.getQuery());

      expect(dsl).toEqual('(V(Bank) ~ (get(Bank.Key).filterV(_ > 23L) ~ get(Bank.Key).filterV(_ < 30L)) ~ sub(inE(_Employer_) ~ outV)).take(50)');
    }));

    it('generates a query with equal operator', inject(function(TrailsDslGenerator, QueryBuilder, QM) {
      QueryBuilder.addNode('Bank');
      var filter = [new QM.PropertyExpr(properties[0], QM.RelOpr.EQUAL, '23')];
      QueryBuilder.setFilter(0, filter);

      var dsl = TrailsDslGenerator.generateDsl(QueryBuilder.getQuery());

      expect(dsl).toEqual('(V(Bank) ~ (get(Bank.Key).filterV(_ == 23L))).take(50)');
    }));

    it('generates a query with a DateTime filter', inject(function(TrailsDslGenerator, QueryBuilder, QM) {
      QueryBuilder.addNode('Bank');
      var filter = [new QM.PropertyExpr(properties[2], QM.RelOpr.GREATER, '2012-04-25')];
      QueryBuilder.setFilter(0, filter);

      var dsl = TrailsDslGenerator.generateDsl(QueryBuilder.getQuery());

      expect(dsl).toEqual('(V(Bank) ~ (get(Bank.Date).filterV(_.isAfter(new org.joda.time.DateTime("2012-04-25"))))).take(50)');
    }));

    it('generates a query with a branch', inject(function(TrailsDslGenerator, QueryBuilder) {
      QueryBuilder.addNode('User');

      QueryBuilder.startBranch();
      QueryBuilder.addEdge('_Submitter_');
      QueryBuilder.addNode('Team');
      QueryBuilder.finishBranch();

      QueryBuilder.startBranch();
      QueryBuilder.addEdge('_SDPOwner_');
      QueryBuilder.addNode('Team');
      QueryBuilder.finishBranch();

      var dsl = TrailsDslGenerator.generateDsl(QueryBuilder.getQuery());

      expect(dsl).toEqual('(V(User) ~ choice((inE(_Submitter_) ~ outV), (inE(_SDPOwner_) ~ outV))).take(50)');
    }));

    it('generates a query with a enum in a property filter', inject(function(TrailsDslGenerator, QueryBuilder, QM) {
      QueryBuilder.addNode('Ticket');
      var filter = [new QM.PropertyExpr(properties[3], QM.RelOpr.EQUAL, 'High')];
      QueryBuilder.setFilter(0, filter);

      var dsl = TrailsDslGenerator.generateDsl(QueryBuilder.getQuery());

      expect(dsl).toEqual('(V(Ticket) ~ (get(Ticket.RequestedPriority).filterV(_ == ch.finnova.babelfish.FinnovaSchema.Priority.withName("High")))).take(50)');
    }));

  });
});
