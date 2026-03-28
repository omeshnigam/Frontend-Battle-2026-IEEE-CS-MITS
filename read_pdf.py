import sys
try:
    import pypdf
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pypdf", "--quiet"])
    import pypdf

try:
    reader = pypdf.PdfReader('BROCHURE.pdf')
    text = ""
    # Ignoring the last page as requested
    for i in range(len(reader.pages)):
        if i == len(reader.pages) - 1:
            break
        page = reader.pages[i]
        extracted = page.extract_text()
        if extracted:
            text += extracted + "\n"

    print("=== PDF START ===")
    print(text)
    print("=== PDF END ===")
except Exception as e:
    print(f"Error reading PDF: {e}")
