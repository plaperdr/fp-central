# Acceptable values
All the files located in this folder define acceptable values for specific tagged 
fingerprints. There are no imposed way to organize the location of each file since the
**acceptable_manager.py** file will go through the content of all folders.

### How it works
Each JSON file has two main components:
* a **mainTag** that indicates which tag is concerned by it
* a list of attributes with one or more acceptable values for each of them

When stats are computed for a specific fingerprint, FP Central will verify for a given
attribute if the collected value is "acceptable" or not.
If there are no acceptable values defined for an attribute, the application 
will return a "-" sign.

###How to add your own acceptable JSON file
1. Go with the browser you want to study on the collection page of FP Central.
2. Execute the test series.
3. Download the results in JSON format.
4. Add the downloaded file in this folder (the **acceptable** folder).
5. Add values or remove attributes you do not want to study.
5. Add a **mainTag** property in the JSON file to indicate to the application
 the tagged fingerprints you wish to study

It is done! Restart the application and your new JSON file will be used
by FP Central!

###Example of a JSON file
```
{
    "mainTag": "Tor 6.X",
    "plugins": "",
    "dnt": "NC",
    "screen": {
		"width": 1000,
		"height": 1000,
		"depth": 24,
		"availTop": 0,
		"availLeft": 0,
		"availHeight": 1000,
		"availWidth": 1000,
		"left": 0,
		"top": 0
	}
	[...]
}
```


