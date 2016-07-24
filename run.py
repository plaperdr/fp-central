from flask import Flask,render_template,Blueprint,request,make_response
from bson.objectid import ObjectId
from fingerprint.attribute_reader import *
from fingerprint.tags_checker import *
from flask_restful import Api, Resource
from flask_babel import Babel
from flask_pymongo import PyMongo
from datetime import datetime, timedelta

import env_config as config
import json
import hashlib


###### App
app = Flask(__name__)
app.debug = config.debug
api = Api(app)

attributes = Blueprint('site', __name__, static_url_path='', static_folder='fingerprint/attributes',url_prefix='/fp')
app.register_blueprint(attributes)

files,variables = get_files_and_variables()
definitions = get_definitions()

tagChecker = TagChecker()
tags = tagChecker.getTagList()

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
    nbTotal = db.getNumberFP()
    #Get percentages of all HTTP headers
    headersPer = []
    for header in request.headers:
        if header[0] != "Cookie":
            headersPer.append(header+(db.getLifetimeStats(header[0],header[1])*100/nbTotal,))

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
                            totalFP=db.getNumberFP(),
                            epochFP=db.getNumberFP(90),
                            dailyFP=db.getDailyFP(),
                            lang=db.getLifetimeValues("Accept-Language")
                           )

@app.route('/customStats')
def customStats():
    return render_template('customStats.html',
                            tags=tags,
                            listOfVariables=variables,
                          )

@app.route('/faq')
def faq():
    return render_template('faq.html',definitions=definitions)

