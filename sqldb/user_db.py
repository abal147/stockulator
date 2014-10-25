import sqlite3, time, os, json
#from server import scraperUtility

#create a new database and set up the tables
def createDB():
	db = sqlite3.connect('stock_db.db')
	cursor = db.cursor()
	cursor.execute('''
	CREATE TABLE users
	(
		name TEXT,
		firstname TEXT,
		lastname TEXT,
		userID INTEGER PRIMARY KEY,
		email TEXT unqiue,
		password TEXT,
		balance REAL
	)
	''')
	#add gameID to this table and where null it is a non-game
	cursor.execute('''
	CREATE TABLE transactions
	(
		userID INTEGER,
		stockID TEXT,
		price REAL,
		numStocks INTEGER,
		unixDate INTEGER
	)
	''')
	#list of distinct pairs of friends
	cursor.execute('''
	CREATE TABLE friends
	(
		userID INT,
		friendID INT,
		accepted INT
	)
	''')
	#watch stocks
	cursor.execute('''
	CREATE TABLE watchlist
	(
		userID INT,
		stockID TEXT
	)
	''')
	#string to store on signin
	cursor.execute('''
	CREATE TABLE signin
	(
		userID INT,
		lastState TEXT
	)
	''')
	db.commit()
	db.close()

#returns true if new user is inserted otherwise if users is not new, returns false
#userID is automatically generated
def insertUser(name, firstname, lastname,  email, password):
	#check if email is unqiue
	db = sqlite3.connect('stock_db.db')
	cursor = db.cursor()
	if newUser(email) == 0:
		return 0	
	defaultBalance = 10000
	cursor.execute('''
	INSERT INTO users (name, firstname, lastname, email, password, balance) values (?,?,?,?,?,?)''', (name, firstname, lastname, email, password, defaultBalance))
	db.commit()
	db.close()
	return 1

#returns true if user is new, else if email is not unique then false
def newUser(name):
	db = sqlite3.connect('stock_db.db')
	cursor = db.cursor()
	cursor.execute(
	'''SELECT * FROM users WHERE name = (?)''', (name,))
	if len(cursor.fetchall()) > 0:
		db.close()
		return 0
	db.close()
	return 1

def getUserID(name):
	db = sqlite3.connect('stock_db.db')
	cursor = db.cursor()
	cursor.execute('''SELECT userID FROM users WHERE name = (?)''', (name,))
	userID = cursor.fetchone()[0]
	db.close()
	return userID

def getUser(name):
	db = sqlite3.connect('stock_db.db')
	cursor = db.cursor()
	cursor.execute('''SELECT * FROM users WHERE name = (?)''', (name,))
	userinfo = cursor.fetchall()
	db.close()
	return userinfo

def getAllUsers():
	db = sqlite3.connect('stock_db.db')
	cursor = db.cursor()
	cursor.execute('''SELECT name FROM users''')
	allusers = []
	for row in cursor:
		allusers.append(str(row[0]))
	db.close()
	return str(allusers)

def changeBalance(name, newBalance):
	db = sqlite3.connect('stock_db.db')
	cursor = db.cursor()
	userID = getUserID(name)
	cursor.execute('''UPDATE users SET balance = (?) WHERE userID = (?)''', (newBalance, userID))
	db.commit()
	db.close()
	return

#inserts a transaction, searches for the userID when given a name
#userID, stockID, price, numstocks, unixDate
def insertTrans(inputstr):
	inputs = inputstr.split(',')
	db = sqlite3.connect('stock_db.db')
	cursor = db.cursor()
	userID = getUserID(inputs[0])
	cursor.execute(
		'''INSERT INTO transactions (userID, stockID, price, numStocks, unixDate) values (?,?,?,?,?)''', (userID, inputs[1], inputs[2], inputs[3], int(time.time())))
	#if its a buy operation, need to remove from the watchlist
	
	db.commit()
	db.close()
	return 'transaction inserted for:' + inputstr

#just prints out all the transactions in the transaction table
def printTrans():
	db = sqlite3.connect('stock_db.db')
	cursor = db.cursor()
	cursor.execute('''SELECT * FROM transactions''')
	#return ','.join(cursor)
	for row in cursor:
		print row[0]
		print row[1]
		print row[2]
		print row[3]
	db.close()
	return

