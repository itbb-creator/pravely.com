const form = document.getElementById('support-form');
const status = document.getElementById('form-status');

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  status.textContent = 'Sending your message…';
  try {
    const config = await fetch('./content.json', { cache: 'no-store' }).then((response) => response.json());
    const fields = new FormData(form);
    const response = await fetch(`${String(config.functionsBaseUrl).replace(/\/+$/, '')}/submit-support`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: config.supabasePublishableKey,
      },
      body: JSON.stringify({
        name: fields.get('name'),
        email: fields.get('email'),
        topic: fields.get('topic'),
        message: fields.get('message'),
        website: fields.get('website'),
      }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'Your message could not be sent.');
    window.location.assign('./contact-success.html');
  } catch (error) {
    status.textContent = error instanceof Error ? error.message : 'Your message could not be sent. Please try again.';
    button.disabled = false;
  }
});
