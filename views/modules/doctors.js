export function render() {
  return `
<div class="px-4 sm:px-6 lg:px-8">
  <div class="sm:flex sm:items-center mt-4">
    <div class="sm:flex-auto">
      <h1 class="text-base font-semibold text-gray-900">Doctors</h1>
    </div>

    <div class="mt-4">
      <label class="inline-flex items-center mb-5 cursor-pointer">
        <input id="toggle-inactive" type="checkbox" class="sr-only peer">
        <div class="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 dark:peer-focus:ring-sky-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-sky-600 dark:peer-checked:bg-sky-600"></div>
        <span class="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Show inactive</span>
      </label>
    </div>
            
    <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
      <button type="button" class="block rounded-md bg-sky-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-xs hover:bg-sky-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600">Add user</button>
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
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">License No.</th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date of Birth</th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Specialty</th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Phone</th>
                <th scope="col" class="relative py-3.5 pr-4 pl-3 sm:pr-6">
                  <span class="sr-only">Edit / Delete</span>
                </th>
              </tr>
            </thead>
<tbody id="doctors-list" class="divide-y divide-gray-200 bg-white">
    <tr>
      <td colspan="6" class="px-4 py-4 text-center text-gray-500">Loading doctors...</td>
    </tr>
</tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</div>

<div id="doctor-modal" class="fixed inset-0 bg-gray-800 bg-opacity-50 hidden flex items-center justify-center z-50">
  <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-xl">
    <h2 class="text-lg font-semibold mb-4">Add Doctor</h2>
    <form id="doctor-form" class="space-y-4">
      <input type="text" name="first_name" placeholder="First Name" class="w-full border p-2 rounded" required>
      <input type="text" name="last_name" placeholder="Last Name" class="w-full border p-2 rounded" required>
      <input type="text" name="dni" placeholder="DNI" class="w-full border p-2 rounded" required>
      <input type="date" name="birth_date" class="w-full border p-2 rounded" required>
      <input type="text" name="address" placeholder="Address" class="w-full border p-2 rounded" required>
      <input type="text" name="phone" placeholder="Phone" class="w-full border p-2 rounded" required>
      <input type="email" name="email" placeholder="Email" class="w-full border p-2 rounded" required>
      <input type="text" name="license_no" placeholder="License No." class="w-full border p-2 rounded" required>
      <input type="text" name="specialty" placeholder="Specialty" class="w-full border p-2 rounded" required>

      <div class="flex justify-end gap-2 pt-2">
        <button type="button" id="cancel-doctor" class="px-4 py-2 bg-gray-300 text-gray-800 rounded">Cancel</button>
        <button type="submit" class="px-4 py-2 bg-sky-600 text-white rounded">Save</button>
      </div>
    </form>
  </div>
</div>

<!-- Confirmación de eliminación -->
<div id="confirm-modal" class="fixed inset-0 bg-black bg-opacity-30 hidden flex justify-center items-center z-50">
  <div class="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
    <h2 class="text-lg font-semibold mb-4">Confirm Deactivation</h2>
    <p class="text-sm text-gray-600 mb-6">Are you sure you want to deactivate this doctor?</p>
    <div class="flex justify-end gap-2">
      <button id="cancel-deactivate" class="px-4 py-2 bg-gray-300 text-gray-800 rounded">Cancel</button>
      <button id="confirm-deactivate" class="px-4 py-2 bg-red-600 text-white rounded">Deactivate</button>
    </div>
  </div>
</div>
  `;
}

