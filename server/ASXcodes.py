

import urllib, urllib2
import datetime

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
		return

	url = 'http://www.asx.com.au/asx/research/ASXListedCompanies.csv'
	page = urllib2.urlopen(url).read()

	file = open('ASXCodes.csv', 'w')
	file.write(page)
	file.close()


grabAllCodes()
