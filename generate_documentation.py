"""
Script untuk Generate Dokumentasi PDF - Analisis Curah Hujan Web App

Author: Ferri Krisdiantoro
Contact: 
- WhatsApp: +6285351168279
- Instagram: @solusi.ai.praktis
- Website: ferrikrisdiantoro.com
- Fastwork: Ferri Krisdiantoro
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm, mm
from reportlab.lib.colors import HexColor, black, white
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, 
    PageBreak, Image, ListFlowable, ListItem
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY, TA_RIGHT
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from datetime import datetime
import os

# Path
BASE_DIR = r"D:\Projek\Freelancer\cl42_fw - Web App Regresi dan Prediksi Curah Hujan\webapp"
OUTPUT_PDF = os.path.join(BASE_DIR, "DOKUMENTASI_SISTEM.pdf")
TEMPLATE_DIR = os.path.join(BASE_DIR, "public", "template_dokumentasi")

# Colors
PRIMARY_COLOR = HexColor("#6366f1")
SECONDARY_COLOR = HexColor("#8b5cf6")
ACCENT_COLOR = HexColor("#4f46e5")
DARK_COLOR = HexColor("#1e293b")
LIGHT_COLOR = HexColor("#f8fafc")
MUTED_COLOR = HexColor("#64748b")

# Contact Info
CONTACT_INFO = {
    "wa": "+6285351168279",
    "ig": "@solusi.ai.praktis",
    "website": "ferrikrisdiantoro.com",
    "fastwork": "Ferri Krisdiantoro"
}

def create_styles():
    """Create custom paragraph styles"""
    styles = getSampleStyleSheet()
    
    # Title style
    styles.add(ParagraphStyle(
        name='CustomTitle',
        parent=styles['Title'],
        fontSize=28,
        textColor=DARK_COLOR,
        spaceAfter=30,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    ))
    
    # Heading 1
    styles.add(ParagraphStyle(
        name='Heading1Custom',
        parent=styles['Heading1'],
        fontSize=18,
        textColor=PRIMARY_COLOR,
        spaceAfter=12,
        spaceBefore=20,
        fontName='Helvetica-Bold'
    ))
    
    # Heading 2
    styles.add(ParagraphStyle(
        name='Heading2Custom',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=SECONDARY_COLOR,
        spaceAfter=8,
        spaceBefore=16,
        fontName='Helvetica-Bold'
    ))
    
    # Heading 3
    styles.add(ParagraphStyle(
        name='Heading3Custom',
        parent=styles['Heading3'],
        fontSize=12,
        textColor=ACCENT_COLOR,
        spaceAfter=6,
        spaceBefore=12,
        fontName='Helvetica-Bold'
    ))
    
    # Body text
    styles.add(ParagraphStyle(
        name='BodyCustom',
        parent=styles['Normal'],
        fontSize=10,
        textColor=DARK_COLOR,
        spaceAfter=8,
        alignment=TA_JUSTIFY,
        leading=14
    ))
    
    # Code style
    styles.add(ParagraphStyle(
        name='CodeCustom',
        parent=styles['Normal'],
        fontSize=9,
        fontName='Courier',
        textColor=DARK_COLOR,
        backColor=HexColor("#f1f5f9"),
        leftIndent=10,
        rightIndent=10,
        spaceAfter=8,
        leading=12
    ))
    
    # Caption
    styles.add(ParagraphStyle(
        name='Caption',
        parent=styles['Normal'],
        fontSize=9,
        textColor=MUTED_COLOR,
        alignment=TA_CENTER,
        spaceAfter=12
    ))
    
    # Footer style
    styles.add(ParagraphStyle(
        name='Footer',
        parent=styles['Normal'],
        fontSize=8,
        textColor=MUTED_COLOR,
        alignment=TA_CENTER
    ))
    
    return styles

def create_header_footer(canvas, doc):
    """Add header and footer to each page"""
    canvas.saveState()
    
    # Header line
    canvas.setStrokeColor(PRIMARY_COLOR)
    canvas.setLineWidth(2)
    canvas.line(2*cm, A4[1] - 1.5*cm, A4[0] - 2*cm, A4[1] - 1.5*cm)
    
    # Header text
    canvas.setFont('Helvetica-Bold', 10)
    canvas.setFillColor(PRIMARY_COLOR)
    canvas.drawString(2*cm, A4[1] - 1.3*cm, "Dokumentasi Sistem Analisis Curah Hujan")
    
    # Page number
    canvas.setFont('Helvetica', 9)
    canvas.setFillColor(MUTED_COLOR)
    page_num = f"Halaman {doc.page}"
    canvas.drawRightString(A4[0] - 2*cm, A4[1] - 1.3*cm, page_num)
    
    # Footer line
    canvas.setStrokeColor(LIGHT_COLOR)
    canvas.setLineWidth(1)
    canvas.line(2*cm, 1.5*cm, A4[0] - 2*cm, 1.5*cm)
    
    # Footer content
    canvas.setFont('Helvetica', 8)
    canvas.setFillColor(MUTED_COLOR)
    footer_text = f"© 2026 Ferri Krisdiantoro | WA: {CONTACT_INFO['wa']} | IG: {CONTACT_INFO['ig']} | {CONTACT_INFO['website']}"
    canvas.drawCentredString(A4[0]/2, 1*cm, footer_text)
    
    canvas.restoreState()

def create_cover_page(styles):
    """Create cover page elements"""
    elements = []
    
    elements.append(Spacer(1, 4*cm))
    
    # Main title
    elements.append(Paragraph(
        "📊 DOKUMENTASI SISTEM", 
        styles['CustomTitle']
    ))
    
    elements.append(Spacer(1, 0.5*cm))
    
    elements.append(Paragraph(
        "<font color='#6366f1' size='20'><b>Analisis Curah Hujan</b></font>", 
        ParagraphStyle(name='Subtitle', alignment=TA_CENTER, fontSize=20, spaceAfter=8)
    ))
    
    elements.append(Paragraph(
        "<font color='#8b5cf6' size='14'>Web Application untuk Regresi dan Prediksi</font>", 
        ParagraphStyle(name='Tagline', alignment=TA_CENTER, fontSize=14, spaceAfter=30)
    ))
    
    elements.append(Spacer(1, 2*cm))
    
    # Info box
    info_data = [
        ['Versi', '1.0.0'],
        ['Tanggal', datetime.now().strftime('%d %B %Y')],
        ['Platform', 'Next.js + ONNX Runtime'],
        ['Author', 'Ferri Krisdiantoro'],
    ]
    
    info_table = Table(info_data, colWidths=[5*cm, 8*cm])
    info_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), HexColor("#eef2ff")),
        ('TEXTCOLOR', (0, 0), (0, -1), PRIMARY_COLOR),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('PADDING', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor("#e2e8f0")),
    ]))
    
    elements.append(info_table)
    
    elements.append(Spacer(1, 3*cm))
    
    # Contact info
    elements.append(Paragraph(
        "<font color='#64748b' size='10'>Contact Information:</font>",
        ParagraphStyle(name='ContactHeader', alignment=TA_CENTER, spaceAfter=8)
    ))
    
    elements.append(Paragraph(
        f"<font color='#6366f1'>📞 WhatsApp:</font> {CONTACT_INFO['wa']} | "
        f"<font color='#6366f1'>📸 Instagram:</font> {CONTACT_INFO['ig']}",
        ParagraphStyle(name='Contact1', alignment=TA_CENTER, fontSize=10, spaceAfter=4)
    ))
    
    elements.append(Paragraph(
        f"<font color='#6366f1'>🌐 Website:</font> {CONTACT_INFO['website']} | "
        f"<font color='#6366f1'>💼 Fastwork:</font> {CONTACT_INFO['fastwork']}",
        ParagraphStyle(name='Contact2', alignment=TA_CENTER, fontSize=10)
    ))
    
    elements.append(PageBreak())
    
    return elements

def create_toc(styles):
    """Create table of contents"""
    elements = []
    
    elements.append(Paragraph("DAFTAR ISI", styles['Heading1Custom']))
    elements.append(Spacer(1, 0.5*cm))
    
    toc_items = [
        ("1. Pendahuluan", "3"),
        ("2. Arsitektur Sistem", "4"),
        ("3. Modul Analisis Regresi", "6"),
        ("4. Modul Prediksi Curah Hujan", "10"),
        ("5. Machine Learning Models", "14"),
        ("6. API Documentation", "18"),
        ("7. Komponen UI", "22"),
        ("8. Panduan Penggunaan", "24"),
        ("9. Deployment Guide", "27"),
        ("10. Troubleshooting", "29"),
    ]
    
    toc_data = [[item[0], "." * 50, item[1]] for item in toc_items]
    toc_table = Table(toc_data, colWidths=[8*cm, 6*cm, 2*cm])
    toc_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TEXTCOLOR', (0, 0), (0, -1), DARK_COLOR),
        ('TEXTCOLOR', (1, 0), (1, -1), MUTED_COLOR),
        ('TEXTCOLOR', (2, 0), (2, -1), PRIMARY_COLOR),
        ('ALIGN', (2, 0), (2, -1), 'RIGHT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    
    elements.append(toc_table)
    elements.append(PageBreak())
    
    return elements

def create_intro_section(styles):
    """Create introduction section"""
    elements = []
    
    elements.append(Paragraph("1. PENDAHULUAN", styles['Heading1Custom']))
    
    elements.append(Paragraph("1.1 Latar Belakang", styles['Heading2Custom']))
    elements.append(Paragraph(
        "Sistem Analisis Curah Hujan adalah aplikasi web modern yang dirancang untuk membantu "
        "dalam analisis data hidrologi, khususnya pengolahan data curah hujan menggunakan "
        "metode regresi statistik dan prediksi berbasis Machine Learning. Aplikasi ini "
        "dikembangkan menggunakan teknologi Next.js dengan inferensi model ONNX untuk "
        "deployment yang optimal di environment serverless.",
        styles['BodyCustom']
    ))
    
    elements.append(Paragraph("1.2 Tujuan Sistem", styles['Heading2Custom']))
    elements.append(Paragraph(
        "Sistem ini bertujuan untuk menyediakan:",
        styles['BodyCustom']
    ))
    
    objectives = [
        "Analisis regresi dengan 6 metode berbeda (Linear, Polynomial, Exponential, Power, Logarithmic, Moving Average)",
        "Prediksi curah hujan menggunakan 3 model Machine Learning (Gradient Boosting, LSTM, BiLSTM)",
        "Visualisasi data interaktif dengan Chart.js",
        "Export hasil analisis dalam format PNG dan CSV",
        "Antarmuka yang responsif dan user-friendly",
    ]
    
    for obj in objectives:
        elements.append(Paragraph(f"• {obj}", styles['BodyCustom']))
    
    elements.append(Paragraph("1.3 Teknologi yang Digunakan", styles['Heading2Custom']))
    
    tech_data = [
        ['Komponen', 'Teknologi', 'Versi'],
        ['Frontend', 'Next.js (React)', '16.1.1'],
        ['Backend API', 'Next.js API Routes', '16.1.1'],
        ['ML Runtime', 'ONNX Runtime Node', '^1.20.1'],
        ['Charting', 'Chart.js + react-chartjs-2', '4.x / 5.x'],
        ['Styling', 'CSS Custom Properties', '-'],
        ['Language', 'TypeScript', '5.x'],
        ['Package Manager', 'npm', '10.x'],
    ]
    
    tech_table = Table(tech_data, colWidths=[4*cm, 6*cm, 3*cm])
    tech_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor("#e2e8f0")),
        ('PADDING', (0, 0), (-1, -1), 8),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [white, HexColor("#f8fafc")]),
    ]))
    
    elements.append(tech_table)
    elements.append(PageBreak())
    
    return elements

def create_architecture_section(styles):
    """Create architecture section"""
    elements = []
    
    elements.append(Paragraph("2. ARSITEKTUR SISTEM", styles['Heading1Custom']))
    
    elements.append(Paragraph("2.1 Struktur Direktori", styles['Heading2Custom']))
    elements.append(Paragraph(
        "Proyek ini mengikuti konvensi standar Next.js App Router dengan struktur sebagai berikut:",
        styles['BodyCustom']
    ))
    
    dir_structure = """
