import assert from 'node:assert/strict';
import test from 'node:test';

const authModule = await import('../src/lib/service-auth.mjs').catch(() => ({}));
const TOKEN = 'a'.repeat(43);

test('opportunity API authentication fails closed before a database request', async () => {
  assert.equal(typeof authModule.authorizeOpportunityServiceRequest, 'function');

  for (const [configuredToken, authorization, expectedStatus] of [
    ['', '', 503],
    ['short', '', 503],
    [`${TOKEN} `, `Bearer ${TOKEN}`, 503],
    [TOKEN, '', 401],
    [TOKEN, 'Basic dXNlcjpwYXNz', 401],
    [TOKEN, `Bearer ${'b'.repeat(43)}`, 401],
  ]) {
    const response = authModule.authorizeOpportunityServiceRequest(
      new Request('https://opportunity-tracker-sw.netlify.app/api/opportunities', {
        headers: authorization ? { authorization } : {},
      }),
      configuredToken,
    );
    assert.equal(response?.status, expectedStatus);
    assert.equal(response?.headers.get('cache-control'), 'no-store');
    const body = await response.text();
    assert.doesNotMatch(body, /opportunit|customer|target.price|row|database|token/i);
  }
});

test('every opportunity route denies before database, params, or body processing', async () => {
  process.env.OPPORTUNITY_TRACKER_SERVICE_TOKEN = TOKEN;
  process.env.DATABASE_URL = '';
  const collection = await import('../src/app/api/opportunities/route.ts');
  const item = await import('../src/app/api/opportunities/[id]/route.ts');
  const throwingParams = Object.defineProperty({}, 'then', {
    get() { throw new Error('route touched params before authorization'); },
  });
  const cases = [
    [collection.GET, 'GET', 'https://example.test/api/opportunities', undefined, undefined],
    [collection.HEAD, 'HEAD', 'https://example.test/api/opportunities', undefined, undefined],
    [collection.POST, 'POST', 'https://example.test/api/opportunities', 'not-json', undefined],
    [collection.DELETE, 'DELETE', 'https://example.test/api/opportunities', undefined, undefined],
    [item.PUT, 'PUT', 'https://example.test/api/opportunities/private-id', 'not-json', { params: throwingParams }],
    [item.PATCH, 'PATCH', 'https://example.test/api/opportunities/private-id', 'not-json', { params: throwingParams }],
    [item.DELETE, 'DELETE', 'https://example.test/api/opportunities/private-id', undefined, { params: throwingParams }],
  ];

  for (const [handler, method, url, body, context] of cases) {
    const request = new Request(url, {
      method,
      ...(body === undefined ? {} : { body }),
    });
    const response = await handler(request, context);
    assert.equal(response.status, 401, `${method} ${url}`);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    const responseBody = await response.text();
    if (method === 'HEAD') assert.equal(responseBody, '');
    else assert.deepEqual(JSON.parse(responseBody), { error: 'Unauthorized' });
  }
});

test('only the exact service bearer credential authorizes an opportunity API request', () => {
  assert.equal(typeof authModule.authorizeOpportunityServiceRequest, 'function');
  const response = authModule.authorizeOpportunityServiceRequest(
    new Request('https://opportunity-tracker-sw.netlify.app/api/opportunities', {
      headers: { authorization: `Bearer ${TOKEN}` },
    }),
    TOKEN,
  );
  assert.equal(response, null);
});

test('HEAD authentication failures never include a response body', async () => {
  assert.equal(typeof authModule.authorizeOpportunityServiceRequest, 'function');
  const response = authModule.authorizeOpportunityServiceRequest(
    new Request('https://opportunity-tracker-sw.netlify.app/api/opportunities', { method: 'HEAD' }),
    TOKEN,
  );
  assert.equal(response.status, 401);
  assert.equal(await response.text(), '');
});
