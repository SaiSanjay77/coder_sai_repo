def is_perfect_square():
    num=int(input("Enter a number: "))
    if num < 0:
        return False
    else:
        root = int(num ** 0.5)
        if root * root == num:
            print("Perfect Square")
        else:
            print("Not a Perfect Square")
is_perfect_square()