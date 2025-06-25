export function render() {
  return `
  <div class="max-w-2xl mx-auto bg-white p-6 rounded shadow">
    <h2 class="text-xl font-semibold">Account Settings</h2>
    <form id="settings-form" class="space-y-4 mt-4">
      <input type="text" name="username" placeholder="Username" class="w-full border p-2 rounded" required>
      <input type="email" name="email" placeholder="Email" class="w-full border p-2 rounded" required>
      <input type="text" name="phone" placeholder="Phone" class="w-full border p-2 rounded">
      <input type="text" name="address" placeholder="Address" class="w-full border p-2 rounded">

      <div class="text-right">
        <button type="submit" class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-500">Save Changes</button>
      </div>
    </form>

    <h2 class="text-xl font-semibold">Change Password</h2>
    <form id="password-form" class="space-y-4 mt-4">
      <input type="password" name="current_password" placeholder="Current Password" class="w-full border p-2 rounded" autocomplete="current-password" required>
      <input type="password" name="new_password" placeholder="New Password" class="w-full border p-2 rounded" autocomplete="new-password" required>
      <input type="password" name="confirm_password" placeholder="Confirm New Password" class="w-full border p-2 rounded" autocomplete="new-password" required>

      <div class="text-right">
        <button type="submit" class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-500">Change Password</button>
      </div>
    </form>
  </div>
  `;
}

export async function afterRender() {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  const form = document.getElementById('settings-form');
  const passForm = document.getElementById('password-form');
  let employeeId = null;
  if (user) {
    employeeId = user.user_id;
  }


  // Cargar datos actuales
  try {
    const res = await fetch(`http://localhost/HospiCareDev/BACKEND/public/employee/show?id=${employeeId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await res.json();
    if (res.ok) {
      form.username.value = data.username;
      form.email.value = data.email;
      form.phone.value = data.phone || '';
      form.address.value = data.address || '';
    } else {
      alert('Error loading profile: ' + data.error);
    }
  } catch (err) {
    alert('Connection error');
  }

  // 🔄 Guardar cambios generales
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    data.employee_id = employeeId;

    const response = await fetch('http://localhost/HospiCareDev/BACKEND/public/employee/change', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (response.ok) {
      alert('Profile updated successfully');
      const updatedUser = {
        ...user,
        username: result.user.username
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } else {
      alert('Error: ' + result.error);
    }
  });

  // 🔒 Cambiar contraseña
  passForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const passData = Object.fromEntries(new FormData(passForm).entries());

    if (passData.new_password !== passData.confirm_password) {
        alert('New passwords do not match.');
        return;
    }

    const body = {
        current_password: passData.current_password,
        new_password: passData.new_password,
        employee_id: employeeId
    };

    const res = await fetch('http://localhost/HospiCareDev/BACKEND/public/user/pass', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
    });

    const result = await res.json();

    if (res.ok) {
        alert('Password changed successfully');
        passForm.reset();
    } else {
        alert('Error: ' + result.error);
    }
  });
}
