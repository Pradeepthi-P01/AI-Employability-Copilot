from pypdf import PdfReader
import io

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """
    Extracts text from PDF bytes using PyPDF.
    Handles multi-column layouts by concatenating page texts.
    """
    text = ""
    try:
        pdf_file = io.BytesIO(pdf_bytes)
        reader = PdfReader(pdf_file)
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    except Exception as e:
        print(f"Error extracting PDF: {str(e)}")
        raise ValueError("Could not parse PDF file. Ensure it is a valid, uncorrupted PDF document.")
    
    if not text.strip():
        raise ValueError("No readable text found in the PDF. It might be scanned or image-only.")
        
    return text.strip()