webapp/
├── public/
│   └── models/           # ONNX model files
│       ├── model_gbr.onnx
│       ├── model_lstm.onnx
│       └── model_bilstm.onnx
├── src/
│   ├── app/
│   │   ├── api/          # API Routes
│   │   │   ├── predict/
│   │   │   └── regression/
│   │   ├── prediction/   # Prediction page
│   │   ├── regression/   # Regression page
│   │   ├── layout.tsx    # Root layout
│   │   ├── page.tsx      # Home page
│   │   └── globals.css   # Global styles
│   ├── components/       # Reusable components
│   │   ├── ChartComponent.tsx
│   │   ├── CsvUploader.tsx
│   │   ├── DataTable.tsx
│   │   ├── Icon.tsx
│   │   └── Navbar.tsx
│   ├── lib/              # Utility libraries
│   │   ├── exportUtils.ts
│   │   ├── onnxLoader.ts
│   │   └── regression.ts
│   └── types/            # TypeScript types
│       └── index.ts
└── notebook/
    └── prediksi_hujan.ipynb  # Training notebook
"""
    
    elements.append(Paragraph(f"<pre>{dir_structure}</pre>", styles['CodeCustom']))
    
    elements.append(Paragraph("2.2 Alur Data (Data Flow)", styles['Heading2Custom']))
    elements.append(Paragraph(
        "Sistem menggunakan arsitektur client-server dengan Next.js sebagai full-stack framework:",
        styles['BodyCustom']
    ))
    
    flow_steps = [
        "User Input: Data diinput melalui form manual atau upload CSV",
        "Client Processing: Data divalidasi dan diformat di browser",
        "API Request: Data dikirim ke Next.js API Routes",
        "Server Processing: API melakukan kalkulasi regresi atau inferensi ML",
        "Model Inference: ONNX Runtime menjalankan model prediksi",
        "Response: Hasil dikembalikan dalam format JSON",
        "Visualization: Chart.js merender grafik hasil analisis",
        "Export: User dapat mengekspor hasil ke PNG atau CSV",
    ]
    
    for i, step in enumerate(flow_steps, 1):
        elements.append(Paragraph(f"<b>{i}.</b> {step}", styles['BodyCustom']))
    
    elements.append(Paragraph("2.3 Deployment Architecture", styles['Heading2Custom']))
    elements.append(Paragraph(
        "Aplikasi ini dirancang untuk deployment di Vercel dengan arsitektur serverless. "
        "Model ONNX disimpan di folder public dan diload secara lazy saat pertama kali dibutuhkan. "
        "Session model di-cache menggunakan singleton pattern untuk optimasi performa.",
        styles['BodyCustom']
    ))
    
    deploy_data = [
        ['Aspek', 'Konfigurasi'],
        ['Hosting', 'Vercel (Serverless)'],
        ['Build', 'Next.js Static + Dynamic Routes'],
        ['API', 'Serverless Functions'],
        ['Model Loading', 'Lazy + Singleton Cache'],
        ['Static Assets', 'Vercel CDN'],
    ]
    
    deploy_table = Table(deploy_data, colWidths=[5*cm, 8*cm])
    deploy_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), SECONDARY_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor("#e2e8f0")),
        ('PADDING', (0, 0), (-1, -1), 8),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [white, HexColor("#f8fafc")]),
    ]))
    
    elements.append(deploy_table)
    elements.append(PageBreak())
    
    return elements

def create_regression_section(styles):
    """Create regression module section"""
    elements = []
    
    elements.append(Paragraph("3. MODUL ANALISIS REGRESI", styles['Heading1Custom']))
    
    elements.append(Paragraph("3.1 Deskripsi Modul", styles['Heading2Custom']))
    elements.append(Paragraph(
        "Modul Analisis Regresi menyediakan kemampuan fitting data dengan berbagai model matematika. "
        "Modul ini cocok untuk analisis hubungan antara dua variabel, seperti hubungan antara "
        "debit air (flow) dan tinggi muka air (water level).",
        styles['BodyCustom']
    ))
    
    elements.append(Paragraph("3.2 Metode Regresi yang Tersedia", styles['Heading2Custom']))
    
    methods = [
        {
            'name': 'Linear Regression',
            'formula': 'y = a + bx',
            'desc': 'Regresi linier sederhana untuk hubungan proporsional antara X dan Y.',
            'use_case': 'Hubungan linear seperti kecepatan vs jarak'
        },
        {
            'name': 'Polynomial Regression',
            'formula': 'y = a₀ + a₁x + a₂x² + ... + aₙxⁿ',
            'desc': 'Regresi polynomial untuk kurva non-linear dengan degree 2-6.',
            'use_case': 'Kurva parabola, kubik, atau pola kompleks'
        },
        {
            'name': 'Exponential Regression',
            'formula': 'y = a × e^(bx)',
            'desc': 'Regresi eksponensial untuk pertumbuhan/penurunan eksponensial.',
            'use_case': 'Pertumbuhan populasi, peluruhan radioaktif'
        },
        {
            'name': 'Power Regression',
            'formula': 'y = ax^b',
            'desc': 'Regresi power untuk hubungan pangkat antara variabel.',
            'use_case': 'Kurva rating (Q-H), hukum fisika'
        },
        {
            'name': 'Logarithmic Regression',
            'formula': 'y = a + b ln(x)',
            'desc': 'Regresi logaritmik untuk kurva yang melambat.',
            'use_case': 'Kurva pembelajaran, diminishing returns'
        },
        {
            'name': 'Moving Average',
            'formula': 'MA(n) = (x₁ + x₂ + ... + xₙ) / n',
            'desc': 'Rata-rata bergerak untuk smoothing data time series.',
            'use_case': 'Trend detection, noise reduction'
        },
    ]
    
    for method in methods:
        elements.append(Paragraph(f"<b>{method['name']}</b>", styles['Heading3Custom']))
        elements.append(Paragraph(f"<i>Formula:</i> <font color='#6366f1'>{method['formula']}</font>", styles['BodyCustom']))
        elements.append(Paragraph(method['desc'], styles['BodyCustom']))
        elements.append(Paragraph(f"<i>Use Case:</i> {method['use_case']}", styles['BodyCustom']))
    
    elements.append(Paragraph("3.3 Metrik Evaluasi", styles['Heading2Custom']))
    elements.append(Paragraph(
        "Setiap hasil regresi dilengkapi dengan metrik evaluasi untuk menilai kualitas fitting:",
        styles['BodyCustom']
    ))
    
    metrics_data = [
        ['Metrik', 'Rumus', 'Interpretasi'],
        ['R² (Coefficient of Determination)', '1 - (SS_res / SS_tot)', '0-1, semakin tinggi semakin baik'],
        ['MAE (Mean Absolute Error)', 'Σ|y - ŷ| / n', 'Error rata-rata, satuan sama dengan Y'],
        ['RMSE (Root Mean Square Error)', '√(Σ(y - ŷ)² / n)', 'Error kuadrat, sensitif terhadap outlier'],
    ]
    
    metrics_table = Table(metrics_data, colWidths=[4*cm, 5*cm, 5*cm])
    metrics_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor("#e2e8f0")),
        ('PADDING', (0, 0), (-1, -1), 6),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    
    elements.append(metrics_table)
    
    elements.append(Paragraph("3.4 Implementasi Teknis", styles['Heading2Custom']))
    elements.append(Paragraph(
        "Kalkulasi regresi diimplementasikan dalam file <font color='#6366f1'>src/lib/regression.ts</font> "
        "dengan algoritma yang dioptimasi untuk browser dan Node.js. Polynomial regression menggunakan "
        "Gaussian elimination dengan partial pivoting untuk stabilitas numerik.",
        styles['BodyCustom']
    ))
    
    code_example = """
