

import urllib, urllib2
import datetime
import re
import sys

def grabAllCodes():

	file = open('ASXCodes.csv', 'r')
	lastScraped = file.readline()
	file.close()

	lastScraped = datetime.datetime.strptime(lastScraped[27:], 
		'%a %b %d %H:%M:%S EST %Y\r')

	today = datetime.date.today()

	todayInt = 10000 * today.year + 100 * today.month + today.day

	if (today.year == lastScraped.year 
		and today.month == lastScraped.month 
		and today.day == lastScraped.day):
		return todayInt

	url = 'http://www.asx.com.au/asx/research/ASXListedCompanies.csv'
	page = urllib2.urlopen(url).read()

	# page.replace('"') was only removing one quote
	# couldnt find a good solution so using this for now
	page = ''.join(page.split('"'))
	page = page.upper()

	cleanedRecords = []

	lines = page.split('\n')

	cleanedRecords.append(lines[0])

	for line in lines[3:]:
		record = line.split(',', 2)
		if len(record) == 3:
			record[1] += '.AX'
			cleanedRecords.append(','.join(record))
			
	allCodes = '\n'.join(cleanedRecords)
	
	file = open('ASXCodes.csv', 'w')
	file.write(allCodes)
	file.close()

	return todayInt

def requestCodes():
	grabAllCodes()	
	
	result = dict()

	file = open('ASXCodes.csv', 'r')
	result['data'] = file.read()
	file.close()

	return result	


def getCodes(regex, industry = ''):
	retrieved = grabAllCodes()
#	if (retrieved):
#		print('retrieved new data')

	regex = regex.upper()
	industry = industry.upper()
#	print 'Searching for', regex, industry
	
	file = open('ASXCodes.csv', 'r')
	file.readline()

	page = file.read()
	lines = page.split('\r\n')
	results = []


	for line in lines:
		splitLine = line.split(',')
		if (len(splitLine) != 3):
			continue
		codeMatch = re.search(regex, line)
		if (codeMatch):
			results.append(line)
		elif (industry != ''):
			industryMatch = re.search(industry, splitLine[2])
			if (industryMatch):
				results.append(line)
	
	return results

if __name__ == "__main__":
	print requestCodes()
