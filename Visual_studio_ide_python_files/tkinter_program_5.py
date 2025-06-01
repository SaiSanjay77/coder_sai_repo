import tkinter as tk

def show_value(val):
    label.config(text=f"Slider at: {val}")

root = tk.Tk()
root.title("Scale (Slider) Demo")
root.geometry("300x200")

# Scale widget
slider = tk.Scale(root, from_=0, to=100, orient="horizontal", command=show_value)
slider.pack(pady=20)

# Label to show the value
label = tk.Label(root, text="Slider at: 0")
label.pack()

root.mainloop()
