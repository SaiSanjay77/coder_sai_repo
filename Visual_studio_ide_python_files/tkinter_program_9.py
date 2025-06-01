import tkinter as tk

def show_selected():
    print("You picked:", spin.get())

root = tk.Tk()

spin = tk.Spinbox(root, from_=1, to=5, command=show_selected)
spin.pack()
root.mainloop()