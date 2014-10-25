from bottle import Bottle, run, response , request
from json import dumps,load
from server import dataScraper, historical, metric, ASXcodes
from sqldb import user_db
import re

testGlobUser = "none" # remove me later, just to test exactly how the user object looks...
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

@app.route('/isusernew/<user>')
def checkUser(user=""):
	user=re.sub(r'\W+','',user)
	result = user_db.newUser(user)
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
   username = re.sub(r'\W+','',request.forms['userName']);
   pwd = re.sub(r'\W+','',request.forms['password']);
   response.content_type = 'application/json'
   
   if userAuthenticated(username,pwd) :
   	   user_db.insertTrans(transaction) # Security issue if transaction has other shit....
   	   return dumps("yes")
   else :
   	   return dumps("no")

@app.route('/login/<userName>/<password>')
def login (userName,password):
	output="yes"
	global testGlobUser
	#1. clean the data
	user = re.sub(r'\W+','',userName)
	pwd = re.sub(r'\W+','',password)
	
	# 2. Check user data is correct in user database
	if userAuthenticated(user,pwd):
		print "User is authenticated..."
		output=user_db.getLastState(user) # TODO!! change this to the saved user object...
		#TODO - return the complete saved user object....
	else :
		print "user is not authenticated!"
		output="none"
		
	# 3. Return response
	response.content_type = 'application/json'
	return dumps(output)

@app.post('/updateUser',methods='POST')
def updateUser():	
	global testGlobUser
	user=request.forms['user'] # NB: possible security fflaw as we are just accepting that the string is okay...
	username = re.sub(r'\W+','',request.forms['userName']);
	pwd = re.sub(r'\W+','',request.forms['password']);
	if userAuthenticated(username,pwd) :
		user_db.storeLastState(username,user) # Store the user object in the database...
	result="good"
	response.content_type = 'application/json'
	return dumps(result)

@app.route('/addUser/<userData>')
def addUser(userData=""):

	print "User Data is " + userData
	username=re.sub(r'\W+','',userData.split(',')[0])
	password=re.sub(r'\W+','',userData.split(',')[1])
	email=re.sub(r'\W+','',userData.split(',')[2])
	result=user_db.insertUser(username,password,email);
	out="no" # silly i know but oh well since i am passing string nicely
	if result :
		out="yes";
	response.content_type = 'application/json'
	return dumps(out)

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

# return true is username password combo valid, false otherwise
def userAuthenticated(username,password):
	userdata=user_db.getUser(username)
	if len(userdata) < 3 :
		return False
	else :
		if password == userdata[3] :
			return True
		else:
			return False

run(app, host='0.0.0.0', port=8080, debug=True)
