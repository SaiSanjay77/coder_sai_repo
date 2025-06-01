import tkinter 
top=tkinter.Tk()
widget=tkinter.Label(top,text="Hello World")
widget.pack(expand=True, fill='both')
widget.config(font=("Arial", 24), bg="lightblue", fg="black")
button=tkinter.Button(top, text="Click Me", command=lambda: print("Button Clicked!"))
button.pack()
top.mainloop()