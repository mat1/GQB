'use strict';

/**
 * The history services stores created queris in the browsers local storage.
 */
gqb.services.factory('History', function(LocalStorage) {
  var History = {};

  var STORAGE_NAME = 'gqbHistory';
  var HISTORY_SIZE = 30;

  var json = LocalStorage[STORAGE_NAME];
  var elements = json ? JSON.parse(json) : [];

  var HistoryElement = function(dsl, query) {
    this.dsl = dsl;
    this.query = query;
  };

  /**
   * Adds a query and the corresponding dsl string to the history.
   * Removes all entries with the same dsl string. Remove the oldest entries,
   * if the history size is greater than HISTORY_SIZE.
   * 
   * @param {String} dsl
   * @param {QM.Query} query
   * @returns {void}
   */
  History.add = function(dsl, query) {
    if (dsl !== '') {
      // remove entries with the same query
      elements = _.reject(elements, function(historyElement) {
        return historyElement.dsl === dsl;
      });

      // add new element at the top
      elements.unshift(new HistoryElement(dsl, angular.copy(query)));

      while (elements.length > HISTORY_SIZE) {
        // remove last element
        elements.pop();
      }

      LocalStorage[STORAGE_NAME] = JSON.stringify(elements);
    }
  };

  History.getElements = function() {
    return elements;
  };

  History.clear = function() {
    elements = [];
    LocalStorage.clear();
  };

  return History;
});
