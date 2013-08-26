'use strict';

describe('Service', function() {
  beforeEach(module('gqb.services'));

  describe('Property Type Checker', function() {
    it('test check long', inject(function(PropertyTypeChecker) {
      expect(PropertyTypeChecker.check('1', 'Long')).toEqual(true);
      expect(PropertyTypeChecker.check('1.2', 'Long')).toEqual(false);
      expect(PropertyTypeChecker.check('bla', 'Long')).toEqual(false);
    }));

    it('test check string', inject(function(PropertyTypeChecker) {
      expect(PropertyTypeChecker.check('test', 'String')).toEqual(true);
    }));

    it('test check boolean', inject(function(PropertyTypeChecker) {
      expect(PropertyTypeChecker.check('true', 'Boolean')).toEqual(true);
      expect(PropertyTypeChecker.check('false', 'Boolean')).toEqual(true);
      expect(PropertyTypeChecker.check('dfs', 'Boolean')).toEqual(false);
    }));
  });
});
