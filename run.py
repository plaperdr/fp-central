from flask import Flask,render_template,Blueprint,request
from bson.objectid import ObjectId
from fingerprint.attribute_reader import get_definitions,get_files_and_variables,get_hashed_variables
from flask_restful import Api, Resource,reqparse
from flask_babel import Babel
from flask_pymongo import PyMongo

import env_config as config
import json
import datetime
import hashlib



###### App
app = Flask(__name__)
app.debug = config.debug
api = Api(app)

attributes = Blueprint('site', __name__, static_url_path='', static_folder='fingerprint/attributes',url_prefix='/fp')
app.register_blueprint(attributes)

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/fp')
def fp():
    files,variables = get_files_and_variables()
    return render_template('fp.html', files=files, variables=variables, headers=request.headers)

@app.route('/tor')
def tor():
    return render_template('tor.html')

@app.route('/stats')
def stats():
    return render_template('stats.html')

@app.route('/faq')
def faq():
    definitions = get_definitions()
    return render_template('faq.html',definitions=definitions)

@app.route('/store', methods=['POST'])
def store():
    db.storeFP(request.data)
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
    def storeFP(self,fingerprint):
        parsedFP = json.loads(fingerprint.decode('utf-8'))

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


    ######Lifetime stats (since the creation of the collection)
    #Return the number of fingerprints having the exact same value for the specified attribute
    def getLifetimeStats(self, name, value):
        if name in self.hashedVariables:
            return self.mongo.db.hash.find({name: self.hashValue(value)}).count()
        else:
            return self.mongo.db.fp.find({name:value}).count()

    #Return the 5 most popular values for a specific attribute
    def getPopularLifetimeValues(self, name):
        return self.mongo.db.fp.aggregate({"$group": {"_id":"$"+name, "count": {"$sum": 1}}}, {"$sort": { "count" : -1}},{"$limit": 5})


    ######Epoch stats (stats on a specified period of time)
    #Method to get the correct timestamp in an ObjectID object
    @staticmethod
    def getObjectID(days):
        genTime = datetime.datetime.today() - datetime.timedelta(days=days)
        return ObjectId.from_datetime(genTime)

    #Return the number of fingerprints having the exact same value for the specified attribute in the last X days
    def getEpochStats(self, name, value, days):
        tempID = self.getObjectID(days)
        if name in self.hashedVariables:
            return self.mongo.db.hash.find({"_id": {"$gte": tempID}, name: self.hashValue(value)}).count()
        else:
            return self.mongo.db.fp.find({"_id": {"$gte": tempID}, name: value}).count()

    #Return the 5 most popular values for a specific attribute in the last X days
    def getPopularEpochValues(self, name, days):
        tempID = self.getObjectID(days)
        return self.mongo.db.fp.aggregate([{"$match": { "_id" : {"$gt": tempID}}},{"$group": {"_id": "$" + name, "$gte": tempID,  "count": {"$sum": 1}}},
                                          {"$sort": {"count": -1}}, {"$limit": 5}])

db = Db()


###### API
class IndividualStatistics(Resource):
    #Get the statistics for the value sent in POST
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('name', type=str, help='The name of the attribute must be included.', required=True)
        parser.add_argument('value', type=str, help='A value must be included.')
        parser.add_argument('epoch', type=int, help='A period in days can be included.')
        args = parser.parse_args()

        if args.value is not None:
            if args.epoch is None:
                return db.getLifetimeStats(args.name, json.loads(args.value))
            else:
                return db.getEpochStats(args.name, json.loads(args.value), args.epoch)
        else:
            return ""

class GlobalStatistics(Resource):
    # Get the most popular values
    def get(self, att):
        if att == "total":
            return db.getTotalFP()
        else:
            return db.getPopularLifetimeValues(att)

api.add_resource(IndividualStatistics, '/stats')
api.add_resource(GlobalStatistics, '/stats/<string:att>')

if __name__ == '__main__':
    #Launch application
    app.run()