export async function afterRender() {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost/HospiCareDev/BACKEND/public/doctors', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    let currentDoctorData = null; 
    let showInactive = false;
    let allDoctors = [];  

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = user.role_id === 1;
    const data = await res.json();
    const container = document.getElementById('doctors-list');
    const modal = document.getElementById('doctor-modal');
    const form = document.getElementById('doctor-form');
    const openBtn = document.querySelector('button.bg-sky-600');
    const cancelBtn = document.getElementById('cancel-doctor');
    const optionalInEditMode = ['dni', 'birth_date'];

    if (!isAdmin) {
      document.getElementById('toggle-inactive')?.closest('label')?.classList.add('hidden');
      openBtn?.classList.add('hidden');
    }

    if (!res.ok) {
      container.innerHTML = `<p class="text-red-500">Error: ${data.error}</p>`;
      return;
    }

    document.getElementById('toggle-inactive').addEventListener('change', e => {
      showInactive = e.target.checked;
      renderDoctorsList();
    });

    allDoctors = data;
    renderDoctorsList();

    openBtn.addEventListener('click', () => {
      form.reset();
      modal.classList.remove('hidden');
    });

    cancelBtn.addEventListener('click', () => {
      modal.classList.add('hidden');
      form.reset();
      form.removeAttribute('data-editing-id');
      form.querySelector('[name="username"]')?.remove();
      restoreHiddenFields();
      currentDoctorData = null; 
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const isEditing = form.hasAttribute('data-editing-id');
      const formData = new FormData(form);
      const entries = Object.fromEntries(formData.entries());
      if (isEditing) {
        entries.doctor_id = form.getAttribute('data-editing-id');
      }

      const validations = {
        first_name: /^[A-Za-zÀ-ÿ\s]+$/,
        last_name: /^[A-Za-zÀ-ÿ\s]+$/,
        dni: /^\d+$/,
        birth_date: /^\d{4}-\d{2}-\d{2}$/,
        address: /^[A-Za-zÀ-ÿ0-9\s,.#-]+$/,
        phone: /^\d{6,15}$/,
        email: /^[^@]+@[^@]+\.[^@]+$/,
        license_no: /^[A-Za-z0-9-]+$/,
        specialty: /^[A-Za-zÀ-ÿ\s]+$/
      };

      for (const [key, value] of Object.entries(entries)) {
        if (isEditing && optionalInEditMode.includes(key)) continue;

        if (!value.trim()) {
          alert(`Please fill in the ${key.replace('_', ' ')} field.`);
          return;
        }

        const pattern = validations[key];
        if (pattern && !pattern.test(value.trim())) {
          alert(`Invalid value in "${key.replace('_', ' ')}" field.`);
          return;
        }
      }
      
      const url = isEditing
        ? `http://localhost/HospiCareDev/BACKEND/public/doctors/update`
        : 'http://localhost/HospiCareDev/BACKEND/public/doctors/store';

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(entries)
      });

      const result = await res.json();

      if (res.ok) {
        modal.classList.add('hidden');
        form.reset();

        const doctorId = form.getAttribute('data-editing-id') || result.doctor_id;

        const baseData = isEditing
          ? {
              ...currentDoctorData,
              ...entries,
              dni: currentDoctorData.dni,
              birth_date: currentDoctorData.birth_date
            }
          : entries;

        baseData.doctor_id = doctorId;
        const updatedRow = rowTemplate(baseData);
        
        if (isEditing) {
          const oldRow = document.querySelector(`#doctor-${doctorId}`);
          if (oldRow) {
            oldRow.outerHTML = updatedRow;
          }
        } else {
          container.insertAdjacentHTML('beforeend', updatedRow);
        }

        bindEditButtons();
        form.removeAttribute('data-editing-id');
        form.querySelector('[name="username"]')?.remove();
        restoreHiddenFields();
        currentDoctorData = null; 

        if (isEditing) {
          showToast('Doctor updated successfully!');
        }

        if (result.setup_link) showSetupLinkModal(result.setup_link);
      } else {
        alert('Error: ' + result.error);
      }
    });

    function renderDoctorsList() {
      const container = document.getElementById('doctors-list');
      if (!isAdmin) {
        document.getElementById('toggle-inactive')?.closest('label')?.classList.add('hidden');
        openBtn?.classList.add('hidden');
      }
      container.innerHTML = '';

      const filtered = showInactive ? allDoctors : allDoctors.filter(d => Boolean(d.employed));
      if (filtered.length === 0) {
        container.innerHTML = `<tr><td colspan="6" class="px-4 py-4 text-center text-gray-500">No doctors to display</td></tr>`;
        return;
      }

      container.innerHTML = filtered.map(d => rowTemplate(d)).join('');
      bindEditButtons();
      bindDeleteButtons();
    }

    function bindDeleteButtons() {
      document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', e => {
          const doctorId = e.currentTarget.closest('tr').id.split('-')[1];
          showConfirmModal(doctorId);
        });
      });

      document.querySelectorAll('.reactivate-btn').forEach(btn => {
        btn.addEventListener('click', async e => {
          const doctorId = e.currentTarget.closest('tr').id.split('-')[1];
          await toggleEmployment(doctorId, true);
        });
      });
    }

    function showConfirmModal(doctorId) {
      const modal = document.getElementById('confirm-modal');
      modal.classList.remove('hidden');

      document.getElementById('cancel-deactivate').onclick = () => {
        modal.classList.add('hidden');
      };

      document.getElementById('confirm-deactivate').onclick = async () => {
        await toggleEmployment(doctorId, false);
        modal.classList.add('hidden');
      };
    }

    function rowTemplate(doctor) {
      const actionButton = !isAdmin ? '' : doctor.employed
      ? `<button class="delete-btn"><img src="../../img/archive.svg" alt="Delete" class="h-5" /><span class="sr-only">Delete</span></button>`
      : `<button class="reactivate-btn"><img src="../../img/unarchive.svg" alt="Reactivate" class="h-5" /><span class="sr-only">Reactivate</span></button>`;

      return `
        <tr id="doctor-${doctor.doctor_id}" class="hover:bg-gray-50 ${doctor.employed ? '' : 'opacity-60'}">
          <td class="py-4 pr-3 pl-4 text-sm font-medium text-gray-900 sm:pl-6">${doctor.first_name} ${doctor.last_name}</td>
          <td class="px-3 py-4 text-sm text-gray-500">${doctor.license_no}</td>
          <td class="px-3 py-4 text-sm text-gray-500">${doctor.birth_date || '-'}</td>
          <td class="px-3 py-4 text-sm text-gray-500">${doctor.email}</td>
          <td class="px-3 py-4 text-sm text-gray-500">${doctor.specialty}</td>
          <td class="px-3 py-4 text-sm text-gray-500">${doctor.phone}</td>
          <td class="relative py-4 pr-4 pl-3 text-right text-sm font-medium sm:pr-6">
            <div class="flex justify-end gap-3">
              ${doctor.employed && isAdmin ? '<button class="edit-btn"><img src="../../img/edit.svg" alt="Edit" class="h-5" /></button>' : ''}
              ${actionButton}
            </div>
          </td>
        </tr>
      `;
    }

    function bindEditButtons() {
      document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', async (e) => {
          const tr = e.currentTarget.closest('tr');
          const doctorId = tr.id.split('-')[1];

          const res = await fetch(`http://localhost/HospiCareDev/BACKEND/public/doctors/show?id=${doctorId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          currentDoctorData = await res.json();
          const doctor = currentDoctorData;

          modal.classList.remove('hidden');
          form.setAttribute('data-editing-id', doctorId);

          form.querySelector('[name="first_name"]').value = doctor.first_name;
          form.querySelector('[name="last_name"]').value = doctor.last_name;
          form.querySelector('[name="address"]').value = doctor.address;
          form.querySelector('[name="phone"]').value = doctor.phone;
          form.querySelector('[name="email"]').value = doctor.email;
          form.querySelector('[name="license_no"]').value = doctor.license_no;
          form.querySelector('[name="specialty"]').value = doctor.specialty;

          form.querySelector('[name="dni"]').removeAttribute('required');
          form.querySelector('[name="birth_date"]').removeAttribute('required');
          form.querySelector('[name="dni"]').style.display = 'none';
          form.querySelector('[name="birth_date"]').style.display = 'none';

          if (!form.querySelector('[name="username"]')) {
            const usernameField = document.createElement('input');
            usernameField.name = 'username';
            usernameField.placeholder = 'Username';
            usernameField.required = true;
            usernameField.className = 'w-full border p-2 rounded';
            form.insertBefore(usernameField, form.querySelector('.flex.justify-end'));
          }

          form.querySelector('[name="username"]').value = doctor.username;
        });
      });
    }

    function restoreHiddenFields() {
      const dni = form.querySelector('[name="dni"]');
      const birth = form.querySelector('[name="birth_date"]');
      if (dni) {
        dni.style.display = '';
        dni.setAttribute('required', 'true');
      }
      if (birth) {
        birth.style.display = '';
        birth.setAttribute('required', 'true');
      }
    }

    function showSetupLinkModal(link) {
      const copyBox = document.createElement('div');
      copyBox.innerHTML = `
        <div class="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div class="bg-white rounded p-6 shadow-lg max-w-md w-full text-center">
            <h2 class="text-lg font-semibold mb-2">Setup Link</h2>
            <input type="text" id="linkInput" value="${link}" readonly class="w-full border p-2 rounded mb-4 text-sm text-gray-700">
            <button id="copyLink" class="bg-sky-600 text-white px-4 py-2 rounded hover:bg-sky-500">Copy</button>
            <button id="closeLinkModal" class="ml-2 text-gray-500 hover:underline">Close</button>
          </div>
        </div>`;

      document.body.appendChild(copyBox);
      document.getElementById('copyLink').addEventListener('click', async () => {
        const input = document.getElementById('linkInput');
        try {
          await navigator.clipboard.writeText(input.value);
          showToast('Link copied to clipboard!');
        } catch (err) {
          alert('Could not copy to clipboard');
        }
      });
      document.getElementById('closeLinkModal').addEventListener('click', () => {
        copyBox.remove();
      });
    }

    function showToast(message) {
      const existingToast = document.getElementById('toast-simple');
      if (existingToast) existingToast.remove();

      const toast = document.createElement('div');
      toast.id = 'toast-simple';
      toast.className = 'fixed bottom-6 left-1/2 transform -translate-x-1/2 flex items-center w-full max-w-xs p-4 space-x-4 rtl:space-x-reverse text-gray-600 bg-gray-50 divide-x rtl:divide-x-reverse divide-gray-200 rounded-lg shadow-lg dark:text-gray-400 dark:divide-gray-700 dark:bg-gray-800';
      toast.innerHTML = `
        <div class="ps-4 text-sm font-normal">${message}</div>
      `;

      document.body.appendChild(toast);

      setTimeout(() => {
        toast.remove();
      }, 3000);
    }

    async function toggleEmployment(doctorId, employed) {
      try {
        const res = await fetch(`http://localhost/HospiCareDev/BACKEND/public/doctors/employment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ doctor_id: doctorId, employed })
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Failed to update employment status');

        const index = allDoctors.findIndex(d => d.doctor_id == doctorId);
        if (index !== -1) {
          allDoctors[index].employed = employed;
          renderDoctorsList();
          showToast(`Doctor ${employed ? 'reactivated' : 'deactivated'} successfully`);
        }
      } catch (err) {
        showToast(err.message || 'Error updating status');
      }
    }

  } catch (err) {
    document.getElementById('doctors-list').innerHTML = `<tr><td colspan="5" class="px-4 py-4 text-center text-red-500">Failed to fetch data</td></tr>`;
    console.error(err);
  }
}
