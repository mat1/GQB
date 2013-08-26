'use strict';

describe('Service', function() {
  beforeEach(module('gqb.services'));

  /* Graph Mock Object */
  beforeEach(module(function($provide) {
    $provide.factory('Graph', function() {
      var Graph = {};

      Graph.getEdgeByName = function(name) {
        return name;
      };

      Graph.getNodeByName = function(name) {
        return name;
      };

      return Graph;
    });
  }));

  var json = {
    "dsl": "(V(Team) ~ (get(Team.Key).filterV(_ > 10L) ~ get(Team.Key).filterV(_ < 100L)) ~ inE(_Team_) ~ outV).take(50)",
    "query": {
      "elements": [
        {
          "id": 0,
          "name": "Team",
          "mode": "follow",
          "filter": [
            {
              "id": 9,
              "property": {
                "name": "Key",
                "description": "",
                "propertyType": "Long",
                "isId": true
              },
              "opr": ">",
              "literal": "10",
              "type": "QM.PropertyExpr"
            },
            {
              "id": 10,
              "opr": "AND",
              "type": "QM.BoolExpr"
            },
            {
              "id": 11,
              "property": {
                "name": "Key",
                "description": "",
                "propertyType": "Long",
                "isId": true
              },
              "opr": "<",
              "literal": "100",
              "type": "QM.PropertyExpr"
            }
          ],
          "subQuery": [],
          "type": "QM.Node"
        },
        {
          "id": 12,
          "name": "_Team_",
          "mode": "follow",
          "filter": [],
          "subQuery": [],
          "type": "QM.Edge"
        },
        {
          "id": 13,
          "name": "User",
          "mode": "follow",
          "filter": [],
          "subQuery": [],
          "type": "QM.Node"
        }
      ],
      "limit": 50
    }
  };

  describe('Json Query Parser', function() {
    it('should parse a json object to an QM.Query Object', inject(function(JsonQueryParser, QM) {

      var query = JsonQueryParser.parse(json.query);

      expect(query.elements[0] instanceof QM.Node).toBe(true);
      expect(query.elements[0].filter[0] instanceof QM.PropertyExpr).toBe(true);
      expect(query.elements[0].filter[1] instanceof QM.BoolExpr).toBe(true);
      expect(query.elements[1] instanceof QM.Edge).toBe(true);
      expect(query.limit).toBe(50);
    }));

  });
});
