import json
import os

class AcceptableChecker:
    def __init__(self):
        self.acceptList = {}
        for subdir, dirs, files in os.walk("fingerprint/acceptable"):
            for file in files:
                if file.endswith(".json"):
                    with open(os.path.join(subdir, file)) as json_file:
                        json_data = json.load(json_file)
                        self.acceptList[json_data["mainTag"]] = flattenJSON(json_data)

        self.acceptHelp = ["plugins","screen"]


    #For an attribute with a specific value, returns:
    # - 'Ok' if there is no acceptable supported tag
    # - 'Ok' if there are no specific values for this attribute
    # - 'Yes' if the value matches an acceptable one
    # - 'No' if the value does not match any acceptable ones
    def checkValue(self,tags,attribute,value):
        for tag in tags:
            if tag in self.acceptList:
                if attribute not in self.acceptList[tag]:
                    return 'Ok'
                else:
                    if isinstance(self.acceptList[tag][attribute],list) and value in self.acceptList[tag][attribute]:
                        return 'Yes'
                    elif self.acceptList[tag][attribute] == value:
                        return 'Yes'
                    else :
                        return 'No'
        return 'Ok'

    #Returns if there is help on this attribute in case
    #it does not have an acceptable value
    #(See Tor page)
    def hasHelp(self, attribute):
        base = attribute.split(".")[0]
        if base in self.acceptHelp:
            return base
        else:
            return ""

def flattenJSON(jsonData):
    flat = {}
    for k1,v1 in jsonData.items():
        if isinstance(v1,dict):
            fl = flattenJSON(v1)
            for k2,v2 in fl.items():
                flat[k1+"."+k2] = v2
        else:
            flat[k1] = v1
    return flat