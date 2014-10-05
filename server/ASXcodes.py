

import urllib, urllib2
import datetime
import re

def grabAllCodes():

	file = open('ASXCodes.csv', 'r')
	lastScraped = file.readline()
	file.close()

	lastScraped = datetime.datetime.strptime(lastScraped[27:], 
		'%a %b %d %H:%M:%S EST %Y\r')

	today = datetime.date.today()

	if (today.year == lastScraped.year 
		and today.month == lastScraped.month 
		and today.day == lastScraped.day):
		return False

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
		record = line.split(',')
		if len(record) == 3:
			record[1] += '.AX'
			cleanedRecords.append(','.join(record))
			
	allCodes = '\n'.join(cleanedRecords)
	
	file = open('ASXCodes.csv', 'w')
	file.write(allCodes)
	file.close()

	return True


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
	print getCodes('Wool', '')



