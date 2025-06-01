class MyIterator:
    def __init__(self, start, end):
        self.current = start
        self.end = end

    def __iter__(self):
        return self

    def __next__(self):
        if self.current > self.end:
            raise StopIteration
        else:
            num = self.current
            self.current += 1
            return num

# Usage
it = MyIterator(1, 5)
for i in it:
    print(i)
