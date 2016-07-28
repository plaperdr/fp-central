#Tags
All the tags and their tests are located in this folder.
There are no imposed way to organize the location of each file. However, the
**tags_checker.py** must know the existence of created files so that the defined
tags are supported by the application (see details below).

### How it works
One tag file is composed of two components: a list of defined tags and the tests associated
with these tags.

To add your own list of tags, you can follow these steps.
1. Create a python file in the **tags** folder like *myCustomTags.py*.

2. Add a class that implements the **Tag** base class along with the two mandatary methods.
    ``` python
    from fingerprint.tags.tagBase import Tag
    class MySuperNewClass(Tag):
        def getListOfTags(self):
            [...]

        def checkTags(self, fp):
            [...]
    ```
3. Provide the complete list of new tags to the application by implementing the
    **getListOfTags** method. The response must be a list of strings.

4. Provide your own implementation of the **checkTags**. In this method, you have access
    to all the attributes collected in a fingerprint. From there, you can perform
    any verification that is needed and you have to return a list with all the tags that apply
    to the fingerprint.

5. When your file is ready and all your checks have been written, you have to add
    your newly created class in the **tags_checker.py** located in the parent folder.
    First, you have to import it.
    ``` python
    from fingerprint.tags.myCustomTags import MySuperNewClass
    ```
    Then, you need to add an instance of your class in the **classList** attribute of the
**Tag** class the following way.
    ``` python
        self.classList = [....,Tor(),MySuperNewClass()]
    ```

6. Finally, you need to launch the **run.py** script with the **updateTags** argument.
    ```bash
    python3 run.py updateTags
    ```
    This process will refresh the tags of all collected fingerprints by going through all
    the tests including your newly added one.


This is it! Your newly created tags are now supported by the application and every new
fingerprint that is submitted to the system will go through the tests that you wrote.
If you need a full example of a Tag file, you can check the **tor.py** file located
in this folder.

