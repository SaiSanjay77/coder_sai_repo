import tkinter as tk

root = tk.Tk()
root.title("PanedWindow Demo")
root.geometry("400x200")

# Create horizontal PanedWindow
paned = tk.PanedWindow(root, orient=tk.HORIZONTAL)
paned.pack(fill=tk.BOTH, expand=True)
left = tk.Label(paned, text="Left Pane", bg="lightblue")
paned.add(left)
right = tk.Label(paned, text="Right Pane", bg="lightgreen")
paned.add(right)
root.mainloop()