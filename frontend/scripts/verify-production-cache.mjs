const baseUrl = (process.argv[2] || 'https://www.luccc.org').replace(/\/$/, '');
const paths = [
  '/',
  '/api/projects?summary=true',
  '/api/news-events?blog=false&pageSize=8&summary=true',
  '/api/publications?pageSize=8&summary=true',
  '/sitemap.xml',
];

let failed = false;

async function fetchWithRetry(url, attempts = 2) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const started = performance.now();
      const response = await fetch(url, {
        headers: { 'user-agent': 'colocal-cache-verifier/1.0' },
        signal: AbortSignal.timeout(15_000),
      });
      const body = await response.arrayBuffer();
      return {
        status: response.status,
        cache: response.headers.get('x-vercel-cache') || 'n/a',
        bytes: body.byteLength,
        milliseconds: Math.round(performance.now() - started),
      };
    } catch (error) {
      const reason = error?.cause?.code || error?.name || 'connection error';
      console.error(`${url} attempt ${attempt}/${attempts} failed: ${reason}`);
      if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, 1_000));
    }
  }
  return null;
}

for (const path of paths) {
  const attempts = [];
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const result = await fetchWithRetry(`${baseUrl}${path}`);
    if (!result) {
      failed = true;
      break;
    }
    attempts.push(result);
    if (result.status < 200 || result.status >= 300) failed = true;
  }
  console.log(path, attempts);

  if (attempts.length < 2) {
    console.error('Production was unreachable; cache behavior could not be tested.');
    break;
  }

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
