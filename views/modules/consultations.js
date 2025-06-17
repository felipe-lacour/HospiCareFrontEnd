export function render() {
  return `
<div class="px-4 sm:px-6 lg:px-8">
  <div class="sm:flex sm:items-center">
    <div class="sm:flex-auto">
      <h1 class="text-base font-semibold text-gray-900 mt-4">Consultations</h1>
    </div>
  </div>
  <div class="mt-8 flow-root">
    <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
        <div class="overflow-hidden shadow-sm ring-1 ring-black/5 sm:rounded-lg">
          <table class="min-w-full divide-y divide-gray-300">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-6">Date</th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Patient</th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Doctor</th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Notes</th>
                <th scope="col" class="relative py-3.5 pr-4 pl-3 sm:pr-6">
                  <span class="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
<tbody id="consuls-list" class="divide-y divide-gray-200 bg-white">
    <tr>
      <td colspan="6" class="px-4 py-4 text-center text-gray-500">Loading consultations...</td>
    </tr>
</tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</div>


<div id="edit-modal" class="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center hidden z-50">
  <div class="bg-white rounded-lg p-6 shadow-lg max-w-md">
    <h2 class="text-lg font-semibold text-gray-900 mb-4">Edit Note</h2>
    <textarea id="edit-note-text" class="w-full p-2 border border-gray-300 rounded mb-4" rows="6"></textarea>
    <div class="flex justify-end gap-2">
      <button id="cancel-edit" class="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400">Cancel</button>
      <button id="save-edit" class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500">Save</button>
    </div>
  </div>
</div>
  `;
}

export async function afterRender() {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost/HospiCareDev/BACKEND/public/clinical/notes/all', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await res.json();
    const container = document.getElementById('consuls-list');

    if (!res.ok) {
      container.innerHTML = `<tr><td colspan="5" class="px-4 py-4 text-center text-red-500">Error: ${data.error}</td></tr>`;
      return;
    }

    if (data.length === 0) {
      container.innerHTML = `<tr><td colspan="5" class="px-4 py-4 text-center text-gray-500">No consultations found.</td></tr>`;
      return;
    }

    container.innerHTML = data.map(note => `
      <tr class="hover:bg-gray-50">
        <td class="py-4 px-4 text-sm text-gray-900">${new Date(note.time).toLocaleString()}</td>
        <td class="px-4 py-4 text-sm text-gray-500">${note.patient_first_name} ${note.patient_last_name}</td>
        <td class="px-4 py-4 text-sm text-gray-500">${note.doctor_first_name} ${note.doctor_last_name}</td>
        <td class="px-4 py-4 text-sm text-gray-500 note-text">${note.text}</td>
        <td class="px-4 py-4 text-sm text-right text-indigo-600 hover:text-indigo-900">
          <button class="edit-note text-indigo-600 hover:text-indigo-900">Edit</button>
        </td>
      </tr>
    `).join('');

    const modal = document.getElementById('edit-modal');
    const textarea = document.getElementById('edit-note-text');
    const cancelBtn = document.getElementById('cancel-edit');
    const saveBtn = document.getElementById('save-edit');

    let currentIndex = null;

    document.querySelectorAll('.edit-note').forEach((btn, i) => {
      btn.addEventListener('click', () => {
        currentIndex = i;
        textarea.value = data[i].text;
        modal.classList.remove('hidden');
      });
    });

    cancelBtn.addEventListener('click', () => {
      modal.classList.add('hidden');
    });

    saveBtn.addEventListener('click', async () => {
      const updatedText = textarea.value;
      const noteId = data[currentIndex].note_id;

      const updateRes = await fetch(`http://localhost/HospiCareDev/BACKEND/public/clinical/notes/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ note_id: noteId, text: updatedText })
      });

      if (updateRes.ok) {
        document.querySelectorAll('.note-text')[currentIndex].textContent = updatedText;
        modal.classList.add('hidden');
      } else {
        alert('Failed to update note');
      }
    });
  } catch (err) {
    document.getElementById('consuls-list').innerHTML = `<tr><td colspan="5" class="px-4 py-4 text-center text-red-500">Failed to fetch data</td></tr>`;
    console.error(err);
  }
}