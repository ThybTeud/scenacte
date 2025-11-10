#!/usr/bin/env node

/**
 * Script de test complet des routes API de Scenacte
 * Usage: node test-api.js
 */

const API_BASE = process.env.API_URL || 'http://localhost:3000/api';

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

let testsPassed = 0;
let testsFailed = 0;
let token = null;
let userId = null;
let playId = null;
let versionId = null;

// Helper pour faire des requêtes
async function request(method, endpoint, data = null, auth = false) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (auth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, options);
  const contentType = response.headers.get('content-type');
  const responseData = contentType && contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  return {
    status: response.status,
    ok: response.ok,
    data: responseData,
  };
}

// Helper pour logger les résultats
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name, passed, details = '') {
  if (passed) {
    testsPassed++;
    log(`  ✓ ${name}`, 'green');
  } else {
    testsFailed++;
    log(`  ✗ ${name}`, 'red');
    if (details) log(`    ${details}`, 'yellow');
  }
}

// Tests
async function testHealthCheck() {
  log('\n📍 Health Check', 'cyan');
  try {
    const res = await request('GET', '/health');
    logTest('GET /health', res.ok && res.data.status === 'ok');
  } catch (error) {
    logTest('GET /health', false, error.message);
  }
}

async function testAuth() {
  log('\n🔐 Authentication', 'cyan');

  const testEmail = `test-${Date.now()}@scenacte.com`;
  const testUsername = `testuser${Date.now()}`;
  const testPassword = 'TestPassword123!';

  // Register
  try {
    const res = await request('POST', '/auth/register', {
      email: testEmail,
      username: testUsername,
      password: testPassword,
    });
    logTest('POST /auth/register', res.ok && res.data.token);
    if (res.ok) {
      token = res.data.token;
      userId = res.data.user.id;
    }
  } catch (error) {
    logTest('POST /auth/register', false, error.message);
  }

  // Login
  try {
    const res = await request('POST', '/auth/login', {
      email: testEmail,
      password: testPassword,
    });
    logTest('POST /auth/login', res.ok && res.data.token);
    if (res.ok && !token) token = res.data.token;
  } catch (error) {
    logTest('POST /auth/login', false, error.message);
  }

  // Get current user
  try {
    const res = await request('GET', '/auth/me', null, true);
    logTest('GET /auth/me', res.ok && res.data.user);
  } catch (error) {
    logTest('GET /auth/me', false, error.message);
  }

  // Forgot password
  try {
    const res = await request('POST', '/auth/forgot-password', {
      email: testEmail,
    });
    logTest('POST /auth/forgot-password', res.ok);
  } catch (error) {
    logTest('POST /auth/forgot-password', false, error.message);
  }
}

async function testUsers() {
  log('\n👤 Users', 'cyan');

  // Get profile
  try {
    const res = await request('GET', '/users/profile', null, true);
    logTest('GET /users/profile', res.ok && res.data.user && typeof res.data.user.playsCount !== 'undefined');
  } catch (error) {
    logTest('GET /users/profile', false, error.message);
  }

  // Update profile
  try {
    const res = await request('PUT', '/users/profile', {
      username: `updated${Date.now()}`,
    }, true);
    logTest('PUT /users/profile', res.ok);
  } catch (error) {
    logTest('PUT /users/profile', false, error.message);
  }
}

async function testPlays() {
  log('\n🎭 Plays', 'cyan');

  // Create play
  try {
    const res = await request('POST', '/plays', {
      title: 'Test Play',
      subtitle: 'A test play',
      rawContent: '# Acte 1\n\n## Scène 1\n\nTest content',
    }, true);
    logTest('POST /plays', res.ok && res.data.play);
    if (res.ok) playId = res.data.play.id;
  } catch (error) {
    logTest('POST /plays', false, error.message);
  }

  // List plays
  try {
    const res = await request('GET', '/plays?page=1&limit=20', null, true);
    logTest('GET /plays', res.ok && Array.isArray(res.data.plays));
  } catch (error) {
    logTest('GET /plays', false, error.message);
  }

  // Get single play
  if (playId) {
    try {
      const res = await request('GET', `/plays/${playId}`, null, true);
      logTest(`GET /plays/${playId}`, res.ok && res.data.play);
    } catch (error) {
      logTest(`GET /plays/${playId}`, false, error.message);
    }

    // Update play
    try {
      const res = await request('PUT', `/plays/${playId}`, {
        title: 'Updated Test Play',
        rawContent: '# Acte 1\n\n## Scène 1\n\nUpdated content',
        htmlContent: '<h1>Acte 1</h1><h2>Scène 1</h2><p>Updated content</p>',
        statistics: {
          totalActs: 1,
          totalScenes: 1,
          totalCharacters: 0,
          totalLines: 1,
          wordCount: 5,
          estimatedDurationMinutes: 1
        },
        versionType: 'manual',
        manualLabel: 'Test update',
      }, true);
      logTest(`PUT /plays/${playId}`, res.ok);
      // Don't set versionId here, we'll get it from the versions list
    } catch (error) {
      logTest(`PUT /plays/${playId}`, false, error.message);
    }

    // Update status
    try {
      const res = await request('PATCH', `/plays/${playId}/status`, {
        status: 'completed',
      }, true);
      logTest(`PATCH /plays/${playId}/status`, res.ok);
    } catch (error) {
      logTest(`PATCH /plays/${playId}/status`, false, error.message);
    }
  }
}

