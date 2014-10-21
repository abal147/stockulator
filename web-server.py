from bottle import Bottle, run, response
from json import dumps
from server import dataScraper, historical, metric, ASXcodes

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
