'use strict';

gqb.directives.directive('gqbZoom', function() {
  return function(scope, element, attrs) {
    d3.select(element[0]).call(d3.behavior.zoom().on('zoom', redraw));

    var nodes = d3.select('.nodes');
    var edges = d3.select('.edges');
    var transforms = ['transform', '-ms-transform', '-webkit-transform'];

    function redraw() {
      edges.attr('transform', 'translate(' + d3.event.translate + ')' +
              'scale(' + d3.event.scale + ')');

      _.each(transforms, function(transform) {
        nodes.style(transform, 'translate(' + d3.event.translate[0] + 'px,' + d3.event.translate[1] + 'px) ' +
                'scale(' + d3.event.scale + ')');
      });
    }
  };
});