#!/usr/bin/python
# This is a server script used to get the metric data in correct JSON Format
# For graphical display
# Also used to pull raw historical data for graphing...
# Usage : 
# command Line : 
from metric import metricData
from historical import grabHistoricalData

def getRawHistoryJson (code, numDays)
	# Function used to call aaron's history and view raw json as csv
	csvString = grabHistoricalData(code,numDays);

	# Convert the csv string to a proper json representation

def getMetricJson (code,numDays)
	# Function used to call metric.py and parse output as json ready for graphing
	output = metricData(code,numDays,3,0.3);
	
	# Convert this output to a proper json representation....
##########################################################
##### CGI Code used to Determine what data to serve ######
##########################################################
