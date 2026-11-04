import http from 'http';

const boxArg = process.argv[2] ? parseInt(process.argv[2], 10) : 1;
const typeArg = process.argv[3] || 'MEDICINE_TAKEN';
const nameArg = process.argv[4] || (boxArg === 1 ? 'Morning Medicine (Blood Pressure)' : 'Afternoon Medicine (Multivitamin)');

const payload = {
  deviceId: 'SMB-ESP32-001',
  boxNumber: boxArg,
  medicineName: nameArg,
  eventType: typeArg,
  timestamp: new Date().toISOString(),
};

const postData = JSON.stringify(payload);

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/device/events',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'X-Device-API-Key': 'SMB-ESP32-SECRET-API-KEY-2026',
  },
};

console.log('====================================================');
console.log('DEV HARDWARE EVENT SIMULATOR (TEST TOOL)');
console.log('====================================================');
console.log(`Pinging local server at http://localhost:5000/api/device/events...`);
console.log(`Payload:`, payload);

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => (data += chunk));
  res.on('end', () => {
    console.log(`\nHTTP Response Code: ${res.statusCode}`);
    try {
      console.log(`Response Payload:`, JSON.parse(data));
    } catch {
      console.log(`Response Payload:`, data);
    }
    console.log('====================================================');
  });
});

req.on('error', (err) => {
  console.error('Failed to communicate with local backend server:', err.message);
});

req.write(postData);
req.end();
