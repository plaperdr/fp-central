#Fingerprint
A fingerprint is composed of two components: a list of attributes and a list of tags.

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
**This functionality is not active yet and will be developed at a later date.**
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

The role of the **tag_checker.py** file is to check all the tags defined in the **tags** folder
against all collected fingerprints.
A fingerprint can have any number of tags as long as they are compatible with each other.