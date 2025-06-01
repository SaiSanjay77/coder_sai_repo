def is_happy_number():
    print("Happy Number")
    no = int(input("Enter a number: "))
    sq = 0
    seen = set()
    while no != 1 and no not in seen:
        seen.add(no)  
        for i in str(no):
            sq += int(i) ** 2
        no = sq
        sq = 0
    if no == 1:
        print("Happy Number")
    else:
        print("Not a Happy Number")
is_happy_number()
import strong_no
strong_no.strong_no()
