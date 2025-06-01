import tkinter
root=tkinter.Tk()
root.title("My First Tkinter Program")
root.geometry("4000x1000")
widget=tkinter.Label(root, text="Hello World")
widget.pack(expand=True, fill='both')
widget.config(font=("Arial", 24), bg="lightblue", fg="black")
root.mainloop()