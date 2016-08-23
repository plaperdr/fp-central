from fingerprint.tags.tagBase import Tag
from ua_parser import user_agent_parser

windows = "Windows"
mac = "Mac"
linux = "Linux"
android = "Android"
iOS = "iOS"
others = "Other OS"
linuxOS = ["Linux","Ubuntu","Kubuntu","Arch Linux","CentOS","Slackware","Gentoo","openSUSE","SUSE","Red Hat","Fedora","PCLinuxOS","Mageia"]

class OS(Tag):
    def getListOfTags(self):
        return [windows,mac,linux,android,iOS,others]

    def checkTags(self, fp):
        parsedUA = user_agent_parser.ParseOS(fp["User-Agent"])
        family = parsedUA["family"]
        if "Windows" in family:
            return [windows]
        elif "Mac" in family:
            return [mac]
        elif family in linuxOS:
            return [linux]
        elif "Android" in family:
            return [android]
        elif "iOS" in family:
            return [iOS]
        else :
            return [others]

