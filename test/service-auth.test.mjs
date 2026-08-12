import assert from 'node:assert/strict';
import test from 'node:test';

const authModule = await import('../src/lib/service-auth.mjs').catch(() => ({}));
const TOKEN = 'a'.repeat(43);

test('opportunity API authentication fails closed before a database request', async () => {
  assert.equal(typeof authModule.authorizeOpportunityServiceRequest, 'function');

  for (const [configuredToken, authorization, expectedStatus] of [
    ['', '', 503],
    ['short', '', 503],
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
