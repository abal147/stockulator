import sqlite3

#should i be doing the input checking e.g. for email

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
			password TEXT
		)
		''')

	cursor.execute('''
		CREATE TABLE transactions
		(
			userID INTEGER,
			numStocks INTEGER,
			price REAL,
			unixDate INTEGER		
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
	cursor.execute('''
		INSERT INTO users (name, email, password) values (?,?,?)''', (name, email, password))
	db.commit()
	db.close()
	return 1

#returns true if user is new, else if email is not unique then false
def newUser(email):
	db = sqlite3.connect('stock_db.db')
	cursor = db.cursor()
	cursor.execute(
	'''SELECT * FROM users WHERE email = (?)''',  (email,))
	if len(cursor.fetchall()) > 0:
		db.close()
		return 0
	db.close()
	return 1

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
		

#inserts a transaction, searches for the userID when given a name
def insertTrans(name, numStocks, price, unixDate):
	db = sqlite3.connect('stock_db.db')
	cursor = db.cursor()
	cursor.execute('''SELECT userID FROM users WHERE name = (?)''', (name,))
	userID = cursor.fetchone()[0]
	cursor.execute(
		'''INSERT INTO transactions (userID, numStocks, price, unixDate) values (?,?,?,?)''', (userID, numStocks, price, unixDate))
	db.commit()
	db.close()
	return

#just prints out all the transactions in the transaction table
def printTrans():
	db = sqlite3.connect('stock_db.db')
	cursor = db.cursor()
	cursor.execute('''SELECT * FROM transactions''')
	for row in cursor:
		print row[0]
		print row[1]
		print row[2]
		print row[3]


createDB()
newUser('asdf')
insertUser('bob', 'asdf', 'quet')

newUser('asdf')
printUsers()

insertTrans('bob', '40', '2.15', '13456898763')
printTrans()
