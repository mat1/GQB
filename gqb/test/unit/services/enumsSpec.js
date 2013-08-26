'use strict';

describe('Service', function() {
  beforeEach(module('gqb.services'));

  var enums = [
    {
      "name": "ch.schema.Priority",
      "values": [
        "High",
        "Kill",
        "Low",
        "Medium"
      ]
    },
    {
      "name": "ch.schema.TicketState",
      "values": [
        "Closed",
        "Delivered",
        "Open",
        "PartlyDelivered"
      ]
    }
  ];

  beforeEach(inject(function(Enums) {
    Enums.init(enums);
  }));

  describe('Enums', function() {

    it('gets enum by property type', inject(function(Enums) {
      var e = Enums.getEnumByPropertyType('Enum:Priority');
      expect(e.name).toEqual('ch.schema.Priority');
      expect(e.values[0]).toEqual('High');
    }));

    it('gets values by property type', inject(function(Enums) {
      var values = Enums.getEnumValuesByPropertyType('Enum:Priority');
      expect(values.length).toEqual(4);
      expect(values[0]).toEqual('High');
    }));

    it('tests if property type is a enum', inject(function(Enums) {
      var result = Enums.isEnum('Enum:Priority');
      expect(result).toEqual(true);
    }));

  });
});