// Contoh penggunaan API Regresi
const response = await fetch('/api/regression', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        data: [{ x: 100, y: 15 }, { x: 200, y: 22 }],
        type: 'linear'  // atau 'polynomial', 'exponential', dll
    })
});

const result = await response.json();
// result.formula = "y = 11.9707 + 0.0001x"
// result.r2 = 0.9624
"""
    elements.append(Paragraph(f"<pre>{code_example}</pre>", styles['CodeCustom']))
    
    elements.append(PageBreak())
    
    return elements

def create_prediction_section(styles):
    """Create prediction module section"""
    elements = []
    
    elements.append(Paragraph("4. MODUL PREDIKSI CURAH HUJAN", styles['Heading1Custom']))
    
    elements.append(Paragraph("4.1 Deskripsi Modul", styles['Heading2Custom']))
    elements.append(Paragraph(
        "Modul Prediksi Curah Hujan menggunakan Machine Learning untuk memprediksi curah hujan "
        "1-30 hari ke depan berdasarkan data historis. Sistem ini menggunakan tiga model yang "
        "telah dilatih dan diekspor ke format ONNX untuk inferensi yang cepat di server.",
        styles['BodyCustom']
    ))
    
    elements.append(Paragraph("4.2 Model Machine Learning", styles['Heading2Custom']))
    
    models = [
        {
            'name': 'Gradient Boosting Regressor (GBR)',
            'type': 'Tabular ML',
            'input': '7 features (lag, rolling stats, month)',
            'mae': '6.42 mm',
            'rmse': '11.28 mm',
            'desc': 'Model ensemble berbasis decision tree yang efektif untuk data tabular dengan feature engineering manual.',
            'features': ['lag_1 (curah hujan kemarin)', 'lag_3 (3 hari lalu)', 'lag_7 (7 hari lalu)', 
                        'roll_mean_3 (rata-rata 3 hari)', 'roll_mean_7 (rata-rata 7 hari)',
                        'roll_max_7 (maksimum 7 hari)', 'bulan_idx (indeks bulan 0-11)']
        },
        {
            'name': 'LSTM (Long Short-Term Memory)',
            'type': 'Deep Learning',
            'input': 'Sequence [1, 7, 1]',
            'mae': '7.15 mm',
            'rmse': '12.03 mm',
            'desc': 'Model recurrent neural network yang mampu menangkap dependensi jangka panjang dalam data sekuensial.',
            'features': ['7 nilai curah hujan berurutan sebagai input sequence']
        },
        {
            'name': 'BiLSTM (Bidirectional LSTM)',
            'type': 'Deep Learning',
            'input': 'Sequence [1, 7, 1]',
            'mae': '6.89 mm',
            'rmse': '11.67 mm',
            'desc': 'Varian LSTM yang memproses sequence dari dua arah untuk konteks yang lebih kaya.',
            'features': ['7 nilai curah hujan berurutan, diproses forward dan backward']
        },
    ]
    
    for model in models:
        elements.append(Paragraph(f"<b>{model['name']}</b>", styles['Heading3Custom']))
        
        model_info = [
            ['Tipe', model['type']],
            ['Input Shape', model['input']],
            ['MAE (Test)', model['mae']],
            ['RMSE (Test)', model['rmse']],
        ]
        
        model_table = Table(model_info, colWidths=[4*cm, 9*cm])
        model_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), HexColor("#eef2ff")),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('GRID', (0, 0), (-1, -1), 0.5, HexColor("#e2e8f0")),
            ('PADDING', (0, 0), (-1, -1), 6),
        ]))
        
        elements.append(model_table)
        elements.append(Paragraph(model['desc'], styles['BodyCustom']))
        
        elements.append(Paragraph("<i>Features:</i>", styles['BodyCustom']))
        for feat in model['features']:
            elements.append(Paragraph(f"  • {feat}", styles['BodyCustom']))
    
    elements.append(Paragraph("4.3 Recursive Forecasting", styles['Heading2Custom']))
    elements.append(Paragraph(
        "Untuk prediksi multi-step (lebih dari 1 hari), sistem menggunakan strategi recursive forecasting. "
        "Prediksi hari ke-n digunakan sebagai input untuk memprediksi hari ke-(n+1). "
        "Metode ini memungkinkan prediksi hingga 30 hari ke depan dari 7 hari data historis.",
        styles['BodyCustom']
    ))
    
    recursive_steps = [
        "Input: 7 nilai historis terakhir [d₁, d₂, ..., d₇]",
        "Prediksi d₈ menggunakan model",
        "Update input menjadi [d₂, d₃, ..., d₇, d₈]",
        "Prediksi d₉ menggunakan model",
        "Ulangi hingga horizon tercapai (maks 30 hari)",
    ]
    
    for i, step in enumerate(recursive_steps, 1):
        elements.append(Paragraph(f"<b>Step {i}:</b> {step}", styles['BodyCustom']))
    
    elements.append(PageBreak())
    
    return elements

def create_ml_section(styles):
    """Create ML models technical section"""
    elements = []
    
    elements.append(Paragraph("5. MACHINE LEARNING MODELS", styles['Heading1Custom']))
    
    elements.append(Paragraph("5.1 Training Pipeline (Notebook)", styles['Heading2Custom']))
    elements.append(Paragraph(
        "Model dilatih menggunakan Jupyter Notebook dengan file <font color='#6366f1'>notebook/prediksi_hujan.ipynb</font>. "
        "Berikut adalah tahapan training yang dilakukan:",
        styles['BodyCustom']
    ))
    
    training_steps = [
        "Data Loading: Membaca dataset curah hujan harian dari file CSV",
        "Feature Engineering: Membuat lag features, rolling statistics, dan seasonal features",
        "Data Splitting: Membagi data menjadi train (80%) dan test (20%)",
        "Model Training: Melatih GBR, LSTM, dan BiLSTM dengan hyperparameter tuning",
        "Model Evaluation: Mengevaluasi performa dengan MAE, RMSE pada test set",
        "ONNX Export: Mengekspor model ke format ONNX untuk deployment web",
    ]
    
    for i, step in enumerate(training_steps, 1):
        elements.append(Paragraph(f"<b>{i}.</b> {step}", styles['BodyCustom']))
    
    elements.append(Paragraph("5.2 Feature Engineering Details", styles['Heading2Custom']))
    elements.append(Paragraph(
        "Feature engineering adalah kunci untuk performa model GBR. Berikut adalah features yang digunakan:",
        styles['BodyCustom']
    ))
    
    features_data = [
        ['Feature', 'Deskripsi', 'Formula/Metode'],
        ['lag_1', 'Curah hujan 1 hari sebelumnya', 'y[t-1]'],
        ['lag_3', 'Curah hujan 3 hari sebelumnya', 'y[t-3]'],
        ['lag_7', 'Curah hujan 7 hari sebelumnya', 'y[t-7]'],
        ['roll_mean_3', 'Rata-rata 3 hari terakhir', 'mean(y[t-3:t])'],
        ['roll_mean_7', 'Rata-rata 7 hari terakhir', 'mean(y[t-7:t])'],
        ['roll_max_7', 'Maksimum 7 hari terakhir', 'max(y[t-7:t])'],
        ['bulan_idx', 'Indeks bulan (seasonality)', 'month(date) - 1'],
    ]
    
    features_table = Table(features_data, colWidths=[3*cm, 5*cm, 5*cm])
    features_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), SECONDARY_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor("#e2e8f0")),
        ('PADDING', (0, 0), (-1, -1), 6),
    ]))
    
    elements.append(features_table)
    
    elements.append(Paragraph("5.3 ONNX Runtime Integration", styles['Heading2Custom']))
    elements.append(Paragraph(
        "ONNX (Open Neural Network Exchange) digunakan sebagai format portable untuk deployment model. "
        "Keuntungan menggunakan ONNX:",
        styles['BodyCustom']
    ))
    
    onnx_benefits = [
        "Cross-platform: Dapat dijalankan di berbagai environment (Python, Node.js, browser)",
        "Optimized: Runtime yang dioptimasi untuk CPU inference",
        "Lightweight: Ukuran model lebih kecil dibanding format asli",
        "Serverless-friendly: Cocok untuk Vercel dan AWS Lambda",
    ]
    
    for benefit in onnx_benefits:
        elements.append(Paragraph(f"• {benefit}", styles['BodyCustom']))
    
    elements.append(Paragraph("5.4 Model Files", styles['Heading2Custom']))
    
    model_files = [
        ['File', 'Size', 'Input Shape', 'Description'],
        ['model_gbr.onnx', '200 KB', '[1, 7]', 'Gradient Boosting with 7 features'],
        ['model_lstm.onnx', '37 KB', '[1, 7, 1]', 'LSTM sequence model'],
        ['model_bilstm.onnx', '96 KB', '[1, 7, 1]', 'Bidirectional LSTM'],
    ]
    
    files_table = Table(model_files, colWidths=[4*cm, 2*cm, 3*cm, 5*cm])
    files_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor("#e2e8f0")),
        ('PADDING', (0, 0), (-1, -1), 6),
    ]))
    
    elements.append(files_table)
    elements.append(PageBreak())
    
    return elements

def create_api_section(styles):
    """Create API documentation section"""
    elements = []
    
    elements.append(Paragraph("6. API DOCUMENTATION", styles['Heading1Custom']))
    
    elements.append(Paragraph("6.1 Regression API", styles['Heading2Custom']))
    
    elements.append(Paragraph("<b>Endpoint:</b> <font color='#6366f1'>POST /api/regression</font>", styles['BodyCustom']))
    elements.append(Paragraph("Melakukan analisis regresi pada data X-Y.", styles['BodyCustom']))
    
    elements.append(Paragraph("<b>Request Body:</b>", styles['BodyCustom']))
    req_code = """
{
    "data": [
        { "x": 33262.03, "y": 14.44 },
        { "x": 48285.70, "y": 18.16 },
        ...
    ],
    "type": "linear" | "polynomial" | "exponential" | 
            "power" | "logarithmic" | "moving-average",
    "degree": 2  // Optional, for polynomial (2-6) or MA window
}
"""
    elements.append(Paragraph(f"<pre>{req_code}</pre>", styles['CodeCustom']))
    
    elements.append(Paragraph("<b>Response:</b>", styles['BodyCustom']))
    resp_code = """
{
    "type": "linear",
    "formula": "y = 11.9707 + 0.0001x",
    "coefficients": [11.9707, 0.0001],
    "r2": 0.9624,
    "mae": 0.6594,
    "rmse": 0.7725,
    "predictions": [14.32, 17.89, ...]
}
"""
    elements.append(Paragraph(f"<pre>{resp_code}</pre>", styles['CodeCustom']))
    
    elements.append(Paragraph("6.2 Prediction API", styles['Heading2Custom']))
    
    elements.append(Paragraph("<b>Endpoint:</b> <font color='#6366f1'>POST /api/predict</font>", styles['BodyCustom']))
    elements.append(Paragraph("Melakukan prediksi curah hujan menggunakan model ML.", styles['BodyCustom']))
    
    elements.append(Paragraph("<b>Request Body:</b>", styles['BodyCustom']))
    pred_req = """
{
    "model": "gbr" | "lstm" | "bilstm",
    "horizon": 7,  // 1-30 days
    "historicalData": [
        { "date": "2024-11-01", "value": 12.5 },
        { "date": "2024-11-02", "value": 8.3 },
        ...  // min 7 data points
    ]
}
"""
    elements.append(Paragraph(f"<pre>{pred_req}</pre>", styles['CodeCustom']))
    
    elements.append(Paragraph("<b>Response:</b>", styles['BodyCustom']))
    pred_resp = """
{
    "success": true,
    "model": {
        "name": "Gradient Boosting Regressor",
        "mae": 6.42,
        "rmse": 11.28
    },
    "predictions": [
        { "date": "2024-12-01", "value": 15.32 },
        { "date": "2024-12-02", "value": 12.78 },
        ...
    ]
}
"""
    elements.append(Paragraph(f"<pre>{pred_resp}</pre>", styles['CodeCustom']))
    
    elements.append(Paragraph("6.3 Error Handling", styles['Heading2Custom']))
    
    errors_data = [
        ['Status Code', 'Error', 'Penyebab'],
        ['400', 'Invalid request body', 'Body request tidak valid'],
        ['400', 'At least 2 data points required', 'Data kurang dari minimum'],
        ['400', 'Invalid regression type', 'Tipe regresi tidak dikenal'],
        ['400', 'At least 7 historical data points', 'Data historis kurang untuk ML'],
        ['500', 'Regression calculation failed', 'Error internal saat kalkulasi'],
        ['500', 'Model inference failed', 'Error saat inferensi ONNX'],
    ]
    
    errors_table = Table(errors_data, colWidths=[2.5*cm, 5*cm, 6*cm])
    errors_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), HexColor("#ef4444")),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor("#e2e8f0")),
        ('PADDING', (0, 0), (-1, -1), 6),
    ]))
    
    elements.append(errors_table)
    elements.append(PageBreak())
    
    return elements

def create_components_section(styles):
    """Create UI components section"""
    elements = []
    
    elements.append(Paragraph("7. KOMPONEN UI", styles['Heading1Custom']))
    
    elements.append(Paragraph("7.1 Daftar Komponen", styles['Heading2Custom']))
    
    components = [
        {
            'name': 'Navbar',
            'file': 'src/components/Navbar.tsx',
            'desc': 'Navigation bar responsif dengan hamburger menu untuk mobile. Menampilkan logo, judul aplikasi, dan link ke halaman Beranda, Regresi, dan Prediksi.'
        },
        {
            'name': 'ChartComponent',
            'file': 'src/components/ChartComponent.tsx',
            'desc': 'Wrapper untuk Chart.js yang mendukung scatter plot dan line chart. Menerima props untuk data, title, dan axis labels yang dapat dikustomisasi.'
        },
        {
            'name': 'DataTable',
            'file': 'src/components/DataTable.tsx',
            'desc': 'Tabel interaktif untuk menampilkan dan mengedit data. Mendukung checkbox toggle untuk enable/disable data point dan input edit inline.'
        },
        {
            'name': 'CsvUploader',
            'file': 'src/components/CsvUploader.tsx',
            'desc': 'Komponen upload file CSV dengan drag-and-drop. Mendukung dua mode: XY data (x,y columns) dan timeseries (date,value columns).'
        },
        {
            'name': 'Icon',
            'file': 'src/components/Icon.tsx',
            'desc': 'Library SVG icons dengan 15+ icons termasuk home, chart-line, download, copy, rocket, dll. Ukuran dan warna dapat dikustomisasi.'
        },
    ]
    
    for comp in components:
        elements.append(Paragraph(f"<b>{comp['name']}</b>", styles['Heading3Custom']))
        elements.append(Paragraph(f"<i>File:</i> <font color='#6366f1'>{comp['file']}</font>", styles['BodyCustom']))
        elements.append(Paragraph(comp['desc'], styles['BodyCustom']))
    
    elements.append(Paragraph("7.2 Utility Libraries", styles['Heading2Custom']))
    
    libs = [
        {
            'name': 'exportUtils.ts',
            'desc': 'Fungsi untuk export chart sebagai PNG dan data sebagai CSV.',
            'functions': ['exportChartAsPNG()', 'exportXYDataAsCSV()', 'exportTimeSeriesAsCSV()']
        },
        {
            'name': 'regression.ts',
            'desc': 'Implementasi algoritma regresi (6 metode) dengan kalkulasi metrik.',
            'functions': ['linearRegression()', 'polynomialRegression()', 'exponentialRegression()', 'powerRegression()', 'logarithmicRegression()', 'movingAverageRegression()']
        },
        {
            'name': 'onnxLoader.ts',
            'desc': 'ONNX model loader dengan singleton pattern dan feature preparation.',
            'functions': ['getOnnxSession()', 'runModelInference()', 'recursiveForecast()', 'prepareGBRFeatures()', 'prepareLSTMFeatures()']
        },
    ]
    
    for lib in libs:
        elements.append(Paragraph(f"<b>{lib['name']}</b>", styles['Heading3Custom']))
        elements.append(Paragraph(lib['desc'], styles['BodyCustom']))
        elements.append(Paragraph("<i>Functions:</i> " + ", ".join([f"<font color='#6366f1'>{f}</font>" for f in lib['functions']]), styles['BodyCustom']))
    
    elements.append(PageBreak())
    
    return elements

def create_usage_section(styles):
    """Create usage guide section"""
    elements = []
    
    elements.append(Paragraph("8. PANDUAN PENGGUNAAN", styles['Heading1Custom']))
    
    elements.append(Paragraph("8.1 Modul Regresi", styles['Heading2Custom']))
    
    regression_steps = [
        ("Input Data", "Upload file CSV dengan kolom X dan Y, atau input data secara manual melalui tabel. Gunakan checkbox untuk enable/disable data point tertentu."),
        ("Pilih Metode", "Pilih metode regresi dari dropdown: Linear, Polynomial (degree 2-6), Exponential, Power, Logarithmic, atau Moving Average."),
        ("Visualisasi", "Grafik akan otomatis terupdate menampilkan scatter plot data dan garis/kurva regresi."),
        ("Hasil", "Lihat formula regresi, nilai R², MAE, dan RMSE. Gunakan tombol Copy untuk menyalin formula."),
        ("Export", "Klik 'Export PNG' untuk download grafik atau 'Export Data CSV' untuk download data."),
    ]
    
    for i, (title, desc) in enumerate(regression_steps, 1):
        elements.append(Paragraph(f"<b>Langkah {i}: {title}</b>", styles['BodyCustom']))
        elements.append(Paragraph(desc, styles['BodyCustom']))
    
    elements.append(Paragraph("8.2 Modul Prediksi", styles['Heading2Custom']))
    
    prediction_steps = [
        ("Input Data Historis", "Upload file CSV dengan kolom date dan value, atau input manual. Minimum 7 data point diperlukan."),
        ("Pilih Model", "Pilih model ML: Gradient Boosting (tercepat, akurasi bagus), LSTM (deep learning), atau BiLSTM (bidirectional)."),
        ("Set Horizon", "Tentukan berapa hari ke depan yang ingin diprediksi (1-30 hari) menggunakan slider."),
        ("Jalankan Prediksi", "Klik tombol 'Jalankan Prediksi' untuk memulai inferensi model."),
        ("Lihat Hasil", "Grafik akan menampilkan data historis dan prediksi. Tabel 'Hasil Prediksi' menampilkan nilai prediksi per hari."),
        ("Export", "Export grafik sebagai PNG atau data lengkap (historis + prediksi) sebagai CSV."),
    ]
    
    for i, (title, desc) in enumerate(prediction_steps, 1):
        elements.append(Paragraph(f"<b>Langkah {i}: {title}</b>", styles['BodyCustom']))
        elements.append(Paragraph(desc, styles['BodyCustom']))
    
    elements.append(Paragraph("8.3 Format File CSV", styles['Heading2Custom']))
    
    elements.append(Paragraph("<b>Untuk Modul Regresi (XY Data):</b>", styles['BodyCustom']))
    csv_xy = """
