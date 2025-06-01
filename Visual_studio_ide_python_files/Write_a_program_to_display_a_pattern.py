pat="ABCDE"
for i in range(len(pat)):
    for j in range(i + 1):
        print(pat[j], end="\t")
    print()
