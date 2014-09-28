from bottle import Bottle, run, response
from json import dumps
from server import dataScraper, historical, metric

app = Bottle()

@app.route('/')
@app.route('/hello')
def hello():
    return "Hello World!"

@app.route('/data/<code>')
def get_data(code=""):
   return dataScraper.grabCurrentData([code]);

@app.route('/data_historical/<code>/<numDays:int>')
def get_data_historical(code="", numDays=30):
   result = metric.metricData(code, numDays, 3, 0.3);
   response.content_type = 'application/json'
   return dumps(result)

run(app, host='0.0.0.0', port=8080, debug=True)
