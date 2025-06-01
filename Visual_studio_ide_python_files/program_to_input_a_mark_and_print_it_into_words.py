mark = int(input("Enter a mark: "))
def number_to_words(n):
    words = {
        0: "zero", 1: "one", 2: "two", 3: "three", 4: "four",
        5: "five", 6: "six", 7: "seven", 8: "eight", 9: "nine",
        10: "ten", 11: "eleven", 12: "twelve", 13: "thirteen",
        14: "fourteen", 15: "fifteen", 16: "sixteen",
        17: "seventeen", 18: "eighteen", 19: "nineteen"
    }
    tens = ["", "", "twenty", "thirty", "forty", "fifty", 
            "sixty", "seventy", "eighty", "ninety"]
    if n < 20:
        return words[n]
    elif n < 100:
        return tens[n // 10] + ('' if n % 10 == 0 else ' ' + words[n % 10])
    else:
        return str(n)
print(number_to_words(mark))   