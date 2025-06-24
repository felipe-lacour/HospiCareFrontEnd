export function render() {
  return `
<div class="px-4 sm:px-6 lg:px-8">
  <div class="sm:flex sm:items-center mt-4">
    <div class="sm:flex-auto">
      <h1 class="text-base font-semibold text-gray-900">General Staff</h1>
    </div>
    <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
      <button type="button" class="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Add staff</button>
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
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Document</th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date of Birth</th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Phone</th>
                <th scope="col" class="relative py-3.5 pr-4 pl-3 sm:pr-6">
                  <span class="sr-only">Edit / Delete</span>
                </th>
              </tr>
            </thead>
        <tbody id="employee-list" class="divide-y divide-gray-200 bg-white">
            <tr>
            <td colspan="6" class="px-4 py-4 text-center text-gray-500">Loading staff...</td>
            </tr>
        </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</div>

<div id="employee-modal" class="fixed inset-0 bg-gray-800 bg-opacity-50 hidden flex items-center justify-center z-50">
  <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-xl">
    <h2 class="text-lg font-semibold mb-4">Add Staff</h2>
    <form id="employee-form" class="space-y-4">
      <input type="text" name="first_name" placeholder="First Name" class="w-full border p-2 rounded" required>
      <input type="text" name="last_name" placeholder="Last Name" class="w-full border p-2 rounded" required>
      <input type="text" name="dni" placeholder="DNI" class="w-full border p-2 rounded" required>
      <input type="date" name="birth_date" class="w-full border p-2 rounded" required>
      <input type="text" name="address" placeholder="Address" class="w-full border p-2 rounded" required>
      <input type="text" name="phone" placeholder="Phone" class="w-full border p-2 rounded" required>
      <input type="email" name="email" placeholder="Email" class="w-full border p-2 rounded" required>

      <div class="flex justify-end gap-2 pt-2">
        <button type="button" id="cancel-employee" class="px-4 py-2 bg-gray-300 text-gray-800 rounded">Cancel</button>
        <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded">Save</button>
      </div>
    </form>
  </div>
</div>

  `;
}

