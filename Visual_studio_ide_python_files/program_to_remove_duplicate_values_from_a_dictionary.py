dict={1:3, 2:4, 3:5, 4:6, 5:7, 1:3, 2:4}
def remove_duplicates(input_dict):
    unique_dict = {}
    for key, value in input_dict.items():
        if key not in unique_dict:
            unique_dict[key] = value
    return unique_dict
result = remove_duplicates(dict)
print("Original dictionary:", dict)
