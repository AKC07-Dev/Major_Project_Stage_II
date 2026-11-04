import http from 'http';

const API_BASE = 'http://localhost:5000/api';
const DEVICE_KEY = 'SMB-ESP32-SECRET-API-KEY-2026';

function makeRequest(url: string, method: string, headers: Record<string, string> = {}, body: any = null): Promise<{ status: number; data: any }> {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const postData = body ? JSON.stringify(body) : '';

    const reqHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (body) {
      reqHeaders['Content-Length'] = Buffer.byteLength(postData).toString();
    }

    const req = http.request(
      {
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname + urlObj.search,
        method,
        headers: reqHeaders,
      },
      (res) => {
        let responseBody = '';
        res.on('data', (chunk) => (responseBody += chunk));
        res.on('end', () => {
          try {
            const parsed = responseBody ? JSON.parse(responseBody) : {};
            resolve({ status: res.statusCode || 500, data: parsed });
          } catch (e) {
            resolve({ status: res.statusCode || 500, data: responseBody });
          }
        });
      }
    );

    req.on('error', (err) => reject(err));
    if (body) req.write(postData);
    req.end();
  });
}

async function runIntegrationSuite() {
  console.log('====================================================');
  console.log('SMART MEDICINE BOX INTEGRATION TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  async function assertTest(name: string, fn: () => Promise<boolean>) {
    try {
      const success = await fn();
      if (success) {
        console.log(`[PASS] ${name}`);
        passed++;
      } else {
        console.error(`[FAIL] ${name}`);
        failed++;
      }
    } catch (err: any) {
      console.error(`[FAIL] ${name} - Exception: ${err.message}`);
      failed++;
    }
  }

  // Test 1: Health Check
  await assertTest('Test 1: GET /api/health endpoint', async () => {
    const res = await makeRequest(`${API_BASE}/health`, 'GET');
    return res.status === 200 && res.data.status === 'OK';
  });

  // Test 2: Caretaker Authentication
  let authToken = '';
  await assertTest('Test 2: POST /api/auth/login with valid credentials', async () => {
    const res = await makeRequest(`${API_BASE}/auth/login`, 'POST', {}, { email: 'caretaker@smartbox.com', password: 'caretaker123' });
    if (res.status === 200 && res.data.token) {
      authToken = res.data.token;
      return true;
    }
    return false;
  });

  // Test 3: ESP32 Dynamic Schedule Sync
  await assertTest('Test 3: GET /api/device/schedules with X-Device-API-Key', async () => {
    const res = await makeRequest(`${API_BASE}/device/schedules`, 'GET', { 'X-Device-API-Key': DEVICE_KEY });
    return res.status === 200 && Array.isArray(res.data.schedules) && res.data.schedules.length > 0;
  });

  // Test 4: Box 1 Intake Event Ingestion
  await assertTest('Test 4: POST /api/device/events (Box 1 - Lid Open Event)', async () => {
    const res = await makeRequest(
      `${API_BASE}/device/events`,
      'POST',
      { 'X-Device-API-Key': DEVICE_KEY },
      {
        deviceId: 'SMB-ESP32-001',
        boxNumber: 1,
        medicineName: 'Morning Medicine (Blood Pressure)',
        eventType: 'MEDICINE_TAKEN',
      }
    );
    return res.status === 201 || (res.status === 200 && res.data.message.includes('idempotent'));
  });

  // Test 5: Box 2 Intake Event Ingestion
  await assertTest('Test 5: POST /api/device/events (Box 2 - Proximity Sensor Event)', async () => {
    const res = await makeRequest(
      `${API_BASE}/device/events`,
      'POST',
      { 'X-Device-API-Key': DEVICE_KEY },
      {
        deviceId: 'SMB-ESP32-001',
        boxNumber: 2,
        medicineName: 'Afternoon Medicine (Multivitamin)',
        eventType: 'MEDICINE_TAKEN',
      }
    );
    return res.status === 201 || (res.status === 200 && res.data.message.includes('idempotent'));
  });

  // Test 6: Deduplication Check
  await assertTest('Test 6: Idempotency deduplication check on rapid duplicate push', async () => {
    const res = await makeRequest(
      `${API_BASE}/device/events`,
      'POST',
      { 'X-Device-API-Key': DEVICE_KEY },
      {
        deviceId: 'SMB-ESP32-001',
        boxNumber: 2,
        medicineName: 'Afternoon Medicine (Multivitamin)',
        eventType: 'MEDICINE_TAKEN',
      }
    );
    return res.status === 200 && res.data.message.includes('idempotent');
  });

  // Test 7: ESP32 Telemetry Heartbeat
  await assertTest('Test 7: POST /api/device/heartbeat ping', async () => {
    const res = await makeRequest(
      `${API_BASE}/device/heartbeat`,
      'POST',
      { 'X-Device-API-Key': DEVICE_KEY },
      {
        deviceId: 'SMB-ESP32-001',
        wifiSignal: -52,
        firmwareVersion: 'v1.2.0',
      }
    );
    return res.status === 200 && res.data.status === 'ONLINE';
  });

  // Test 8: Caretaker Dashboard Analytics API
  await assertTest('Test 8: GET /api/analytics/summary with JWT Bearer Token', async () => {
    const res = await makeRequest(`${API_BASE}/analytics/summary`, 'GET', { Authorization: `Bearer ${authToken}` });
    return res.status === 200 && res.data.summary && res.data.summary.totalEventsCount >= 0;
  });

  // Test 9: Device Status for Frontend
  await assertTest('Test 9: GET /api/device/status for Frontend Dashboard', async () => {
    const res = await makeRequest(`${API_BASE}/device/status`, 'GET');
    return res.status === 200 && res.data.device && res.data.device.status === 'ONLINE';
  });

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) process.exit(1);
}

runIntegrationSuite();
