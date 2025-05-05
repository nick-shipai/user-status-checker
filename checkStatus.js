const axios = require('axios');
const express = require('express');

const app = express();
const port = process.env.PORT || 3000; // Define a port

const BASE_URL = 'https://teens-f3fc7-default-rtdb.firebaseio.com'; // Replace with your Firebase DB URL
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

// Run the checkUsers function every 10 seconds (you can adjust this time)
setInterval(checkUsers, 10000);

// Start the Express server
app.get('/', (req, res) => {
  res.send('User status checker is running!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
