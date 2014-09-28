from bottle import Bottle, run
from server import dataScraper, historical

app = Bottle()

@app.route('/')
@app.route('/hello')
def hello():
    return "Hello World!"

@app.route('/data/<code>')
def get_data(code=""):
   return dataScraper.grabCurrentData([code]);

@app.route('/data_historical/<code>/<numDays:int>')
def get_data(code="", numDays=30):
   return historical.grabHistoricalData(code, numDays);

