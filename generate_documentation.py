"""
Script untuk Generate Dokumentasi PDF - Analisis Curah Hujan Web App
FIXED VERSION - No special unicode characters

Author: Ferri Krisdiantoro
Contact: 
- WhatsApp: +6285351168279
- Instagram: @solusi.ai.praktis
- Website: ferrikrisdiantoro.com
- Fastwork: Ferri Krisdiantoro
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib.colors import HexColor, white
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, 
    PageBreak, Preformatted
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from datetime import datetime
import os

# Path
BASE_DIR = r"D:\Projek\Freelancer\cl42_fw - Web App Regresi dan Prediksi Curah Hujan\webapp"
OUTPUT_PDF = os.path.join(BASE_DIR, "DOKUMENTASI_SISTEM.pdf")

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
        name='CodeBlock',
        parent=styles['Normal'],
        fontSize=8,
        fontName='Courier',
        textColor=DARK_COLOR,
        backColor=HexColor("#f1f5f9"),
        leftIndent=10,
        rightIndent=10,
        spaceAfter=8,
        spaceBefore=4,
        leading=11
    ))
    
    # Footer style
    styles.add(ParagraphStyle(
        name='FooterStyle',
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
    footer_text = f"2026 Ferri Krisdiantoro | WA: {CONTACT_INFO['wa']} | IG: {CONTACT_INFO['ig']} | {CONTACT_INFO['website']}"
    canvas.drawCentredString(A4[0]/2, 1*cm, footer_text)
    
    canvas.restoreState()

def create_cover_page(styles):
    """Create cover page elements"""
    elements = []
    
    elements.append(Spacer(1, 4*cm))
    
    # Main title
    elements.append(Paragraph(
        "DOKUMENTASI SISTEM", 
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
        ['Platform', 'Next.js + ONNX Runtime Web'],
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
        f"<font color='#6366f1'>WhatsApp:</font> {CONTACT_INFO['wa']} | "
        f"<font color='#6366f1'>Instagram:</font> {CONTACT_INFO['ig']}",
        ParagraphStyle(name='Contact1', alignment=TA_CENTER, fontSize=10, spaceAfter=4)
    ))
    
    elements.append(Paragraph(
        f"<font color='#6366f1'>Website:</font> {CONTACT_INFO['website']} | "
        f"<font color='#6366f1'>Fastwork:</font> {CONTACT_INFO['fastwork']}",
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
        elements.append(Paragraph(f"* {obj}", styles['BodyCustom']))
    
    elements.append(Paragraph("1.3 Teknologi yang Digunakan", styles['Heading2Custom']))
    
    tech_data = [
        ['Komponen', 'Teknologi', 'Versi'],
        ['Frontend', 'Next.js (React)', '16.1.1'],
        ['Backend API', 'Next.js API Routes', '16.1.1'],
        ['ML Runtime', 'ONNX Runtime Web (Browser)', '1.20+'],
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
    
    # Directory structure as table
    dir_data = [
        ['Folder/File', 'Deskripsi'],
        ['public/models/', 'File model ONNX (GBR, LSTM, BiLSTM)'],
        ['src/app/', 'Halaman aplikasi (page.tsx)'],
        ['src/app/api/', 'API Routes (predict, regression)'],
        ['src/app/prediction/', 'Halaman prediksi curah hujan'],
        ['src/app/regression/', 'Halaman analisis regresi'],
        ['src/components/', 'Komponen React (Chart, DataTable, dll)'],
        ['src/lib/', 'Library utilities (regression.ts, onnxWebInference.ts)'],
        ['src/types/', 'TypeScript type definitions'],
        ['notebook/', 'Jupyter notebook untuk training'],
    ]
    
    dir_table = Table(dir_data, colWidths=[5*cm, 9*cm])
    dir_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), SECONDARY_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (0, -1), 'Courier'),
        ('FONTNAME', (1, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor("#e2e8f0")),
        ('PADDING', (0, 0), (-1, -1), 6),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [white, HexColor("#f8fafc")]),
    ]))
    
    elements.append(dir_table)
    
    elements.append(Paragraph("2.2 Alur Data (Data Flow)", styles['Heading2Custom']))
    elements.append(Paragraph(
        "Sistem menggunakan arsitektur client-side inference dengan ONNX Runtime Web:",
        styles['BodyCustom']
    ))
    
    flow_steps = [
        "1. User Input: Data diinput melalui form manual atau upload CSV",
        "2. Client Processing: Data divalidasi dan diformat di browser",
        "3. Model Loading: ONNX model diload ke browser (cached)",
        "4. Feature Engineering: Fitur dikalkulasi (lag, rolling stats)",
        "5. Inference: ONNX Runtime Web menjalankan prediksi di browser",
        "6. Visualization: Chart.js merender grafik hasil analisis",
        "7. Export: User dapat mengekspor hasil ke PNG atau CSV",
    ]
    
    for step in flow_steps:
        elements.append(Paragraph(step, styles['BodyCustom']))
    
    elements.append(Paragraph("2.3 Deployment Architecture", styles['Heading2Custom']))
    elements.append(Paragraph(
        "Aplikasi ini dirancang untuk deployment di Vercel dengan arsitektur serverless. "
        "Model ONNX disimpan di folder public dan diload di browser menggunakan onnxruntime-web. "
        "Ini memungkinkan inferensi ML tanpa server-side processing.",
        styles['BodyCustom']
    ))
    
    deploy_data = [
        ['Aspek', 'Konfigurasi'],
        ['Hosting', 'Vercel (Serverless)'],
        ['ML Inference', 'Browser (ONNX Runtime Web)'],
        ['Build', 'Next.js Static + Dynamic Routes'],
        ['Static Assets', 'Vercel CDN'],
        ['Model Loading', 'Lazy load + Session cache'],
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
            'formula': 'y = a0 + a1*x + a2*x^2 + ... + an*x^n',
            'desc': 'Regresi polynomial untuk kurva non-linear dengan degree 2-6.',
            'use_case': 'Kurva parabola, kubik, atau pola kompleks'
        },
        {
            'name': 'Exponential Regression',
            'formula': 'y = a * e^(bx)',
            'desc': 'Regresi eksponensial untuk pertumbuhan/penurunan eksponensial.',
            'use_case': 'Pertumbuhan populasi, peluruhan radioaktif'
        },
        {
            'name': 'Power Regression',
            'formula': 'y = a * x^b',
            'desc': 'Regresi power untuk hubungan pangkat antara variabel.',
            'use_case': 'Kurva rating (Q-H), hukum fisika'
        },
        {
            'name': 'Logarithmic Regression',
            'formula': 'y = a + b * ln(x)',
            'desc': 'Regresi logaritmik untuk kurva yang melambat.',
            'use_case': 'Kurva pembelajaran, diminishing returns'
        },
        {
            'name': 'Moving Average',
            'formula': 'MA(n) = (x1 + x2 + ... + xn) / n',
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
        ['R-squared (R2)', '1 - (SS_res / SS_tot)', '0-1, semakin tinggi semakin baik'],
        ['MAE', 'sum(|y - y_pred|) / n', 'Error rata-rata, satuan sama dengan Y'],
        ['RMSE', 'sqrt(sum((y - y_pred)^2) / n)', 'Error kuadrat, sensitif terhadap outlier'],
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
        "Kalkulasi regresi diimplementasikan dalam file src/lib/regression.ts "
        "dengan algoritma yang dioptimasi untuk browser. Polynomial regression menggunakan "
        "Gaussian elimination dengan partial pivoting untuk stabilitas numerik.",
        styles['BodyCustom']
    ))
    
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
        "telah dilatih dan diekspor ke format ONNX untuk inferensi di browser.",
        styles['BodyCustom']
    ))
    
    elements.append(Paragraph("4.2 Data Training", styles['Heading2Custom']))
    elements.append(Paragraph(
        "Model dilatih menggunakan data curah hujan harian dengan karakteristik berikut:",
        styles['BodyCustom']
    ))
    
    data_stats = [
        ['Statistik', 'Nilai'],
        ['Jumlah data', '7,320 hari'],
        ['Range', '0 - 11 mm'],
        ['Mean', '1.46 mm'],
        ['Median', '0.9 mm'],
        ['Std Dev', '2.22 mm'],
    ]
    
    data_table = Table(data_stats, colWidths=[5*cm, 5*cm])
    data_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), SECONDARY_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor("#e2e8f0")),
        ('PADDING', (0, 0), (-1, -1), 8),
    ]))
    
    elements.append(data_table)
    
    elements.append(Paragraph("4.3 Model Machine Learning", styles['Heading2Custom']))
    
    models = [
        {
            'name': 'Gradient Boosting Regressor (GBR)',
            'type': 'Tabular ML',
            'input': '9 features (lag, rolling stats, time)',
            'mae': '6.42 mm',
            'rmse': '11.28 mm',
        },
        {
            'name': 'LSTM (Long Short-Term Memory)',
            'type': 'Deep Learning',
            'input': 'Sequence [batch, 7, 1]',
            'mae': '7.15 mm',
            'rmse': '12.03 mm',
        },
        {
            'name': 'BiLSTM (Bidirectional LSTM)',
            'type': 'Deep Learning',
            'input': 'Sequence [batch, 7, 1]',
            'mae': '6.89 mm',
            'rmse': '11.67 mm',
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
        elements.append(Spacer(1, 0.3*cm))
    
    elements.append(Paragraph("4.4 Feature Engineering (GBR)", styles['Heading2Custom']))
    elements.append(Paragraph(
        "Model GBR menggunakan 9 features yang dikalkulasi dari data historis:",
        styles['BodyCustom']
    ))
    
    features_data = [
        ['Feature', 'Deskripsi', 'Formula'],
        ['lag_1', 'Curah hujan 1 hari sebelumnya', 'y[t-1]'],
        ['lag_3', 'Curah hujan 3 hari sebelumnya', 'y[t-3]'],
        ['lag_7', 'Curah hujan 7 hari sebelumnya', 'y[t-7]'],
        ['roll_mean_3', 'Rata-rata 3 hari terakhir', 'mean(y[t-3:t])'],
        ['roll_mean_7', 'Rata-rata 7 hari terakhir', 'mean(y[t-7:t])'],
        ['roll_max_7', 'Maksimum 7 hari terakhir', 'max(y[t-7:t])'],
        ['roll_std_7', 'Std dev 7 hari terakhir', 'std(y[t-7:t])'],
        ['bulan_idx', 'Indeks bulan (1-12)', 'month(date)'],
        ['day_of_week', 'Hari dalam minggu (0-6)', 'weekday(date)'],
    ]
    
    features_table = Table(features_data, colWidths=[3*cm, 5*cm, 5*cm])
    features_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), SECONDARY_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor("#e2e8f0")),
        ('PADDING', (0, 0), (-1, -1), 5),
    ]))
    
    elements.append(features_table)
    
    elements.append(Paragraph("4.5 Recursive Forecasting", styles['Heading2Custom']))
    elements.append(Paragraph(
        "Untuk prediksi multi-step (lebih dari 1 hari), sistem menggunakan strategi recursive forecasting. "
        "Prediksi hari ke-n digunakan sebagai input untuk memprediksi hari ke-(n+1). "
        "Metode ini memungkinkan prediksi hingga 30 hari ke depan dari 7 hari data historis.",
        styles['BodyCustom']
    ))
    
    elements.append(PageBreak())
    
    return elements

def create_ml_section(styles):
    """Create ML models technical section"""
    elements = []
    
    elements.append(Paragraph("5. MACHINE LEARNING MODELS", styles['Heading1Custom']))
    
    elements.append(Paragraph("5.1 Training Pipeline (Notebook)", styles['Heading2Custom']))
    elements.append(Paragraph(
        "Model dilatih menggunakan Jupyter Notebook (notebook/prediksi_hujan.ipynb). "
        "Berikut adalah tahapan training yang dilakukan:",
        styles['BodyCustom']
    ))
    
    training_steps = [
        "1. Data Loading: Membaca dataset curah hujan harian dari Excel",
        "2. Feature Engineering: Membuat lag features, rolling statistics, time features",
        "3. Data Splitting: Membagi data menjadi train (80%) dan test (20%)",
        "4. Model Training: Melatih GBR, LSTM, dan BiLSTM",
        "5. Model Evaluation: Mengevaluasi performa dengan MAE, RMSE",
        "6. ONNX Export: Mengekspor model ke format ONNX untuk web deployment",
    ]
    
    for step in training_steps:
        elements.append(Paragraph(step, styles['BodyCustom']))
    
    elements.append(Paragraph("5.2 ONNX Runtime Web", styles['Heading2Custom']))
    elements.append(Paragraph(
        "ONNX (Open Neural Network Exchange) digunakan sebagai format portable untuk deployment model. "
        "Model dijalankan di browser menggunakan onnxruntime-web dengan WASM backend.",
        styles['BodyCustom']
    ))
    
    onnx_benefits = [
        "* Cross-platform: Dapat dijalankan di browser tanpa server",
        "* Optimized: Runtime yang dioptimasi untuk CPU inference",
        "* Lightweight: Ukuran model kecil (37KB - 200KB)",
        "* Vercel-friendly: Tidak memerlukan server-side processing",
    ]
    
    for benefit in onnx_benefits:
        elements.append(Paragraph(benefit, styles['BodyCustom']))
    
    elements.append(Paragraph("5.3 Model Files", styles['Heading2Custom']))
    
    model_files = [
        ['File', 'Size', 'Input Shape', 'Description'],
        ['model_gbr.onnx', '200 KB', '[1, 9]', 'Gradient Boosting with 9 features'],
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
    
    elements.append(Paragraph("<b>Endpoint:</b> POST /api/regression", styles['BodyCustom']))
    elements.append(Paragraph("Melakukan analisis regresi pada data X-Y.", styles['BodyCustom']))
    
    elements.append(Paragraph("<b>Request Body:</b>", styles['BodyCustom']))
    
    req_data = [
        ['Field', 'Type', 'Description'],
        ['data', 'Array', 'Array of {x, y} objects'],
        ['type', 'String', 'linear | polynomial | exponential | power | logarithmic | moving-average'],
        ['degree', 'Number', 'Optional, for polynomial (2-6) or MA window'],
    ]
    
    req_table = Table(req_data, colWidths=[3*cm, 3*cm, 8*cm])
    req_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), SECONDARY_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor("#e2e8f0")),
        ('PADDING', (0, 0), (-1, -1), 6),
    ]))
    
    elements.append(req_table)
    
    elements.append(Paragraph("<b>Response:</b>", styles['BodyCustom']))
    
    resp_data = [
        ['Field', 'Type', 'Description'],
        ['type', 'String', 'Regression type used'],
        ['formula', 'String', 'Regression equation'],
        ['coefficients', 'Array', 'Coefficient values'],
        ['r2', 'Number', 'R-squared value (0-1)'],
        ['mae', 'Number', 'Mean Absolute Error'],
        ['rmse', 'Number', 'Root Mean Square Error'],
        ['predictions', 'Array', 'Predicted Y values'],
    ]
    
    resp_table = Table(resp_data, colWidths=[3*cm, 3*cm, 8*cm])
    resp_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), SECONDARY_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor("#e2e8f0")),
        ('PADDING', (0, 0), (-1, -1), 6),
    ]))
    
    elements.append(resp_table)
    
    elements.append(Paragraph("6.2 Prediction (Client-Side)", styles['Heading2Custom']))
    elements.append(Paragraph(
        "Prediksi curah hujan dijalankan di browser menggunakan ONNX Runtime Web. "
        "Tidak ada API call ke server untuk inferensi ML.",
        styles['BodyCustom']
    ))
    
    elements.append(Paragraph("<b>Function:</b> forecast(modelType, historicalData, horizonDays)", styles['BodyCustom']))
    
    pred_params = [
        ['Parameter', 'Type', 'Description'],
        ['modelType', 'String', 'gbr | lstm | bilstm'],
        ['historicalData', 'Array', 'Array of {date, value} (min 7 points)'],
        ['horizonDays', 'Number', 'Prediction horizon (1-30 days)'],
    ]
    
    pred_table = Table(pred_params, colWidths=[3*cm, 3*cm, 8*cm])
    pred_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), SECONDARY_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor("#e2e8f0")),
        ('PADDING', (0, 0), (-1, -1), 6),
    ]))
    
    elements.append(pred_table)
    
    elements.append(PageBreak())
    
    return elements

def create_ui_section(styles):
    """Create UI components section"""
    elements = []
    
    elements.append(Paragraph("7. KOMPONEN UI", styles['Heading1Custom']))
    
    elements.append(Paragraph("7.1 Komponen Utama", styles['Heading2Custom']))
    
    components = [
        {
            'name': 'ChartComponent',
            'file': 'src/components/ChartComponent.tsx',
            'desc': 'Komponen grafik menggunakan Chart.js. Mendukung scatter, line, dan time series.'
        },
        {
            'name': 'DataTable',
            'file': 'src/components/DataTable.tsx',
            'desc': 'Tabel data interaktif dengan kemampuan edit inline dan toggle enable/disable.'
        },
        {
            'name': 'CsvUploader',
            'file': 'src/components/CsvUploader.tsx',
            'desc': 'Komponen upload CSV dengan validasi dan parsing otomatis.'
        },
        {
            'name': 'Navbar',
            'file': 'src/components/Navbar.tsx',
            'desc': 'Navigation bar responsif dengan hamburger menu untuk mobile.'
        },
        {
            'name': 'Icon',
            'file': 'src/components/Icon.tsx',
            'desc': 'Koleksi SVG icons untuk UI (chart, upload, copy, download, dll).'
        },
    ]
    
    for comp in components:
        elements.append(Paragraph(f"<b>{comp['name']}</b>", styles['Heading3Custom']))
        elements.append(Paragraph(f"<i>File:</i> {comp['file']}", styles['BodyCustom']))
        elements.append(Paragraph(comp['desc'], styles['BodyCustom']))
    
    elements.append(Paragraph("7.2 Utility Libraries", styles['Heading2Custom']))
    
    libs = [
        {
            'name': 'regression.ts',
            'desc': 'Implementasi 6 algoritma regresi dan kalkulasi metrik (R2, MAE, RMSE).'
        },
        {
            'name': 'onnxWebInference.ts',
            'desc': 'Loading dan inferensi model ONNX di browser dengan feature preparation.'
        },
        {
            'name': 'exportUtils.ts',
            'desc': 'Fungsi export chart ke PNG dan data ke CSV.'
        },
    ]
    
    for lib in libs:
        elements.append(Paragraph(f"<b>{lib['name']}</b>", styles['Heading3Custom']))
        elements.append(Paragraph(lib['desc'], styles['BodyCustom']))
    
    elements.append(PageBreak())
    
    return elements

def create_usage_section(styles):
    """Create usage guide section"""
    elements = []
    
    elements.append(Paragraph("8. PANDUAN PENGGUNAAN", styles['Heading1Custom']))
    
    elements.append(Paragraph("8.1 Modul Regresi", styles['Heading2Custom']))
    
    regression_steps = [
        ("Input Data", "Upload file CSV dengan kolom x,y atau input manual di tabel."),
        ("Pilih Metode", "Pilih metode regresi: Linear, Polynomial, Exponential, Power, Logarithmic, atau Moving Average."),
        ("Lihat Hasil", "Grafik akan menampilkan data points dan garis/kurva regresi."),
        ("Salin Formula", "Klik tombol copy untuk menyalin formula ke clipboard."),
        ("Export", "Export grafik sebagai PNG atau data sebagai CSV."),
    ]
    
    for i, (title, desc) in enumerate(regression_steps, 1):
        elements.append(Paragraph(f"<b>Langkah {i}: {title}</b>", styles['BodyCustom']))
        elements.append(Paragraph(desc, styles['BodyCustom']))
    
    elements.append(Paragraph("8.2 Modul Prediksi", styles['Heading2Custom']))
    
    prediction_steps = [
        ("Input Data Historis", "Upload CSV dengan kolom date,value atau input manual. Minimum 7 data point."),
        ("Pilih Model", "Pilih model ML: Gradient Boosting, LSTM, atau BiLSTM."),
        ("Set Horizon", "Tentukan berapa hari ke depan yang ingin diprediksi (1-30 hari)."),
        ("Jalankan Prediksi", "Klik tombol 'Jalankan Prediksi' untuk memulai inferensi."),
        ("Lihat Hasil", "Grafik menampilkan data historis dan prediksi. Tabel menampilkan nilai prediksi."),
        ("Export", "Export grafik sebagai PNG atau data (historis + prediksi) sebagai CSV."),
    ]
    
    for i, (title, desc) in enumerate(prediction_steps, 1):
        elements.append(Paragraph(f"<b>Langkah {i}: {title}</b>", styles['BodyCustom']))
        elements.append(Paragraph(desc, styles['BodyCustom']))
    
    elements.append(Paragraph("8.3 Format File CSV", styles['Heading2Custom']))
    
    elements.append(Paragraph("<b>Untuk Modul Regresi (XY Data):</b>", styles['BodyCustom']))
    
    csv_xy_data = [
        ['x', 'y'],
        ['33262.03', '14.44'],
        ['48285.70', '18.16'],
        ['68609.89', '21.55'],
    ]
    csv_table1 = Table(csv_xy_data, colWidths=[5*cm, 5*cm])
    csv_table1.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), HexColor("#e2e8f0")),
        ('FONTNAME', (0, 0), (-1, -1), 'Courier'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor("#cbd5e1")),
        ('PADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(csv_table1)
    
    elements.append(Spacer(1, 0.5*cm))
    elements.append(Paragraph("<b>Untuk Modul Prediksi (Time Series):</b>", styles['BodyCustom']))
    
    csv_ts_data = [
        ['date', 'value'],
        ['2024-11-01', '0.5'],
        ['2024-11-02', '1.2'],
        ['2024-11-03', '2.8'],
    ]
    csv_table2 = Table(csv_ts_data, colWidths=[5*cm, 5*cm])
    csv_table2.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), HexColor("#e2e8f0")),
        ('FONTNAME', (0, 0), (-1, -1), 'Courier'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor("#cbd5e1")),
        ('PADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(csv_table2)
    
    elements.append(PageBreak())
    
    return elements

def create_deployment_section(styles):
    """Create deployment guide section"""
    elements = []
    
    elements.append(Paragraph("9. DEPLOYMENT GUIDE", styles['Heading1Custom']))
    
    elements.append(Paragraph("9.1 Prerequisites", styles['Heading2Custom']))
    
    prereq = [
        "* Node.js 18 atau lebih baru",
        "* npm 10 atau lebih baru",
        "* Git",
        "* Akun Vercel (untuk deployment)",
    ]
    
    for p in prereq:
        elements.append(Paragraph(p, styles['BodyCustom']))
    
    elements.append(Paragraph("9.2 Local Development", styles['Heading2Custom']))
    
    local_steps = [
        "1. Clone repository: git clone [repo-url]",
        "2. Install dependencies: npm install",
        "3. Run development server: npm run dev",
        "4. Open browser: http://localhost:3000",
    ]
    
    for step in local_steps:
        elements.append(Paragraph(step, styles['BodyCustom']))
    
    elements.append(Paragraph("9.3 Build Production", styles['Heading2Custom']))
    
    build_steps = [
        "1. Build: npm run build",
        "2. Start production server: npm start",
        "3. Atau deploy ke Vercel",
    ]
    
    for step in build_steps:
        elements.append(Paragraph(step, styles['BodyCustom']))
    
    elements.append(Paragraph("9.4 Deploy to Vercel", styles['Heading2Custom']))
    
    vercel_steps = [
        "1. Push code ke GitHub repository",
        "2. Login ke Vercel (vercel.com)",
        "3. Import project dari GitHub",
        "4. Klik Deploy",
        "5. Vercel akan otomatis build dan deploy",
    ]
    
    for step in vercel_steps:
        elements.append(Paragraph(step, styles['BodyCustom']))
    
    elements.append(Paragraph("9.5 Environment Variables", styles['Heading2Custom']))
    elements.append(Paragraph(
        "Tidak ada environment variables yang diperlukan untuk deployment standar. "
        "Semua konfigurasi sudah di-hardcode untuk simplicity.",
        styles['BodyCustom']
    ))
    
    elements.append(PageBreak())
    
    return elements

def create_troubleshooting_section(styles):
    """Create troubleshooting section"""
    elements = []
    
    elements.append(Paragraph("10. TROUBLESHOOTING", styles['Heading1Custom']))
    
    elements.append(Paragraph("10.1 Common Issues", styles['Heading2Custom']))
    
    issues = [
        {
            'problem': 'Model tidak load / ONNX error',
            'solution': 'Pastikan file model ada di folder public/models/. Refresh browser dengan Ctrl+Shift+R.'
        },
        {
            'problem': 'Prediksi selalu sama (~5-6mm)',
            'solution': 'Ini normal untuk model yang ditraining dengan data range 0-11mm. Gunakan data input sesuai range.'
        },
        {
            'problem': 'Chart tidak muncul',
            'solution': 'Pastikan minimal ada 2 data point (regresi) atau 7 data point (prediksi).'
        },
        {
            'problem': 'CSV upload gagal',
            'solution': 'Pastikan format CSV benar: header di baris pertama, kolom sesuai (x,y atau date,value).'
        },
        {
            'problem': 'Warning CPU vendor unknown',
            'solution': 'Ini hanya warning, tidak mempengaruhi fungsi. ONNX tetap berjalan dengan WASM backend.'
        },
    ]
    
    for issue in issues:
        elements.append(Paragraph(f"<b>Problem:</b> {issue['problem']}", styles['BodyCustom']))
        elements.append(Paragraph(f"<b>Solution:</b> {issue['solution']}", styles['BodyCustom']))
        elements.append(Spacer(1, 0.3*cm))
    
    elements.append(Paragraph("10.2 Contact Support", styles['Heading2Custom']))
    elements.append(Paragraph(
        "Jika mengalami masalah yang tidak tercantum di atas, silakan hubungi:",
        styles['BodyCustom']
    ))
    
    contact_data = [
        ['Platform', 'Contact'],
        ['WhatsApp', CONTACT_INFO['wa']],
        ['Instagram', CONTACT_INFO['ig']],
        ['Website', CONTACT_INFO['website']],
        ['Fastwork', CONTACT_INFO['fastwork']],
    ]
    
    contact_table = Table(contact_data, colWidths=[4*cm, 8*cm])
    contact_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor("#e2e8f0")),
        ('PADDING', (0, 0), (-1, -1), 8),
    ]))
    
    elements.append(contact_table)
    
    return elements

def generate_pdf():
    """Generate the complete PDF documentation"""
    print("Generating PDF documentation...")
    
    # Create document
    doc = SimpleDocTemplate(
        OUTPUT_PDF,
        pagesize=A4,
        rightMargin=2*cm,
        leftMargin=2*cm,
        topMargin=2*cm,
        bottomMargin=2*cm
    )
    
    # Create styles
    styles = create_styles()
    
    # Build content
    elements = []
    
    # Add sections
    elements.extend(create_cover_page(styles))
    elements.extend(create_toc(styles))
    elements.extend(create_intro_section(styles))
    elements.extend(create_architecture_section(styles))
    elements.extend(create_regression_section(styles))
    elements.extend(create_prediction_section(styles))
    elements.extend(create_ml_section(styles))
    elements.extend(create_api_section(styles))
    elements.extend(create_ui_section(styles))
    elements.extend(create_usage_section(styles))
    elements.extend(create_deployment_section(styles))
    elements.extend(create_troubleshooting_section(styles))
    
    # Build PDF
    doc.build(elements, onFirstPage=create_header_footer, onLaterPages=create_header_footer)
    
    print(f"PDF generated successfully: {OUTPUT_PDF}")

if __name__ == "__main__":
    generate_pdf()
