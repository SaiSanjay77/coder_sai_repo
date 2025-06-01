# udp_server.py
import socket

server = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
server.bind(('localhost', 9998))

print("UDP Server ready...")
data, addr = server.recvfrom(1024)
print(f"Received from {addr}: {data.decode()}")

server.sendto(b'Hello from UDP server!', addr)
