let formToggle = false;

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

  const loadPatients = async () => {
    const res = await fetch('http://localhost/HospiCareDev/BACKEND/public/patients', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await res.json();
    const container = document.getElementById('patients-list');

    if (!res.ok) {
      container.innerHTML = `<p class="text-red-500">Error: ${data.error}</p>`;
      return;
    }

    container.innerHTML = data.map(patient => `
        <tr id="patient-${patient.person_id}" class="hover:bg-gray-50">
        <td class="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6">${patient.first_name} ${patient.last_name}</td>
        <td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500">${patient.dni}</td>
        <td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500">${patient.birth_date}</td>
        <td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500">${patient.medical_rec_no}</td>
        <td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500">${patient.blood_type}</td>
        <td class="relative py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-6">
            <button id="edit-${patient.person_id}"><img src="../../img/edit.svg" alt="Edit" class="h-5" /><span class="sr-only">, ${patient.first_name} ${patient.last_name}</span></button>
            <button id="delete-${patient.person_id}"><img src="../../img/trash.svg" alt="Delete" class="h-5" /><span class="sr-only">, ${patient.first_name} ${patient.last_name}</span></button>
        </td>
        </tr>
    `).join('');

    data.forEach(patient => {
  const deleteBtn = document.getElementById(`delete-${patient.person_id}`);
  const editBtn = document.getElementById(`edit-${patient.person_id}`);

  deleteBtn?.addEventListener('click', async () => {
    if (!confirm(`Are you sure you want to delete ${patient.first_name} ${patient.last_name}?`)) return;

    try {
      const res = await fetch(`http://localhost/HospiCareDev/BACKEND/public/patients/delete?id=${patient.person_id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await res.json();
      if (res.ok) {
        alert('Patient deleted');
        await loadPatients();
      } else {
        alert(`Error: ${result.error || 'Could not delete'}`);
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to connect to server');
    }
  });

editBtn?.addEventListener('click', () => {
  // Mostrar modal
  modal.classList.remove('hidden');

  // Llenar el formulario con los datos del paciente
  form.elements['dni'].value = patient.dni;
  form.elements['first_name'].value = patient.first_name;
  form.elements['last_name'].value = patient.last_name;
  form.elements['birth_date'].value = patient.birth_date;
  form.elements['address'].value = patient.address;
  form.elements['phone'].value = patient.phone;
  form.elements['blood_type'].value = patient.blood_type;

  // Guardar ID para actualización
  form.dataset.editingId = patient.person_id;

  // Cambiar texto del botón a "Update"
  form.querySelector('button[type="submit"]').textContent = 'Update';

  // ✅ Asegurarse de no duplicar listeners
  const newForm = form.cloneNode(true);
  form.parentNode.replaceChild(newForm, form);
  const currentForm = document.getElementById('patient-form');

  // Nuevo submit solo para edición
  currentForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(currentForm);
    const patientData = {
      dni: formData.get('dni'),
      first_name: formData.get('first_name'),
      last_name: formData.get('last_name'),
      birth_date: formData.get('birth_date'),
      address: formData.get('address'),
      phone: formData.get('phone'),
      blood_type: formData.get('blood_type')
    };

    try {
      const res = await fetch(`http://localhost/HospiCareDev/BACKEND/public/patients/update?id=${patient.person_id}`, {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(patientData)
      });

      const result = await res.json();

      if (res.ok) {
        alert('Paciente actualizado correctamente');
        currentForm.reset();
        modal.classList.add('hidden');
        await loadPatients();
      } else {
        alert(`Error: ${result.error || 'No se pudo actualizar el paciente'}`);
      }
    } catch (err) {
      console.error('Error al actualizar:', err);
      alert('Error al conectar con el servidor');
    }
  });
});
});
  };

  await loadPatients();

  const addPatientBtn = document.getElementById('add-patient');
  const closeModalBtn = document.getElementById('close-modal');
  const modal = document.getElementById('patient-modal');

  closeModalBtn?.addEventListener('click', () => {
    modal.classList.add('hidden'); 
  });

  addPatientBtn?.addEventListener('click', () => {
    modal.classList.remove('hidden'); 
  });

  const form = document.getElementById('patient-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const patientData = {
      dni: formData.get('dni'),
      first_name: formData.get('first_name'),
      last_name: formData.get('last_name'),
      birth_date: formData.get('birth_date'),
      address: formData.get('address'),
      phone: formData.get('phone'),
      blood_type: formData.get('blood_type')
    };

    try {
      const res = await fetch('http://localhost/HospiCareDev/BACKEND/public/patients/store', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(patientData)
      });

      const result = await res.json();

      if (res.ok) {
        alert('Patient created successfully');
        form.reset();
        modal.classList.add('hidden');
        await loadPatients();
      } else {
        alert(`Error: ${result.error || 'The patient could not be created.'}`);
      }
    } catch (err) {
      console.error('Error connecting to the server:', err);
      alert('There was an error while sending the data.');
    }
  });
}



