import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const loginDuration = new Trend('login_duration');
const expenseDuration = new Trend('expense_create_duration');
const dashboardDuration = new Trend('dashboard_duration');

const BASE_URL = __ENV.API_URL || 'http://localhost:3001/api/v1';

export const options = {
  stages: [
    { duration: '30s', target: 50 },   // ramp up to 50 users
    { duration: '1m', target: 200 },    // ramp up to 200 users
    { duration: '2m', target: 500 },    // ramp up to 500 users
    { duration: '3m', target: 1000 },   // ramp up to 1000 users
    { duration: '1m', target: 0 },      // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],   // 95% of requests < 2s
    errors: ['rate<0.1'],                // error rate < 10%
    login_duration: ['p(95)<3000'],
    expense_create_duration: ['p(95)<2000'],
    dashboard_duration: ['p(95)<2500'],
  },
};

function getAuthToken() {
  const vuId = __VU;
  const email = `loadtest${vuId}@fintrack.test`;
  const password = 'TestPass123!';

  // Try login first
  const loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
    email,
    password,
  }), {
    headers: { 'Content-Type': 'application/json' },
    tags: { name: 'login' },
  });

  loginDuration.add(loginRes.timings.duration);

  if (loginRes.status === 200) {
    return JSON.parse(loginRes.body).data.accessToken;
  }

  // Register if login failed
  const registerRes = http.post(`${BASE_URL}/auth/register`, JSON.stringify({
    email,
    username: `loadtest${vuId}`,
    password,
  }), {
    headers: { 'Content-Type': 'application/json' },
    tags: { name: 'register' },
  });

  if (registerRes.status === 201) {
    return JSON.parse(registerRes.body).data.accessToken;
  }

  return null;
}

export default function () {
  const token = getAuthToken();
  if (!token) {
    errorRate.add(1);
    sleep(1);
    return;
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // Create expense
  const expenseRes = http.post(`${BASE_URL}/expenses`, JSON.stringify({
    amount: Math.random() * 100 + 1,
    currency: 'USD',
    description: `K6 test expense ${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
  }), { headers, tags: { name: 'create_expense' } });

  expenseDuration.add(expenseRes.timings.duration);
  check(expenseRes, { 'expense created': (r) => r.status === 201 });
  errorRate.add(expenseRes.status !== 201);

  sleep(0.5);

  // Get dashboard
  const dashRes = http.get(`${BASE_URL}/analytics/dashboard?period=month`, {
    headers,
    tags: { name: 'dashboard' },
  });

  dashboardDuration.add(dashRes.timings.duration);
  check(dashRes, { 'dashboard loaded': (r) => r.status === 200 });
  errorRate.add(dashRes.status !== 200);

  sleep(0.5);

  // List expenses
  const listRes = http.get(`${BASE_URL}/expenses?page=1&limit=20`, {
    headers,
    tags: { name: 'list_expenses' },
  });

  check(listRes, { 'expenses listed': (r) => r.status === 200 });
  errorRate.add(listRes.status !== 200);

  sleep(1);
}
