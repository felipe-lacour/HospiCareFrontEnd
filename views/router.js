import { renderLayout } from './layout.js';

export async function router() {
  const hash = location.hash.slice(1);
  const [rawRoute, queryString] = hash.split('?');
  const [route, ...params] = rawRoute.split('/');
  const token = localStorage.getItem('token');
  const layoutRoot = document.getElementById('layout');

  if (!layoutRoot) {
    console.error('Missing #layout div in HTML');
    return;
  }

  // LOGIN
  if (route === 'login') {
    layoutRoot.innerHTML = '';
    const module = await import(`./modules/login.js`);
    const html = await module.render();
    layoutRoot.innerHTML = html;
    if (module.afterRender) module.afterRender();
    return;
  }

  // SET PASSWORD
  if (rawRoute === 'auth/set-password') {
    layoutRoot.innerHTML = '';
    const module = await import(`./modules/setup.js`);
    const html = await module.render(queryString); // ← le pasamos el query
    layoutRoot.innerHTML = html;
    if (module.afterRender) module.afterRender(queryString);
    return;
  }

  // REDIRECCIÓN SI NO HAY TOKEN
  if (!token) {
    location.hash = 'login';
    return;
  }

  // USUARIO AUTENTICADO
  renderLayout();
  const app = document.getElementById('app');
  if (!app) {
    console.error('Missing #app inside layout');
    return;
  }

  try {
    const module = await import(`./modules/${route}.js`);
    const html = await module.render(...params);
    app.innerHTML = html;
    if (module.afterRender) module.afterRender(...params);
  } catch (e) {
    console.error(e);
    app.innerHTML = `<p class="text-red-500">Module "${route}" not found.</p>`;
  }
}
