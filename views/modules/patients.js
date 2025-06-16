export function render() {
  return `
<div class="px-4 sm:px-6 lg:px-8">
  <div class="sm:flex sm:items-center">
    <div class="sm:flex-auto">
      <h1 class="text-base font-semibold text-gray-900">Patients</h1>
    </div>
    <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
      <button type="button" class="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Add user</button>
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
  try {
    const token = localStorage.getItem('token');
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
            <a href="#" class="text-indigo-600 hover:text-indigo-900">Edit<span class="sr-only">, ${patient.first_name} ${patient.last_name}</span></a>
        </td>
        </tr>
    `).join('');
  } catch (err) {
    document.getElementById('patients-list').innerHTML = `<p class="text-red-500">Failed to fetch data</p>`;
    console.error(err);
  }
}