async function testVersions() {
  log('\n📚 Versions', 'cyan');

  if (!playId) {
    log('  ⚠ Skipped (no play created)', 'yellow');
    return;
  }

  // List versions
  try {
    const res = await request('GET', `/plays/${playId}/versions?page=1&limit=20`, null, true);
    logTest(`GET /plays/${playId}/versions`, res.ok && Array.isArray(res.data.versions));
    if (res.ok && res.data.versions.length > 0 && !versionId) {
      versionId = res.data.versions[0].id;
    }
  } catch (error) {
    logTest(`GET /plays/${playId}/versions`, false, error.message);
  }

  // Get specific version
  if (versionId) {
    try {
      const res = await request('GET', `/plays/${playId}/versions/${versionId}`, null, true);
      logTest(`GET /plays/${playId}/versions/${versionId}`, res.ok && res.data.version);
    } catch (error) {
      logTest(`GET /plays/${playId}/versions/${versionId}`, false, error.message);
    }

    // Create manual version
    try {
      const res = await request('POST', `/plays/${playId}/versions/manual`, {
        manualLabel: 'Manual backup',
      }, true);
      logTest(`POST /plays/${playId}/versions/manual`, res.ok);
    } catch (error) {
      logTest(`POST /plays/${playId}/versions/manual`, false, error.message);
    }

    // Restore version
    try {
      const res = await request('POST', `/plays/${playId}/versions/restore`, {
        versionId: versionId,
      }, true);
      logTest(`POST /plays/${playId}/versions/restore`, res.ok);
    } catch (error) {
      logTest(`POST /plays/${playId}/versions/restore`, false, error.message);
    }
  }
}

async function testTemplates() {
  log('\n📄 Templates', 'cyan');

  // List templates
  try {
    const res = await request('GET', '/templates', null, true);
    logTest('GET /templates', res.ok && Array.isArray(res.data.templates));
  } catch (error) {
    logTest('GET /templates', false, error.message);
  }
}

async function cleanup() {
  log('\n🧹 Cleanup', 'cyan');

  // Delete play
  if (playId) {
    try {
      const res = await request('DELETE', `/plays/${playId}`, null, true);
      logTest(`DELETE /plays/${playId}`, res.ok);
    } catch (error) {
      logTest(`DELETE /plays/${playId}`, false, error.message);
    }
  }
}

// Main
async function runTests() {
  log('╔═══════════════════════════════════════════╗', 'blue');
  log('║  🎭 SCENACTE API - SUITE DE TESTS        ║', 'blue');
  log('╚═══════════════════════════════════════════╝', 'blue');
  log(`\nAPI Base URL: ${API_BASE}\n`);

  try {
    await testHealthCheck();
    await testAuth();
    await testUsers();
    await testPlays();
    await testVersions();
    await testTemplates();
    await cleanup();

    log('\n╔═══════════════════════════════════════════╗', 'blue');
    log('║  📊 RÉSULTATS                             ║', 'blue');
    log('╚═══════════════════════════════════════════╝', 'blue');
    log(`\n  Total: ${testsPassed + testsFailed}`);
    log(`  Passed: ${testsPassed}`, 'green');
    log(`  Failed: ${testsFailed}`, 'red');
    log(`  Success rate: ${Math.round((testsPassed / (testsPassed + testsFailed)) * 100)}%\n`);

    process.exit(testsFailed > 0 ? 1 : 0);
  } catch (error) {
    log(`\n❌ Erreur fatale: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Vérifier que le serveur est accessible
async function checkServer() {
  try {
    const response = await fetch(`${API_BASE}/health`);
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }
    return true;
  } catch (error) {
    log(`\n❌ Impossible de se connecter au serveur API sur ${API_BASE}`, 'red');
    log(`   Assurez-vous que le serveur est démarré (npm run dev dans le dossier server)\n`, 'yellow');
    return false;
  }
}

// Lancer les tests
(async () => {
  const serverOk = await checkServer();
  if (serverOk) {
    await runTests();
  } else {
    process.exit(1);
  }
})();
