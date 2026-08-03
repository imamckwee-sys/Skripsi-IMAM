const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Storage data sementara di Cloud Server
let sensorData = {
    suhu1: 0, suhu2: 0,
    hum1: 0, hum2: 0,
    lux1: 0, lux2: 0,
    gas1: 0, gas2: 0,
    kipas: false,
    penghangat: false,
    led: false,
    modeKipas: 0,
    modePenghangat: 0,
    modeLED: 0
};

// 1. Menampilkan Halaman Web Dashboard
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 2. API untuk Web Dashboard membaca data sensor
app.get('/api/data', (req, res) => {
    res.json(sensorData);
});

// 3. API untuk Web Dashboard saat kamu menekan tombol kontrol
app.get('/api/control', (req, res) => {
    const { device, mode } = req.query;
    const m = parseInt(mode);
    if (device === 'kipas') sensorData.modeKipas = m;
    if (device === 'penghangat') sensorData.modePenghangat = m;
    if (device === 'led') sensorData.modeLED = m;
    res.send('OK');
});

// 4. API Khusus untuk ESP32 (Mengirim data sensor & menerima status mode tombol)
app.post('/api/update', (req, res) => {
    sensorData = { ...sensorData, ...req.body };
    res.json({
        modeKipas: sensorData.modeKipas,
        modePenghangat: sensorData.modePenghangat,
        modeLED: sensorData.modeLED
    });
});

app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});