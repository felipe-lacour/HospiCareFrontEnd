export function render() {
  return `

<div class="flex min-h-full flex-col justify-center px-6 py-4 lg:px-8">
  <div class="sm:mx-auto sm:w-full sm:max-w-sm">
    <img class="mx-auto h-40 w-auto" src="../../img/HPcolor.svg" alt="Your Company">
    <h2 class="text-center text-2xl/9  tracking-tight text-gray-900">Sign in to your account</h2>
  </div>

  <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
    <form class="space-y-6" action="#" method="POST">
      <div>
        <label for="email" class="block text-sm/6 font-medium text-gray-900">Email address</label>
        <div class="mt-2">
          <input type="text" name="email" id="email" autocomplete="email" required 
          class="block w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-base text-gray-900 
          outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 
          focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
        </div>
      </div>

      <div>
        <label for="password" class="block text-sm/6 font-medium text-gray-900">Password</label>
        <div class="mt-2">
          <input type="password" name="password" id="password" autocomplete="current-password" required 
          class="block w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-base text-gray-900 
          outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 
          focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
        </div>
      </div>

      <div>
        <button type="submit" class="flex w-full justify-center rounded-md bg-sky-800 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Sign in</button>
      </div>
    </form>
  </div>
</div>

  `;
}

export function afterRender() {
  const form = document.querySelector('form');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;

    try {
      const res = await fetch('http://localhost/HospiCareDev/BACKEND/public/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Login failed');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      location.hash = 'dashboard';

    } catch (err) {
      console.error(err);
      alert('Network error or backend unavailable');
    }
  });
}