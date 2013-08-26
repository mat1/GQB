'use strict';

gqb.ctrls.controller('PropertyFilterCtrl', function($scope, QueryBuilder, QM, PropertyParser, Graph, Enums, Event) {
  var FilterProperty = function() {
    this.property = null;
    this.id = null;
    this.placeholder = '';
    this.filter = '';
    this.possibleValues = [];
    this.boolOpr = QM.BoolOpr.AND;
  };

  $scope.$on(Event.ACTIVE_QM_NODE_CHANGED, function() {
    $scope.activeQmNode = QueryBuilder.getActiveQmNode();
    $scope.activeQmEdge = QueryBuilder.getActiveQmEdge();

    if ($scope.activeQmNode !== null) {
      $scope.isShowNode = true;
      $scope.activeQmElement = $scope.activeQmNode;
      showPropertyFilter();
    }
  });

  $scope.showNode = function() {
    if ($scope.isFormValid()) {
      $scope.isShowNode = true;
      $scope.activeQmElement = $scope.activeQmNode;
      showPropertyFilter();
    }
  };

  $scope.showEdge = function() {
    if ($scope.isFormValid()) {
      $scope.isShowNode = false;
      $scope.activeQmElement = $scope.activeQmEdge;
      showPropertyFilter();
    }
  };

  $scope.hasEdgeProperties = function() {
    if (angular.isUndefined($scope.activeQmEdge) || $scope.activeQmEdge === null) {
      return false;
    } else {
      var edge = Graph.getEdgeByName($scope.activeQmEdge.name);
      return edge.properties.length > 0;
    }
  };

  function showPropertyFilter() {
    $scope.element = Graph.getElementByQmElement($scope.activeQmElement);
    $scope.properties = $scope.element.properties;
    $scope.selectedProperty = $scope.element.properties[0];

    var exprs = QueryBuilder.getPropertyFilter($scope.activeQmElement.id);

    $scope.filterProperties = [];

    for (var i = 0; i < exprs.length; i++) {
      var filterProperty = new FilterProperty();

      if (i > 0) {
        filterProperty.boolOpr = exprs[i++].opr;
      }
      filterProperty.property = exprs[i].property;
      filterProperty.placeholder = getPropertyPlaceholder(exprs[i].property);
      filterProperty.id = exprs[i].id;
      filterProperty.filter = exprs[i].opr + ' ' + exprs[i].literal;

      if (Enums.isEnum(filterProperty.property.propertyType)) {
        filterProperty.possibleValues = Enums.getEnumValuesByPropertyType(filterProperty.property.propertyType);
      }

      $scope.filterProperties.push(filterProperty);
    }
  }

  $scope.addProperty = function(property) {
    var filterProperty = new FilterProperty();
    filterProperty.property = property;
    filterProperty.placeholder = getPropertyPlaceholder(property);

    if (Enums.isEnum(property.propertyType)) {
      filterProperty.possibleValues = Enums.getEnumValuesByPropertyType(property.propertyType);
    }

    $scope.filterProperties.push(filterProperty);
  };

  function getPropertyPlaceholder(property) {
    switch (property.propertyType) {
      case QM.PropertyType.LONG:
        return QM.PropertyPlaceholder.LONG;

      case QM.PropertyType.OPT_STRING:
      case QM.PropertyType.STRING:
        return QM.PropertyPlaceholder.STRING;

      case QM.PropertyType.BOOLEAN:
        return QM.PropertyPlaceholder.BOOLEAN;

      case QM.PropertyType.OPT_DATE_TIME:
      case QM.PropertyType.DATE_TIME:
        return QM.PropertyPlaceholder.DATE_TIME;

      default:
        // No placeholder if type is unknown
        return '';
    }
  }

  $scope.removeProperty = function(filterProperty) {
    var index = $scope.filterProperties.indexOf(filterProperty);
    if (index !== -1) {
      $scope.filterProperties.splice(index, 1);
    }
    if (filterProperty.id !== null) {
      QueryBuilder.removeExpr(filterProperty.id);
    }
  };

  $scope.toggleBoolOpr = function(filterProperty) {
    if (filterProperty.boolOpr === QM.BoolOpr.AND) {
      filterProperty.boolOpr = QM.BoolOpr.OR;
    } else {
      filterProperty.boolOpr = QM.BoolOpr.AND;
    }
  };

  $scope.isFormInvalid = function() {
    return $scope.filterForm.$invalid;
  };

  $scope.isFormValid = function() {
    return !$scope.isFormInvalid();
  };

  $scope.saveFilter = function() {
    if ($scope.isFormValid()) {
      var id = $scope.activeQmElement.id;

      var filter = [];
      _.each($scope.filterProperties, function(filterProperty, index) {
        if (index > 0) {
          var boolExpr = new QM.BoolExpr(filterProperty.boolOpr);
          filter.push(boolExpr);
        }

        var opr = PropertyParser.extractOpr(filterProperty.filter);
        var literal = PropertyParser.extractLiteral(filterProperty.filter);
        var property = new QM.PropertyExpr(filterProperty.property, opr, literal);
        filter.push(property);

        filterProperty.id = property.id;
      });

      QueryBuilder.setFilter(id, filter);
    }
  };

});