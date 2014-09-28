#!/usr/bin/python
# Usage: 	python historical.py Code Numdays
# Example:	python historical.py WOW.AX 7
# NumDays >= 7
# Results returned != numDays as stockmarkets close on weekends
import os 
import cgi
import cgitb
import sys
import urllib, urllib2
import time 
from datetime import date
from datetime import timedelta
import json
import scraperUtility

cgitb.enable(display=0,logdir="bugs") # enable cgi script debugging

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
   
   # Create our json output...
   jsonArray = [] # we want an array of point arrays
   # i.e [ [date1 , val1] , [date2 , val2] ...] 
   timeFormat = '%Y-%m-%d' # need time to be converted to epoch time
   # date/time must be in epoch format...
   
   for result in results:
      jsonArray.append([time.mktime(time.strptime(result['Date'],timeFormat))*1000 , float(result['Close'])]); # fill with some Json data..
      output = ''
      for column in selectedColumns:
       	output += result[column] + ','
      csvResult += output[:-1] + '\n'

   # return a tuple of csv data and json data
   # TODO - we will want to clean this process up in the future
   jsonArray=jsonArray[::-1] # Reverse the jsonArray
   return csvResult,jsonArray
      

##########################
### START OF MAIN CODE ###
##########################

# Determine if being run be cgi or command line
# will print csv for command line, json for web
if 'GATEWAY_INTERFACE' in os.environ:
    #print ('CGI')
    # Get the variables from CGI
    data=cgi.FieldStorage();
    code=data['code'].value
    numDays=int(data['numDays'].value)
    print 'Content-Type: application/json'
    print
    print (json.JSONEncoder().encode(grabHistoricalData(code, numDays)[1]))
    
else:
    #print ('CLI')
    code = sys.argv[1]
    numDays = int(sys.argv[2])
    print grabHistoricalData(code, numDays)[0]






