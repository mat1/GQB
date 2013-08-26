'use strict';

/**
 * The enums service provides functions to get the schema enum from the schema
 * property type. The Enums.init function has to be called before using the other
 * functions.
 */
gqb.services.factory('Enums', function(QM) {
  var Enums = {};

  var enums = null;

  Enums.init = function(newEnums) {
    enums = newEnums;
  };

  Enums.getEnums = function() {
    return enums;
  };

  Enums.getEnumByPropertyType = function(propertyType) {
    var name = propertyTypeToEnumName(propertyType);

    var result = _.find(enums, function(e) {
      return e.name.match(name) !== null;
    });

    return result;
  };

  function propertyTypeToEnumName(propertyType) {
    var name = propertyType.split(':');
    return name[1];
  }
  
  Enums.isEnum = function(propertyType) {
    var name = propertyType.split(':');
    return name[0] === QM.PropertyType.ENUM;
  };
  
  Enums.getEnumValuesByPropertyType = function(propertyType) {
    var e = Enums.getEnumByPropertyType(propertyType);
    return e.values;
  };
  

  return Enums;
});
