export function render() {
  return `
<div class="py-6 px-4 sm:px-6 lg:px-8">
  <h2 class="text-base font-semibold text-gray-700">Dashboard</h2>
  <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    
    <a href="#patients"
       class="flex flex-col items-center justify-center bg-gradient-to-br from-pink-500 to-pink-600 
              text-white rounded-lg shadow-lg p-6 hover:from-pink-600 hover:to-pink-700 transition">
      <div class="text-4xl"><img src="../../img/patient.svg" class="h-10 w-10"/></div>
      <div class="mt-2 text-lg font-semibold">Patients</div>
    </a>
    
    <a href="#doctors"
       class="flex flex-col items-center justify-center bg-gradient-to-br from-purple-500 to-purple-600 
              text-white rounded-lg shadow-lg p-6 hover:from-purple-600 hover:to-purple-700 transition">
      <div class="text-4xl"><img src="../../img/corss.svg" class="h-10 w-10"/></div>
      <div class="mt-2 text-lg font-semibold">Doctors</div>
    </a>
    
    <a href="#appointments"
       class="flex flex-col items-center justify-center bg-gradient-to-br from-yellow-400 to-yellow-500 
              text-white rounded-lg shadow-lg p-6 hover:from-yellow-500 hover:to-yellow-600 transition">
      <div class="text-4xl"><img src="../../img/appointments.svg" class="h-10 w-10"/></div>
      <div class="mt-2 text-lg font-semibold">Appointments</div>
    </a>
    
    <a href="#receptionists"
       class="flex flex-col items-center justify-center bg-gradient-to-br from-green-500 to-green-600 
              text-white rounded-lg shadow-lg p-6 hover:from-green-600 hover:to-green-700 transition">
      <div class="text-4xl"><img src="../../img/staff.svg" class="h-10 w-10"/></div>
      <div class="mt-2 text-lg font-semibold">General Staff</div>
    </a>
    
  </div>
</div>
`;
}




