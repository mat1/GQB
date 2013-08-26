'use strict';

gqb.services.factory('PropertyParser', function(QM) {
  var PropertyParser = {};
  
  /**
   * Extracts and returns the operator from a string or throws an error if
   * the text does not start with an operator.
   * 
   * @param {String} text
   * @returns {QM.RelOpr} operator
   */
  PropertyParser.extractOpr = function(text) {
    var filter = text.trim();
    for (var opr in QM.RelOpr) {
      var regex = new RegExp('^' + QM.RelOpr[opr]);
      if (regex.test(filter)) {
        return QM.RelOpr[opr];
      }
    }
    throw new Error('Text must contain a relational operator. ' + text);
  };
  
  /**
   * Extracts and returns the literal from a string.
   * 
   * @param {String} text
   * @returns {String} literal
   */
  PropertyParser.extractLiteral = function(text) {
    var opr = this.extractOpr(text);
    var literal = text.replace(opr, '');
    var result = literal.trim();
    
    if (result.length > 0) {
      return result;
    } else {
      throw new Error('Literal has to be at least on character long.');
    }
  };

  return PropertyParser;
});