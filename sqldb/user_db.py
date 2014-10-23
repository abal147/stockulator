import sqlite3, time, os

#create a new database and set up the tables
def createDB():
	db = sqlite3.connect('stock_db.db')
	cursor = db.cursor()
	cursor.execute('''
	CREATE TABLE users
	(
		name TEXT,
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
	#userID in the table below is the creator?
	cursor.execute('''
	CREATE TABLE games
	(
		gameName TEXT,
		gameID INTEGER PRIMARY KEY,
		userID INTEGER
	)
	''')
	#list of non-distinct users in games
	cursor.execute('''
	CREATE TABLE gameusers
	(
		gameID INTEGER,
		userID INTEGER
	)
	''')
	db.commit()
	db.close()

#returns true if new user is inserted otherwise if users is not new, returns false
#userID is automatically generated
def insertUser(name, email, password):
	#check if email is unqiue
	db = sqlite3.connect('stock_db.db')
	cursor = db.cursor()
	if newUser(email) == 0:
		return 0	
	defaultBalance = 10000
	cursor.execute('''
	INSERT INTO users (name, email, password, balance) values (?,?,?,?)''', (name, email, password, defaultBalance))
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

def getAllUsers(name):
	db = sqlite3.connect('stock_db.db')
	cursor = db.cursor()
	cursor.execute('''SELECT name FROM users WHERE name = (?)''', (name,))
	userinfo = cursor.fetchall()
	db.close()
	return userinfo

#prints all rowsi n the users table
def printUsers():
	db = sqlite3.connect('stock_db.db')
	cursor = db.cursor()
	cursor.execute('''SELECT * FROM users''')
	for row in cursor:
		print row[0]
		print row[1]
		print row[2]
		print row[3]
		print row[4]
	db.close()
	return

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
	db.commit()
	db.close()
	return

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
		if row[1] in portfolio:
			portfolio[row[1]] += row[2]*row[3]
		else:
			portfolio[row[1]] = row[2]*row[3]
	returnstr = '['
	for stockID in portfolio:
		returnstr += stockID + ':' + str(portfolio[stockID])
	returnstr += ']'
	db.close()
	return str(portfolio)#returnstr

def getCurrBalance(name):
	db = sqlite3.connect('stock_db.db')
	cursor = db.cursor()
	userID = getUserID(name)
	cursor.execute(
		'''SELECT price, numStocks FROM transactions WHERE userID = (?)''', (userID,))
	balance = 0
	for row in cursor:
		balance += row[0]*row[1]
	db.close()
	return balance

#creates new game and will return the gameID
def newGame(gameName, name):
	db = sqlite3.connect('stock_db.db')
	cursor = db.cursor()
	userID = getUserID(name)
	cursor.execute(
		'''INSERT INTO games (gameName, userID) values (?,?)''', (gameName, userID))
	cursor.execute(
		'''SELECT COUNT * FROM games''')
	gameID = cursor.fetchone()[0]
	db.commit()
	db.close()
	return gameID

#need function to put users into gamestable

os.remove('stock_db.db')
createDB()
newUser('asdf')
insertUser('bob', 'asdf', 'quet')
newUser('asdf')
#printUsers()
insertTrans('bob,wow.ax,40,2.15,13456898763')

printTrans()
str = getPortfolio('bob')
print str
