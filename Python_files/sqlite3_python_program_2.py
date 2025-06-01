import sqlite3
conn= sqlite3.connect('test.db')
cursor = conn.cursor()
cursor.execute("create table if not exists employees (id integer primary key, name char(40), salary int(10))")
cursor.execute("insert into employees (name, salary) values ('Nandita', 50000)")
cursor.execute("insert into employees  values (2,'Sai', 60000) , (3,'Paul', 70000), (4,'Kowshik', 80000), (5,'Nithish', 90000), (6,'Ganesh', 100000)")
conn.commit()
cursor.execute("select * from employees")
data = cursor.fetchall()    
for row in data:
    print(row)