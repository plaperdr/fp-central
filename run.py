from flask import Flask,render_template,Blueprint,request,make_response,jsonify
from copy import deepcopy
from fingerprint.attributes_manager import *
from fingerprint.tags_manager import *
from fingerprint.acceptable_manager import *
from flask_babel import Babel
from flask_pymongo import PyMongo
from datetime import datetime, timedelta
from functools import wraps

import env_config as config
import json
import hashlib
import sys


###### App
app = Flask(__name__)
app.debug = config.debug

attributes = Blueprint('site', __name__, static_url_path='', static_folder='fingerprint/attributes',url_prefix='/fp')
app.register_blueprint(attributes)

files,variables = get_files_and_variables()
variablesWithHTTP = [["User-Agent"],["Accept"],["Accept-Language"],["Accept-Encoding"],["Connection"]]
variablesWithHTTP.extend(variables)
definitions = get_definitions()

tagChecker = TagChecker()
tags = tagChecker.getTagList()

acceptableChecker = AcceptableChecker()

unspecifiedValue = "-"

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/fp')
def fp():
    return render_template('fp.html', files=files, variables=variables, headers=request.headers)

@app.route('/fpNoJS')
def fpNoJS():

    # If cookie is not present, we store
    # the headers into the database
    if "fpcentral" not in request.cookies:
        headers = {}
        # Transformation from array of tuples to dictionary
        for key, value in request.headers:
            headers[key] = value
        db.storeFP(headers, False)

    #Get total number of fingerprints
    nbTotal = db.getNumberLifetimeFP()
    #Get percentages of all HTTP headers
    headersPer = []
    for header in request.headers:
        if header[0] != "Cookie":
            headersPer.append(header+(db.getNumberFP({'name':header[0],"value":header[1]})*100/nbTotal,))

    resp = make_response(render_template('fpNoJS.html', headers=headersPer, nbFP = nbTotal))

    #We store a cookie if not present
    if "fpcentral" not in request.cookies:
        resp.set_cookie('fpcentral', 'true', expires=datetime.now() + timedelta(days=config.cookiesDays))

    return resp

@app.route('/tor')
def tor():
    return render_template('tor.html')

@app.route('/globalStats')
def globalStats():
    return render_template('globalStats.html',
                           totalFP=db.getNumberLifetimeFP(),
                           epochFP=db.getNumberLastDaysFP(90),
                           dailyFP=db.getNumberDailyFP(),
                           lang=db.getValues({"name":"Accept-Language"})
                           )

@app.route('/customStats')
def customStats():
    return render_template('customStats.html',
                            tags=tags,
                            listOfVariables=variablesWithHTTP,
                          )

@app.route('/faq')
def faq():
    return render_template('faq.html',definitions=definitions)

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/store', methods=['POST'])
def store():
    return json.dumps(db.storeFP(request.data,True))

###### Babel
babel = Babel(app)

@babel.localeselector
def get_locale():
    return request.accept_languages.best_match(config.LANGUAGES.keys())

