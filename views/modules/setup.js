export function render() {
  const hashParams = new URLSearchParams(location.hash.split('?')[1]);
  const token = hashParams.get('token');

  if (!token) {
    return `<div class="text-center mt-10 text-red-600">Invalid or missing token.</div>`;
  }

  return `
    <div class="max-w-md mx-auto mt-10 bg-white p-6 rounded shadow">
      <h2 class="text-xl font-semibold mb-4">Set Your Password</h2>
      <form id="set-password-form" class="space-y-4">
        <input type="password" name="new_password" placeholder="New Password" class="w-full border p-2 rounded" required>
        <input type="password" name="confirm_password" placeholder="Confirm Password" class="w-full border p-2 rounded" required>
        <input type="hidden" name="token" value="${token}">

        <div class="text-right">
          <button type="submit" class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-500">Set Password</button>
        </div>
      </form>
    </div>
  `;
}

export function afterRender() {
  const form = document.getElementById('set-password-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());

    if (data.new_password.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }

    if (data.new_password !== data.confirm_password) {
      alert('Passwords do not match');
      return;
    }

    try {
      const res = await fetch('http://localhost/HospiCareDev/BACKEND/public/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: data.token, new_password: data.new_password })
      });

      const result = await res.json();

      if (res.ok) {
        alert('Password has been set successfully! You may now log in.');
        location.hash = 'login';
      } else {
        alert(result.error || 'Something went wrong');
      }
    } catch (err) {
      alert('Network error');
    }
  });
}
