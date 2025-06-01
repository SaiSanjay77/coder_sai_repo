import sqlite3
conn = sqlite3.connect('test.db')
cursor = conn.cursor()
cursor.execute("DROP TABLE IF EXISTS employees")
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
data = cursor.fetchall()
for row in data:
    print(row)
conn.commit()
conn.close()

