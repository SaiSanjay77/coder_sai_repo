sent=str(input("Enter a sentence: "))
def delete_last_word(sentence):
    words = sentence.split()
    if words:
        words.pop()  
    return ' '.join(words)
print("Sentence after deleting the last word:", delete_last_word(sent))