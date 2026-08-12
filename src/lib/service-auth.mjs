import { timingSafeEqual } from 'node:crypto';

const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43,128}$/u;

function failureResponse(request, status) {
  const head = String(request?.method || 'GET').toUpperCase() === 'HEAD';
  const payload = status === 401
    ? { error: 'Unauthorized' }
    : { error: 'Service unavailable' };
  const headers = {
    'cache-control': 'no-store',
    'content-type': 'application/json; charset=utf-8',
  };
  if (status === 401) headers['www-authenticate'] = 'Bearer';
  return new Response(head ? null : JSON.stringify(payload), { status, headers });
}

function exactTokenMatch(candidate, expected) {
  if (!TOKEN_PATTERN.test(candidate) || !TOKEN_PATTERN.test(expected)) return false;
  const candidateBytes = Buffer.from(candidate, 'utf8');
  const expectedBytes = Buffer.from(expected, 'utf8');
  return candidateBytes.length === expectedBytes.length
    && timingSafeEqual(candidateBytes, expectedBytes);
}

export function authorizeOpportunityServiceRequest(
  request,
  configuredToken = process.env.OPPORTUNITY_TRACKER_SERVICE_TOKEN || '',
) {
  const expected = String(configuredToken || '').trim();
  if (!TOKEN_PATTERN.test(expected)) return failureResponse(request, 503);

  const authorization = String(request?.headers?.get?.('authorization') || '');
  const candidate = authorization.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length)
    : '';
  return exactTokenMatch(candidate, expected) ? null : failureResponse(request, 401);
}
