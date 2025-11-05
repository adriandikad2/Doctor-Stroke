document.getElementById('signup').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const msg = document.getElementById('msg');
  msg.textContent = '';
  if (!email) return (msg.textContent = 'Email is required');

  try {
    const res = await fetch('/api/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, source: 'normal-site' }) });
    const data = await res.json();
    msg.textContent = data.message || 'Signup received. Check the console for the verification link.';
  } catch (e) {
    msg.textContent = 'Failed to submit signup';
    console.error(e);
  }
});
