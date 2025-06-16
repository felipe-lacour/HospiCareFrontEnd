import { renderLayout } from './layout.js';

export async function router() {
  const route = location.hash.slice(1) || 'login';
  const token = localStorage.getItem('token');
  const layoutRoot = document.getElementById('layout');

  // 🛑 Safety check
  if (!layoutRoot) {
    console.error('Missing #layout div in HTML');
    return;
  }

  // 🟡 LOGIN route — show only login screen, no layout
  if (route === 'login') {
    layoutRoot.innerHTML = '';
    const module = await import(`./modules/login.js`);
    const html = await module.render();
    layoutRoot.innerHTML = html;
    if (module.afterRender) module.afterRender();
    return;
  }

  // 🔒 If no token, force redirect to login
  if (!token) {
    location.hash = 'login';
    return;
  }

  // ✅ Authenticated: render layout + load module
  renderLayout(); // renders sidebar + #app

  const app = document.getElementById('app');
  if (!app) {
    console.error('Missing #app inside layout');
    return;
  }

  try {
    const module = await import(`./modules/${route}.js`);
    const html = await module.render();
    app.innerHTML = html;
    if (module.afterRender) module.afterRender();
  } catch (e) {
    app.innerHTML = `<p class="text-red-500">Module "${route}" not found.</p>`;
  }
}