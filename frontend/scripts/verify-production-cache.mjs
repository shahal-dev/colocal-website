const baseUrl = (process.argv[2] || 'https://www.luccc.org').replace(/\/$/, '');
const paths = [
  '/',
  '/api/projects?summary=true',
  '/api/news-events?blog=false&pageSize=8&summary=true',
  '/api/publications?pageSize=8&summary=true',
  '/sitemap.xml',
];

let failed = false;

for (const path of paths) {
  const attempts = [];
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const started = performance.now();
    const response = await fetch(`${baseUrl}${path}`, {
      headers: { 'user-agent': 'colocal-cache-verifier/1.0' },
    });
    const body = await response.arrayBuffer();
    attempts.push({
      status: response.status,
      cache: response.headers.get('x-vercel-cache') || 'n/a',
      bytes: body.byteLength,
      milliseconds: Math.round(performance.now() - started),
    });
    if (!response.ok) failed = true;
  }
  console.log(path, attempts);

  const secondCache = attempts[1].cache;
  if (!['HIT', 'STALE', 'PRERENDER'].includes(secondCache)) failed = true;
}

if (failed) {
  console.error(
    'Cache verification failed: inspect non-2xx responses or second-request cache misses.'
  );
  process.exitCode = 1;
} else {
  console.log('Cache verification passed.');
}
