'use strict';

gqb.services.factory('QM', function() {
  var QM = {};
  
  /**
   * All query elements have an unique id. This id is used to find and identify an 
   * element in the query.
   * @type int
   */
  var queryId = 0;

  QM.Query = function() {
    this.elements = [];
    this.limit = 50;

    this.toString = function() {
      return 'Query(Limit:' + this.limit + ', Elements: ' + elementsToString(this.elements) + ')';
    };
  };

  QM.Node = function(name, mode) {
    this.id = queryId++;
    this.name = name;
    this.mode = mode;
    this.filter = [];
    this.subQuery = [];
    this.branches = [];
    this.type = 'QM.Node';

    this.toString = function() {
      return 'Node(' + this.name + ', ' + this.mode + ', Filter[' + elementsToString(this.filter) +
              '], Sub[' + elementsToString(this.subQuery) + '], Branches[' + elementsToString(this.branches) + '])';
    };

    this.hasBranches = function() {
      return this.branches.length > 0 && this.branches[0].length > 0;
    };

    this.getLastNodeInBranch = function() {
      return _.last(this.branches[0]);
    };
  };

  QM.Edge = function(name, mode) {
    this.id = queryId++;
    this.name = name;
    this.mode = mode;
    this.filter = [];
    this.type = 'QM.Edge';

    this.toString = function() {
      return 'Edge(' + this.name + ', Filter[' + elementsToString(this.filter) + '])';
    };
  };

  QM.ElementMode = {
    NOT_SELECTED: 'not-selected',
    FOLLOW: 'follow',
    SUB_QUERY: 'sub-query',
    BRANCH: 'branch'
  };

  QM.ElementState = {
    ACTIVE: 'active',
    REACHABLE: 'reachable',
    NOT_REACHABLE: 'not-reachable'
  };

  QM.PropertyExpr = function(property, opr, literal) {
    this.id = queryId++;
    this.property = property;
    this.opr = opr;
    this.literal = literal;
    this.type = 'QM.PropertyExpr';

    this.toString = function() {
      return 'PropertyExpr(' + this.property.name + ', ' + this.opr + ', ' + this.literal + ')';
    };
  };

  QM.RelOpr = {
    NOT_EQUAL: '!=',
    EQUAL: '=',
    GERATER_EQUAL: '>=',
    GREATER: '>',
    LESS_EQUAL: '<=',
    LESS: '<'
  };

  QM.PropertyType = {
    LONG: 'Long',
    STRING: 'String',
    OPT_STRING: 'Option(String)',
    DATE_TIME: 'DateTime',
    OPT_DATE_TIME: 'Option(DateTime)',
    BOOLEAN: 'Boolean',
    ENUM: 'Enum'
  };

  QM.PropertyPlaceholder = {
    LONG: '> 12',
    STRING: '= Test',
    DATE_TIME: '> 2012-06-21',
    BOOLEAN: '= true'
  };

  QM.BoolExpr = function(opr) {
    this.id = queryId++;
    this.opr = opr;
    this.type = 'QM.BoolExpr';

    this.toString = function() {
      return 'BoolExpr(' + this.opr + ')';
    };
  };

  QM.BoolOpr = {
    AND: 'AND',
    OR: 'OR'
  };

  function elementsToString(elements) {
    var result = '';
    for (var i = 0; i < elements.length; i++) {
      result += elements[i].toString();

      if (i !== elements.length - 1) {
        result += ', ';
      }
    }
    return result;
  }

  return QM;
});