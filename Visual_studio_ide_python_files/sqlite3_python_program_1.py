import sqlite3
conn = sqlite3.connect('test.db')
cursor = conn.cursor()
cursor.execute("select sqlite_version();")
data = cursor.fetchone()
print("SQLite version: ", data)
conn.close()
