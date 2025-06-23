export function render() {
  const user = JSON.parse(localStorage.getItem('user'));
  return `
<div id="patient-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <form id="patient-form" class="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md space-y-4">
      <h2 class="text-xl font-semibold text-gray-800">New Patient</h2>
      <input type="text" name="dni" placeholder="DNI" required class="w-full border border-gray-300 rounded px-3 py-2" />
      <input type="text" name="first_name" placeholder="Nombre" required class="w-full border border-gray-300 rounded px-3 py-2" />
      <input type="text" name="last_name" placeholder="Apellido" required class="w-full border border-gray-300 rounded px-3 py-2" />
      <input type="date" name="birth_date" placeholder="Fecha de nacimiento" required class="w-full border border-gray-300 rounded px-3 py-2" />
      <input type="text" name="address" placeholder="Dirección" required class="w-full border border-gray-300 rounded px-3 py-2" />
      <input type="text" name="phone" placeholder="Teléfono" required class="w-full border border-gray-300 rounded px-3 py-2" />
      <select name="blood_type" required class="w-full border border-gray-300 rounded px-3 py-2">
        <option value="" disabled selected>Select Blood Type</option>
        <option value="A+">A+</option>
        <option value="A-">A−</option>
        <option value="B+">B+</option>
        <option value="B-">B−</option>
        <option value="AB+">AB+</option>
        <option value="AB-">AB−</option>
        <option value="O+">O+</option>
        <option value="O-">O−</option>
      </select>
      <div class="flex justify-end gap-2 pt-4">
        <button type="button" id="close-modal" class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
        <button type="submit" class="px-4 py-2 bg-sky-900 text-white rounded hover:bg-sky-800">Create</button>
      </div>
    </form>
</div>
<div id="patient-details-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center bg-black/50">
  <div class="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md space-y-4">
    <h2 class="text-xl font-semibold text-gray-800">Patient Details</h2>
    <div id="patient-details-content" class="text-sm text-gray-700 space-y-1"></div>
    <div class="flex justify-end gap-2 pt-4">
      <button type="button" id="view-history" class="px-4 py-2 bg-sky-800 text-white rounded hover:bg-sky-700">View History</button>
      <button type="button" id="close-details-modal" class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Close</button>
    </div>
  </div>
</div>
<div class="px-4 sm:px-6 lg:px-8">
  <div class="sm:flex sm:items-center mt-4">
    <div class="sm:flex-auto">
      <h1 class="text-base font-semibold text-gray-900">Patients</h1>
    </div>
    <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
      <button id="add-patient" type="button" class=" ${user.role_id === 1 || user.role_id === 3 ? '' : 'hidden'} block rounded-md bg-sky-900 px-3 py-2 text-center text-sm font-semibold text-white shadow-xs hover:bg-sky-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Add patient</button>
    </div>
  </div>
  <div class="mt-8 flow-root">
    <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
        <div class="overflow-hidden shadow-sm ring-1 ring-black/5 sm:rounded-lg">
          <table class="min-w-full divide-y divide-gray-300">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-6">Name</th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">DNI</th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date of Birth</th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Rec. No.</th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Blood Type</th>
                <th scope="col" class="relative py-3.5 pr-4 pl-3 sm:pr-6">
                  <span class="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody id="patients-list" class="divide-y divide-gray-200 bg-white">
                <tr>
                  <td colspan="6" class="px-4 py-4 text-center text-gray-500">Loading patients...</td>
                </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</div>
  `;
}

