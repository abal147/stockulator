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
