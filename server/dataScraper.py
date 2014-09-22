# Example usage: python dataScraper.py WOW.AX ^AORD

#http stuff
import urllib, urllib2
import json
import sys

import scraperUtility

def printDict(d):
	for key, value in d.items():
		print key, ":", value
	print

# Hardcoded values for the API url
url = 'https://query.yahooapis.com/v1/public/yql'
suffix = '&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback='

# Process the command line args
codes = scraperUtility.quoteList(sys.argv[1:], "'")
processedCodes = scraperUtility.commaString(codes, ', ')

#print 'processedCodes = "' + processedCodes + '"'

selectedColumns = ['*']
# selectedColumns = ['symbol', 'Name', 'Change', 'Ask', 'PercentChange']

# Build the proper url
query = "select " + scraperUtility.commaString(selectedColumns, ', ') + " from yahoo.finance.quotes where symbol in (" + processedCodes + ")"
url = url + '?q=' + urllib.quote_plus(query) + suffix

#print url

# Grab the page
page = urllib2.urlopen(url).read()


# Parse the JSON object
wholeObject = json.loads(page)
count = wholeObject['query']['count']

#print count, 'Results returned'

results = wholeObject['query']['results']['quote']

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