export async function afterRender() {
  const token = localStorage.getItem('token');
  let editingPatientId = null;

  const modal           = document.getElementById('patient-modal');
  const closeModalBtn   = document.getElementById('close-modal');
  const addPatientBtn   = document.getElementById('add-patient');
  const form            = document.getElementById('patient-form');
  const submitBtn       = form.querySelector('button[type="submit"]');

  const detailsModal    = document.getElementById('patient-details-modal');
  const detailsContent  = document.getElementById('patient-details-content');
  const closeDetailsBtn = document.getElementById('close-details-modal');
  const viewHistoryBtn  = document.getElementById('view-history');

  function openCreateModal() {
    editingPatientId = null;
    form.reset();
    submitBtn.textContent = 'Create';
    modal.classList.remove('hidden');
  }

  function openEditModal(patient) {
    editingPatientId = patient.person_id;
    form.elements['dni'].value        = patient.dni;
    form.elements['first_name'].value = patient.first_name;
    form.elements['last_name'].value  = patient.last_name;
    form.elements['birth_date'].value = patient.birth_date;
    form.elements['address'].value    = patient.address;
    form.elements['phone'].value      = patient.phone;
    form.elements['blood_type'].value = patient.blood_type;
    submitBtn.textContent = 'Update';
    modal.classList.remove('hidden');
  }

  function closeFormModal() {
    editingPatientId = null;
    form.reset();
    modal.classList.add('hidden');
  }

  closeModalBtn.onclick = closeFormModal;
  addPatientBtn.onclick = openCreateModal;

  async function loadPatients() {
    const res  = await fetch('http://localhost/HospiCareDev/BACKEND/public/patients', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    const tbody = document.getElementById('patients-list');

    tbody.innerHTML = data.map(p => `
      <tr id="patient-${p.person_id}" class="hover:bg-gray-50 cursor-pointer">
        <td class="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6">${p.first_name} ${p.last_name}</td>
        <td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500">${p.dni}</td>
        <td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500">${p.birth_date}</td>
        <td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500">${p.medical_rec_no}</td>
        <td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500">${p.blood_type}</td>
        <td class="relative py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-6">
          <button class="edit-btn" data-id="${p.person_id}"><img src="../../img/edit.svg" alt="Edit" class="h-5" /><span class="sr-only">Edit ${p.first_name} ${p.last_name}</span></button>
          <button class="delete-btn" data-id="${p.person_id}"><img src="../../img/trash.svg" alt="Delete" class="h-5" /><span class="sr-only">Delete ${p.first_name} ${p.last_name}</span></button>
        </td>
      </tr>
    `).join('');

    data.forEach(patient => {
      document.getElementById(`patient-${patient.person_id}`).onclick = () => {
        detailsContent.innerHTML = `
          <p><strong>DNI:</strong> ${patient.dni}</p>
          <p><strong>Name:</strong> ${patient.first_name} ${patient.last_name}</p>
          <p><strong>Date of Birth:</strong> ${patient.birth_date}</p>
          <p><strong>Address:</strong> ${patient.address}</p>
          <p><strong>Phone:</strong> ${patient.phone}</p>
          <p><strong>Blood Type:</strong> ${patient.blood_type}</p>
          <p><strong>Medical Record No.:</strong> ${patient.medical_rec_no}</p>
        `;
        detailsModal.classList.remove('hidden');
        viewHistoryBtn.onclick = () => {
          window.location.hash = `#history/${patient.medical_rec_no}`;
          detailsModal.classList.add('hidden');
        };
      };

      document.querySelector(`button.edit-btn[data-id="${patient.person_id}"]`)
              .onclick = e => {
        e.stopPropagation();
        openEditModal(patient);
      };

      document.querySelector(`button.delete-btn[data-id="${patient.person_id}"]`)
              .onclick = async e => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this patient?')) return;
        await fetch(`http://localhost/HospiCareDev/BACKEND/public/patients/delete?id=${patient.person_id}`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        await loadPatients();
      };
    });
  }

  closeDetailsBtn.onclick = () => detailsModal.classList.add('hidden');

  await loadPatients();

  form.onsubmit = async e => {
    e.preventDefault();
    const fd = new FormData(form);
    const body = {
      dni:         fd.get('dni'),
      first_name:  fd.get('first_name'),
      last_name:   fd.get('last_name'),
      birth_date:  fd.get('birth_date'),
      address:     fd.get('address'),
      phone:       fd.get('phone'),
      blood_type:  fd.get('blood_type')
    };

    const url    = editingPatientId
                   ? `http://localhost/HospiCareDev/BACKEND/public/patients/update?id=${editingPatientId}`
                   : 'http://localhost/HospiCareDev/BACKEND/public/patients/store';
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    if (res.ok) {
      alert(editingPatientId ? 'Patient updated successfully' : 'Patient created successfully');
      closeFormModal();
      await loadPatients();
    } else {
      const err = await res.json();
      alert(`Error: ${err.error || 'Operation failed'}`);
    }
  };
}