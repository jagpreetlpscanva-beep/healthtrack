const base = process.env.TEST_BASE_URL || 'http://localhost:8787';
const checks = ['/api/health', '/api/profile', '/api/comparisons', '/api/insights'];
let failed = false;
for (const path of checks) {
  try {
    const res = await fetch(base + path);
    console.log(`${res.ok ? 'PASS' : 'FAIL'} ${path} (${res.status})`);
    if (!res.ok) failed = true;
  } catch (e) { console.log(`FAIL ${path}: ${e.message}`); failed = true; }
}
if (failed) process.exit(1);
