GQB
===

Graphical Query Builder for [trails](https://github.com/danielkroeni/trails) (purely functional graph traversal language).

GQB is build with AngularJS [online demo](http://gqb.ebrun.ch/).

 ![image][]
  [image]: http://gqb.ebrun.ch/img/gqb.png

It is possible to extend GQB for other query languages like SQL or [gremlin](https://github.com/tinkerpop/gremlin/wiki).


### Installation

Requirements:

- Webserver with PHP (>= 5)

Clone the repository to your webserver folder. Enjoy!


### Use an other schema

The quickest way to get started with your own schema is to create a JSON schema as shown below:

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

Follow these steps to add a new schema:

- Save this schema under gqb/app/data/schema.json and open the admin page [demo admin page](http://gqb.ebrun.ch/#/admin).
- Save the layout on the server. 
- Go to the query page to use the new schema.

## License
GQB is licensed under the [MIT License](http://www.opensource.org/licenses/mit-license.php).
