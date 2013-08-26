'use strict';

/**
 * Checks if the literal has the correct type.
 */
gqb.services.factory('PropertyTypeChecker', function(QM) {
  var PropertyTypeChecker = {};
  
  /**
   * Returns true if the literal type and the property type are equal or the
   * property type is unknown otherwise false.
   * 
   * <pre>
   * PropertyTypeChecker.check('10', 'Long') == true
   * PropertyTypeChecker.check('10', 'Boolean') == false
   * </pre>
   * 
   * @param {String} literal
   * @param {String} propertyType
   * @returns {Boolean}
   */
  PropertyTypeChecker.check = function(literal, propertyType) {
    switch (propertyType) {
      case QM.PropertyType.LONG:
        return isLong(literal);
      case QM.PropertyType.OPT_STRING:
      case QM.PropertyType.STRING:
        return _.isString(literal);
      case QM.PropertyType.BOOLEAN:
        return isBoolean(literal);
      case QM.PropertyType.OPT_DATE_TIME:
      case QM.PropertyType.DATE_TIME:
        return true;
      default:
        // Return true so that a query will always be executed
        return true;
    }
  };

  var LONG_REGEXP = new RegExp('^\\-?\\d*$');

  function isLong(literal) {
    return LONG_REGEXP.test(literal);
  }

  function isBoolean(literal) {
    return literal === 'true' || literal === 'false';
  }

  return PropertyTypeChecker;
});