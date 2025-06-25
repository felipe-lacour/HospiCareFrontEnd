export function renderLayout() {
  const user = JSON.parse(localStorage.getItem('user'));
  document.getElementById('layout').innerHTML = `<div>

  <div class="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
    <div class="flex grow flex-col gap-y-5 overflow-y-auto bg-sky-900 px-6 pb-4">
      <div class="flex h-16 shrink-0 items-center">
        <img class="h-32 w-auto" src="../img/HCblanco.svg" alt="Your Company">
      </div>
      <nav class="flex flex-1 flex-col">
        <ul role="list" class="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" class="-mx-2 space-y-1">
              <li>
                <a href="#dashboard" class="group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-white">
                    <img src="../img/home.svg" class="h-6 w-6" alt="Home"/>
                  Dashboard
                </a>
              </li>
              <li>
                <a href="#patients" class="group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-400 hover:bg-blue-950 hover:text-white">
                  <img src="../img/patient.svg" class="h-6 w-6" alt="Patients"/>
                  Patients
                </a>
              </li>
              <li>
                <a href="#appointments" class="group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-400 hover:bg-blue-950 hover:text-white">
                  <img src="../img/appointments.svg" class="h-6 w-6" alt="Appointments"/>
                  Appointments
                </a>
              </li>
              ${user.role_id === 2 || user.role_id === 3 ? '' : `
              <li>
                <a href="#receptionists" class="group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-400 hover:bg-blue-950 hover:text-white">
                  <img src="../img/staff.svg" class="h-6 w-6" alt="Staff"/>
                  Staff
                </a>
              </li>
              `}
              ${user.role_id === 2 ? '' : `
              <li>
                <a href="#doctors" class="group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-400 hover:bg-blue-950 hover:text-white">
                  <img src="../img/corss.svg" class="h-6 w-6" alt="Home"/>
                  Doctors
                </a>
              </li>
              `}
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  </div>

  <div class="lg:pl-72">
    <div class="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-xs sm:gap-x-6 sm:px-6 lg:px-8">
      <button type="button" class="-m-2.5 p-2.5 text-gray-700 lg:hidden">
        <span class="sr-only">Open sidebar</span>
        <svg class="size-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

      <div class="h-6 w-px bg-gray-900/10 lg:hidden" aria-hidden="true"></div>

     <div class="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 justify-end">
        <div class="flex items-center gap-x-4 lg:gap-x-6">

          <div class="relative ">
            <button type="button" class="-m-1.5 flex items-center p-1.5" id="user-menu-button" aria-expanded="false" aria-haspopup="true">
              <span class="sr-only">Open user menu</span>
              <img class="size-8 rounded-full bg-gray-50" src="../../img/user.svg" alt="">
              <span class="hidden lg:flex lg:items-center">
                <span id="username-display" class="ml-4 text-sm/6 font-semibold text-gray-900" aria-hidden="true"></span>
                <svg class="ml-2 size-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon">
                  <path fill-rule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                </svg>
              </span>
            </button>

            <div class="hidden absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-hidden" role="menu" id="user-dropdown" aria-orientation="vertical" aria-labelledby="user-menu-button" tabindex="-1">
              <a href="#settings" class="block px-3 py-1 text-sm/6 text-gray-900" role="menuitem" tabindex="-1">Settings</a>
              <a href="#" id="logout" class="block px-3 py-1 text-sm/6 text-gray-900" role="menuitem" tabindex="-1">Sign out</a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <main id='app'>
      <div class="px-4 sm:px-6 lg:px-8">
        {/* {contenido} */}
      </div>
    </main>
  </div>
</div>`;

  // Mostrar username
  const token = localStorage.getItem('token');
  if (user) {
    document.getElementById('username-display').textContent = user.username;
  }

  // Logout
  document.getElementById('logout').addEventListener('click', async () => {

    try {
      await fetch('http://localhost/HospiCareDev/BACKEND/public/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    }

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    location.hash = 'login';
  });

  // Toggle del menú de usuario
  const userBtn = document.getElementById('user-menu-button');
  const dropdown = document.getElementById('user-dropdown');

  userBtn.addEventListener('click', () => {
    dropdown.classList.toggle('hidden');
  });

  // Ocultar dropdown si se hace clic fuera
  document.addEventListener('click', (e) => {
    const isInsideMenu = userBtn.contains(e.target) || dropdown.contains(e.target);
    if (!isInsideMenu) {
      dropdown.classList.add('hidden');
    }
  });
}