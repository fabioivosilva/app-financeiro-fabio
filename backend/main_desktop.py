import threading
import time
import uvicorn
import webview
import socket

from app.main import app


def find_free_port():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def start_server(port):
    # run uvicorn server in the thread
    uvicorn.run(app, host="127.0.0.1", port=port, log_level="error")

if __name__ == '__main__':
    port = find_free_port()

    # Start the FastAPI server in a background thread
    server_thread = threading.Thread(target=start_server, args=(port,), daemon=True)
    server_thread.start()
    
    # Wait a moment for the server to actually start
    time.sleep(1)
    
    # Start the desktop window
    window = webview.create_window(
        'Controle Financeiro', 
        f'http://127.0.0.1:{port}',
        width=1200, 
        height=800,
        min_size=(800, 600)
    )
    
    webview.start()
