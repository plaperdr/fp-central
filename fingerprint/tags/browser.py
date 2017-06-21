from fingerprint.tags.tagBase import Tag
from ua_parser import user_agent_parser

tor4 = "Tor 4.X"
tor5 = "Tor 5.X"
tor6 = "Tor 6.X"
torbrowser70 = "Tor Browser 7.0"
chrome = "Chrome"
firefox = "Firefox" #NB: A Tor browser cannot have the Firefox tag
edge = "Edge"
ie = "IE"
bot = "Bot"
others = "Other browsers"


class Browser(Tag):
    def getListOfTags(self):
        return [tor4,tor5,tor6,chrome,firefox,edge,others]

    def checkTags(self, fp):
        ua = fp["User-Agent"]
        #We check first for UA from Tor browsers
        if ua == "Mozilla/5.0 (Windows NT 6.1; rv:52.0) Gecko/20100101 Firefox/52.0":
            return [torbrowser70]
        elif ua == "Mozilla/5.0 (Windows NT 6.1; rv:45.0) Gecko/20100101 Firefox/45.0":
            return [tor6]
        elif ua == "Mozilla/5.0 (Windows NT 6.1; rv:38.0) Gecko/20100101 Firefox/38.0":
            return [tor5]
        elif ua == "Mozilla/5.0 (Windows NT 6.1; rv:31.0) Gecko/20100101 Firefox/31.0":
            return [tor4]
        else:
            #We parse the UA with a more powerful parser
            parsedUA = user_agent_parser.ParseUserAgent(ua)
            family = parsedUA["family"]
            if "Chrome" in family:
                return [chrome]
            elif "Firefox" in family:
                return [firefox]
            elif "Edge" in family:
                return [edge]
            elif "Bot" in family:
                return [bot]
            elif "IE" in family:
                return [ie]
            else :
                return [others]
