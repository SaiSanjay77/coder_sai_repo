import tkinter as tk

root = tk.Tk()
root.title("LabelFrame Example")
root.geometry("300x200")

# Create a LabelFrame
info_frame = tk.LabelFrame(root, text="User Info", padx=10, pady=10)
info_frame.pack(padx=10, pady=10, fill="both", expand=True)

# Add widgets inside the LabelFrame
tk.Label(info_frame, text="Name:").grid(row=0, column=0, sticky="w")
tk.Entry(info_frame).grid(row=0, column=1)

tk.Label(info_frame, text="Age:").grid(row=1, column=0, sticky="w")
tk.Entry(info_frame).grid(row=1, column=1)

root.mainloop()