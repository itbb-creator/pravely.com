# Buy-us-a-coffee link setup

Pravely supports up to three optional one-time Stripe Payment Links in the app Settings page. The entire section stays hidden until at least one valid `https://buy.stripe.com/...` link is configured.

Use “support Pravely” or “buy us a coffee,” not “charitable donation,” unless a qualified adviser confirms that Pravely may solicit tax-deductible donations. Coffee contributions do not grant, extend, upgrade, or restore app access.

## 1. Create the Stripe products and prices

In the Stripe Dashboard:

1. Open **More → Payment Links** and choose **New**.
2. Create a one-time product such as **Buy Pravely a $1 coffee**.
3. Set the price to `$1.00 USD`, one time.
4. Do not attach the app’s Plus, Complete, upgrade, or entitlement products.
5. Do not enable a subscription or recurring payment.
6. Allow Stripe to choose the eligible payment methods dynamically.
7. Add a short description: “Optional support for Pravely. Does not change product access and is not represented as a tax-deductible donation.”
8. Activate the link and copy the resulting `https://buy.stripe.com/...` URL.
9. Repeat for `$2` and `$5` if all three choices are wanted.

Stripe-hosted Payment Links are preferable here because they keep payment details out of Pravely and need no custom checkout code. Receipts and refund handling stay in Stripe.

## 2. Attach the links to the app

In the Netlify site that deploys the Pravely app, open **Site configuration → Environment variables** and add any or all of:

```text
VITE_STRIPE_COFFEE_URL_1=https://buy.stripe.com/...
VITE_STRIPE_COFFEE_URL_2=https://buy.stripe.com/...
VITE_STRIPE_COFFEE_URL_5=https://buy.stripe.com/...
```

These URLs are public checkout destinations, not secret API keys. Never place `sk_`, `rk_`, webhook secrets, or customer information in a `VITE_` variable.

Trigger a new app deployment after saving the variables. Vite embeds public environment variables at build time, so an existing build will not discover them automatically.

## 3. Verify before announcing it

1. Use Stripe test-mode Payment Links first in the preview deployment.
2. Confirm Settings shows only the amounts with configured valid links.
3. Open each link and verify the product, one-time amount, currency, and description.
4. Complete a test-mode payment and confirm the Stripe receipt.
5. Confirm the payment creates no Pravely entitlement and does not alter Plus/Complete access.
6. Test cancel/back behavior and the support/refund process.
7. Replace the test links with live Payment Links only after the test passes, redeploy, and perform one low-value live verification if approved.

No webhook is required merely to display or accept these voluntary Payment Links. If Pravely later reports contributions inside its admin accounting view, add a separate, idempotent webhook event category that cannot call the product-entitlement code.
