
import requests
import os

def test_upload(file_path):
    url = "http://127.0.0.1:8000/imports/upload"
    if not os.path.exists(file_path):
        print(f"ERRO: Arquivo nao encontrado em {file_path}")
        return

    print(f"Enviando {file_path} para {url}...")
    try:
        with open(file_path, 'rb') as f:
            files = {'file': (os.path.basename(file_path), f, 'application/octet-stream')}
            response = requests.post(url, files=files, timeout=10)
            
        print(f"Status Code: {response.status_code}")
        print(f"Resposta: {response.text}")
    except Exception as e:
        print(f"FALHA NA CONEXAO: {e}")

if __name__ == "__main__":
    # Testa os dois arquivos que voce tem
    test_upload(r"C:\Users\fabio\Downloads\Extrato Conta Corrente-020520260135.ofx")
    test_upload(r"C:\Users\fabio\Downloads\Fatura-Excel.xls")
