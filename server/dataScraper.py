# Example useage: python dataScraper.py WOW.AX ^AORD

#http stuff
import urllib
import urllib2
import json
import sys

# Create a string delimited by delim out of the list words
def commaString(words, delim):
	retString = ''
	for word in words:
		retString += word + delim
	return retString[:-len(delim)]

def quoteList(words, quote):
	retList = []
	for word in words:
		retList.append(quote + word + quote)
	return retList

def printDict(d):
	for key, value in d.items():
		print key, ":", value
	print

# Hardcoded values for the API url
url = 'https://query.yahooapis.com/v1/public/yql'
suffix = '&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback='

# Process the command line args
codes = quoteList(sys.argv[1:], "'")
processedCodes = commaString(codes, ', ')

#print 'processedCodes = "' + processedCodes + '"'

selectedColumns = ['*']
# selectedColumns = ['symbol', 'Name', 'Change', 'Ask', 'PercentChange']

# Build the proper url
query = "select " + commaString(selectedColumns, ', ') + " from yahoo.finance.quotes where symbol in (" + processedCodes + ")"
url = url + '?q=' + urllib.quote_plus(query) + suffix

#print url

# Grab the page
page = urllib2.urlopen(url).read()


# Parse the JSON object
wholeObject = json.loads(page)
count = wholeObject['query']['count']

#print count, 'Results returned'

results = wholeObject['query']['results']['quote']


# For simplicity, create a list of the results
# (its a list of dicts)
quotes = []
if count == 1:
	quotes.append(results)
else:
	quotes = results

for quote in quotes:
	printDict(quote)

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
