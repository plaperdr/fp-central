from fingerprint.tags.browser import Browser
from fingerprint.tags.os import OS

class TagChecker:
    def __init__(self):
        self.classList = [Browser(),OS()]
        self.tagList = []
        for c in self.classList:
            self.tagList.extend(c.getListOfTags())

    def getTagList(self):
        return self.tagList

    def checkFingerprint(self,fp):
        tags = []
        for c in self.classList:
            tags.extend(c.checkTags(fp))
        return tags
