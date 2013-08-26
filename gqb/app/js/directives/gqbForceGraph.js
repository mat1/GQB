'use strict';

gqb.directives.directive('gqbForceGraph', function($rootScope, ForceGraphHelper, LayoutStorage, Event) {
  var ForceGraph = function(container, nodes, edges, enums) {
    this.container = container;
    this.nodes = nodes;
    this.edges = edges;
    this.enums = enums;
  };

  var force = null;
  var graph = null;

  var WIDTH = 1200;
  var HEIGHT = 570;

  var nodeSelection = null;
  var edgeSelection = null;

  $rootScope.$on(Event.SAVE_LAYOUT, function() {
    LayoutStorage.save(graph);
  });

  function init(newGraph) {
    graph = newGraph;
    
    ForceGraphHelper.mapEdgesToNodes(graph.edges, graph.nodes);
    ForceGraphHelper.markOverlappingEdges(graph.edges);
    ForceGraphHelper.markNodesWithLoop(graph.edges, graph.nodes);

    // clear the elements inside of the directive
    graph.container.selectAll('*').remove();
    
    var nodesContainer = graph.container.append('div').attr('class', 'nodes');
    var svg = graph.container.append('svg');
    var edgesContainer = svg.append('g').attr('class', 'edges');

    // Calculate node sizes
    createHiddenNode(graph.container); 
    calcNodeSizes(graph.nodes);

    nodeSelection = nodesContainer.selectAll('.node').data(graph.nodes);
    edgeSelection = edgesContainer.selectAll('.edge').data(graph.edges);

    force = d3.layout.force()
            .size([WIDTH, HEIGHT])
            .nodes(graph.nodes)
            .links(graph.edges)
            .on('tick', forceTick)
            .charge(-1500)
            .linkDistance(100)
            .start();

    // Define what sould happen if a new node or edge added
    updateNodes();
    updateEdges();
  }

  function updateNodes() {
    var nodeDrag = d3.behavior.drag()
            .on('dragstart', dragstart)
            .on('drag', dragmove)
            .on('dragend', dragend);

    var nodeDiv = nodeSelection.enter()
            .append('div')
            .attr('class', 'node')
            .call(nodeDrag);

    nodeDiv.append('h6').text(function(d) {
      return d.name;
    });

    nodeSelection.exit().remove();
  }

  function dragstart(d, i) {
    force.stop();
  }

  function dragmove(d, i) {
    d.px += d3.event.dx;
    d.py += d3.event.dy;
    d.x += d3.event.dx;
    d.y += d3.event.dy;
    forceTick();
  }

  function dragend(d, i) {
    d.fixed = true;
    forceTick();
    force.resume();
  }

  function updateEdges() {
    edgeSelection.enter()
            .append('line')
            .attr('class', 'edge edge-width-0');

    edgeSelection.exit().remove();
  }

  function createHiddenNode(d3element) {
    d3element.append('div')
            .attr('class', 'node')
            .attr('id', 'hidden-node')
            .append('h6');
  }

  function calcNodeSizes(nodes) {
    var h6 = d3.select('#hidden-node h6');
    var div = d3.select('#hidden-node');

    _.each(nodes, function(e) {
      h6.text(e.name);
      e.width = div.property('clientWidth');
      e.height = div.property('clientHeight');
    });
  }

  function forceTick() {
    nodeSelection.style('left', leftPosition)
                 .style('top', topPosition);

    edgeSelection.attr('x1', function(d) { return correctLeft(d.source.x); })
                 .attr('y1', function(d) { return correctTop(d.source.y); })
                 .attr('x2', function(d) { return correctLeft(d.target.x); })
                 .attr('y2', function(d) { return correctTop(d.target.y); });
  }
  
  function leftPosition(d) {
    var pos = (d.x - (d.width / 2));
    d.x = correctLeft(d.x);
    return correctLeft(pos) + 'px';
  }
  
  function topPosition(d) {
    var pos = (d.y - (d.height / 2));
    d.y = correctTop(d.y);
    return correctTop(pos) + 'px';
  }
  
  function correctLeft(pos) {
    if (pos < 0) {
      return 0;
    }
    if (pos > WIDTH) {
      return WIDTH;
    }
    return pos;
  }
  
  function correctTop(pos) {
    if (pos < 0) {
      return 0;
    }
    if (pos > HEIGHT) {
      return HEIGHT;
    }
    return pos;
  }
  
  return {
    restrict: 'E',
    scope: {
      val: '='
    },
    link: function($scope, element, attrs) {

      $scope.$watch('val', function(newValue, oldValue) {
        // if 'value' is undefined, exit
        if (!newValue) {
          return;
        }

        var graph = newValue;

        var nodes = graph.nodes;
        var edges = graph.edges;

        var container = d3.select(element[0]);

        var forceGraph = new ForceGraph(container, nodes, edges, graph.enums);
        init(forceGraph);
      });
    }
  };
});