def getTrans(name):
	db = sqlite3.connect('stock_db.db')
	userID = getUserID(name)
	cursor = db.cursor()
	cursor.execute(
		'''SELECT * FROM transactions WHERE userID = (?)''', (userID,))
	transinfo = cursor.fetchall()
	return transinfo

def getPortfolio(name):
	db = sqlite3.connect('stock_db.db')
	cursor = db.cursor()
	userID = getUserID(name)
	cursor.execute(
		'''SELECT * FROM transactions WHERE userID = (?)''', (userID,))
	portfolio = {}
	for row in cursor:
		stockID = str(row[1])
		if row[1] in portfolio:
			portfolio[stockID] += row[2]*row[3]
		else:
			portfolio[stockID] = row[2]*row[3]
	returnstr = '['
	for stockID in portfolio:
		returnstr += stockID + ':' + str(portfolio[stockID])
	returnstr += ']'
	db.close()
	return json.dumps(portfolio)

def getInitialBalance(name):
	db = sqlite3.connect('stock_db.db')
	cursor = db.cursor()
	cursor.execute(
		'''SELECT balance FROM users WHERE name = (?)''', (name,))
	initial = cursor.fetchone()[0]
	db.close()
	return initial

def getCurrBalance(name):
	db = sqlite3.connect('stock_db.db')
	cursor = db.cursor()
	userID = getUserID(name)
	balance = getInitialBalance(name)
	cursor.execute(
		'''SELECT price, numStocks FROM transactions WHERE userID = (?)''', (userID,))
	for row in cursor:
		balance -= row[0]*row[1]
	db.close()
	return balance

def insertRequest(name, friend):
	db = sqlite3.connect('stock_db.db')
	cursor = db.cursor()
	userID = getUserID(name)
	friendID = getUserID(friend)
	cursor.execute(
		'''INSERT INTO friends (userID, friendID, accepted) VALUES (?,?,?)''', (userID, friendID, 0))
	db.commit()
	db.close()
	return

def getRequest(name):
	db = sqlite3.connect('stock_db.db')
	cursor = db.cursor()
	userID = getUserID(name)
	cursor.execute(
		'''SELECT name FROM users WHERE userID IN
			(SELECT userID FROM friends WHERE friendID = (?) AND accepted = (?))''', (userID,0))
	requestlist = []
	for row in cursor:
		requestlist.append(str(row[0]))
	db.close()
	return requestlist

def acceptRequest(name, friend):
	db = sqlite3.connect('stock_db.db')
	cursor = db.cursor()
	userID = getUserID(name)
	friendID = getUserID(friend)
	cursor.execute(
		'''UPDATE friends SET accepted = (?) WHERE userID = (?) AND friendID = (?)''', (1, userID, friendID))
	cursor.execute(
		'''INSERT INTO friends (userID, friendID, accepted) VALUES (?,?,?)''', (friendID, userID, 1))
	db.commit()
	db.close()
	return

def rejectRequest(name, friend):
	db = sqlite3.connect('stock_db.db')
	cursor = db.cursor()
	userID = getUserID(name)
	friendID = getUserID(friend)
	cursor.execute(
		'''DELETE FROM friends WHERE userID = (?) AND friendID = (?)''', (userID, friendID))
	db.commit()
	db.close()
	return

def deleteFriend(name, friend):
	db = sqlite3.connect('stock_db.db')
	cursor = db.cursor()
	userID = getUserID(name)
	friendID = getUserID(friend)
	cursor.execute(
		'''DELETE FROM friends WHERE userID = (?) AND friendID = (?)''', (userID, friendID))
	cursor.execute(
		'''DELETE FROM friends WHERE userID = (?) AND friendID = (?)''', (friendID, userID))
	db.commit()
	db.close()
	return

def getFriends(name):
	db = sqlite3.connect('stock_db.db')
	cursor = db.cursor()
	userID = getUserID(name)
	cursor.execute(
		'''SELECT name FROM users WHERE userID IN 
			(SELECT friendID FROM friends WHERE userID = (?))''', (userID,))
	friendlist = []
	for row in cursor:
		friendlist.append(str(row[0]))
	db.close()
	return friendlist

