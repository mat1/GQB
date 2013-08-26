'use strict';

/**
 * This is an example dsl generator implementation. 
 * If you want to change the dsl generator you have to change the dependency 
 * injection to your implementation name.
 */
gqb.services.factory('DummyDslGenerator', function() {
  var DummyDslGenerator = {};

  DummyDslGenerator.generateDsl = function(query) {
    return 'V(Team)';
  };

  return DummyDslGenerator;
});