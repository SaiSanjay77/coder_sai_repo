# udp_client.py
import socket

client = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
client.sendto(b'Hello UDP server!', ('localhost', 9998))

data, addr = client.recvfrom(1024)
print("Response:", data.decode())
