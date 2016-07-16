from fingerprint.tags.tagBase import Tag

tor4 = "Tor 4.X"
tor5 = "Tor 5.X"
tor6 = "Tor 6.X"

class Tor(Tag):
    def getListOfTags(self):
        return [tor4,tor5,tor6]

    def checkTags(self, fp):
        ua = fp["User-Agent"]
        if ua is "Mozilla/5.0 (Windows NT 6.1; rv:45.0) Gecko/20100101 Firefox/45.0":
            return [tor6]
        elif ua is "Mozilla/5.0 (Windows NT 6.1; rv:38.0) Gecko/20100101 Firefox/38.0":
            return [tor5]
        elif ua is "Mozilla/5.0 (Windows NT 6.1; rv:31.0) Gecko/20100101 Firefox/31.0":
            return [tor6]
        else :
            return []