@app.route('/store', methods=['POST'])
def store():
    db.storeFP(request.data,True)
    return 'ok'

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

    #Hashing method using SHA-256
    @staticmethod
    def hashValue(value):
        return hashlib.sha256(value.encode('ascii','ignore')).hexdigest()


    ######Global stats
    #Return the total number of stored fingerprints
    def getTotalFP(self):
        return self.mongo.db.fp.count()

    #Return the number of stored fingerprints
    #0 argument: return the number of lifetime fingerprints
    #1 argument: number of days from current date
    #2 arguments: start and end dates
    #3 arguments: start date, end date, tags
    def getNumberFP(self,*args):
        print(args)
        if len(args) == 0:
            return self.mongo.db.fp.count()
        elif len(args) == 1:
            startID = ObjectId.from_datetime(datetime.today() - timedelta(days=args[0]))
            return self.mongo.db.fp.find({"_id": {"$gte": startID}}).count()
        elif len(args) == 2:
            startID = self.getObjectID(args[0])
            endID = self.getObjectID(args[1])
            return self.mongo.db.fp.find({"_id": {"$gte": startID, "$lt": endID}}).count()
        else:
            startID = self.getObjectID(args[0])
            endID = self.getObjectID(args[1])
            tagList = args[2]
            return self.mongo.db.fp.find({"_id": {"$gte": startID, "$lt": endID}, "tags":{ "$in": tagList}}).count()


    #Get the number of daily stored fingerprints
    def getDailyFP(self):
        return list(self.mongo.db.fp.aggregate( [{ "$group" : {"_id": {"year" : { "$year" : "$date" },
                                                                 "month" : { "$month" : "$date" },
                                                                 "day" : { "$dayOfMonth" : "$date" }
                                                              },
                                                   "count": { "$sum": 1 }}},
                                                  {"$sort": {'_id.year': 1, '_id.month': 1, '_id.day': 1}}] ))


    ######Lifetime stats (since the creation of the collection)
    #Return the number of fingerprints having the exact same value for the specified attribute
    def getLifetimeStats(self, name, value):
        if name in self.hashedVariables:
            return self.mongo.db.hash.find({name: self.hashValue(value)}).count()
        else:
            return self.mongo.db.fp.find({name:value}).count()

    #Return all the values for a specific attribute
    def getLifetimeValues(self, name):
        return list(self.mongo.db.fp.aggregate([{"$group": {"_id": "$" + name, "count": {"$sum": 1}}},{"$sort": {"count": -1}}]))

    #Return the 5 most popular values for a specific attribute
    def getPopularLifetimeValues(self, name):
        return self.mongo.db.fp.aggregate({"$group": {"_id":"$"+name, "count": {"$sum": 1}}}, {"$sort": { "count" : -1}},{"$limit": 5})


    ######Epoch stats (stats on a specified period of time)
    #Method to get the correct timestamp in an ObjectID object
    @staticmethod
    def getObjectID(date):
        return ObjectId.from_datetime(datetime.strptime(date,'%Y-%m-%d'))

    #Return the number of fingerprints having the exact same value for the specified attribute in the last X days
    def getEpochStats(self, name, value, start, end):
        startID = self.getObjectID(start)
        endID = self.getObjectID(end)
        if name in self.hashedVariables:
            return self.mongo.db.hash.find({"_id": {"$gte": startID, "$lt": endID}, name: self.hashValue(value)}).count()
        else:
            return self.mongo.db.fp.find({"_id": {"$gte": startID, "$lt": endID}, name: value}).count()

    #Return all the values for a specific attribute in the last X days
    def getEpochValues(self, name, start, end):
        startID = self.getObjectID(start)
        endID = self.getObjectID(end)
        return list(self.mongo.db.fp.aggregate([{"$match": {"_id": {"$gte": startID, "$lt": endID}}},
                                                {"$group": {"_id": "$" + name, "count": {"$sum": 1}}},
                                                {"$sort": {"count": -1}}]))

    #Return the 5 most popular values for one attribute or a list of attributes in the last X days
    def getPopularEpochValues(self, *args):
        attList = args[0]
        startID = self.getObjectID(args[1])
        endID = self.getObjectID(args[2])
        if type(attList) is list:
            att = {}
            for attribute in attList:
                att[attribute] = "$"+attribute
        else:
            #attList is a single value
            att = "$"+attList

        if len(args) < 4:
            match = {"_id": {"$gte": startID, "$lt": endID}}
        else:
            match = {"$and": [{"tags": {"$in": args[3]}}, {"_id": {"$gte": startID, "$lt": endID}}]}

        return list(self.mongo.db.fp.aggregate([{"$match": match},
                                           {"$group": {"_id": att, "count": {"$sum": 1}}},
                                           {"$sort": {"count": -1}}, {"$limit": 5}]))

    ##FOR TAG SUPPORT
    # ALL OF THEM
    # t = [{"tags": el} for el in tags]
    # t.append({"date": {"$gt": tempID})
    #{"$match": {"$and": t}}
    #
    # AT LEAST ONE
    #t = {"$match": {"$and": [{"tags": {"$in": tags}}, {"date": {"$gt": tempID}}]}}
    #

db = Db()


###### API
class IndividualStatistics(Resource):
    #Get the statistics for the value sent in POST
    def post(self):
        jsonData = request.get_json(force=True)
        if "name" in jsonData and "value" in jsonData:
            if "start" not in jsonData:
                return db.getLifetimeStats(jsonData["name"], json.loads(jsonData["value"]))
            else:
                return db.getEpochStats(jsonData["name"], json.loads(jsonData["value"]), jsonData["start"],jsonData["end"])
        else:
            if "start" in jsonData and "list" in jsonData:
                if jsonData["tags"] == "all":
                    nbFP = db.getNumberFP(jsonData["start"],jsonData["end"])
                    data = db.getPopularEpochValues(jsonData["list"], jsonData["start"], jsonData["end"])
                else:
                    nbFP = db.getNumberFP(jsonData["start"], jsonData["end"],jsonData["tags"])
                    data = db.getPopularEpochValues(jsonData["list"], jsonData["start"], jsonData["end"], jsonData["tags"])
                #We send data for the customStats page
                return {
                        "totalFP": nbFP,
                        "data": data
                        }
            else:
                return ""

class GlobalStatistics(Resource):
    # Get the most popular values
    def get(self, att):
        if att == "total":
            return db.getNumberFP()
        else:
            return db.getPopularLifetimeValues(att)

api.add_resource(IndividualStatistics, '/stats')
api.add_resource(GlobalStatistics, '/stats/<string:att>')

if __name__ == '__main__':
    #Launch application
    app.run()
