const API_BASE = 'http://localhost/HospiCareDev/BACKEND/public';

export function render() {
  const today = new Date();
  const month = today.toLocaleString('default', { month: 'long' });
  const year = today.getFullYear();

return `
  <div class="px-4 sm:px-6 lg:px-8">
    <div id="app-content" class="relative z-0">
      <div class="mt-8 bg-white shadow-sm ring-1 ring-black/5 rounded-lg">
        <div class="sm:flex sm:items-center justify-center py-4">
          <p class="text-center text-lg font-semibold text-gray-800">${month} ${year}</p>
        </div>
        <div id="calendar-grid" class="text-center text-gray-500 pb-10">Loading calendar...</div>
      </div>
    </div>

    <!-- Modal stays outside that container -->
    <div id="appointment-modal" class="fixed inset-0 z-50 hidden bg-black bg-opacity-50 items-center justify-center">
      <div class="bg-white rounded-lg p-6 w-full max-w-lg mx-auto max-h-[80vh] flex flex-col">
        <h2 class="text-lg font-bold mb-4">Appointments</h2>
        <ul id="modal-appointments" class="text-left space-y-2 text-sm overflow-y-auto max-h-[60vh] pr-2"></ul>
        <div class="text-right mt-4">
          <button id="close-modal" class="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700">Close</button>
        </div>
      </div>
    </div>
  </div>
`;
}

export async function afterRender() {
  const calendarContainer = document.getElementById('calendar-grid');

  try {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    const res = await fetch(`${API_BASE}/appointments`, { headers });
    const appointments = await res.json();
    if (!res.ok || !Array.isArray(appointments)) {
      calendarContainer.innerHTML = `<p class="text-red-500">Error loading appointments</p>`;
      return;
    }

    // Caches
    const doctorMap = new Map();
    const patientMap = new Map();

    const fetchDoctorName = async (id) => {
      if (doctorMap.has(id)) return doctorMap.get(id);
      try {
        const res = await fetch(`${API_BASE}/doctors/show?id=${id}`, { headers });
        const data = await res.json();
        const name = `${data.first_name} ${data.last_name}`;
        doctorMap.set(id, name);
        return name;
      } catch {
        return `Dr. Unknown`;
      }
    };

    const fetchPatientName = async (id) => {
      if (patientMap.has(id)) return patientMap.get(id);
      try {
        const res = await fetch(`${API_BASE}/patients/show?id=${id}`, { headers });
        const data = await res.json();
        const name = `${data.first_name} ${data.last_name}`;
        patientMap.set(id, name);
        return name;
      } catch {
        return `Unknown Patient`;
      }
    };

    const apptMap = {};

    await Promise.all(
      appointments.map(async (appt) => {
        if (!appt.datetime) return;
        const [date, time] = appt.datetime.split(' ');
        const doctorName = await fetchDoctorName(appt.doctor_id);
        const patientName = await fetchPatientName(appt.patient_id);

        apptMap[date] = apptMap[date] || [];
        apptMap[date].push({
          time,
          doctor: doctorName,
          patient: patientName,
        });
      })
    );

    const grid = [];
    let dayCounter = 1 - ((firstDay + 6) % 7);

    for (let week = 0; week < 6; week++) {
      let row = '';
      for (let i = 0; i < 7; i++) {
        const date = new Date(year, month, dayCounter);
        const iso = date.toISOString().split('T')[0];
        const isCurrent = date.getMonth() === month;
        const appts = apptMap[iso] || [];

        row += `
          <div class="relative px-2 py-2 ${isCurrent ? 'bg-white' : 'bg-gray-50 text-gray-400'} min-h-[4rem] border border-gray-200 overflow-y-auto">
            <time datetime="${iso}" class="text-xs font-semibold block">${date.getDate()}</time>
            ${appts.length > 0 ? `
              <div class="mt-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 text-xs font-medium rounded px-2 py-1 w-full text-center cursor-pointer"
                onclick="showAppointments('${iso}')">
                ${appts.length} appointment${appts.length > 1 ? 's' : ''}
              </div>
            ` : ''}
          </div>
        `;

        dayCounter++;
      }
      grid.push(`<div class="grid grid-cols-7 gap-px">${row}</div>`);
    }

    calendarContainer.innerHTML = `
      <div class="text-xs font-semibold text-gray-700 grid grid-cols-7 bg-gray-200 border-b border-gray-300">
        <div class="bg-white py-2 text-center">Mon</div>
        <div class="bg-white py-2 text-center">Tue</div>
        <div class="bg-white py-2 text-center">Wed</div>
        <div class="bg-white py-2 text-center">Thu</div>
        <div class="bg-white py-2 text-center">Fri</div>
        <div class="bg-white py-2 text-center">Sat</div>
        <div class="bg-white py-2 text-center">Sun</div>
      </div>
      ${grid.join('')}
    `;

    // Modal logic
window.showAppointments = (date) => {
  const list = document.getElementById('modal-appointments');

  const sortedAppointments = (apptMap[date] || []).slice().sort((a, b) => {
    return a.time.localeCompare(b.time);
  });

  list.innerHTML = sortedAppointments.map(a => {
    return `<li class="border-b border-gray-200">
      <button class="w-full text-left hover:bg-gray-100 p-2 text-center">
        🕒 ${a.time} — <strong>Dr. ${a.doctor}</strong> → ${a.patient}
      </button>
    </li>`;
  }).join('');

  const modal = document.getElementById('appointment-modal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
};

    document.getElementById('close-modal').addEventListener('click', () => {
      const modal = document.getElementById('appointment-modal');
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    });

  } catch (err) {
    calendarContainer.innerHTML = `<p class="text-red-500">Failed to load calendar</p>`;
    console.error(err);
  }
}