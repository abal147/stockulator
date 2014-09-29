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

# Possible metrics

# "symbol"
# "Ask"
# "AverageDailyVolume"
# "Bid"
# "AskRealtime"
# "BidRealtime"
# "BookValue"
# "Change_PercentChange"
# "Change"
# "Commission"
# "Currency"
# "ChangeRealtime"
# "AfterHoursChangeRealtime"
# "DividendShare"
# "LastTradeDate"
# "TradeDate"
# "EarningsShare"
# "ErrorIndicationreturnedforsymbolchangedinvalid"
# "EPSEstimateCurrentYear"
# "EPSEstimateNextYear"
# "EPSEstimateNextQuarter"
# "DaysLow"
# "DaysHigh"
# "YearLow"
# "YearHigh"
# "HoldingsGainPercent"
# "AnnualizedGain"
# "HoldingsGain"
# "HoldingsGainPercentRealtime"
# "HoldingsGainRealtime"
# "MoreInfo"
# "OrderBookRealtime"
# "MarketCapitalization"
# "MarketCapRealtime"
# "EBITDA"
# "ChangeFromYearLow"
# "PercentChangeFromYearLow"
# "LastTradeRealtimeWithTime"
# "ChangePercentRealtime"
# "ChangeFromYearHigh"
# "PercebtChangeFromYearHigh"
# "LastTradeWithTime"
# "LastTradePriceOnly"
# "HighLimit"
# "LowLimit"
# "DaysRange"
# "DaysRangeRealtime"
# "FiftydayMovingAverage"
# "TwoHundreddayMovingAverage"
# "ChangeFromTwoHundreddayMovingAverage"
# "PercentChangeFromTwoHundreddayMovingAverage"
# "ChangeFromFiftydayMovingAverage"
# "PercentChangeFromFiftydayMovingAverage"
# "Name"
# "Notes"
# "Open"
# "PreviousClose"
# "PricePaid"
# "ChangeinPercent"
# "PriceSales"
# "PriceBook"
# "ExDividendDate"
# "PERatio"
# "DividendPayDate"
# "PERatioRealtime"
# "PEGRatio"
# "PriceEPSEstimateCurrentYear"
# "PriceEPSEstimateNextYear"
# "Symbol"
# "SharesOwned"
# "ShortRatio"
# "LastTradeTime"
# "TickerTrend"
# "OneyrTargetPrice"
# "Volume"
# "HoldingsValue"
# "HoldingsValueRealtime"
# "YearRange"
# "DaysValueChange"
# "DaysValueChangeRealtime"
# "StockExchange"
# "DividendYield"
# "PercentChange"
