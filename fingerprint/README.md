#Fingerprint folder
You will find here three different folders associated with three different features 
of FP Central. 
The "attributes" folder contains all the tests that are run on the collection page.
The "tags" folder has the list of tags defined in the application with the associated
logic of each tag.
Finally, the "acceptable" folder has a list of acceptable values for different tags. 

## Attributes
### Description
Attributes are at the core of a fingerprint.
They reveal information on several layers of user's device from the browser to the operating system and
even the hardware.
They can be collected through HTTP header, JavaScript or plugins if they are available.

### How it works
All attributes are present in the **attributes** folder.
Depending on a fingerprint's tag, not all the tests are run and not all attributes are collected.


## Tags
### Description
A tag is a classification of a fingerprint in a specific category.
Based on the analysis of standard attributes, a fingerprint will go through a series of tests
to determine which tags apply to it.
These tags can be on the browser itself like "Firefox" or "Chrome" but they can also be much broader
and indicate the type of the device like "Desktop" or "Mobile".

The tags are a simple way to manage groups of fingerprints and it leverages the power of MongoDB
to calculate statistics on the collected fingerprints without having to deal with complex logic.

### How it works
Each tag has its own set of rules.
If a fingerprint respects all of the rules for a given tag, it will earn the tag in its collection.

The role of the **tag_manager.py** file is to check all the tags defined in the **tags** folder
against all collected fingerprints.
A fingerprint can have any number of tags as long as they are compatible with each other.


##Attributes
### Description
In order to find out if values sent by browsers around the world are common and not that different
between devices, we check for each collected attribute if the sent values are "expected" or 
"acceptable" ones.

###How it works
Each JSON file located in the **acceptable** folder defines for one tag the acceptable values 
for any number of attributes.
When the statistics are computed for a fingerprint, the **acceptable_manager.py** script
will verify for each attribute if the collected value is acceptable.