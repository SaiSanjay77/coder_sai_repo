s="Hello"
lst=[100,200,300,400,500]
dic={}
for i,j in zip(s,lst):
    key=i
    value=j
    dic[key]=value
print(dic)