import mysql.connector as mc
mydb = mc.connect(
    host="localhost",
    user="saisanjay",
    password="saisanjay",   
)
cursor = mydb.cursor()
cursor.execute("SHOW DATABASES")
print("Databases:")
for db in cursor.fetchall():
    print(db)
cursor.execute("use Sample")
print("\nTables before creation:")
cursor.execute("SHOW TABLES")
for table in cursor.fetchall():
    print(table)
cursor.execute("CREATE TABLE IF NOT EXISTS student (name VARCHAR(40), rollno INT, age INT)")
print("\nTables after creation:")
cursor.execute("SHOW TABLES")
for table in cursor.fetchall():
    print(table)
