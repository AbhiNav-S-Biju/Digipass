#!/usr/bin/env python3
"""
Simple test script to verify ReportLab installation and basic PDF generation
"""

import sys
import json

try:
    from reportlab.lib.pagesizes import A4
    from reportlab.pdfgen import canvas
    from io import BytesIO
    
    print("ReportLab imported successfully", file=sys.stderr)
    
    # Read JSON from stdin
    data = json.loads(sys.stdin.read())
    
    print(f"Received user: {data.get('user', {}).get('full_name', 'Unknown')}", file=sys.stderr)
    print(f"Received {len(data.get('assets', []))} assets", file=sys.stderr)
    print(f"Received {len(data.get('executors', []))} executors", file=sys.stderr)
    
    # Create a simple PDF
    pdf_buffer = BytesIO()
    c = canvas.Canvas(pdf_buffer, pagesize=A4)
    
    # Write some test content
    c.drawString(50, 750, "DIGIPASS Digital Will")
    c.drawString(50, 700, f"User: {data.get('user', {}).get('full_name', 'Unknown')}")
    c.drawString(50, 650, f"Email: {data.get('user', {}).get('email', 'N/A')}")
    c.drawString(50, 600, f"Assets: {len(data.get('assets', []))}")
    c.drawString(50, 550, f"Executors: {len(data.get('executors', []))}")
    c.drawString(50, 500, "Test PDF Generated Successfully")
    
    c.save()
    
    # Get PDF data
    pdf_data = pdf_buffer.getvalue()
    print(f"Generated PDF of {len(pdf_data)} bytes", file=sys.stderr)
    
    # Write to stdout in binary mode
    sys.stdout.buffer.write(pdf_data)
    
except json.JSONDecodeError as e:
    sys.stderr.write(f"JSON parsing error: {str(e)}\n")
    sys.exit(1)
except ImportError as e:
    sys.stderr.write(f"Import error (missing dependency): {str(e)}\n")
    sys.stderr.write("Install reportlab: pip install reportlab\n")
    sys.exit(1)
except Exception as e:
    sys.stderr.write(f"Unexpected error: {str(e)}\n")
    import traceback
    sys.stderr.write(traceback.format_exc() + "\n")
    sys.exit(1)
