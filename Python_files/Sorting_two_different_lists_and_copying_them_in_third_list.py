list1=[]
list2=[]
list3=[]
n=int(input("Enter the number of elements in the first list: "))
for i in range(n):
    element = int(input(f"Enter element {i+1} for the first list: "))
    list1.append(element)
m=int(input("Enter the number of elements in the second list: "))
for i in range(m):
    element = int(input(f"Enter element {i+1} for the second list: "))
    list2.append(element)
list3 = list1 + list2
list3.sort()
print("First list:", list1)
print("Second list:", list2)
print("Combined and sorted list:", list3)
