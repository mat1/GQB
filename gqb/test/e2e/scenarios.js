'use strict';

/**
 * End-2-End Tests.
 * 
 * http://docs.angularjs.org/guide/dev_guide.e2e-testing
 */

describe('GQB', function() {

  beforeEach(function() {
    browser().navigateTo('index.html');
  });

  it('should automatically redirect to /query when location hash/fragment is empty', function() {
    expect(browser().location().url()).toBe("/query");
  });

  describe('Query', function() {

    beforeEach(function() {
      browser().navigateTo('#/query');
    });

    it('should render the graph when user navigates to /query', function() {
      expect(repeater('.node').count()).toBe(5);
      expect(repeater('.edge').count()).toBe(7);
    });

    it('should highlight the reachable nodes', function() {
      expect(element('.node:first h6').text()).toMatch('User');
      element('.node:first').click();

      expect(repeater('.node-reachable').count()).toBe(4);
      expect(repeater('.node-active').count()).toBe(1);
    });

    it('should use the breadcrumb navigation and change the active node to user', function() {
      element('.node:first').click();
      element('.node-reachable:first').click();
      element('.breadcrumb a:first').click();

      expect(element('.node-active').text()).toMatch('User');
    });

    it('should show the property filter and add the property key', function() {
      element('.node:first').click();
      element('#property-filter .btn-primary').click();

      expect(element('#property-filter h4').text()).toEqual('Property Filter - User');
      expect(element('#property-filter form[name="filterForm"] label:first').text()).toEqual('Key');
      expect(element('#property-filter input').count()).toBe(1);
    });

    it('should generate the dsl expression (V(User) ~ outE(likes) ~ inV).take(50)', function() {
      element('.node:first').click();
      element('.node-reachable:first').click();

      expect(element('#query').text()).toEqual('(V(User) ~ outE(likes) ~ inV).take(50)');
    });

    it('should generates the url for the dsl expression (V(User) ~ outE(likes) ~ inV).take(50)', function() {
      var search = {query:
                '{"elements":[' +
                '{"id":0,"name":"User","mode":"follow","filter":[],"subQuery":[],"branches":[],"type":"QM.Node"},' +
                '{"id":1,"name":"likes","mode":"follow","filter":[],"type":"QM.Edge"},' +
                '{"id":2,"name":"Site","mode":"follow","filter":[],"subQuery":[],"branches":[],"type":"QM.Node"}],"limit":50}'
      };

      element('.node:first').click();
      element('.node-reachable:first').click();

      expect(browser().location().search()).toEqual(search);
    });

    it('should add the dsl expression (V(User) ~ outE(likes) ~ inV).take(50) to the history', function() {
      element('.node:first').click();
      element('.node-reachable:first').click();

      expect(element('select[ng-model="history"] option[value="0"]').text()).toEqual('(V(User) ~ outE(likes) ~ inV).take(50)');
    });

    it('should create a query with a sub query', function() {
      element('.node:first').click();
      element('button[ng-click="startSubQuery()"]').click();
      element('.node-reachable:first').click();

      expect(element('#query').text()).toEqual('(V(User) ~ sub(outE(likes) ~ inV)).take(50)');
    });

    it('should create a query with two branches', function() {
      element('.node:first').click();
      
      // create first branch
      element('button[ng-click="startBranch()"]').click();
      element('.node-reachable:first').click();
      element('button[ng-click="finishBranch()"]').click();

      // create second branch
      element('button[ng-click="startBranch()"]').click();
      element('.node-reachable:first').click();
      element('button[ng-click="finishBranch()"]').click();

      expect(element('#query').text()).toEqual('(V(User) ~ choice((outE(likes) ~ inV), (outE(likes) ~ inV))).take(50)');
    });

  });

});
