'use strict';

/**
 * Broadcats events to the $rootScope.
 */
gqb.services.factory('Event', function($rootScope) {
  var Event = {
    GRAPH_LOADED: 'graphLoaded',
    ACTIVE_QM_NODE_CHANGED: 'activeQmNodeChanged',
    QUERY_CHANGED: 'queryChanged',
    DSL_CHANGED: 'dslChanged',
    SHOW_GRAPH: 'showGraph',
    SHOW_NODE_INFO: 'showNodeInfo',
    SAVE_LAYOUT: 'saveLayout'
  };

  Event.notifyGraphLoaded = function(schema) {
    $rootScope.$broadcast(Event.GRAPH_LOADED, schema);
  };

  Event.notifyActiveNodeChanged = function() {
    $rootScope.$broadcast(Event.ACTIVE_QM_NODE_CHANGED);
  };

  Event.notifyQueryChanged = function() {
    $rootScope.$broadcast(Event.QUERY_CHANGED);
  };

  /**
   * Broadcasts the dslChanged event on the $rootScope.
   * 
   * @param {String} dsl the new dsl string
   * @param {Boolean} byUser true if the user changed the dsl manually
   * @returns {void}
   */
  Event.notifyDslChanged = function(dsl, byUser) {
    $rootScope.$broadcast(Event.DSL_CHANGED, dsl, byUser);
  };
  
  /**
   * Broadcats the showGraph event on the $rootScope.
   * 
   * @param {Boolean} show if true => display graph
   * @returns {void}
   */
  Event.notifyShowGraph = function(show) {
    $rootScope.$broadcast(Event.SHOW_GRAPH, show);
  };

  Event.notifyShowNodeInfo = function(id) {
    $rootScope.$broadcast(Event.SHOW_NODE_INFO, id);
  };
  
  Event.notifySaveLayout = function() {
    $rootScope.$broadcast(Event.SAVE_LAYOUT);
  };
  
  return Event;
});
