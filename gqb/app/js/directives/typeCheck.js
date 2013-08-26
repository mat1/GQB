'use strict';

/**
 * Defines some custom form validation directives.
 * More information about custom form validation http://docs.angularjs.org/guide/forms.
 */
gqb.directives.directive('containsRelOpr', function(PropertyParser) {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$parsers.unshift(function(viewValue) {
        if (angular.isString(viewValue)) {
          var filter = viewValue.trim();

          if (filter.length === 0) {
            ctrl.$setValidity('relopr', true);
          } else {
            try {
              PropertyParser.extractOpr(viewValue);
              ctrl.$setValidity('relopr', true);
            } catch (error) {
              // it is invalid
              ctrl.$setValidity('relopr', false);
            }
          }

          return viewValue;
        }
      });
    }
  };
});

gqb.directives.directive('propertyTypeCheck', function(PropertyParser, PropertyTypeChecker) {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$parsers.unshift(function(viewValue) {
        if (angular.isString(viewValue)) {
          var literal = '';
          try {
            literal = PropertyParser.extractLiteral(viewValue);
          } catch (error) {
          }

          if (literal.length > 0) {
            ctrl.$setValidity('typecheck', PropertyTypeChecker.check(literal, attrs.propertyTypeCheck));
          } else {
            ctrl.$setValidity('typecheck', false);
          }

          return viewValue;
        }
      });
    }
  };
});

gqb.directives.directive('typeCheck', function(PropertyTypeChecker) {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$parsers.unshift(function(viewValue) {
        if (angular.isString(viewValue)) {

          if (viewValue.length > 0) {
            ctrl.$setValidity('typecheck', PropertyTypeChecker.check(viewValue, attrs.typeCheck));
          } else {
            ctrl.$setValidity('typecheck', true);
          }

          return viewValue;
        }
      });
    }
  };
});