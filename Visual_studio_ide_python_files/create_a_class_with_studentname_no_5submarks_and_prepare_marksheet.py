class student:
    def __init__(self, name, roll_no):
        self.name = name
        self.roll_no = roll_no
        self.marks = []
    def add_marks(self, marks):
        if len(marks) == 5:
            self.marks = marks
        else:
            raise ValueError("Exactly 5 marks are required.")
    def calculate_total(self):
        return sum(self.marks)
    def calculate_average(self):
        return self.calculate_total() / len(self.marks)
    def __str__(self):
        return f"Name: {self.name}, Roll No: {self.roll_no}, Marks: {self.marks}"
    def prepare_marksheet(student):
        total = student.calculate_total()
        average = student.calculate_average()
        return f"Marks Sheet:\n{student}\nTotal Marks: {total}\nAverage Marks: {average:.2f}"
student1 = student("Dhoni", 7)
student1.add_marks([77, 77, 77, 77, 77])
print(student.prepare_marksheet(student1))