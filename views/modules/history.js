export async function render(mrn) {
  const res = await fetch(`http://localhost/HospiCareDev/BACKEND/public/clinical/show?medical_rec_no=${mrn}`, {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  });

  const data = await res.json();
  if (!res.ok) {
    return `<p class="text-red-500">Error: ${data.error}</p>`;
  }

  // 🔽 Traer nombres de doctores
  const notesWithDoctors = await Promise.all(
    data.consult_notes.map(async (note) => {
      const docRes = await fetch(`http://localhost/HospiCareDev/BACKEND/public/doctors/show?id=${note.doctor_id}`, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
      });
      const doctor = await docRes.json();
      return {
        ...note,
        doctor_name: doctor.first_name + ' ' + doctor.last_name,
      };
    })
  );

  return `
 <div class="mx-auto max-w-7xl sm:px-6 lg:px-8 py-6">
  <div class="px-4 sm:px-0">
    <h3 class="text-base/7 font-semibold text-gray-900">Patient Information</h3>
    <p class="mt-1 max-w-2xl text-sm/6 text-gray-500">Personal details and application.</p>
  </div>
  <div class="mt-6 border-t border-gray-100">
    <dl class="divide-y divide-gray-100">
      <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
        <dt class="text-sm/6 font-medium text-gray-900">Full name</dt>
        <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">${data.patient.first_name} ${data.patient.last_name}</dd>
      </div>
      <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
        <dt class="text-sm/6 font-medium text-gray-900">DNI</dt>
        <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">${data.patient.dni}</dd>
      </div>
      <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
        <dt class="text-sm/6 font-medium text-gray-900">Phone Number</dt>
        <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">${data.patient.phone}</dd>
      </div>
      <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
        <dt class="text-sm/6 font-medium text-gray-900">Date of Birth</dt>
        <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">${data.patient.birth_date}</dd>
      </div>

      <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
        <dt class="text-sm/6 font-medium text-gray-900">Clinical History</dt>
        <dd class="mt-2 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
          <ul role="list" class="divide-y divide-gray-100 rounded-md border border-gray-200">
            ${notesWithDoctors.map(note => `
              <li class="w-full flex items-center justify-between py-4 pr-5 pl-4 text-sm/6">
                <div class="w-full divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow-sm">
                  <div class="w-full px-4 py-2 sm:px-6 font-medium text-gray-700">
                    <span>${note.time}</span> – <span>Dr. ${note.doctor_name}</span>
                  </div>
                  <div class="w-full px-4 py-3 sm:p-6 text-gray-900">
                    ${note.text}
                  </div>
                </div>
              </li>
            `).join('')}
          </ul>
        </dd>
      </div>
    </dl>
  </div>
</div>
  `;
}