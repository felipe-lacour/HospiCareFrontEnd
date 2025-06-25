const API_BASE = 'http://localhost/HospiCareDev/BACKEND/public';

export function render() {
  const today = new Date();
  const month = today.toLocaleString('default', { month: 'long' });
  const year  = today.getFullYear();

  return `
    <div class="px-4 sm:px-6 lg:px-8">
      <div id="app-content" class="relative z-0">
        <div class="mt-8 bg-white shadow-sm ring-1 ring-black/5 rounded-lg">
          <div class="sm:flex sm:items-center justify-between py-4 px-6">
            <p class="text-center text-lg font-semibold text-gray-800">${month} ${year}</p>
            <button id="add-appointment" class="ml-4 px-4 py-2 bg-sky-800 text-white rounded hover:bg-sky-700 text-xs">
              Add Appointment
            </button>
          </div>
          <div id="calendar-grid" class="text-center text-gray-500 pb-10">Loading calendar...</div>
        </div>
      </div>

      <!-- List Modal -->
      <div id="appointment-modal" class="fixed inset-0 z-50 hidden bg-black bg-opacity-50 items-center justify-center">
        <div class="bg-white rounded-lg p-6 w-full max-w-lg mx-auto max-h-[80vh] flex flex-col">
          <h2 class="text-lg font-bold mb-4">Appointments</h2>
          <ul id="modal-appointments" class="overflow-y-auto max-h-[60vh] space-y-2 pr-2"></ul>
          <div class="text-right mt-4">
            <button id="close-modal" class="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700">
              Close
            </button>
          </div>
        </div>
      </div>

      <!-- Add Modal -->
      <div id="add-appointment-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <form id="add-appointment-form" class="bg-white p-6 rounded-xl shadow-xl w-full max-w-md space-y-4">
          <h2 class="text-lg font-semibold text-gray-800">New Appointment</h2>
          <input type="date" name="date" required class="w-full border rounded px-3 py-2" />
          <input type="time" name="time" required class="w-full border rounded px-3 py-2" />
          <select name="doctor_id" required class="w-full border rounded px-3 py-2">
            <option value="" disabled selected>Select Doctor</option>
          </select>
          <select name="patient_id" required class="w-full border rounded px-3 py-2">
            <option value="" disabled selected>Select Patient</option>
          </select>
          <div class="flex justify-end gap-2 pt-4">
            <button type="button" id="close-add-modal" class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
              Cancel
            </button>
            <button type="submit" class="px-4 py-2 bg-sky-900 text-white rounded hover:bg-sky-800">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

export async function afterRender() {
  const calendarContainer = document.getElementById('calendar-grid');
  const token = localStorage.getItem('token');
  const headers = { 'Authorization': `Bearer ${token}` };

  // 🔽 Read the current user and determine if they are a doctor
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const isDoctor = user.role_id === 2;
  const doctorId = user.user_id;

  // If it’s a doctor, hide the Add button
  const addBtn = document.getElementById('add-appointment');
  if (isDoctor) {
    addBtn.classList.add('hidden');
  }

  // Caches for names
  const doctorMap  = new Map();
  const patientMap = new Map();

  async function fetchDoctorName(id) {
    if (doctorMap.has(id)) return doctorMap.get(id);
    const res = await fetch(`${API_BASE}/doctors/show?id=${id}`, { headers });
    const d   = await res.json();
    const name = `${d.first_name} ${d.last_name}`;
    doctorMap.set(id, name);
    return name;
  }

  async function fetchPatientName(id) {
    if (patientMap.has(id)) return patientMap.get(id);
    const res = await fetch(`${API_BASE}/patients/show?id=${id}`, { headers });
    const p   = await res.json();
    const name = `${p.first_name} ${p.last_name}`;
    patientMap.set(id, name);
    return name;
  }

  let apptMap = {};

  async function loadCalendar() {
    apptMap = {};
    const resAll = await fetch(`${API_BASE}/appointments`, { headers });
    const allAppts = await resAll.json();
    if (!resAll.ok || !Array.isArray(allAppts)) {
      calendarContainer.innerHTML = `<p class="text-red-500">Error loading appointments</p>`;
      return;
    }

    // 🔽 Filter for doctors

    console.log('logged-in user:', user);
console.log('all fetched appts:', allAppts);
    const appointments = isDoctor
      ? allAppts.filter(a => a.doctor_id == doctorId)
      : allAppts;

    await Promise.all(appointments.map(async appt => {
      if (!appt.datetime) return;
      const [date, time] = appt.datetime.split(' ');
      const doctor  = await fetchDoctorName(appt.doctor_id);
      const patient = await fetchPatientName(appt.patient_id);
      apptMap[date] = apptMap[date] || [];
      apptMap[date].push({
        id:       appt.appointment_id,
        time,
        doctor,
        patient,
        status:   appt.status
      });
    }));

    // … render grid exactly as before …
    const today    = new Date();
    const year     = today.getFullYear();
    const month    = today.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    let dayCounter = 1 - ((firstDay + 6) % 7);
    const rows = [];

    for (let w = 0; w < 6; w++) {
      let row = '';
      for (let i = 0; i < 7; i++, dayCounter++) {
        const d      = new Date(year, month, dayCounter);
        const iso    = d.toISOString().slice(0, 10);
        const isCurr = d.getMonth() === month;
        const list   = apptMap[iso] || [];
        row += `
          <div class="relative px-2 py-2 ${isCurr?'bg-white':'bg-gray-50 text-gray-400'} min-h-[4rem]
                      border border-gray-200 overflow-y-auto">
            <time datetime="${iso}" class="text-xs font-semibold block">${d.getDate()}</time>
            ${list.length>0 ? `
              <div class="mt-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 text-xs font-medium
                          rounded px-2 py-1 text-center cursor-pointer"
                   onclick="showAppointments('${iso}')">
                ${list.length} appointment${list.length>1?'s':''}
              </div>` : ''}
          </div>`;
      }
      rows.push(`<div class="grid grid-cols-7 gap-px">${row}</div>`);
    }

    calendarContainer.innerHTML = `
      <div class="text-xs font-semibold text-gray-700 grid grid-cols-7 bg-gray-200 border-b border-gray-300">
        <div class="py-2 text-center">Mon</div>
        <div class="py-2 text-center">Tue</div>
        <div class="py-2 text-center">Wed</div>
        <div class="py-2 text-center">Thu</div>
        <div class="py-2 text-center">Fri</div>
        <div class="py-2 text-center">Sat</div>
        <div class="py-2 text-center">Sun</div>
      </div>
      ${rows.join('')}
    `;
  }

  window.showAppointments = async (date) => {
    const list = document.getElementById('modal-appointments');
    const items = (apptMap[date] || []).slice().sort((a,b)=>a.time.localeCompare(b.time));

    list.innerHTML = items.map(a => `
      <li class="flex items-center justify-between py-3 px-4 border-b hover:bg-gray-50 transition">
        <div class="flex items-center space-x-4">
          <span class="w-2 h-2 rounded-full 
            ${a.status==='CONFIRMADA'?'bg-green-500':a.status==='PENDIENTE'?'bg-yellow-500':'bg-red-500'}"></span>
          <div>
            <p class="text-sm font-semibold">${a.time}</p>
            <p class="text-xs text-gray-600">Dr. ${a.doctor} → ${a.patient}</p>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <span class="px-2 py-0.5 text-xs font-medium rounded-full 
            ${a.status==='CONFIRMADA'?'bg-green-100 text-green-800'
              :a.status==='PENDIENTE'?'bg-yellow-100 text-yellow-800':'bg-red-100 text-red-800'}">
            ${a.status}
          </span>
          <button class="delete-appt-btn p-1 rounded-full hover:bg-red-100" data-id="${a.id}" title="Delete">
            <img src="../../img/trash.svg" alt="Delete" class="w-5 h-5"/>
          </button>
        </div>
      </li>
    `).join('');

    list.querySelectorAll('.delete-appt-btn').forEach(btn => {
      btn.onclick = async e => {
        e.stopPropagation();
        if (!confirm('Delete this appointment?')) return;
        const id = btn.dataset.id;
        const res = await fetch(`${API_BASE}/appointments/delete?id=${id}`, {
          method: 'GET', headers
        });
        if (res.ok) {
          document.getElementById('appointment-modal').classList.replace('flex','hidden');
          await loadCalendar();
        } else {
          const err = await res.json();
          alert(`Delete failed: ${err.error || res.statusText}`);
        }
      };
    });

    document.getElementById('appointment-modal').classList.replace('hidden','flex');
  };

  document.getElementById('close-modal').onclick = () => {
    document.getElementById('appointment-modal').classList.replace('flex','hidden');
  };

  // Only non-doctors get the add-appointment modal
  if (!isDoctor) {
    async function setupAddModal() {
      const addModal = document.getElementById('add-appointment-modal');
      const closeAdd = document.getElementById('close-add-modal');
      const form     = document.getElementById('add-appointment-form');
      const [docs, pats] = await Promise.all([
        fetch(`${API_BASE}/doctors`,  { headers }).then(r=>r.json()),
        fetch(`${API_BASE}/patients`, { headers }).then(r=>r.json())
      ]);
      const drSel = form.elements['doctor_id'];
      const ptSel = form.elements['patient_id'];
      docs.forEach(d => drSel.append(new Option(`${d.first_name} ${d.last_name}`, d.doctor_id)));
      pats.forEach(p => ptSel.append(new Option(`${p.first_name} ${p.last_name}`, p.person_id)));

      document.getElementById('add-appointment').onclick = () => {
        form.reset();
        addModal.classList.replace('hidden','flex');
      };
      closeAdd.onclick = () => addModal.classList.replace('flex','hidden');

      form.onsubmit = async e => {
        e.preventDefault();
        const fd = new FormData(form);
        const body = {
          datetime:  `${fd.get('date')} ${fd.get('time')}`,
          doctor_id: fd.get('doctor_id'),
          patient_id: fd.get('patient_id')
        };
        const res = await fetch(`${API_BASE}/appointments/store`, {
          method: 'POST',
          headers: { 'Content-Type':'application/json', ...headers },
          body: JSON.stringify(body)
        });
        if (res.ok) {
          addModal.classList.replace('flex','hidden');
          await loadCalendar();
        } else {
          const err = await res.json();
          alert(`Add failed: ${err.error||res.statusText}`);
        }
      };
    }
    await setupAddModal();
  }

  // Finally, render the calendar
  await loadCalendar();
}