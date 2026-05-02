import threading
import time
import uvicorn
import webview
import socket

from app.main import app

def find_free_port():
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.bind(('', 0))
    port = s.getsockname()[1]
    s.close()
    return port

# Fixed port to ensure ease of setup, could use find_free_port if desired
PORT = 8000

def start_server():
    # run uvicorn server in the thread
    uvicorn.run(app, host="127.0.0.1", port=PORT, log_level="error")

if __name__ == '__main__':
    # Start the FastAPI server in a background thread
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    
    # Wait a moment for the server to actually start
    time.sleep(1)
    
    # Start the desktop window
    window = webview.create_window(
        'Controle Financeiro', 
        f'http://127.0.0.1:{PORT}', 
        width=1200, 
        height=800,
        min_size=(800, 600)
    )
    
    webview.start()
