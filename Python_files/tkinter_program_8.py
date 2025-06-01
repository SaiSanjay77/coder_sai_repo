import tkinter as tk
def open_new_window():
    new_win = tk.Toplevel(root)
    new_win.title("New Window")
    new_win.geometry("200x100")
    tk.Label(new_win, text="Yo, this is a new window!").pack(pady=10)
root = tk.Tk()
root.title("Main Window")
root.geometry("300x200")
btn = tk.Button(root, text="Open Window", command=open_new_window)
btn.pack(pady=50)
root.mainloop()