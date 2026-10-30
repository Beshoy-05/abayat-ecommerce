
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '20s', target: 5 },
    { duration: '30s', target: 10 },
    { duration: '30s', target: 20 },
    { duration: '10s', target: 0 },
  ],

  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<2000'],
  },
};

export default function () {
  const response = http.get(
    'https://abaya-ecommerce.runasp.net/api/Products?pageSize=8',
    { timeout: '10s' }
  );

  check(response, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
