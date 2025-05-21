const form = document.getElementById('form');
const messages = document.getElementById('messages');

// Modal elements
const detailsModal = document.getElementById('detailsModal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const modalDate = document.getElementById('modalDate');
const modalStatus = document.getElementById('modalStatus');
const closeModal = document.getElementById('closeModal');

// Cargar historial desde localStorage al iniciar
let messageHistory = JSON.parse(localStorage.getItem('fcmMessages')) || [];
messageHistory.forEach(createMessageCard);

// Escuchar envío del formulario
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const token = document.getElementById('token').value;
  const title = document.getElementById('title').value;
  const body = document.getElementById('body').value;

  // Crear objeto de mensaje
  const msg = {
    id: Date.now(),
    token,
    title,
    body,
    status: 'Pendiente',
    date: new Date().toLocaleString()
  };

  // Agregar a historial y guardar en localStorage
  messageHistory.unshift(msg);
  localStorage.setItem('fcmMessages', JSON.stringify(messageHistory));

  // Mostrar en UI
  createMessageCard(msg);

  // Enviar al servidor
  try {
    const res = await fetch('/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, title, body })
    });

    const result = await res.json();

    // Actualizar estado
    msg.status = result.success ? 'Enviada' : 'Error';
    updateMessageStatus(msg.id, msg.status);

    // Guardar cambio en localStorage
    localStorage.setItem('fcmMessages', JSON.stringify(messageHistory));
  } catch (err) {
    msg.status = 'Error';
    updateMessageStatus(msg.id, msg.status);
    localStorage.setItem('fcmMessages', JSON.stringify(messageHistory));
  }
});

// Función para crear una tarjeta de mensaje
function createMessageCard(msg) {
  const card = document.createElement('div');
  card.className = 'card';
  card.setAttribute('data-id', msg.id);

  card.innerHTML = `
    <strong>${msg.title}</strong><br/>
    <small>${msg.body}</small><br/>
    <small><strong>Fecha:</strong> ${msg.date}</small><br/>
    <span class="status ${msg.status.toLowerCase()}">${msg.status}</span>
  `;

  // Abrir modal al hacer clic en la tarjeta
  card.addEventListener('click', () => showMessageDetails(msg));

  messages.prepend(card);
}

// Función para actualizar el estado en la tarjeta
function updateMessageStatus(id, newStatus) {
  const card = document.querySelector(`.card[data-id='${id}']`);
  if (card) {
    const statusEl = card.querySelector('.status');
    statusEl.textContent = newStatus;
    statusEl.className = `status ${newStatus.toLowerCase()}`;
  }

  // También actualizamos el objeto del historial
  const msg = messageHistory.find(m => m.id === id);
  if (msg) {
    msg.status = newStatus;
  }
}

// Función para mostrar los detalles en un modal
function showMessageDetails(msg) {
  modalTitle.textContent = msg.title;
  modalBody.textContent = msg.body;
  modalDate.textContent = msg.date;
  modalStatus.textContent = msg.status;
  detailsModal.classList.remove('hidden');
}

// Cerrar modal
closeModal.addEventListener('click', () => {
  detailsModal.classList.add('hidden');
});
