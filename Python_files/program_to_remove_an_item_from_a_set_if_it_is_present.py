set1={1,2,3,4,5}
item_to_remove = int(input("Enter the item to remove from the set: "))
if item_to_remove in set1:
    set1.remove(item_to_remove)
    print(f"Item {item_to_remove} removed from the set.")
else:
    print(f"Item {item_to_remove} is not present in the set.")
print("Updated set:", set1)