###### DB
class Db(object):

    def __init__(self):

        #Initialize connection to the Mongo database
        app.config['MONGO_HOST'] = config.db_host
        app.config['MONGO_PORT'] = config.db_port
        app.config['MONGO_DBNAME'] = config.db_dbname
        app.config['MONGO_USERNAME'] = config.db_username
        app.config['MONGO_PASSWORD'] = config.db_password
        app.config['MONGO_CONNECT'] = False #For multiprocessing
        self.mongo = PyMongo(app, config_prefix='MONGO')

        #Get the list of hashed variables
        self.hashedVariables = get_hashed_variables()


    ######Utility functions
    # Hashing method using SHA-256
    @staticmethod
    def hashValue(value):
        return hashlib.sha256(value.encode('ascii', 'ignore')).hexdigest()

    # Method to get the date from the date string
    @staticmethod
    def getStartDate(date):
        return datetime.strptime(date, '%Y-%m-%d')

    # Method to add one day to the end date so that
    # it takes the data collected during the day
    @staticmethod
    def getEndDate(date):
        return datetime.strptime(date, '%Y-%m-%d') + timedelta(days=1)


    ######Storage
    def storeFP(self,fingerprint,decode):
        if decode :
            parsedFP = json.loads(fingerprint.decode('utf-8'))
        else :
            parsedFP = fingerprint

        #Adding date
        parsedFP["date"] = datetime.utcnow()

        #Adding tags
        parsedFP["tags"] = tagChecker.checkFingerprint(parsedFP)

        #Store the complete fingerprint in the main collection
        insertedID = self.mongo.db.fp.insert_one(parsedFP).inserted_id

        #Compute hashes for hashed variables and
        #store them in a secondary collection
        hashes = { "_id": insertedID}
        for key in parsedFP:
            if key in self.hashedVariables:
                hashes[key] = self.hashValue(parsedFP[key])

        if len(hashes)>1:
            self.mongo.db.hash.insert_one(hashes)

        if len(parsedFP["tags"]) == 0:
            return {'tags': "No tags"}
        else:
            return {'tags': parsedFP["tags"]}


    ######Number of fingerprints
    #Returns the number of lifetime fingerprints
    def getNumberLifetimeFP(self):
        return self.mongo.db.fp.count()

    #Returns the number of fingerprints collected in the last X days
    def getNumberLastDaysFP(self, days):
        startID = datetime.today() - timedelta(days=days)
        return self.mongo.db.fp.find({"date": {"$gte": startID}}).count()

    # Get the number of daily stored fingerprints
    def getNumberDailyFP(self):
        return list(self.mongo.db.fp.aggregate([{"$group": {"_id": {"year": {"$year": "$date"},
                                                                    "month": {"$month": "$date"},
                                                                    "day": {"$dayOfMonth": "$date"}
                                                                    },
                                                            "count": {"$sum": 1}}}]))

    #Returns the number of fingerprints
    #  start/end -> With or without a specific time period
    # name/value -> With or without an attribute and its value
    #       tags -> With or without a list of specific tags
    #includeNoJS -> With or without fingerprints without JS
    def getNumberFP(self,jsonData):
        query = {}

        date = {}
        if "start" in jsonData:
            date["$gte"] = jsonData["start"] if type(jsonData["start"]) is datetime else self.getStartDate(jsonData["start"])
        if "end" in jsonData:
            date["$lt"] = jsonData["end"] if type(jsonData["end"]) is datetime else self.getEndDate(jsonData["end"])
        if len(date) > 0:
            query["date"] = date

        if "tags" in jsonData and jsonData["tags"] not in ["all","No tags"]:
            if "tagComb" in jsonData:
                query["tags"] = {"$"+jsonData["tagComb"]: jsonData["tags"]}
            else:
                #We put "in" by default if it is not specified
                query["tags"] = {"$in": jsonData["tags"]}
        if "includeNoJS" in jsonData and jsonData["includeNoJS"] == "false":
            query["platform"] = {"$exists" : True}

        if "value" not in jsonData:
            return self.mongo.db.fp.find(query).count()
        else:
            if jsonData["name"] in self.hashedVariables:
                query[jsonData["name"]] = self.hashValue(json.loads(jsonData["value"]))
                return self.mongo.db.hash.find(query).count()
            else:
                query[jsonData["name"]] = json.loads(jsonData["value"])
                return self.mongo.db.fp.find(query).count()


    ######Values
    #Return specific values
    #  start/end -> With or without a specific time period
    #       tags -> With or without a list of specific tags
    #includeNoJS -> With or without fingerprints without JS
    #       name -> List of attributes or a single attribute
    #      limit -> With or without a limit on the nb of values
    def getValues(self, jsonData):
        query = []

        #Generation of the match query
        match = []
        date = {}
        if "start" in jsonData:
            date["$gte"] = jsonData["start"] if type(jsonData["start"]) is datetime else self.getStartDate(jsonData["start"])
        if "end" in jsonData:
            date["$lt"] = jsonData["end"] if type(jsonData["end"]) is datetime else self.getEndDate(jsonData["end"])
        if len(date)>0:
            match.append({"date": date})
        if "tags" in jsonData and jsonData["tags"] not in ["all","No tags"]:
            if "tagComb" in jsonData:
                match.append({"tags": {"$"+jsonData["tagComb"]: jsonData["tags"]}})
            else:
                #We put "in" by default if it is not specified
                match.append({"tags": {"$in": jsonData["tags"]}})
        if "includeNoJS" in jsonData and jsonData["includeNoJS"] == "false":
            match.append({"timezone": {"$exists": True}})
        if len(match)>0:
            query.append({"$match": {"$and": match}})

        #Generation of the project query
        attList = jsonData["name"]
        if type(attList) is list:
            att = {}
            project = {}
            for attribute in attList:
                att[attribute] = "$"+attribute
                project[attribute] = {"$ifNull": ["$"+attribute,unspecifiedValue]}
            query.append({"$project": project})
        else:
            #attList is a single value
            att = "$"+attList
            query.append({"$project": {attList: {"$ifNull": ["$" + attList, unspecifiedValue]}}})

        #Generation of the group query
        query.append({"$group": {"_id": att, "count": {"$sum": 1}}})

        #Generation of the sort query
        query.append({"$sort": {"count": -1}})
        
        #Generation of the limit query
        if "limit" in jsonData:
            query.append({"$limit": jsonData["limit"]})

        return list(self.mongo.db.fp.aggregate(query))


    ######Database maintenance
    #Update the tags of all fingerprints -> run it if a tag's logic
    # has been updated or if a new tag has been added
    def updateTags(self):
        with app.app_context():
            cursor = self.mongo.db.fp.find(modifiers={"$snapshot": True})
            for doc in cursor:
                self.mongo.db.fp.update_one({"_id": doc["_id"]}, {"$set": {"tags": tagChecker.checkFingerprint(doc)}})

