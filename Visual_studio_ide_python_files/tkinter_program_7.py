import tkinter as tk
root = tk.Tk()
root.title("Scrollbar + Text")
root.geometry("300x200")
text_area = tk.Text(root, wrap="word")
text_area.pack(side="left", fill="both", expand=True)
scroll = tk.Scrollbar(root, command=text_area.yview)
scroll.pack(side="right", fill="y")
text_area.config(yscrollcommand=scroll.set)
for i in range(50):
    text_area.insert("end", f"Line {i+1}\n")
root.mainloop()