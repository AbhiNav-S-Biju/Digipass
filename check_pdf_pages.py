#!/usr/bin/env python3
"""Check how many pages are in the generated PDF"""

import PyPDF2
import os

pdf_path = "test_will.pdf"

if not os.path.exists(pdf_path):
    print(f"✗ {pdf_path} not found")
    exit(1)

try:
    with open(pdf_path, 'rb') as f:
        pdf_reader = PyPDF2.PdfReader(f)
        num_pages = len(pdf_reader.pages)
        print(f"✓ {pdf_path} has {num_pages} pages")
        
        # Check first and last page for keywords
        first_page = pdf_reader.pages[0].extract_text() if num_pages > 0 else ""
        last_page = pdf_reader.pages[-1].extract_text() if num_pages > 0 else ""
        
        print("\n--- FIRST PAGE (first 300 chars) ---")
        print(first_page[:300] if first_page else "(empty)")
        
        print("\n--- LAST PAGE (last 300 chars) ---")
        print(last_page[-300:] if last_page else "(empty)")
        
        if "SIGNATURE" in last_page or "NOTARY" in last_page or "TESTATOR" in last_page:
            print("\n✓ Signature page content detected!")
        else:
            print("\n✗ NO signature page content found!")
        
except ImportError:
    print("PyPDF2 not installed. Installing...")
    os.system("pip install PyPDF2")
except Exception as e:
    print(f"Error: {e}")
