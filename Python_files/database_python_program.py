import mysql.connector as mc
mydb = mc.connect(
    host="localhost",
    user="saisanjay",
    password="saisanjay"
)  # no database specified here
cursor = mydb.cursor()
cursor.execute("CREATE DATABASE IF NOT EXISTS Sample")
cursor.execute("SHOW DATABASES")
for db in cursor:
    print(db)
