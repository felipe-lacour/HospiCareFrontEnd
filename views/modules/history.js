const API_BASE = 'http://localhost/HospiCareDev/BACKEND/public';

export async function render(mrn) {
  const user = JSON.parse(localStorage.getItem('user'));
  const res = await fetch(
    `${API_BASE}/clinical/show?medical_rec_no=${encodeURIComponent(mrn)}`,
    {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token'),
      },
    }
  );
  const data = await res.json();
  if (!res.ok) {
    return `<p class="text-red-500">Error: ${data.error}</p>`;
  }

  console.log(data)

  // guard against missing notes
  const notesArray = Array.isArray(data.consult_notes)
    ? data.consult_notes
    : [];

  // fetch doctor names
  const notesWithDoctors = await Promise.all(
    notesArray.map(async (note) => {
      const docRes = await fetch(
        `${API_BASE}/doctors/show?id=${note.doctor_id}`,
        {
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token'),
          },
        }
      );
      const doctor = await docRes.json();
      return {
        ...note,
        doctor_name: `${doctor.first_name} ${doctor.last_name}`,
      };
    })
  );

  return `
<div class="mx-auto max-w-7xl sm:px-6 lg:px-8 py-6">
  <div id="note-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center bg-black/50">
  <form id="note-form" class="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md space-y-4">
    <h2 class="text-xl font-semibold text-gray-800">Add Consult Note</h2>
    <select name="doctor_id" required class="w-full border border-gray-300 rounded px-3 py-2">
      <option value="" disabled selected>Select a doctor</option>
    </select>
    <textarea
      name="text"
      placeholder="Enter consult note..."
      required
      class="w-full border border-gray-300 rounded px-3 py-2 h-32"
    ></textarea>
    <div class="flex justify-end gap-2 pt-4">
      <button
        type="button"
        id="close-note-modal"
        class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
      >
        Cancel
      </button>
      <button
        type="submit"
        class="px-4 py-2 bg-sky-900 text-white rounded hover:bg-sky-800"
      >
        Add Note
      </button>
    </div>
  </form>
</div>
  <div class="px-4 sm:px-0">
    <h3 class="text-base font-semibold text-gray-900">Patient Information</h3>
    <p class="mt-1 max-w-2xl text-sm text-gray-500">Personal details and clinical history.</p>
  </div>
  <div class="mt-6 border-t border-gray-100">
    <dl class="divide-y divide-gray-100">
      <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
        <dt class="text-sm font-medium text-gray-900">Full name</dt>
        <dd class="mt-1 text-sm text-gray-700 sm:col-span-2 sm:mt-0">
          ${data.patient.first_name} ${data.patient.last_name}
        </dd>
      </div>
      <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
        <dt class="text-sm font-medium text-gray-900">DNI</dt>
        <dd class="mt-1 text-sm text-gray-700 sm:col-span-2 sm:mt-0">${data.patient.dni}</dd>
      </div>
      <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
        <dt class="text-sm font-medium text-gray-900">Phone Number</dt>
        <dd class="mt-1 text-sm text-gray-700 sm:col-span-2 sm:mt-0">${data.patient.phone}</dd>
      </div>
      <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
        <dt class="text-sm font-medium text-gray-900">Date of Birth</dt>
        <dd class="mt-1 text-sm text-gray-700 sm:col-span-2 sm:mt-0">${data.patient.birth_date}</dd>
      </div>
      <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
        <dt class="text-sm font-medium text-gray-900">Address</dt>
        <dd class="mt-1 text-sm text-gray-700 sm:col-span-2 sm:mt-0">${data.patient.address}</dd>
      </div>
      <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
        <dt class="text-sm font-medium text-gray-900">Blood Type</dt>
        <dd class="mt-1 text-sm text-gray-700 sm:col-span-2 sm:mt-0">${data.patient.blood_type}</dd>
      </div>
      ${user.role_id === 3 ? `` : `      <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
        <dt class="text-sm font-medium text-gray-900">Clinical History</dt>
        <div></div>
        <button class="bg-sky-800 text-white w-fit py-2 px-4 rounded ml-auto text-sm">Add consult note</button>
        <dd class="mt-2 text-sm text-gray-900 col-span-3 sm:mt-0 mx-auto w-full max-w-2xl">
          <ul role="list" class="divide-y divide-gray-100 rounded-md border border-gray-200 max-h-96 overflow-y-auto">
              ${notesWithDoctors.map(note => `
              <li class="w-full flex items-center justify-between py-4 pr-5 pl-4 text-sm/6">
                <div class="w-full divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow-lg border">
                  <div class="w-full px-4 py-2 sm:px-6 font-medium text-gray-700 bg-sky-50 flex items-center justify-between">
                    <div>
                        <span>${note.time}</span>${user.role_id === 1 ? `<span class="font-semibold text-gray-400"> - Dr. ${note.doctor_name}</span>` : ''}
                    </div>
                    <button class="delete-note-btn h-8 w-8 bg-red-100 flex items-center justify-center rounded" data-id="${note.note_id}">
                        <img src="../../img/trash.svg" alt="Delete note" class="w-6 h-6" />
                    </button>
                  </div>
                  <div class="w-full px-4 py-3 sm:p-6 text-gray-900">
                    ${note.text}
                  </div>
                </div>
              </li>
            `).join('')}
          </ul>
        </dd>
      </div>`}
    </dl>
  </div>
</div>
  `;
}

