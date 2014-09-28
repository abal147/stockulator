# Usage: 	python historical.py Code Numdays
# Example:	python historical.py WOW.AX 7
# NumDays >= 7
# Results returned != numDays as stockmarkets close on weekends

import sys
import urllib, urllib2
import time 
from datetime import date
from datetime import timedelta
import json
import scraperUtility


# Grabs numDays historical data for the stock signified by code
def grabHistoricalData(code, numDays):
   today = date.today()
   delta = timedelta(days = -numDays)

   startDate = (today + delta).isoformat()
   endDate = today.isoformat()


   # The columns to grab from the table
   # selectedColumns = ['*']
   selectedColumns = ['Symbol', 'Date', 'Close']

   # Build query
   query = 'select ' + scraperUtility.commaString(selectedColumns, ', ') 
   query += ' from yahoo.finance.historicaldata where symbol = "' + code
   query += '" and startDate = "' + startDate + '" and endDate = "' + endDate + '"'

   suffix = '&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback='

   # Access URL
   url = 'https://query.yahooapis.com/v1/public/yql?q=' + urllib.quote(query) + suffix

   page = urllib2.urlopen(url).read()

   # Parse the JSON object
   wholeObject = json.loads(page)
   count = wholeObject['query']['count']

   results = wholeObject['query']['results']['quote']
   
   csvResult = scraperUtility.commaString(selectedColumns) + '\n'
   
   for result in results:
      output = ''
      for column in selectedColumns:
      	output += result[column] + ','
      csvResult += output[:-1] + '\n'
      
   return csvResult



##########################
### START OF MAIN CODE ###
##########################

#code = sys.argv[1]

# Perform the date calculations
#numDays = int(sys.argv[2])

#print grabHistoricalData(code, numDays)