x,y
33262.03,14.44
48285.70,18.16
68609.89,21.55
"""
    elements.append(Paragraph(f"<pre>{csv_xy}</pre>", styles['CodeCustom']))
    
    elements.append(Paragraph("<b>Untuk Modul Prediksi (Time Series):</b>", styles['BodyCustom']))
    csv_ts = """
date,value
2024-11-01,12.5
2024-11-02,8.3
2024-11-03,0
"""
    elements.append(Paragraph(f"<pre>{csv_ts}</pre>", styles['CodeCustom']))
    
    elements.append(PageBreak())
    
    return elements

def create_deployment_section(styles):
    """Create deployment guide section"""
    elements = []
    
    elements.append(Paragraph("9. DEPLOYMENT GUIDE", styles['Heading1Custom']))
    
    elements.append(Paragraph("9.1 Prerequisites", styles['Heading2Custom']))
    
    prereqs = [
        "Node.js v18.x atau lebih tinggi",
        "npm v10.x atau pnpm",
        "Git untuk version control",
        "Akun Vercel (opsional, untuk deployment)",
    ]
    
    for prereq in prereqs:
        elements.append(Paragraph(f"• {prereq}", styles['BodyCustom']))
    
    elements.append(Paragraph("9.2 Local Development", styles['Heading2Custom']))
    
    local_steps = """
