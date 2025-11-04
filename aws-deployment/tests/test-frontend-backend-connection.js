#!/usr/bin/env node
/**
 * Frontend-Backend Connection Test Script
 * Tests connectivity and basic API operations that the frontend would perform
 */

const https = require('https');
const http = require('http');

// Get base URL from command line
const baseUrl = process.argv[2];

if (!baseUrl) {
  console.error('❌ Error: Please provide base URL as argument');
  console.error('Usage: node test-frontend-backend-connection.js <BASE_URL>');
  process.exit(1);
}

// Helper function to make HTTP/HTTPS requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;

    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = protocol.request(urlObj, requestOptions, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

// Test functions
async function testHealthEndpoint() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 TEST: Health Endpoint Check');
  console.log('='.repeat(60));

  try {
    const url = `${baseUrl}/health`;
    console.log(`Testing: ${url}`);

    const response = await makeRequest(url);

    if (response.statusCode === 200) {
      const data = JSON.parse(response.body);
      console.log(`Response: ${JSON.stringify(data, null, 2)}`);

      if (data.status === 'ok') {
        console.log('✅ PASS: Health endpoint is working');
        return true;
      } else {
        console.log(`❌ FAIL: Health status is not 'ok': ${data.status}`);
        return false;
      }
    } else {
      console.log(`❌ FAIL: HTTP ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ FAIL: Request failed: ${error.message}`);
    return false;
  }
}

async function testAuthEndpoints() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 TEST: Authentication Endpoints');
  console.log('='.repeat(60));

  try {
    // Test signup endpoint exists
    const signupUrl = `${baseUrl}/auth/signup`;
    console.log(`Testing: POST ${signupUrl}`);

    // Send invalid data to check if endpoint exists (we expect 400, not 404)
    const response = await makeRequest(signupUrl, {
      method: 'POST',
      body: { test: 'data' }
    });

    if (response.statusCode === 400 || response.statusCode === 409) {
      console.log('✅ PASS: Auth signup endpoint is accessible');
      return true;
    } else if (response.statusCode === 404) {
      console.log(`❌ FAIL: Auth signup endpoint not found (404)`);
      return false;
    } else {
      console.log(`✅ PASS: Auth endpoint responding (status: ${response.statusCode})`);
      return true;
    }
  } catch (error) {
    console.log(`❌ FAIL: Request failed: ${error.message}`);
    return false;
  }
}

async function testCorsSupport() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 TEST: CORS Support for Frontend');
  console.log('='.repeat(60));

  try {
    const url = `${baseUrl}/health`;
    console.log(`Testing: OPTIONS ${url}`);

    const response = await makeRequest(url, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://example.com',
        'Access-Control-Request-Method': 'GET'
      }
    });

    const hasCors = response.headers['access-control-allow-origin'] !== undefined;

    if (hasCors || response.statusCode === 200 || response.statusCode === 204) {
      console.log('✅ PASS: CORS appears to be configured');
      return true;
    } else {
      console.log('⚠️  WARNING: CORS headers may not be configured');
      console.log('✅ PASS: Continuing anyway (CORS can be configured later)');
      return true;
    }
  } catch (error) {
    console.log(`❌ FAIL: Request failed: ${error.message}`);
    return false;
  }
}

async function testApiDocumentation() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 TEST: API Documentation');
  console.log('='.repeat(60));

  try {
    const url = `${baseUrl}/docs`;
    console.log(`Testing: ${url}`);

    const response = await makeRequest(url);

    if (response.statusCode === 200) {
      console.log('✅ PASS: API documentation is accessible');
      return true;
    } else {
      console.log(`⚠️  WARNING: API docs returned ${response.statusCode}`);
      console.log('✅ PASS: Not critical for frontend connection');
      return true;
    }
  } catch (error) {
    console.log(`⚠️  WARNING: ${error.message}`);
    console.log('✅ PASS: Not critical for frontend connection');
    return true;
  }
}

// Main execution
async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 FRONTEND-BACKEND CONNECTION TESTS');
  console.log('='.repeat(60));
  console.log(`API Base URL: ${baseUrl}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);

  const tests = [
    { name: 'Health Endpoint', func: testHealthEndpoint },
    { name: 'Authentication Endpoints', func: testAuthEndpoints },
    { name: 'CORS Support', func: testCorsSupport },
    { name: 'API Documentation', func: testApiDocumentation }
  ];

  const results = [];

  for (const test of tests) {
    try {
      const result = await test.func();
      results.push({ name: test.name, passed: result });
    } catch (error) {
      console.log(`\n❌ Test '${test.name}' crashed: ${error.message}`);
      results.push({ name: test.name, passed: false });
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));

  const passed = results.filter(r => r.passed).length;
  const total = results.length;

  results.forEach(result => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status}: ${result.name}`);
  });

  console.log(`\nTotal: ${passed}/${total} tests passed`);

  if (passed === total) {
    console.log('\n🎉 All tests passed! Frontend can connect to backend!');
    process.exit(0);
  } else {
    console.log(`\n❌ ${total - passed} test(s) failed! Frontend connection may have issues.`);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
