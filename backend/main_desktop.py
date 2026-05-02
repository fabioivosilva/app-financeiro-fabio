import threading
import time
import uvicorn
import webview
import socket
import requests

from app.main import app


def find_free_port():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def start_server(port):
    # run uvicorn server in the thread
    uvicorn.run(app, host="127.0.0.1", port=port, log_level="error")


SPLASH_HTML = """
<!DOCTYPE html>
<html>
<head>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    display: flex; align-items: center; justify-content: center;
    height: 100vh; background: linear-gradient(135deg, #820AD1 0%, #6b21a8 50%, #4c1d95 100%);
    font-family: 'Segoe UI', system-ui, sans-serif; color: white;
    overflow: hidden;
  }
  .container { text-align: center; animation: fadeIn 0.5s ease; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  .icon { font-size: 48px; margin-bottom: 16px; }
  h1 { font-size: 28px; font-weight: 600; margin-bottom: 8px; }
  p { font-size: 14px; opacity: 0.8; margin-bottom: 24px; }
  .loader {
    width: 48px; height: 48px; border: 4px solid rgba(255,255,255,0.2);
    border-top-color: white; border-radius: 50%;
    animation: spin 0.8s linear infinite; margin: 0 auto;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
</style>
</head>
<body>
  <div class="container">
    <div class="icon">💰</div>
    <h1>Controle Financeiro</h1>
    <p>Iniciando o sistema...</p>
    <div class="loader"></div>
  </div>
</body>
</html>
"""


def wait_and_navigate(window, port):
    """Wait for the server to be ready, then navigate to the app."""
    url = f"http://127.0.0.1:{port}"
    for _ in range(30):  # try for up to 15 seconds
        try:
            r = requests.get(f"{url}/api/", timeout=1)
            if r.status_code == 200:
                window.load_url(url)
                return
        except Exception:
            pass
        time.sleep(0.5)
    # If server never started, show error
    window.load_html("<h1 style='color:red;text-align:center;margin-top:40vh'>Erro: servidor não iniciou</h1>")


if __name__ == '__main__':
    port = find_free_port()

    # Start the FastAPI server in a background thread
    server_thread = threading.Thread(target=start_server, args=(port,), daemon=True)
    server_thread.start()

    # Show splash screen immediately (no wait!)
    window = webview.create_window(
        'Controle Financeiro',
        html=SPLASH_HTML,
        width=1200,
        height=800,
        min_size=(800, 600)
    )

    # Navigate to app once server is ready
    nav_thread = threading.Thread(target=wait_and_navigate, args=(window, port), daemon=True)
    nav_thread.start()

    webview.start()
