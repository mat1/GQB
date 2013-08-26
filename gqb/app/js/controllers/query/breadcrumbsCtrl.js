'use strict';

gqb.ctrls.controller('BreadcrumbsCtrl', function($scope, QueryBuilder, QM, Event) {
  var Breadcrumb = function(name, type) {
    this.name = name;
    this.type = type;
    this.queryid = null;
    this.isActive = false;
  };

  var BreadcrumbType = {
    NODE: 'node',
    EDGE: 'edge',
    TEXT: 'text'
  };

  $scope.activeNode = null;
  $scope.breadcrumbs = [];
  
  $scope.$on(Event.ACTIVE_QM_NODE_CHANGED, function() {
    var path = QueryBuilder.getPath();

    $scope.activeNode = QueryBuilder.getActiveQmNode();
    $scope.breadcrumbs = [];

    _.each(path, function(qmElement) {
      $scope.breadcrumbs.push(qmElementToBreadcrumb(qmElement));

      if (qmElement instanceof QM.Node) {
        // SubQuery
        if (qmElement.subQuery.length > 0) {
          $scope.breadcrumbs.push(new Breadcrumb('Sub(', BreadcrumbType.TEXT));
        }
        _.each(qmElement.subQuery, function(subElement) {
          $scope.breadcrumbs.push(qmElementToBreadcrumb(subElement));
        });
        if (qmElement.subQuery.length > 0) {
          $scope.breadcrumbs.push(new Breadcrumb(')', BreadcrumbType.TEXT));
        }

        // Branches
        if (qmElement.hasBranches()) {
          $scope.breadcrumbs.push(new Breadcrumb('Branches(', BreadcrumbType.TEXT));
        }
        _.each(qmElement.branches, function(branch, index) {
          if (index > 0) {
            $scope.breadcrumbs.push(new Breadcrumb('|', BreadcrumbType.TEXT));
          }
          _.each(branch, function(branchElement) {
            $scope.breadcrumbs.push(qmElementToBreadcrumb(branchElement));
          });

        });
        if (qmElement.hasBranches()) {
          $scope.breadcrumbs.push(new Breadcrumb(')', BreadcrumbType.TEXT));
        }
      }
    });
  });

  function qmElementToBreadcrumb(qmElement) {
    var type = (qmElement instanceof QM.Node) ? BreadcrumbType.NODE : BreadcrumbType.EDGE;
    var breadcrumb = new Breadcrumb(qmElement.name, type);

    breadcrumb.queryid = qmElement.id;
    breadcrumb.isActive = ($scope.activeNode.id === qmElement.id);

    return breadcrumb;
  }

  $scope.selectNode = function(node) {
    QueryBuilder.setActiveQmNode(node.queryid);
  };

});