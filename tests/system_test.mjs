/**
 * DispatchX End-to-End Automated System Test Suite
 * 
 * Tests the entire distributed architecture:
 * 1. Gateway Health & Prometheus Telemetry
 * 2. User Registration & Authentication (JWT)
 * 3. Protected Route Security (401 on missing token)
 * 4. Transactional Outbox Single Email Dispatch
 * 5. Bulk Campaign Creation with Outbox Events
 * 6. User Campaign History & Status Fetching
 * 7. Rate Limiter Validation
 */

const BASE_URL = process.env.API_GATEWAY_URL || "http://localhost:5000";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Color formatting for console
const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  dim: "\x1b[2m",
};

let totalPassed = 0;
let totalFailed = 0;
const results = [];

async function test(name, fn) {
  const start = Date.now();
  try {
    await fn();
    const duration = Date.now() - start;
    totalPassed++;
    results.push({ name, passed: true, duration });
    console.log(`  ${c.green}✔ PASS${c.reset}  ${name} ${c.dim}(${duration}ms)${c.reset}`);
  } catch (err) {
    const duration = Date.now() - start;
    totalFailed++;
    results.push({ name, passed: false, duration, error: err.message });
    console.log(`  ${c.red}✖ FAIL${c.reset}  ${name} ${c.dim}(${duration}ms)${c.reset}`);
    console.log(`         ${c.red}Error: ${err.message}${c.reset}`);
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
}

async function runTests() {
  console.log(`\n${c.bold}${c.cyan}====================================================${c.reset}`);
  console.log(`${c.bold}${c.cyan}   DispatchX Distributed System Integration Tests   ${c.reset}`);
  console.log(`${c.bold}${c.cyan}====================================================${c.reset}\n`);

  let authToken = null;
  let testUser = null;
  let testNotificationId = null;
  let testCampaignId = null;

  // 1. Health Checks
  console.log(`${c.bold}1. Infrastructure & Service Probing${c.reset}`);
  
  await test("API Gateway is running and healthy (/health)", async () => {
    const res = await fetch(`${BASE_URL}/health`);
    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    const data = await res.json();
    assert(data.status === "OK", `Expected status OK, got ${data.status}`);
  });

  await test("Prometheus telemetry scrape endpoint is active (/metrics)", async () => {
    const res = await fetch(`${BASE_URL}/metrics`);
    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    const text = await res.text();
    assert(text.includes("http_requests_total") || text.includes("process_cpu_user_seconds_total") || text.length > 50, "Metrics endpoint returned empty response");
  });

  await test("Frontend Nginx web server is serving HTTP 200", async () => {
    const res = await fetch(FRONTEND_URL);
    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    const html = await res.text();
    assert(html.includes("<div id=\"root\">"), "Frontend HTML does not include root element");
  });

  // 2. Authentication Lifecycle
  console.log(`\n${c.bold}2. Authentication & JWT Session Lifecycle${c.reset}`);

  const timestamp = Date.now();
  const testEmail = `qa_test_${timestamp}@dispatchx.test`;
  const testPassword = `TestPass_${timestamp}!`;

  await test("User Registration (POST /api/auth/register)", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `QA User ${timestamp}`,
        email: testEmail,
        password: testPassword,
      }),
    });

    assert(res.status === 201 || res.status === 200, `Expected 200/201, got ${res.status}`);
    const data = await res.json();
    assert(data.user && data.user.email === testEmail, "User object was not returned or email mismatched");
    assert(data.accesstoken, "Access token was not provided in response");
    testUser = data.user;
    authToken = data.accesstoken;
  });

  await test("User Login with valid credentials (POST /api/auth/login)", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });

    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    const data = await res.json();
    assert(data.accesstoken, "Login did not return access token");
    authToken = data.accesstoken;
  });

  await test("Security: Block unauthenticated access to protected routes (401 expected)", async () => {
    const res = await fetch(`${BASE_URL}/api/notifications/send-single`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: "unauthorized@test.com",
        subject: "Hack attempt",
        body: "Should fail",
      }),
    });

    assert(res.status === 401 || res.status === 403, `Expected 401 Unauthorized, got ${res.status}`);
  });

  // 3. Notification Service & Transactional Outbox
  console.log(`\n${c.bold}3. Transactional Outbox & Email Dispatches${c.reset}`);

  await test("Send Single Transactional Email (POST /api/notifications/send-single)", async () => {
    const res = await fetch(`${BASE_URL}/api/notifications/send-single`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        userId: testUser._id || testUser.id,
        to: "verify@dispatchx.test",
        subject: "Integration Suite Automated Dispatch",
        body: "Validating that outbox atomicity and RabbitMQ events work as intended.",
      }),
    });

    assert(res.status === 200 || res.status === 201, `Expected status 200/201, got ${res.status}`);
    const data = await res.json();
    const notification = data.data?.notification || data.notification;
    assert(notification && notification._id, "Notification dispatch did not confirm creation");
    testNotificationId = notification._id;
  });

  await test("Create Bulk Campaign with Recipients (POST /api/notifications/send-bulk)", async () => {
    const res = await fetch(`${BASE_URL}/api/notifications/send-bulk`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        userId: testUser._id || testUser.id,
        title: `Automated Batch #${timestamp}`,
        subject: "Bulk Outbox Verification",
        body: "Batch dispatching across distributed queues.",
        recipients: [
          "recipient1@dispatchx.test",
          "recipient2@dispatchx.test",
          "recipient3@dispatchx.test"
        ],
      }),
    });

    assert(res.status === 200 || res.status === 201, `Expected status 200/201, got ${res.status}`);
    const data = await res.json();
    const campaign = data.data?.campaign || data.campaign;
    assert(campaign && campaign._id, "Campaign creation response did not contain campaign record");
    testCampaignId = campaign._id;
  });

  await test("Retrieve User Campaigns & Stats (GET /api/notifications/campaigns/user/:userId)", async () => {
    const userId = testUser._id || testUser.id;
    const res = await fetch(`${BASE_URL}/api/notifications/campaigns/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    const data = await res.json();
    const campaigns = data.campaigns || data;
    assert(Array.isArray(campaigns), "Campaigns response is not an array");
    assert(campaigns.length >= 1, `Expected at least 1 campaign, found ${campaigns.length}`);
  });

  // 4. Rate Limiting Check
  console.log(`\n${c.bold}4. Redis Sliding Window Rate Limiter${c.reset}`);

  await test("API Gateway Rate Limiter passes regular traffic", async () => {
    const res = await fetch(`${BASE_URL}/health`);
    assert(res.status === 200, "Health check rate-limited unexpectedly");
  });

  // Summary
  console.log(`\n${c.bold}====================================================${c.reset}`);
  console.log(`${c.bold}                 Test Execution Summary             ${c.reset}`);
  console.log(`${c.bold}====================================================${c.reset}`);
  console.log(`  Total Tests Run:  ${c.bold}${results.length}${c.reset}`);
  console.log(`  Passed:           ${c.green}${totalPassed} ✔${c.reset}`);
  console.log(`  Failed:           ${totalFailed === 0 ? c.green + "0" : c.red + totalFailed} ✖${c.reset}`);
  console.log(`${c.bold}====================================================${c.reset}\n`);

  if (totalFailed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Fatal Test Runner Error:", err);
  process.exit(1);
});