db = Db()


###### API
def jsonResponse(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        return jsonify(func(*args, **kwargs))
    return wrapper

def getCount(jsonData,prefix):
    result = {}
    startDays = datetime.today() - timedelta(days=90)

    # Adding count with tags
    result[prefix+"Per"] = db.getNumberFP(jsonData)

    # Adding count with tags and a 90-day limit
    jsonData["start"] = startDays
    result[prefix+"PerLimit"] = db.getNumberFP(jsonData)

    # Adding count with a 90-day limit
    del (jsonData["tags"])
    result[prefix+"PerTotalLimit"] = db.getNumberFP(jsonData)

    # Adding count with no tags (all database)
    del (jsonData["start"])
    result[prefix+"PerTotal"] = db.getNumberFP(jsonData)

    return result


@app.route('/stats/number', methods=['POST'])
@jsonResponse
def getNumberFP():
    return getCount(request.get_json(force=True),"number")


@app.route('/stats', methods=['POST'])
@jsonResponse
def getIndividualStats():
    #Get the statistics for the value sent in POST
    jsonData = request.get_json(force=True)
    if "name" in jsonData and "value" in jsonData:
        #Generating variables
        result = getCount(deepcopy(jsonData),"")

        #If one of the tag is a Tor tag, we check for an acceptable value
        if "Tor 6.X" in jsonData["tags"] or "Tor Browser 7.0" in jsonData["tags"]:
            result["acceptable"] = acceptableChecker.checkValue(jsonData["tags"],jsonData["name"], json.loads(jsonData["value"]))

            #If value is not acceptable, we get the most popular value
            #and check if any help is available for this attribute
            if result["acceptable"] == "No":
                #Get the most popular value
                jsonData["limit"] = 1
                result["popular"] = db.getValues(jsonData)

                #Check for help
                l = acceptableChecker.hasHelp(jsonData["name"])
                if l != "":
                    result["link"] = l
        return result
    else:
        return ""

@app.route('/customStats', methods=['POST'])
@jsonResponse
def getCustomStats():
    jsonData = request.get_json(force=True)
    if "start" in jsonData and "name" in jsonData:
        nbFP = db.getNumberFP(jsonData)

        #We limit the returned values
        if 'p' in [el[0] for el in request.args] and request.args['p'] == config.statsPassword:
            jsonData["limit"] = 200
        else:
            jsonData["limit"] = 10
        data = db.getValues(jsonData)
        # We send data for the customStats page
        return {
            "totalFP": nbFP,
            "data": data
        }
    else:
        return ""


if __name__ == '__main__':
    if len(sys.argv)>1 and sys.argv[1] == "updateTags":
        #Update the list of tags of all fingerprints
        db.updateTags()
    else:
        #Launch application
        app.run()
