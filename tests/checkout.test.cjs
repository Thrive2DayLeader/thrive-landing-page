const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const checkoutUrl = productId =>
  `https://sso.teachable.com/secure/2704529/checkout/${productId}/thrive-business-launch-accelerator-life-coaching-program1?product_id=${productId}`;

function loadPage(file, pathname, productId) {
  const html = readFileSync(path.join(root, file), 'utf8');
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  const elements = {};
  const redirects = [];
  const element = id => elements[id] ||= {};
  vm.runInNewContext(script, {
    URLSearchParams,
    document: { getElementById: element, querySelector: element },
    window: { location: {
      pathname,
      search: productId ? `?product_id=${productId}` : '',
      replace: url => redirects.push(url),
    } },
  });
  return { elements, redirects };
}

test('enrollment buttons bypass the school purchase redirect', () => {
  const html = readFileSync(path.join(root, 'thrive-enroll.html'), 'utf8');
  const links = [...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>Enroll Now\s*<span/g)];
  assert.deepEqual(links.map(match => match[1]), ['6865580', '6771179'].map(checkoutUrl));
});

for (const file of ['purchase/index.html', '404.html']) {
  for (const pathname of ['/purchase', '/purchase/']) {
    for (const productId of ['6865580', '6771179', '6771171', '6772141']) {
      test(`${file} ${pathname} ${productId} cannot automatically redirect in a loop`, () => {
        // A return from Teachable must stay here even without cookies or storage.
        for (let visit = 0; visit < 3; visit++) {
          const { elements, redirects } = loadPage(file, pathname, productId);
          assert.deepEqual(redirects, []);
          const link = elements[file === '404.html' ? 'fallbackLink' : 'checkoutLink'];
          const url = new URL(link.href);
          assert.equal(url.origin, 'https://sso.teachable.com');
          assert.equal(url.searchParams.get('product_id'), productId);
          assert.ok(url.pathname.includes(`/checkout/${productId}/`));
          assert.equal(link.textContent, 'Continue to secure checkout');
        }
      });
    }
  }
}

for (const productId of ['unknown', null]) {
  test(`purchase fallback for ${productId} stays manual with a valid enrollment link`, () => {
    const { elements, redirects } = loadPage('purchase/index.html', '/purchase/', productId);
    assert.deepEqual(redirects, []);
    assert.equal(elements.checkoutLink.href, '/thrive-enroll.html');
  });
}

test('ordinary missing pages return to enrollment without entering checkout', () => {
  const { redirects } = loadPage('404.html', '/missing-page', '6865580');
  assert.deepEqual(redirects, ['/thrive-enroll.html']);
});
