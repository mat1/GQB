'use strict';

/**
 * Get access to the browsers local storage.
 */
gqb.services.factory('LocalStorage', function($window) {
  return $window.localStorage;
});
