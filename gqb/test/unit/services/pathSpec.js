'use strict';

describe('Service', function() {
  beforeEach(module('gqb.services'));

  describe('Path', function() {
    var edges = [
      {
        "name": "TeamHierarchy",
        "fromSchemaNode": "Team",
        "toSchemaNode": "Team"
      },
      {
        "name": "Employer",
        "fromSchemaNode": "User",
        "toSchemaNode": "Bank"
      },
      {
        "name": "Test",
        "fromSchemaNode": "User",
        "toSchemaNode": "Team"
      }
    ];
    var nodes = [
      {
        "name": "Team"
      },
      {
        "name": "Bank"
      },
      {
        "name": "User"
      }
    ];

    beforeEach(inject(function(Path) {
      Path.init(edges, nodes);
    }));

    it('should find the reachable elements of a node', inject(function(Path) {
      expect(Path.getReachableElements('Team')).toEqual([edges[0], edges[2], nodes[2]]);
      expect(Path.getReachableElements('User')).toEqual([edges[1], nodes[1], edges[2], nodes[0]]);
    }));

    it('should return the edges from user to team', inject(function(Path) {
      expect(Path.getEdgesToNode('User', 'Team')).toEqual([edges[2]]);
    }));
  });
});