export async function afterRender() {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost/HospiCareDev/BACKEND/public/employees', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
        });

        const data = await res.json();
        const container = document.getElementById('employee-list');
        const modal = document.getElementById('employee-modal');
        const form = document.getElementById('employee-form');
        const openBtn = document.querySelector('button.bg-indigo-600');
        const cancelBtn = document.getElementById('cancel-employee');
        const optionalInEditMode = ['dni', 'birth_date'];
        let currentEmployeeData = null; 

        if (!res.ok) {
            container.innerHTML = `<p class="text-red-500">Error: ${data.error}</p>`;
            return;
        }

        // Render rows
        container.innerHTML = data.map(employee => rowTemplate(employee)).join('');
        bindEditButtons();
        bindDeleteButtons()

        // Abrir modal nuevo
        openBtn.addEventListener('click', () => {
            form.reset();
            modal.classList.remove('hidden');
        });

        // Cancelar
        cancelBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
            form.reset();
            form.removeAttribute('data-editing-id');
            form.querySelector('[name="username"]')?.remove();
            restoreHiddenFields();
            currentEmployeeData = null;
        });

        // Enviar formulario
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const isEditing = form.hasAttribute('data-editing-id');
            const formData = new FormData(form);
            const entries = Object.fromEntries(formData.entries());
            if (isEditing) {
                entries.employee_id = form.getAttribute('data-editing-id');
            }

            for (const [key, value] of Object.entries(entries)) {
                if (isEditing && optionalInEditMode.includes(key)) continue;
                if (!value.trim()) {
                alert(`Please fill in the ${key.replace('_', ' ')} field.`);
                return;
                }
            }

            const url = isEditing
                ? `http://localhost/HospiCareDev/BACKEND/public/employee/update`
                : 'http://localhost/HospiCareDev/BACKEND/public/employee/store';

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

                const employeeId = form.getAttribute('data-editing-id') || result.employee_id;

                const baseData = isEditing
                  ? {
                      ...currentEmployeeData,
                      ...entries,
                      dni: currentEmployeeData.dni,
                      birth_date: currentEmployeeData.birth_date
                    }
                  : entries;

                baseData.employee_id = employeeId;
                const updatedRow = rowTemplate(baseData);
                
                if (isEditing) {
                  const oldRow = document.querySelector(`#employee-${employeeId}`);
                  if (oldRow) {
                    oldRow.outerHTML = updatedRow;
                  }
                } else {
                  container.insertAdjacentHTML('beforeend', updatedRow);
                }
                
                bindEditButtons();
                bindDeleteButtons()
                form.removeAttribute('data-editing-id');
                form.querySelector('[name="username"]')?.remove();
                restoreHiddenFields();
                currentEmployeeData = null;

                if (isEditing) {
                    showToast('Employee updated successfully!');
                }

                if (result.setup_link) showSetupLinkModal(result.setup_link);
            } else {
                alert('Error: ' + result.error);
            }
        });

        function rowTemplate(employee) {
            return `
            <tr id="employee-${employee.employee_id}" class="hover:bg-gray-50">
            <td class="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6">${employee.first_name} ${employee.last_name}</td>
            <td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500">${employee.dni}</td>
            <td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500">${employee.birth_date || '-'}</td>
            <td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500">${employee.email}</td>
            <td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500">${employee.phone}</td>
            <td class="relative py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-6">
                <div class="flex justify-end gap-3">
                <button class="edit-btn"><img src="../../img/edit.svg" alt="Edit" class="h-5" /><span class="sr-only">Edit</span></button>
                <button class="delete-btn"><img src="../../img/trash.svg" alt="Delete" class="h-5" /><span class="sr-only">Delete</span></button>
                </div>
            </td>
            </tr>
            `;
        }

        function bindEditButtons() {
            document.querySelectorAll('.edit-btn').forEach(button => {
                button.addEventListener('click', async (e) => {
                const tr = e.currentTarget.closest('tr');
                const employeeId = tr.id.split('-')[1];

                const res = await fetch(`http://localhost/HospiCareDev/BACKEND/public/employee/show?id=${employeeId}`, {
                    headers: {
                    'Authorization': `Bearer ${token}`
                    }
                });
                currentEmployeeData = await res.json();
                const employee = currentEmployeeData;

                modal.classList.remove('hidden');
                form.setAttribute('data-editing-id', employeeId);

                form.querySelector('[name="first_name"]').value = employee.first_name;
                form.querySelector('[name="last_name"]').value = employee.last_name;
                form.querySelector('[name="address"]').value = employee.address;
                form.querySelector('[name="phone"]').value = employee.phone;
                form.querySelector('[name="email"]').value = employee.email;

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

                form.querySelector('[name="username"]').value = employee.username;
                });
            });
        }

        function bindDeleteButtons() {
          document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
              const tr = e.currentTarget.closest('tr');
              const employeeId = tr.id.split('-')[1];

              if (!confirm('Are you sure you want to delete this employee?')) return;

              const res = await fetch('http://localhost/HospiCareDev/BACKEND/public/employee/delete', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ employee_id: employeeId })
              });

              const result = await res.json();

              if (res.ok) {
                tr.remove();
                showToast('Employee deleted successfully!');
              } else {
                alert('Error: ' + result.error);
              }
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
                    <button id="copyLink" class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-500">Copy</button>
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
            // Remove existing toast if any
            const existingToast = document.getElementById('toast-simple');
            if (existingToast) existingToast.remove();

            // Create toast
            const toast = document.createElement('div');
            toast.id = 'toast-simple';
            toast.className = 'fixed bottom-6 left-1/2 transform -translate-x-1/2 flex items-center w-full max-w-xs p-4 space-x-4 rtl:space-x-reverse text-gray-600 bg-gray-50 divide-x rtl:divide-x-reverse divide-gray-200 rounded-lg shadow-lg dark:text-gray-400 dark:divide-gray-700 dark:bg-gray-800';
            toast.innerHTML = `
                <div class="ps-4 text-sm font-normal">${message}</div>
            `;

            document.body.appendChild(toast);

            // Auto-hide after 3 seconds
            setTimeout(() => {
                toast.remove();
            }, 3000);
        }


    } catch (err) {
        document.getElementById('employee-list').innerHTML = `<tr><td colspan="5" class="px-4 py-4 text-center text-red-500">Failed to fetch data</td></tr>`;
        console.error(err);
    }
}