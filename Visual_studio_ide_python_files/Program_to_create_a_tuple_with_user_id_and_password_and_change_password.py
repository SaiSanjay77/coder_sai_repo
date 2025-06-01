tup=("sai", "1234")
def change_password(user_id, old_password, new_password):
    global tup
    if user_id == tup[0] and old_password == tup[1]:
        tup = (user_id, new_password)
        print("Password changed successfully.")
    else:
        print("Invalid user ID or password.")
change_password("sai", "1234", "5678")