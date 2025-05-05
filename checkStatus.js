const axios = require('axios');

const BASE_URL = 'https://your-project-id.firebaseio.com'; // Replace with your Firebase DB URL
const USERS_URL = `${BASE_URL}/users.json`;

async function checkUsers() {
  try {
    const now = Date.now();
    const { data: users } = await axios.get(USERS_URL);

    for (const uid in users) {
      const user = users[uid];
      const status = user?.status;

      if (!status || !status.last_changed) continue;

      const lastChanged = new Date(status.last_changed).getTime();
      const diff = now - lastChanged;

      if (diff > 10000 && status.state === 'online') {
        console.log(`⛔ Marking ${uid} offline`);
        await axios.patch(`${BASE_URL}/users/${uid}/status.json`, {
          state: "offline",
          last_changed: new Date().toISOString()
        });
      }
    }
  } catch (err) {
    console.error('🔥 Error:', err.message);
  }
}

checkUsers();