import customtkinter as ctk
from tkinter import messagebox

# --- BMI Calculation Function ---
def calculate_bmi():
    try:
        unit = unit_var.get()
        weight = float(weight_entry.get())

        if unit == "Metric":
            height = float(height_entry.get()) / 100  # cm → m
            bmi = weight / (height ** 2)

        elif unit == "Imperial":
            height = float(height_entry.get())  # inches
            bmi = (weight * 703) / (height ** 2)

        elif unit == "Feet & Inches":
            feet = float(feet_entry.get())
            inches = float(inches_entry.get())
            total_cm = (feet * 30.48) + (inches * 2.54)  # Convert to cm
            height = total_cm / 100  # cm → m
            bmi = weight / (height ** 2)

        else:
            raise ValueError("Invalid unit selection.")

        bmi = round(bmi, 2)

        # --- Category & Color (bright for dark mode) ---
        if bmi < 18.5:
            category = "Underweight"
            color = "#4aa3ff"  # bright blue
        elif 18.5 <= bmi < 24.9:
            category = "Normal weight"
            color = "#00ff88"  # bright green
        elif 25 <= bmi < 29.9:
            category = "Overweight"
            color = "#ffcc00"  # bright yellow
        else:
            category = "Obese"
            color = "#ff4444"  # bright red

        result_label.configure(text=f"{bmi} ({category})", text_color=color)
        result_label.update_idletasks()

    except ValueError:
        messagebox.showerror("Invalid Input", "Please enter valid numbers for weight and height.")

# --- Change Height Input Fields Based on Unit ---
def update_height_fields(choice):
    for widget in height_frame.winfo_children():
        widget.destroy()

    if choice == "Feet & Inches":
        ctk.CTkLabel(height_frame, text="Height:", font=("Arial", 14)).grid(row=0, column=0, columnspan=2, pady=2)

        ctk.CTkLabel(height_frame, text="Feet:").grid(row=1, column=0)
        global feet_entry
        feet_entry = ctk.CTkEntry(height_frame, width=70)
        feet_entry.grid(row=1, column=1, padx=5, pady=2)

        ctk.CTkLabel(height_frame, text="Inches:").grid(row=2, column=0)
        global inches_entry
        inches_entry = ctk.CTkEntry(height_frame, width=70)
        inches_entry.grid(row=2, column=1, padx=5, pady=2)

    else:
        label_text = "Height (cm):" if choice == "Metric" else "Height (inches):"
        ctk.CTkLabel(height_frame, text=label_text).pack()
        global height_entry
        height_entry = ctk.CTkEntry(height_frame, placeholder_text="Enter height", width=200)
        height_entry.pack(pady=5)

# --- App Window ---
ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("blue")

root = ctk.CTk()
root.title("BMI Calculator")
root.geometry("420x450")
root.resizable(True, True)

# Title
title_label = ctk.CTkLabel(root, text="BMI Calculator", font=("Arial", 22, "bold"))
title_label.pack(pady=10)

# Unit selection
unit_var = ctk.StringVar(value="Metric")
unit_label = ctk.CTkLabel(root, text="Select Unit System:")
unit_label.pack()
unit_dropdown = ctk.CTkComboBox(root, variable=unit_var,
                                 values=["Metric", "Imperial", "Feet & Inches"],
                                 width=200,
                                 command=update_height_fields)
unit_dropdown.pack(pady=5)

# Weight
weight_label = ctk.CTkLabel(root, text="Weight (kg or lbs):")
weight_label.pack()
weight_entry = ctk.CTkEntry(root, placeholder_text="Enter weight", width=200)
weight_entry.pack(pady=5)

# Height Frame
height_frame = ctk.CTkFrame(root)
height_frame.pack(pady=5)
update_height_fields("Metric")  # Default view

# Calculate Button
calc_button = ctk.CTkButton(root, text="Calculate BMI", command=calculate_bmi,
                             fg_color="#4CAF50", hover_color="#45a049")
calc_button.pack(pady=15)

# Result
result_text_label = ctk.CTkLabel(root, text="Your BMI is:", font=("Arial", 14))
result_text_label.pack()
result_label = ctk.CTkLabel(root, text="", font=("Arial", 24, "bold"))  # Bigger & bolder
result_label.pack(pady=10)

root.mainloop()
