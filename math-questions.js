const PDFDocument = require('pdfkit');
const fs = require('fs');

const argv = process.argv.slice(2);
let maxNumberFromArgs;

for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === '--help' || arg === '-h') {
        console.log('Usage: node math-questions.js [--max <number>] [<number>]');
        console.log('');
        console.log('Options:');
        console.log('  --max, -m   Maximum number used in questions (default: 20)');
        process.exit(0);
    }

    if (arg === '--max' || arg === '-m') {
        const next = argv[i + 1];
        if (next === undefined) {
            console.error('Missing value for --max');
            process.exit(1);
        }
        maxNumberFromArgs = next;
        i++;
        continue;
    }

    if (arg.startsWith('--max=')) {
        maxNumberFromArgs = arg.slice('--max='.length);
        continue;
    }

    if (/^\d+$/.test(arg) && maxNumberFromArgs === undefined) {
        maxNumberFromArgs = arg;
    }
}

const parsedMaxNumber = maxNumberFromArgs === undefined ? 20 : Number(maxNumberFromArgs);
if (!Number.isInteger(parsedMaxNumber) || parsedMaxNumber < 1) {
    console.error(`Invalid max number: ${maxNumberFromArgs}`);
    process.exit(1);
}

// Konfigurasi
const OUTPUT_FILE = 'Soal_Matematika_Anak';
const TOTAL_SOAL = 40; // Jumlah soal
const MAX_NUMBER = parsedMaxNumber; // Angka maksimum

// Inisialisasi PDF
const doc = new PDFDocument({ margin: 50 });
const stream = fs.createWriteStream(`${OUTPUT_FILE}-${Date.now()}.pdf`);
doc.pipe(stream);

// --- 1. Header Halaman ---
doc.fontSize(20).text(`Latihan Matematika (1 - ${MAX_NUMBER})`, { align: 'center' });
doc.moveDown();

// Area Nama dan Tanggal
doc.fontSize(12).text('Nama   : _________________________', 50, 100);
doc.text('Tanggal: _________________________', 350, 100);
doc.moveDown(2);

// --- 2. Fungsi Generator Soal ---
function generateQuestion() {
    const isAddition = Math.random() > 0.5; // Random tambah atau kurang
    let a = Math.floor(Math.random() * MAX_NUMBER) + 1;
    let b = Math.floor(Math.random() * MAX_NUMBER) + 1;

    let operator = '';

    if (isAddition) {
        operator = '+';
    } else {
        operator = '-';
        // Logic: Pastikan A > B agar hasil tidak minus (untuk anak-anak)
        if (a < b) {
            [a, b] = [b, a]; // Swap values
        }
    }

    return `${a}  ${operator}  ${b}  =  .....`;
}

// --- 3. Render Soal (Layout 2 Kolom) ---
const startY = 140; // Posisi Y awal soal
const lineHeight = 25; // Jarak antar baris
const col1X = 50; // Posisi X kolom kiri
const col2X = 300; // Posisi X kolom kanan

doc.fontSize(14); // Ukuran font soal

for (let i = 0; i < TOTAL_SOAL; i++) {
    const questionText = `${i + 1}.   ${generateQuestion()}`;
    
    // Tentukan kolom: 
    // Jika i < separuh total soal, taruh di kiri. Sisanya di kanan.
    const half = Math.ceil(TOTAL_SOAL / 2);
    
    if (i < half) {
        // Kolom Kiri
        doc.text(questionText, col1X, startY + (i * lineHeight));
    } else {
        // Kolom Kanan
        // (i - half) digunakan untuk reset counter baris ke 0 untuk kolom kanan
        doc.text(questionText, col2X, startY + ((i - half) * lineHeight));
    }
}

// --- 4. Finalisasi ---
doc.end();

stream.on('finish', () => {
    console.log(`✅ File PDF berhasil dibuat: ${OUTPUT_FILE}`);
});
