'use strict';

gqb.directives.directive('gqbTree', function(Event) {
  // constants
  var LEVEL_WIDTH = 200;
  var NODE_HEIGHT = 40;
  
  var getNodeText = function(nodeContainer) {
    var node = nodeContainer.node;
    return node.nodeType + ' (' + node.key + ')';
  };
  
  var getDepth = function(tree) {
    if (tree.children.length === 0) {
      return 1;
    }
    
    var max = 0;
    
    _.each(tree.children, function(child){
      var depth = 1 + getDepth(child);
      if (depth > max) {
        max = depth;
      }
    });
    
    return max;
  };
  
  var getCountAtLevel = function(tree, current, target) {
    if (current === target) {
      return 1;
    }
    
    var count = 0;
    _.each(tree.children, function(child){
      count += getCountAtLevel(child, current + 1, target);
    });
    
    return count;
  };
  
  return {
    restrict: 'E',
    scope: {
      val: '='
    },
    link: function($scope, element, attrs) {

      $scope.$watch('val', function(newVal, oldVal) {
        // if 'val' is undefined, exit
        if (!newVal) {
          return;
        }
        
        var depth = getDepth(newVal);
        var maxNodes = getCountAtLevel(newVal, 1, depth);
        
        var height = (maxNodes * NODE_HEIGHT) + 20;
        var width = (depth * LEVEL_WIDTH) + 260;
        
        // set up initial svg object
        var div = d3.select(element[0]).append('div');
        
        // clear the elements inside of the directive
        div.selectAll('*').remove();
        
        var svg = div.append('svg')
                    .attr('width', width)
                    .attr('height', height)
                    .append('g')
                    .attr('transform', 'translate(110,20)');
        
        var tree = d3.layout.tree()
                     .sort(function (a, b) { return getNodeText(a) > getNodeText(b); })
                     .size([height - 20, width - 260]);

        var nodes = tree.nodes(newVal);
        var links = tree.links(nodes);
        
        // load and paint edges:
        var diagonal = d3.svg.diagonal()
                         .projection(function (d) { return [d.y, d.x]; });

        var link = svg.selectAll('.link')
            .data(links)
            .enter().append('path')
            .attr('class', 'link')
            .attr('d', diagonal);

        // load and paint nodes, with active circles and descriptive text
        var node = svg.selectAll('.node')
            .data(nodes)
            .enter().append('g')
            .attr('class', 'node')
            .attr('transform', function (d) { return 'translate(' + d.y + ',' + d.x + ')'; })
            .on('click', function (d) { Event.notifyShowNodeInfo(d.node.id); });

        node.append('circle')
            .attr('r', 4.5);

        node.append('text')
            .attr('dy', '-.75em')
            .attr('text-anchor', function (d) { return 'middle'; })
            .text(function(d) { return getNodeText(d); }); 

      });
    }
  };
});