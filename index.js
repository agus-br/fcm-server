const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');

// Inicializar Firebase Admin con la clave privada
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));


// Ruta para enviar notificación push
app.post('/send', async (req, res) => {
  const { token, title, body } = req.body;

  const message = {
    notification: {
      title: title || 'Título por defecto',
      body: body || 'Cuerpo del mensaje'
    },
    token: token
  };

  try {
    const response = await admin.messaging().send(message);
    res.json({ success: true, response });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
