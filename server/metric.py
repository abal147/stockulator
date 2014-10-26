import json
from rpy2.robjects import r
from historical import grabHistoricalData
from math import isnan

def toNumber (value) :
	if isnan(value) :
		print "isnan"
		return -1
	else :
		return value
		

def metricData(code, numDays, filterlength, alpha) :

	historical = grabHistoricalData(code, numDays)
	
	r.assign("historical", historical)
	r('data.df <- read.csv(text=historical, head=TRUE, sep=",")')
	r('data.df <- data.df[order(as.Date(data.df$Date)),]')
	#r('days <- nrow(data.df)')
	#days = r['days']
	
	r('dates <- as.integer(as.POSIXct(as.Date(data.df$Date)))')
	dates = r['dates']
	r('rawdata <- data.df$Close')
	rawdata = r['rawdata']
	r('volatility <- sqrt(var(data.df$Close))')
	volatility = r['volatility']


	#create time series object
	r('data.ts <- ts(data.df$Close)')
	
	#simple moving average

	r.assign('filterlength', filterlength) #('filterlength <- 2')
	r('data.sma <- filter(data.ts, c(rep(1/as.double(filterlength), filterlength)), sides=2)')
	sma = r['data.sma']
	# for item in sma :
# 		item=toNumber(item)
# 	print list(sma)
	#exponential moving average

	r.assign('alpha', alpha) #r('alpha <- 0.3')
	r('data.ema <- filter(data.ts, c((alpha*(1-alpha))^((filterlength-1):0)), sides=1)')
	ema = r['data.ema']
	#print list(ema)
# 	for item in ema :
# 		toNumber(item)
# 
# 	#trend

	r('data.trend <- data.ts/max(data.ts)')
	trend = r['data.trend']

	return json.dumps((list(dates),(list(rawdata), list(sma), list(ema), list(trend)))

if __name__ == "__main__":
   str = metricData("WOW.AX", 9, 3, 0.3)
   print str

