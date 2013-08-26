'use strict';

describe('Service', function() {
  beforeEach(module('gqb.services'));

  describe('History', function() {
    beforeEach(inject(function(History) {
      History.clear();
    }));

    it('adds three items to the history, the last added item is at the top', inject(function(History) {
      History.add(1, 'Test 1');
      History.add(2, 'Test 2');
      History.add(3, 'Test 3');

      var elements = History.getElements();

      expect(elements[0].dsl).toEqual(3);
      expect(elements.length).toEqual(3);
    }));

    it('adds two equal items to the history', inject(function(History) {
      History.add(1, 'Test 1');
      History.add(2, 'Test 2');
      History.add(1, 'Test 1');

      var elements = History.getElements();

      expect(elements[0].dsl).toEqual(1);
      expect(elements.length).toEqual(2);
    }));

    it('test the max history size', inject(function(History) {
      var HISTORY_SIZE = 30;
      
      for (var i = 0; i < HISTORY_SIZE; i++) {
        History.add(i, 'Test 1');
      }
      
      History.add(30, 'Test 1');
      History.add(31, 'Test 1');
      
      var elements = History.getElements();

      expect(elements[0].dsl).toEqual(31);
      expect(elements.length).toEqual(HISTORY_SIZE);
    }));

  });
});
