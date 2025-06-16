export function render() {
  return `
<div class="px-4 sm:px-6 lg:px-8">
  <h2 class="text-sm font-medium text-gray-500">Dashboard</h2>
  <ul role="list" class="mt-3 flex gap-5 sm:gap-6 justify-between">
    <li class="col-span-1 flex rounded-md shadow-xs">
      <div class="flex w-16 shrink-0 items-center justify-center rounded-l-md bg-pink-600 text-sm font-medium text-white">PA</div>
      <div class="flex flex-1 items-center justify-between truncate rounded-r-md border-t border-r border-b border-gray-200 bg-white">
        <div class="flex-1 truncate px-4 py-2 text-sm">
          <a href="#patients" class="font-medium text-gray-900 hover:text-gray-600">Patients</a>
        </div>
      </div>
    </li>
    <li class="col-span-1 flex rounded-md shadow-xs">
      <div class="flex w-16 shrink-0 items-center justify-center rounded-l-md bg-purple-600 text-sm font-medium text-white">DO</div>
      <div class="flex flex-1 items-center justify-between truncate rounded-r-md border-t border-r border-b border-gray-200 bg-white">
        <div class="flex-1 truncate px-4 py-2 text-sm">
          <a href="#doctors" class="font-medium text-gray-900 hover:text-gray-600">Doctors</a>
        </div>
      </div>
    </li>
    <li class="col-span-1 flex rounded-md shadow-xs">
      <div class="flex w-16 shrink-0 items-center justify-center rounded-l-md bg-yellow-500 text-sm font-medium text-white">AP</div>
      <div class="flex flex-1 items-center justify-between truncate rounded-r-md border-t border-r border-b border-gray-200 bg-white">
        <div class="flex-1 truncate px-4 py-2 text-sm">
          <a href="#appointments" class="font-medium text-gray-900 hover:text-gray-600">Appointments</a>
        </div>
      </div>
    </li>
    <li class="col-span-1 flex rounded-md shadow-xs">
      <div class="flex w-16 shrink-0 items-center justify-center rounded-l-md bg-green-500 text-sm font-medium text-white">CO</div>
      <div class="flex flex-1 items-center justify-between truncate rounded-r-md border-t border-r border-b border-gray-200 bg-white">
        <div class="flex-1 truncate px-4 py-2 text-sm">
          <a href="#consultations" class="font-medium text-gray-900 hover:text-gray-600">Consultations</a>
        </div>
      </div>
    </li>
  </ul>
</div>

  `;
}




