GQB
===

Graphical Query Builder for [trails](https://github.com/danielkroeni/trails)

GQB allows you to easily create queries for trails [online demo](http://gqb.ebrun.ch/).

It is possible to extend GQB for other query languages like SQL or [gremlin](https://github.com/tinkerpop/gremlin/wiki).

## Quick Start

The quickest way to get started with your own graph is to create a schema as shown below:

```js
{
  "nodes": [
    {
      "name": "A",
      "properties": [
        {
          "name": "Key",
          "propertyType": "Long"
        }
      ]
    },
    {
      "name": "B",
      "properties": [
        {
          "name": "Name",
          "propertyType": "String"
        }
      ]
    }
  ],
  "edges": [
    {
      "name": "C",
      "properties": [],
      "fromSchemaNode": "A",
      "toSchemaNode": "B"
    }
  ],
  "enums": []
}
```

## License
GQB is licensed under the [MIT License](http://www.opensource.org/licenses/mit-license.php).
