'use strict';

/**
 * Helper functions to find elements and expressions
 * in a query by the query id.
 */
gqb.services.factory('QueryHelper', function(QM) {
  var QueryHelper = {};

  QueryHelper.findElement = function(elements, id) {
    var root = this.findRoot(elements, id);
    for (var i = 0; i < root.length; i++) {
      if (root[i].id === id) {
        return root[i];
      }
    }
    throw new Error('No element with id:' + id);
  };

  QueryHelper.findElementPosition = function(root, id) {
    for (var i = 0; i < root.length; i++) {
      if (root[i].id === id) {
        return i;
      }
    }
    throw new Error('No element with id:' + id);
  };

  QueryHelper.findExprPosition = function(filter, id) {
    for (var i = 0; i < filter.length; i++) {
      if (filter[i].id === id) {
        return i;
      }
    }
    throw new Error('No expr with id:' + id);
  };

  QueryHelper.findRoot = function(elements, id) {
    if (arrayContainsId(elements, id)) {
      return elements;
    }

    for (var i = 0; i < elements.length; i++) {
      var element = elements[i];

      if (arrayContainsId(element.filter, id)) {
        return element.filter;
      }

      if (_.has(element, 'subQuery')) {
        var result = this.findRoot(element.subQuery, id);
        if (result !== false) {
          return result;
        }

        for (var j = 0; j < element.branches.length; j++) {
          result = this.findRoot(element.branches[j], id);
          if (result !== false) {
            return result;
          }
        }
      }
    }

    return false;
  };

  QueryHelper.findParentNodeInBranches = function(elements, id) {
    var nodes = _.filter(elements, function(element){
      return element instanceof QM.Node;
    });

    var result = _.find(nodes, function(node) {
      return _.some(node.branches, function(branch) {
        return arrayContainsId(branch, id);
      });
    });
    
    return result;
  };
  
  
  QueryHelper.findParentNodeInSubQueries = function(elements, id) {
    var nodes = _.filter(elements, function(element){
      return element instanceof QM.Node;
    });

    var result = _.find(nodes, function(node) {
        return arrayContainsId(node.subQuery, id);
    });
    
    return result;
  };


  function arrayContainsId(array, id) {
    var result = _.some(array, function(element) {
      return element.id === id;
    });

    return result;
  }

  return QueryHelper;
});