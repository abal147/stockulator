from bottle import Bottle, run, response
from json import dumps
from server import dataScraper, historical, metric, ASXcodes
from sqldb import user_db

app = Bottle()

@app.hook('after_request')
def enable_cors():
    """
    You need to add some headers to each request.
    Don't use the wildcard '*' for Access-Control-Allow-Origin in production.
    """
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'PUT, GET, POST, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token'

@app.route('/')
@app.route('/hello')
def hello():
    return "Hello World!"

@app.route('/rmfriendo/<user>/<friend>')
def rmfriend(user='',friend=''):
	user_db.deleteFriend(user, friend)
	response.content_type = 'application/json'
	return dumps('')

@app.route('/asxcodes')
def get_codes():
	result = ASXcodes.requestCodes()
	response.content_type = 'application/json'
	return dumps(result)

@app.route('/getfriends/<user>')
def get_friends(user=''):
	response.content_type = 'application/json'
	return dumps(user_db.getFriends(user));

@app.route('/findfriends/<user>/<search>')
def find_friends(user='',search=''):
	response.content_type = 'application/json'
	return dumps(user_db.getNonFriends(user, search))

@app.route('/getrequests/<user>')
def get_friends(user=''):
	response.content_type = 'application/json'
	return dumps(user_db.getRequest(user))

@app.route('/reqfriend/<user>/<friend>')
def request_friend(user='', friend=''):
	user_db.insertRequest(user, friend)
	response.content_type = 'application/json'
	return dumps("")

@app.route('/acceptfriend/<user>/<friend>')
def accept_friend(user='', friend=''):
	user_db.acceptRequest(friend, user)
	response.content_type = 'application/json'
	return dumps('')

@app.route('/rejectfriend/<user>/<friend>')
def reject_friend(user='', friend=''):
	user_db.rejectRequest(friend, user)
	response.content_type = 'application/json'
	return dumps('')

@app.route('/getportfolio/<user>')
def get_portfolio(user=''):
	response.content_type = 'application/json'
	return user_db.getPortfolio(user)

@app.route('/deletefriend/<user>/<friend>')
def delete_friend(user='', friend=''):
	response.content_type = 'application/json'
	user_db.deleteFriend(user, friend)
	return dumps('')

@app.route('/isusernew/<user>')
def checkUser(user=""):
	# Check to see if username exists ...
	# TODO - query the database and replace true with database result...
	if user == "terry" :
		result = "yes"
	else :
		result = "no"
		
	response.content_type = 'application/json'
	return dumps(result)	

@app.route('/data/<code>')
def get_data(code=""):
   result = dataScraper.grabCurrentData([code])
   response.content_type = 'application/json'
   return dumps(result)

@app.post('/update', methods='POST')
def insertTransaction():
   transaction=request.forms['transaction']
   

   #return scriptName.functionName(transaction)
   #technically don't even need to return if not debugging

   #eg.
   return updateUserObject.updateUserObject(transaction)

@app.route('/addUser/<userData>')
def addUser(userData=""):

	print "User Data is " + userData
	# TODO - insert the user into the database
	# Assuming user is valid... if not valid then bad luck , make nothing happen
	# as an invalid user should be caught by the frontend / above method...
	# Should not need to return -- a failed 
	result="good"
	response.content_type = 'application/json'
	return dumps(result)

@app.route('/price/<code>')
def get_price(code=""):
	result = dataScraper.grabStockPriceOnly([code])
	response.content_type = 'application/json'
	return dumps(result)

@app.route('/data_historical/<code>')
@app.route('/data_historical/<code>/<numDays:int>')
@app.route('/data_historical/<code>/<numDays:int>/<filter:int>')
@app.route('/data_historical/<code>/<numDays:int>/<filter:int>/<alpha:float>')
def get_data_historical(code="", numDays=30, filter=3, alpha=0.3):
   result = metric.metricData(code, numDays, filter, alpha)
   response.content_type = 'application/json'
   return dumps(result)

run(app, host='0.0.0.0', port=8080, debug=True)
