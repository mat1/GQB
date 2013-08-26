'use strict';

describe('Service', function() {
  beforeEach(module('gqb.services'));

  describe('Property Parser', function() {
    it('should extract the greater operator', inject(function(PropertyParser, QM) {
      expect(PropertyParser.extractOpr('> 120')).toEqual(QM.RelOpr.GREATER);
    }));

    it('should extract the equal operator', inject(function(PropertyParser, QM) {
      expect(PropertyParser.extractOpr(' = 120')).toEqual(QM.RelOpr.EQUAL);
    }));

    it('should throw an error', inject(function(PropertyParser) {
      expect(function() {
        PropertyParser.extractOpr('120 =');
      }).toThrow(new Error('Text must contain a relational operator. 120 ='));
    }));

    it('should extract the literal 120', inject(function(PropertyParser) {
      expect(PropertyParser.extractLiteral(' = 120')).toEqual('120');
    }));

    it('should throw an error because text conatins no literal', inject(function(PropertyParser) {
      expect(function() {
        PropertyParser.extractLiteral('= ');
      }).toThrow(new Error('Literal has to be at least on character long.'));
    }));
  });
});
