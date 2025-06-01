import tkinter as tk

def show_choice():
    chosen = lang.get()
    result_label.config(text=f"You picked: {chosen}")

root = tk.Tk()
root.title("Radio Button Demo")
root.geometry("300x200")
root.config(bg="lightblue")
# Shared variable for the radio buttons
lang = tk.StringVar(value="None")  # default value

# Radio button
tk.Radiobutton(root, text="Python", variable=lang, value="Python").pack(anchor='w')
tk.Radiobutton(root, text="JavaScript", variable=lang, value="JavaScript").pack(anchor='w')
tk.Radiobutton(root, text="C++", variable=lang, value="C++").pack(anchor='w')

# Button to confirm choice
tk.Button(root, text="Submit", command=show_choice).pack(pady=10)

# Label to show result
result_label = tk.Label(root, text="You picked: None")
result_label.pack()

root.mainloop()
