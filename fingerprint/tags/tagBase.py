from abc import ABC, abstractmethod

#Tag abstract class with two methods to implement
class Tag(ABC):
    @abstractmethod
    def getListOfTags(self):
        pass

    @abstractmethod
    def checkTags(self, fp):
        pass