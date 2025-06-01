import tkinter as tk
from tkinter import messagebox
def show_msg():
    messagebox.showinfo("Hello", "This is a popup message!")
root = tk.Tk()
btn = tk.Button(root, text="Click me", command=show_msg)
btn.pack()
root.mainloop()