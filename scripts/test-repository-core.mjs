import assert from 'node:assert/strict';

import { buildWelcomeEmail } from '../lib/shared/email.ts';
import { generateLicenseId, isLicenseId } from '../lib/shared/license.ts';

assert.equal(isLicenseId('PRV-7K4X9P2M'), true);
assert.equal(isLicenseId('ITB-7K4X9P2M'), true);
assert.equal(isLicenseId('PRV-0O1IL234'), false);
assert.equal(new Set(Array.from({ length: 200 }, () => generateLicenseId())).size, 200);

const email = buildWelcomeEmail({
  productName: 'Pravely Premium Toolkit',
  customerName: 'Test Customer',
  customerEmail: 'test@example.com',
  licenseId: 'PRV-7K4X9P2M',
  downloadPageUrl: 'https://pravely.com/download.html?license=PRV-7K4X9P2M',
  siteUrl: 'https://pravely.com',
  supportEmail: 'support@pravely.com',
});
assert.match(email.subject, /ready/i);
assert.match(email.html, /PRV-7K4X9P2M/);

console.log('Repository-local license and email tests passed.');
