from bottle import Bottle, run, response
from json import dumps
from server import dataScraper, historical, metric

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

@app.route('/data/<code>')
def get_data(code=""):
   result = dataScraper.grabCurrentData([code])
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
