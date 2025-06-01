import threading
import time
def print_numbers(thread_name):
    for i in range(1, 6):
        print(f"{thread_name} prints {i}")
        time.sleep(1)
thread1 = threading.Thread(target=print_numbers, args=("Thread A",))
thread2 = threading.Thread(target=print_numbers, args=("Thread B",))
thread1.start()
thread2.start()
thread1.join()
thread2.join()
print("Both threads have finished execution.")
