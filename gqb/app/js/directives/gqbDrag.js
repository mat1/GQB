'use strict';

gqb.directives.directive('gqbDrag', function() {
  return function(scope, element, attrs) {
    var dragContainer = d3.select(element[0]);
    dragContainer.call(d3.behavior.drag().on('drag', move));

    function move() {
      dragContainer.style('left', d3.event.dx + parseInt(dragContainer.style('left'), 10) + 'px');
      dragContainer.style('top', d3.event.dy + parseInt(dragContainer.style('top'), 10) + 'px');
    }
  };
});