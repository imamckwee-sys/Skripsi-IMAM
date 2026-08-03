const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

let sensorData = {
    suhu1: 0, suhu2: 0,
    hum1: 0, hum2: 0,
    lux1: 0,
    gas1: 0, gas2: 0,
    kipas: false,
    penghangat: false,
    led: false,
    modeKipas: 0,
    modePenghangat: 0,
    modeLED: 0
};

let lastSeen = 0; // Waktu terakhir ESP32 mengirim data

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API untuk Web Dashboard membaca data sensor & status ESP32
app.get('/api/data', (req, res) => {
    // Anggap ESP32 offline jika tidak ada kiriman data lebih dari 7 detik
    const isEspOnline = (Date.now() - lastSeen) < 7000 && lastSeen !== 0;
    res.json({
        ...sensorData,
        isEspOnline
    });
});

app.get('/api/control', (req, res) => {
    const { device, mode } = req.query;
    const m = parseInt(mode);
    if (device === 'kipas') sensorData.modeKipas = m;
    if (device === 'penghangat') sensorData.modePenghangat = m;
    if (device === 'led') sensorData.modeLED = m;
    res.send('OK');
});

// API saat ESP32 mengirim data
app.post('/api/update', (req, res) => {
    sensorData = { ...sensorData, ...req.body };
    lastSeen = Date.now(); // Catat jam/detik terakhir ESP32 mengirim data
    res.json({
        modeKipas: sensorData.modeKipas,
        modePenghangat: sensorData.modePenghangat,
        modeLED: sensorData.modeLED
    });
});

app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});