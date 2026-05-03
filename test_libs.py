
import sys
import os

try:
    print("Testando ofxparse...")
    import ofxparse
    print("ofxparse OK")
except Exception as e:
    print(f"ERRO ofxparse: {e}")

try:
    print("Testando xlrd...")
    import xlrd
    print("xlrd OK")
except Exception as e:
    print(f"ERRO xlrd: {e}")

try:
    print("Testando openpyxl...")
    import openpyxl
    print("openpyxl OK")
except Exception as e:
    print(f"ERRO openpyxl: {e}")

try:
    print("Testando pdfplumber...")
    import pdfplumber
    print("pdfplumber OK")
except Exception as e:
    print(f"ERRO pdfplumber: {e}")