def getNonFriends(name, searchstr):
	db = sqlite3.connect('stock_db.db')
	cursor = db.cursor()
	userID = getUserID(name)
	cursor.execute(
		'''SELECT name FROM users 
			WHERE userID NOT IN (SELECT friendID FROM friends WHERE userID = (?)) 
				AND userID <> (?) 
				AND name LIKE (?)''', (userID, userID, '%' + searchstr + '%'))
	friendlist = []
	for row in cursor:
		friendlist.append(str(row[0]))
	db.close()
	return friendlist

def printFriends():
	db = sqlite3.connect('stock_db.db')
	cursor = db.cursor()
	cursor.execute(
		'''SELECT * FROM friends''')
	print cursor.fetchall()
	db.close()
	return


def insertWatch(name, stockID):
	db = sqlite3.connect('stock_db.db')
	cursor = db.cursor()
	userID = getUserID(name)
	cursor.execute(
		'''SELECT stockID FROM watchlist WHERE userID = (?)''', (userID,))
	db.commit()
	db.close()
	return

def removeWatch(name, stockID):
	db = sqlite3.connect('stock_db.db')
	cursor = db.cursor()
	userID = getUserID(name)
	cursor.execute(
		'''DELETE FROM watchlist WHERE userID = (?) AND stockID = (?)''', (userID, stockID))
	db.commit()
	db.close()
	return

def getWatchList(name):
	db = sqlite3.connect('stock_db.db')
	cursor = db.cursor()
	userID = getUserID(name)
	cursor.execute(
		'''SELECT stockID FROM watchlist WHERE userID = (?)''', (userID,))
	watchlist = []
	for row in cursor:
		watchlist.append(str(row[0]))
	db.close()
	return watchlist

def storeLastState(name, lastState):
	db = sqlite3.connect('stock_db.db')
	cursor = db.cursor()
	userID = getUserID(name)
	cursor.execute(
		'''DELETE FROM signin WHERE userID = (?)''', (userID,))
	cursor.execute(
		'''INSERT INTO signin (userID, lastState) VALUES (?,?)''', (userID, lastState))
	db.commit()
	db.close()
	return

def getLastState(name):
	db = sqlite3.connect('stock_db.db')
	cursor = db.cursor()
	userID = getUserID(name)
	cursor.execute(
		'''SELECT lastState FROM signin WHERE userID = (?)''', (userID,))
	state = cursor.fetchone()[0]
	db.close()
	return state
	

#need function to put users into gamestable
if __name__ == "__main__":
	os.remove('stock_db.db')
	createDB()
	insertUser('bob', 'asdf', 'asdf', 'asdf', 'quet')
	insertUser('jane', 'asdf', 'asdf', 'asdf', 'qiet')
	insertUser('mark', 'asdf', 'asdf', 'asdf', 'asdf')

def testDB():
	os.remove('stock_db.db')
	createDB()
	insertUser('bob', 'bob', 'asd', 'asdf', 'quet')
	insertUser('jane', 'jane', 'asdf', 'asdf', 'qiet')
	insertUser('mark', 'mark', 'asdf', 'asdf', 'asdf')

	insertTrans('bob,wow.ax,40,1')
	print getCurrBalance('bob')

	print 'inserting request from bob to jane'
	insertRequest('bob', 'jane')
	printFriends()
	print getRequest('jane')
	print 'jane accepts request'
	acceptRequest('bob', 'jane')
	printFriends()
	print 'insert request from mark to jane'
	insertRequest('mark', 'jane')
	acceptRequest('mark', 'jane')
	printFriends()
	print 'bob rejects request from mark'
	insertRequest('mark', 'bob')
	rejectRequest('mark', 'bob')
	print 'these are janes friends'
	print getFriends('jane')
	print getNonFriends('bob', 'ma')
	print 'jane chooses mark and deletes bob'
	deleteFriend('jane', 'bob')
	print getAllUsers()
	storeLastState('bob', 'asfdasdfadsfs')
	print getLastState('bob')

testDB()

