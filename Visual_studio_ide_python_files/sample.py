def token():
    yield 1
    yield 2
values=token()
print(values)
print(values)
for i in values:
    print(i)