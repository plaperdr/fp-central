# Attributes
All the attributes and their source code are located in this folder.
There are no imposed way to organize the location of each file since the
**attribute_reader.py** file will go through the content of each folder.

The only requirement is that the files associated with a specific attribute must be located in the same
folder as this attribute's definition file.


### How it works
One attribute is composed of two components: a JSON definition file and the associated sources
for the test.

The definition file includes:
* the name of the attribute
* the description of the attribute
* the name of the stored variables in an array. This way, one script can store more than a single value.
* the name of the test files in an array. If this attribute is collected on the server side, the array must be empty.
* (Optional) the computation of a hash for this attribute (this is needed to improve the server performance
 when dealing with complex or large attributes)
* (Optional) an URL to a webpage with more information on the attribute or
to a bug tracker page with an insight on what is studied

In order to support the dynamic addition of attributes in the project, the result of
each test must manually be added in the **fp** JSON variable. This way, the code of the
main page does not have to be updated every time a test is added or removed and one script
can store more than one value.

If you want to store more than a single value for an attribute, you must store all the data
in a JSON object: `{ "att1":X, "att2":Y, ...}`.

**Example**

*platform.json*
```javascript
{
  "name" : "Platform",
  "description" : "A string representing the platform on which the browser is running. This attribute is collected through JavaScript via the 'navigator' object.",
  "files" : ["platform.js"],
  "variables": ["platform"],
  "hash" : "False",
  "URL" : "https://developer.mozilla.org/docs/Web/API/NavigatorID/platform"
}
```

*platform.js*
``` javascript
(function() {
    api.register("platform", function () {
        //Here you can perform the computation you want
         [...]
        //Then you can return the result
        return window.navigator.platform;
    });
})();
```
