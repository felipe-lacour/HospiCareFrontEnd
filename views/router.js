import { renderLayout } from './layout.js';

export async function router() {
  const [route, ...params] = location.hash.slice(1).split('/');
  const token = localStorage.getItem('token');
  const layoutRoot = document.getElementById('layout');

  // 🛑 Verifica que exista el div con id="layout"
  if (!layoutRoot) {
    console.error('Missing #layout div in HTML');
    return;
  }

  // 🟡 LOGIN — no se muestra layout si estás en login
  if (route === 'login') {
    layoutRoot.innerHTML = '';
    const module = await import(`./modules/login.js`);
    const html = await module.render();
    layoutRoot.innerHTML = html;
    if (module.afterRender) module.afterRender();
    return;
  }

  // 🔒 Si no hay token, redirige a login
  if (!token) {
    location.hash = 'login';
    return;
  }

  // ✅ Usuario autenticado: render layout y módulo
  renderLayout(); // esto renderiza la sidebar + <main id="app">

  const app = document.getElementById('app');
  if (!app) {
    console.error('Missing #app inside layout');
    return;
  }

  try {
    const module = await import(`./modules/${route}.js`);
    const html = await module.render(...params); // ← pasar parámetros como MRN
    app.innerHTML = html;
    if (module.afterRender) module.afterRender(...params);
  } catch (e) {
    console.error(e);
    app.innerHTML = `<p class="text-red-500">Module "${route}" not found.</p>`;
  }
}