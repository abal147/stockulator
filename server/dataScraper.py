# Example usage: python dataScraper.py WOW.AX ^AORD

import urllib, urllib2
import json
import sys

# Utility functions for server code
import scraperUtility

def grabCurrentData(codes):
   # Hardcoded values for the API url
   url = 'https://query.yahooapis.com/v1/public/yql'
   # Data tables link needed for access to the table
   suffix = '&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback='

   # Process the command line args
   codes = scraperUtility.quoteList(codes, "'")
   processedCodes = scraperUtility.commaString(codes, ', ')

   selectedColumns = ['*']
   selectedColumns = ['symbol', 'Name', 'PreviousClose', 'PEGRatio'
      , 'EarningsShare', 'PERatio', 'MarketCapitalization'
      , 'AskRealtime', 'ErrorIndicationreturnedforsymbolchangedinvalid']

   # Build the proper url
   query = "select " + scraperUtility.commaString(selectedColumns, ', ') 
   query += " from yahoo.finance.quotes where symbol in (" + processedCodes + ")"
   url = url + '?q=' + urllib.quote_plus(query) + suffix


   page = urllib2.urlopen(url).read()

   # Parse the JSON object
   wholeObject = json.loads(page)
   count = wholeObject['query']['count']

   results = wholeObject['query']['results']['quote']

   return results

def grabStockPriceOnly(codes):
   # Hardcoded values for the API url
   url = 'https://query.yahooapis.com/v1/public/yql'
   # Data tables link needed for access to the table
   suffix = '&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback='

   # Process the command line args
   codes = scraperUtility.quoteList(codes, "'")
   processedCodes = scraperUtility.commaString(codes, ', ')

   selectedColumns = ['*']
   #selectedColumns = ['symbol', 'Name', 'AskRealtime'] # Aarons server
   selectedColumns = ['AskRealtime'] # Ed's server change

   # Build the proper url
   query = "select " + scraperUtility.commaString(selectedColumns, ', ')
   query += " from yahoo.finance.quotes where symbol in (" + processedCodes + ")"
   url = url + '?q=' + urllib.quote_plus(query) + suffix


   page = urllib2.urlopen(url).read()

   # Parse the JSON object
   wholeObject = json.loads(page)
   count = wholeObject['query']['count']

   results = wholeObject['query']['results']['quote']

   return results


##########################
### START OF MAIN CODE ###
##########################

if __name__ == "__main__":
   codes = sys.argv[1:]
   results = grabCurrentData(codes)
   # Just output the JSON object and let the UI parse it
   # Prints an array for multiple elements, single object for one
   # Not entirely familiar with JSON but might need to do some checking around that
   print results

