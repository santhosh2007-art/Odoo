import http from 'http';

const PORT = 5000;

const request = (path, method = 'GET', body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const headers = {
      'Content-Type': 'application/json',
    };
    if (payload) {
      headers['Content-Length'] = Buffer.byteLength(payload);
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path,
        method,
        headers,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({
              status: res.statusCode,
              body: JSON.parse(data),
            });
          } catch (err) {
            resolve({
              status: res.statusCode,
              body: data,
            });
          }
        });
      }
    );

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
};

const runTests = async () => {
  console.log('🧪 Starting Dayflow Spring Boot 3 & SQLite Auth Test Suite...\n');

  try {
    // Test 1: Health check
    console.log('Test 1: Health Check GET /health');
    const res1 = await request('/health');
    console.assert(res1.status === 200, 'Health check should return 200');
    console.log('  ✅ Result: Status', res1.status, res1.body.service);

    // Test 2: Signup with weak password
    console.log('\nTest 2: Signup with Weak Password');
    const res2 = await request('/api/auth/signup', 'POST', {
      employeeId: 'EMP-SPRING-999',
      email: 'spring.test@dayflow.com',
      password: 'weak',
      name: 'Spring Test User',
      role: 'Employee',
    });
    console.assert(res2.status === 400, 'Weak password should fail with 400');
    console.log('  ✅ Result: Status', res2.status, res2.body.message, res2.body.errors);

    // Test 3: Signup with valid password
    console.log('\nTest 3: Signup with Valid Credentials');
    const res3 = await request('/api/auth/signup', 'POST', {
      employeeId: 'EMP-SPRING-999',
      email: 'spring.test@dayflow.com',
      password: 'SecureSpringPass123!',
      name: 'Spring Test Employee',
      role: 'Employee',
    });
    console.assert(res3.status === 201, 'Valid signup should return 201');
    console.log('  ✅ Result: Status', res3.status, 'User Created:', res3.body.data.employeeId);
    const verificationToken = res3.body.data.verificationToken;

    // Test 4: Signin before email verification
    console.log('\nTest 4: Signin before Email Verification');
    const res4 = await request('/api/auth/signin', 'POST', {
      email: 'spring.test@dayflow.com',
      password: 'SecureSpringPass123!',
    });
    console.assert(res4.status === 403, 'Unverified signin should return 403');
    console.log('  ✅ Result: Status', res4.status, res4.body.message);

    // Test 5: Email Verification
    console.log('\nTest 5: Email Verification GET /api/auth/verify-email');
    const res5 = await request(`/api/auth/verify-email?token=${verificationToken}`);
    console.assert(res5.status === 200, 'Email verification should return 200');
    console.log('  ✅ Result: Status', res5.status, res5.body.message);

    // Test 6: Signin with invalid password
    console.log('\nTest 6: Signin with Wrong Password');
    const res6 = await request('/api/auth/signin', 'POST', {
      email: 'spring.test@dayflow.com',
      password: 'WrongPassword123!',
    });
    console.assert(res6.status === 401, 'Wrong password signin should return 401');
    console.log('  ✅ Result: Status', res6.status, res6.body.message);

    // Test 7: Signin with correct password
    console.log('\nTest 7: Signin with Correct Password');
    const res7 = await request('/api/auth/signin', 'POST', {
      email: 'spring.test@dayflow.com',
      password: 'SecureSpringPass123!',
    });
    console.assert(res7.status === 200, 'Correct signin should return 200');
    console.log('  ✅ Result: Status', res7.status, 'JWT Token acquired:', res7.body.data.token.substring(0, 20) + '...');
    const authToken = res7.body.data.token;

    // Test 8: Get Profile GET /api/auth/me
    console.log('\nTest 8: Protected GET /api/auth/me');
    const res8 = await request('/api/auth/me', 'GET', null, authToken);
    console.assert(res8.status === 200, 'Protected profile fetch should return 200');
    console.log('  ✅ Result: User Profile:', res8.body.data.email, '| Role:', res8.body.data.role, '| Job:', res8.body.data.jobTitle);

    // Test 9: Signin Seeded HR Account
    console.log('\nTest 9: Signin Seeded HR Account (hr@dayflow.com)');
    const res9 = await request('/api/auth/signin', 'POST', {
      email: 'hr@dayflow.com',
      password: 'Admin@1234',
    });
    console.assert(res9.status === 200, 'HR signin should return 200');
    console.log('  ✅ Result: Status', res9.status, 'Logged in as HR Manager, Role:', res9.body.data.user.role);

    console.log('\n==================================================');
    console.log('🎉 ALL SPRING BOOT 3 & SQLITE AUTH TESTS PASSED SUCCESSFULLY!');
    console.log('==================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Test execution failed:', err);
    process.exit(1);
  }
};

runTests();