export async function afterRender(mrn) {
  const token = localStorage.getItem('token');
  const user  = JSON.parse(localStorage.getItem('user'));
  const headers = { Authorization: `Bearer ${token}` };

  // only wire up the modal and form if they're present
  const modal = document.getElementById('note-modal');
  const form  = document.getElementById('note-form');
  if (modal && form) {
    const closeBtn      = document.getElementById('close-note-modal');
    const openBtn       = document.querySelector('button.bg-sky-800');
    const doctorSelect  = form.elements['doctor_id'];

    // 🩺 If current user is a doctor, show only their own name & disable the select
    if (user.role_id === 2) {
      // fetch this doctor’s details
      const docRes = await fetch(
        `${API_BASE}/doctors/show?id=${user.employee_id}`,
        { headers }
      );
      const doc = await docRes.json();
      const opt = document.createElement('option');
      opt.value = doc.doctor_id;
      opt.textContent = `${doc.first_name} ${doc.last_name}`;
      doctorSelect.appendChild(opt);
      doctorSelect.disabled = true;
      doctorSelect.classList.add('bg-gray-100', 'cursor-not-allowed');
    } else {
      // 👩‍⚕️ Admin: populate full dropdown
      const resDoc = await fetch(`${API_BASE}/doctors`, { headers });
      const doctors = await resDoc.json();
      doctors.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d.doctor_id;
        opt.textContent = `${d.first_name} ${d.last_name}`;
        doctorSelect.appendChild(opt);
      });
    }

    // show/hide modal
    openBtn.onclick  = () => { form.reset(); modal.classList.remove('hidden'); };
    closeBtn.onclick = () => modal.classList.add('hidden');

    // submit new note
    form.onsubmit = async e => {
      e.preventDefault();
      const fd = new FormData(form);
      const body = {
        medical_rec_no: mrn,
        doctor_id:      fd.get('doctor_id'),
        text:           fd.get('text'),
      };
      const postRes = await fetch(
        `${API_BASE}/clinical/notes/add`,
        {
          method:  'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization:  `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );
      if (postRes.ok) {
        alert('Note added.');
        modal.classList.add('hidden');
        location.reload();
      } else {
        const err = await postRes.json();
        alert(`Error: ${err.error || 'Could not save note.'}`);
      }
    };
  }

  // hook up delete buttons
  document.querySelectorAll('.delete-note-btn').forEach(btn => {
    btn.onclick = async e => {
      e.stopPropagation();
      const noteId = btn.dataset.id;
      if (!confirm('Delete this consult note?')) return;
      const res = await fetch(
        `${API_BASE}/clinical/notes/delete?id=${noteId}`,
        { method: 'GET', headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        alert('Note deleted.');
        location.reload();
      } else {
        const err = await res.json();
        alert(`Error: ${err.error || 'Could not delete note.'}`);
      }
    };
  });
}