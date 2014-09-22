# Usage: 	python historical.py Code Numdays
# Example:	python historical.py WOW.AX
# NumDays > 0

import sys
import urllib, urllib2
import time 
from datetime import date
from datetime import timedelta
import json
import scraperUtility

# Perform the date calculations
code = sys.argv[1]
numDays = int(sys.argv[2])
today = date.today()
delta = timedelta(days = -numDays)

#print today
#print today + delta

startDate = (today + delta).isoformat()
endDate = today.isoformat()

# The columns to grab from the table
selectedColumns = ['*']
selectedColumns = ['Symbol', 'Date', 'Open', 'Close']

# Build query
query = 'select ' + scraperUtility.commaString(selectedColumns, ', ') + ' from yahoo.finance.historicaldata where symbol = "' 
query += code + '" and startDate = "' + startDate + '" and endDate = "'
query += endDate + '"'

suffix = '&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback='

# Access URL
url = 'https://query.yahooapis.com/v1/public/yql?q=' + urllib.quote(query) + suffix

page = urllib2.urlopen(url).read()

# Parse the JSON object
wholeObject = json.loads(page)
count = wholeObject['query']['count']

results = wholeObject['query']['results']['quote']

for result in results:
   output = ''
   for column in selectedColumns:
   	output += result[column] + ','
   print output[:-1]
