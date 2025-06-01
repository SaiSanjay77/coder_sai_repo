def strong_no():
    def factorial(n):
        if n == 0 or n == 1:
            return 1
        else:
            return n * factorial(n - 1)

    no=int(input("Enter a number: "))
    list1=[int(x) for x in str(no)]
    st=0
    for i in list1:
        st+= factorial(i)
    if st==no:
        print("Strong Number")
    else:
        print("Not a Strong Number")
strong_no()