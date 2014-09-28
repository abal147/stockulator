# Create a string delimited by delim out of the list words
def commaString(words, delim = ','):
	retString = ''
	for word in words:
		retString += word + delim
	return retString[:-len(delim)]

# Add quotes around each word in a list
# The quote is specified as a parameter
def quoteList(words, quote = '"'):
	retList = []
	for word in words:
		retList.append(quote + word + quote)
	return retList
