'use strict';

gqb.services.factory('ResultHelper', function() {
  var ResultHelper = {};

  ResultHelper.EDGE_KIND = 'EDGE';
  ResultHelper.NODE_KIND = 'NODE';

  ResultHelper.extractPaths = function(queryResult) {
    var elements = extractElements(queryResult);
    var paths = extractPaths(queryResult);

    return mapElementsToPaths(paths, elements);
  };

  function extractElements(queryResult) {
    var elements = {};

    _.each(queryResult.elementInfo, function(element) {
      var key = null;
      if (element.hasOwnProperty('nodeType')) {
        // a node
        key = element.nodeId;
        elements[key] = {
          id: key,
          kind: ResultHelper.NODE_KIND,
          nodeType: element.nodeType,
          key: _.first(_.values(element.idProperties))
        };
      } else {
        // an edge
        key = element.edgeId;
        elements[key] = {
          id: key,
          kind: ResultHelper.EDGE_KIND,
          edgeType: element.relationshipType
        };
      }
    });

    return elements;
  }

  function extractPaths(queryResult) {
    return _.map(queryResult.paths, function(path) {
      return _.map(path, function(id) {
        return id;
      });
    });
  }

  function mapElementsToPaths(paths, elements) {
    return _.map(paths, function(path) {
      return _.map(path, function(id) {
        return elements[id];
      });
    });
  }

  ResultHelper.extractTrees = function(paths) {
    var nodePaths = _.map(paths, function(path) {
      return _.filter(path, function(el) {
        return el.kind === ResultHelper.NODE_KIND;
      });
    });

    return buildTrees(nodePaths);
  };
  
  function buildTrees(paths) {
    var Tree = function(rootnode, subtree) {
      var result = {};
      result.node = rootnode;
      result.children = subtree;
      return result;
    };

    var filtered = _.filter(paths, function(path) {
      return !_.isEmpty(path);
    });

    var grouped = _.groupBy(filtered, function(path) {
      return _.head(path).id;
    });

    return _.map(grouped, function(value, key) {
      return new Tree(
              _.head(_.head(value)), // any head is a valid root node, so we take the first one
              buildTrees(_.map(value, function(val) { return _.rest(val);}))
              );
    });
  }

  return ResultHelper;
});