# Pravely AI coach setup

The AI coach backend is already implemented and deployed as the authenticated
`health-coach` Supabase Edge Function. It will remain unavailable until an
OpenAI API key is stored as an Edge Function secret.

## Connect the key

1. Create a project API key in the OpenAI platform. Use a dedicated Pravely
   project so usage and limits are isolated from other applications.
2. In Supabase, open **Project Settings → Edge Functions → Secrets**.
3. Add `OPENAI_API_KEY` with the key as its value.
4. Optionally add `OPENAI_HEALTH_MODEL`. If omitted, Pravely uses
   `gpt-5.4-mini`.

The key must never be added to `content.json`, a `VITE_` variable, client-side
code, a mobile build, or source control. Supabase makes secret changes available
to hosted Edge Functions without a code redeploy.

CLI alternative:

```sh
supabase secrets set OPENAI_API_KEY=YOUR_KEY OPENAI_HEALTH_MODEL=gpt-5.4-mini
```

## Current integration

The Health Center sends the signed-in user's calculated health score, monthly
income and outflows, investing, debt payments, surplus, emergency runway, and
the user's question or selected scenario to the server-side coach. The model
returns a structured headline, summary, one to three actions, a follow-up
question, and a caution statement. Responses are educational and are prevented
from naming securities, inventing account data, or presenting legal, tax, or
financial advice.

The OpenAI request uses `store: false` and a one-way hashed safety identifier.
The browser never receives the API key.
