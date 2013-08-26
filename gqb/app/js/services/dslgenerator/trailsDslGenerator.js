'use strict';

gqb.services.factory('TrailsDslGenerator', function(QM, Graph, Enums) {
  var TrailsDslGenerator = {};

  /**
   * Generats the trails dsl string from a QM.Query. 
   * If the query is empty it returns an empty string ''.
   * 
   * @param {QM.Query} query
   * @returns {String} dsl string
   */
  TrailsDslGenerator.generateDsl = function(query) {
    var dsl = '';

    if (query.elements.length > 0) {
      var node = _.first(query.elements);

      dsl = writeStartNode(node) + write(node, _.rest(query.elements));

      if (query.limit > 0) {
        dsl = '(' + dsl + ').take(' + query.limit + ')';
      }
    }
    
    return dsl;
  };

  function write(before, elements) {
    var element = _.first(elements);

    if (_.isEmpty(elements)) {
      return '';
    }
    if (element instanceof QM.Node) {
      return writeNode(element) + write(element, _.rest(elements));
    }
    if (element instanceof QM.Edge) {
      return ' ~ ' + writeEdge(before, element) + write(element, _.rest(elements));
    }

    throw new Error('Query is in a illegal state.');
  }

  function writeStartNode(node) {
    return 'V(' + node.name + ')' + writeNode(node);
  }

  function writeNode(node) {
    return writeFilter(node.name, node.filter) + writeSubQuery(node, node.subQuery) + writeBranches(node, node.branches, true);
  }

  function writeEdge(node, edge) {
    var schemaEdge = Graph.getEdgeByName(edge.name);
    if (node.name === schemaEdge.fromSchemaNode) {
      return 'outE(' + edge.name + ')' + writeFilter(edge.name, edge.filter) + ' ~ inV';
    }
    if (node.name === schemaEdge.toSchemaNode) {
      return 'inE(' + edge.name + ')' + writeFilter(edge.name, edge.filter) + ' ~ outV';
    }
    if (node.hasBranches()) {
      return writeEdge(_.last(node.branches[0]), edge);
    }

    throw new Error('Query is in a illegal state. Edge is not connected to node:' + node.name);
  }

  function writeFilter(name, filter) {
    if (_.isEmpty(filter)) {
      return '';
    }

    var result = ' ~ (';

    _.each(filter, function(expr) {
      if (expr instanceof QM.PropertyExpr) {
        result += writeProperty(name, expr);
      }
      if (expr instanceof QM.BoolExpr) {
        result += writeBoolExpr(expr);
      }
    });

    return result + ')';
  }

  function writeProperty(name, expr) {
    return 'get(' + name + '.' + expr.property.name + ')' + writePropertyExpr(expr);
  }

  function writePropertyExpr(expr) {
    switch (expr.property.propertyType) {
      case QM.PropertyType.DATE_TIME:
        return writeDateTimePropertyExpr(expr);
      case QM.PropertyType.OPT_DATE_TIME:
        return writeOptDateTimePropertyExpr(expr);
      default:
        return '.filterV(_ ' + writeRelOpr(expr) + ' ' + writeLiteral(expr) + ')';
    }
  }

  function writeRelOpr(expr) {
    switch (expr.opr) {
      case QM.RelOpr.EQUAL:
        return '==';
      default:
        return expr.opr;
    }
  }

  function writeDateTimePropertyExpr(expr) {
    return '.filterV(_' + writeDateTimeRelOpr(expr) + '(' + writeLiteral(expr) + '))';
  }

  function writeOptDateTimePropertyExpr(expr) {
    return '.filterV(_ match { case Some(x) => x' + writeDateTimeRelOpr(expr) + ' (' + writeLiteral(expr) + ') case None => false } )';
  }

  function writeDateTimeRelOpr(expr) {
    switch (expr.opr) {
      case QM.RelOpr.EQUAL:
        return '.equals';
      case QM.RelOpr.GREATER:
      case QM.RelOpr.GREATER_EQUAL:
        return '.isAfter';
      case QM.RelOpr.LESS:
      case QM.RelOpr.LESS_EQUAL:
        return '.isBefore';
      default:
        throw new Error('Unknown relational operator:' + expr.opr);
    }
  }

  function writeLiteral(expr) {
    switch (toSimplePropertyType(expr.property.propertyType)) {
      case QM.PropertyType.LONG:
        return expr.literal + 'L';
      case QM.PropertyType.STRING:
        return '"' + expr.literal + '"';
      case QM.PropertyType.DATE_TIME:
      case QM.PropertyType.OPT_DATE_TIME:
        return 'new org.joda.time.DateTime("' + expr.literal + '")';
      case QM.PropertyType.ENUM:
        var e = Enums.getEnumByPropertyType(expr.property.propertyType);
        return e.name + '.withName("' + expr.literal + '")';
      default:
        return expr.literal;
    }
  }

  function toSimplePropertyType(propertyType) {
    var simpleType = propertyType.split(':');
    return simpleType[0];
  }

  function writeBoolExpr(expr) {
    switch (expr.opr) {
      case QM.BoolOpr.OR:
        return ' | ';
      case QM.BoolOpr.AND:
        return ' ~ ';
    }
  }

  function writeSubQuery(element, subQuery) {
    if (_.isEmpty(subQuery)) {
      return '';
    }

    return ' ~ sub(' + writeEdge(element, _.first(subQuery)) + write(_.first(subQuery), _.rest(subQuery)) + ')';
  }

  function writeBranches(node, branches, first) {
    var seq = first ? ' ~ ' : '';
    if (_.isEmpty(branches)) {
      return '';
    }
    if (branches.length === 1) {
      
      return seq + writeBranch(node, branches[0]);
    }
    if (branches.length > 1) {
      return seq + 'choice(' + writeBranch(node, branches[0]) + ', ' + writeBranches(node, _.rest(branches), false) + ')';
    }
  }

  function writeBranch(node, branch) {
    return '(' + writeEdge(node, _.first(branch)) + write(_.first(branch), _.rest(branch)) + ')';
  }

  return TrailsDslGenerator;
});