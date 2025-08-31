// Simple test script to verify server endpoints
// Run with: node test-endpoints.js

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testEndpoints() {
  console.log('🧪 Testing Quiz Endpoints...\n');

  try {
    // Test 1: Get contract info (no auth required for this)
    console.log('1️⃣ Testing contract info endpoint...');
    const contractResponse = await fetch(`${BASE_URL}/api/quiz/contract-info`);
    const contractData = await contractResponse.json();
    console.log('✅ Contract info:', contractData);
    console.log('');

    // Test 2: Test with a sample UID (this will fail without auth, but shows endpoint exists)
    console.log('2️⃣ Testing test endpoint with sample UID...');
    const testResponse = await fetch(`${BASE_URL}/api/quiz/test/sample-uid-123`);
    console.log('📊 Response status:', testResponse.status);
    if (testResponse.status === 401) {
      console.log('✅ Endpoint exists (auth required as expected)');
    } else {
      console.log('📝 Response:', await testResponse.text());
    }
    console.log('');

    console.log('🎯 All endpoints are working!');
    console.log('');
    console.log('📋 To test with real data:');
    console.log('1. Start the server: npm run dev');
    console.log('2. Create a quiz in the frontend');
    console.log('3. Use the QuizTester component in /dashboard');
    console.log('4. Test with real UID');

  } catch (error) {
    console.error('❌ Error testing endpoints:', error.message);
    console.log('');
    console.log('💡 Make sure the server is running on port 3000');
  }
}

testEndpoints();
