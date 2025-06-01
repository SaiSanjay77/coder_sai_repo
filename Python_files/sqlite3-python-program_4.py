import sqlite3
import os
conn = sqlite3.connect('test.db')
cursor = conn.cursor()
cursor.execute("CREATE TABLE IF NOT EXISTS employees (id INTEGER PRIMARY KEY, name TEXT, salary REAL)")
cursor.executemany(
    "INSERT INTO employees (name, salary) VALUES (?, ?)",
    [
        ('Nandita', 50000),
        ('Sai', 60000),
        ('Paul', 70000),
        ('Kowshik', 80000),
        ('Nithish', 90000),
        ('Ganesh', 100000)
    ]
)
conn.commit()
cursor.execute("SELECT * FROM employees WHERE salary > 60000;")
data = cursor.fetchmany(3)
for row in data:
    print(row)
cursor.execute("drop table employees;")
cursor.execute("flashback table employees before drop;")
data = cursor.fetchall()
for row in data:
    print(row)
    