# Clone repository
git clone <repository-url>
cd webapp

# Install dependencies
npm install

# Run development server
npm run dev

# Open browser at http://localhost:3000
"""
    elements.append(Paragraph(f"<pre>{local_steps}</pre>", styles['CodeCustom']))
    
    elements.append(Paragraph("9.3 Build Production", styles['Heading2Custom']))
    
    build_steps = """
# Build for production
npm run build

# Start production server (local)
npm start

# Check build output
# Route (app)
# ├ ○ /             (Static)
# ├ ƒ /api/predict  (Dynamic - serverless)
# ├ ƒ /api/regression (Dynamic - serverless)
# ├ ○ /prediction   (Static)
# └ ○ /regression   (Static)
"""
    elements.append(Paragraph(f"<pre>{build_steps}</pre>", styles['CodeCustom']))
    
    elements.append(Paragraph("9.4 Deploy to Vercel", styles['Heading2Custom']))
    
    vercel_steps = [
        "Push code ke GitHub repository",
        "Login ke Vercel dan import project dari GitHub",
        "Vercel akan otomatis mendeteksi Next.js",
        "Klik Deploy dan tunggu build selesai",
        "Akses aplikasi di URL yang diberikan Vercel",
    ]
    
    for i, step in enumerate(vercel_steps, 1):
        elements.append(Paragraph(f"<b>{i}.</b> {step}", styles['BodyCustom']))
    
    elements.append(Paragraph("9.5 Environment Variables", styles['Heading2Custom']))
    elements.append(Paragraph(
        "Aplikasi ini tidak memerlukan environment variables khusus. Semua konfigurasi "
        "sudah hardcoded untuk kesederhanaan. Jika perlu, tambahkan di Vercel dashboard.",
        styles['BodyCustom']
    ))
    
    elements.append(PageBreak())
    
    return elements

def create_troubleshooting_section(styles):
    """Create troubleshooting section"""
    elements = []
    
    elements.append(Paragraph("10. TROUBLESHOOTING", styles['Heading1Custom']))
    
    issues = [
        {
            'problem': 'Error: Model file not found',
            'cause': 'File ONNX tidak ada di folder public/models',
            'solution': 'Pastikan file model_gbr.onnx, model_lstm.onnx, dan model_bilstm.onnx ada di public/models/'
        },
        {
            'problem': 'Prediksi menghasilkan nilai negatif',
            'cause': 'Model output belum di-clamp',
            'solution': 'Sistem sudah menghandle ini dengan Math.max(0, prediction). Jika masih terjadi, cek preprocessing data.'
        },
        {
            'problem': 'Chart tidak muncul',
            'cause': 'SSR issue dengan Chart.js',
            'solution': 'ChartComponent sudah menggunakan dynamic import dengan ssr: false. Pastikan react-chartjs-2 terinstall.'
        },
        {
            'problem': 'CSV upload tidak terbaca',
            'cause': 'Format CSV tidak sesuai',
            'solution': 'Pastikan CSV memiliki header (x,y atau date,value) dan separator koma. Encoding harus UTF-8.'
        },
        {
            'problem': 'Build error: Cannot find module onnxruntime-node',
            'cause': 'Dependency belum terinstall',
            'solution': 'Jalankan npm install onnxruntime-node. Pastikan Node.js versi 18+.'
        },
        {
            'problem': 'Regresi menghasilkan NaN/Infinity',
            'cause': 'Data tidak valid untuk metode tertentu',
            'solution': 'Exponential/Power regression membutuhkan y > 0. Logarithmic membutuhkan x > 0. Filter data terlebih dahulu.'
        },
    ]
    
    for issue in issues:
        elements.append(Paragraph(f"<b>Problem:</b> {issue['problem']}", styles['Heading3Custom']))
        elements.append(Paragraph(f"<i>Penyebab:</i> {issue['cause']}", styles['BodyCustom']))
        elements.append(Paragraph(f"<i>Solusi:</i> {issue['solution']}", styles['BodyCustom']))
    
    elements.append(Spacer(1, 1*cm))
    
    elements.append(Paragraph("KONTAK SUPPORT", styles['Heading2Custom']))
    elements.append(Paragraph(
        "Jika mengalami masalah yang tidak tercantum di atas, silakan hubungi:",
        styles['BodyCustom']
    ))
    
    contact_data = [
        ['Platform', 'Kontak'],
        ['WhatsApp', CONTACT_INFO['wa']],
        ['Instagram', CONTACT_INFO['ig']],
        ['Website', CONTACT_INFO['website']],
        ['Fastwork', CONTACT_INFO['fastwork']],
    ]
    
    contact_table = Table(contact_data, colWidths=[4*cm, 9*cm])
    contact_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor("#e2e8f0")),
        ('PADDING', (0, 0), (-1, -1), 8),
    ]))
    
    elements.append(contact_table)
    
    elements.append(Spacer(1, 2*cm))
    
    # Final thank you
    elements.append(Paragraph(
        "<font color='#6366f1' size='14'><b>Terima kasih telah menggunakan Sistem Analisis Curah Hujan!</b></font>",
        ParagraphStyle(name='ThankYou', alignment=TA_CENTER, spaceAfter=12)
    ))
    
    elements.append(Paragraph(
        f"<font color='#64748b' size='10'>Dokumentasi ini dibuat pada {datetime.now().strftime('%d %B %Y %H:%M')}</font>",
        ParagraphStyle(name='Date', alignment=TA_CENTER)
    ))
    
    return elements

def generate_pdf():
    """Generate the complete PDF documentation"""
    print("Generating PDF documentation...")
    
    # Create document
    doc = SimpleDocTemplate(
        OUTPUT_PDF,
        pagesize=A4,
        leftMargin=2*cm,
        rightMargin=2*cm,
        topMargin=2*cm,
        bottomMargin=2*cm
    )
    
    styles = create_styles()
    elements = []
    
    # Build content
    elements.extend(create_cover_page(styles))
    elements.extend(create_toc(styles))
    elements.extend(create_intro_section(styles))
    elements.extend(create_architecture_section(styles))
    elements.extend(create_regression_section(styles))
    elements.extend(create_prediction_section(styles))
    elements.extend(create_ml_section(styles))
    elements.extend(create_api_section(styles))
    elements.extend(create_components_section(styles))
    elements.extend(create_usage_section(styles))
    elements.extend(create_deployment_section(styles))
    elements.extend(create_troubleshooting_section(styles))
    
    # Build PDF
    doc.build(elements, onFirstPage=create_header_footer, onLaterPages=create_header_footer)
    
    print(f"PDF generated successfully: {OUTPUT_PDF}")
    return OUTPUT_PDF

if __name__ == "__main__":
    generate_pdf()
