/* ===================================================================
   Agendamento de PetShop — Mundo Pet
   Lógica de agenda: listar, filtrar por data, agendar e remover
=================================================================== */

(() => {
  'use strict';

  const STORAGE_KEY = 'mundopet.appointments';

  /** Ícones (linha) usados nos cabeçalhos de período */
  const PERIOD_ICONS = {
    manha: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>',
    tarde: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 18a5 5 0 0 0-10 0"/><path d="M12 9V2M4.2 10.2l1.4 1.4M19.8 10.2l-1.4 1.4M1 18h22M4 22h1M19 22h1M12 22h1"/></svg>',
    noite: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.354 15.354A9 9 0 0 1 8.646 3.646 9.003 9.003 0 1 0 20.354 15.354Z"/></svg>'
  };

  const PERIOD_META = [
    { key: 'manha', label: 'Manhã', range: '09h-12h', from: 0, to: 12 },
    { key: 'tarde', label: 'Tarde', range: '13h-18h', from: 12, to: 18 },
    { key: 'noite', label: 'Noite', range: '19h-21h', from: 18, to: 24 }
  ];

  /** Dados iniciais — mesmos exemplos usados no protótipo do Figma */
  const SEED_DATE = '2024-01-10';
  const SEED_APPOINTMENTS = [
    { id: cryptoId(), date: SEED_DATE, time: '09:00', pet: 'Thor', tutor: 'Fernanda Costa', phone: '(11) 9 8888-1111', service: 'Vacinação' },
    { id: cryptoId(), date: SEED_DATE, time: '13:00', pet: 'Mel', tutor: 'João Souza', phone: '(11) 9 7777-2222', service: 'Corte de Unhas' },
    { id: cryptoId(), date: SEED_DATE, time: '14:00', pet: 'Bella', tutor: 'Pedro Martins', phone: '(11) 9 6666-3333', service: 'Aplicação de Anti-pulgas' },
    { id: cryptoId(), date: SEED_DATE, time: '15:00', pet: 'Simba', tutor: 'Juliana Rocha', phone: '(11) 9 5555-4444', service: 'Tosa Higiênica' },
    { id: cryptoId(), date: SEED_DATE, time: '20:00', pet: 'Max', tutor: 'Camila Santos', phone: '(11) 9 4444-5555', service: 'Limpeza de Dentes' }
  ];

  function cryptoId() {
    return (crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  }

  /* ---------------- Estado ---------------- */

  let appointments = loadAppointments();
  let selectedDate = SEED_DATE;

  function loadAppointments() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (err) {
      console.warn('Não foi possível ler agendamentos salvos:', err);
    }
    return SEED_APPOINTMENTS;
  }

  function saveAppointments() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
    } catch (err) {
      console.warn('Não foi possível salvar agendamentos:', err);
    }
  }

  /* ---------------- Elementos ---------------- */

  const periodsContainer = document.getElementById('periodsContainer');
  const dateInput = document.getElementById('dateInput');
  const selectedDateLabel = document.getElementById('selectedDateLabel');
  const datePickerBtn = document.getElementById('datePickerBtn');

  const openModalBtn = document.getElementById('openModalBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const modalOverlay = document.getElementById('modalOverlay');
  const appointmentForm = document.getElementById('appointmentForm');
  const toast = document.getElementById('toast');

  const phoneInput = document.getElementById('phone');
  const formDateInput = document.getElementById('date');

  /* ---------------- Utilidades ---------------- */

  function formatDateBR(isoDate) {
    const [y, m, d] = isoDate.split('-');
    return `${d}/${m}/${y}`;
  }

  function hourOf(time) {
    return parseInt(time.split(':')[0], 10);
  }

  function showToast(message, { actionLabel, onAction, duration = 2600 } = {}) {
    toast.innerHTML = '';
    toast.append(document.createTextNode(message));

    if (actionLabel && onAction) {
      const actionBtn = document.createElement('button');
      actionBtn.type = 'button';
      actionBtn.className = 'toast-action';
      actionBtn.textContent = actionLabel;
      actionBtn.addEventListener('click', () => {
        onAction();
        hideToast();
      });
      toast.appendChild(actionBtn);
    }

    toast.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(hideToast, duration);
  }

  function hideToast() {
    toast.classList.remove('show');
    clearTimeout(showToast._t);
  }

  /* ---------------- Renderização ---------------- */

  function render() {
    const dayAppointments = appointments
      .filter(a => a.date === selectedDate)
      .sort((a, b) => a.time.localeCompare(b.time));

    periodsContainer.innerHTML = '';

    if (dayAppointments.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.textContent = 'Nenhum agendamento para esta data.';
      periodsContainer.appendChild(empty);
      return;
    }

    PERIOD_META.forEach(period => {
      const rows = dayAppointments.filter(a => {
        const h = hourOf(a.time);
        return h >= period.from && h < period.to;
      });

      if (rows.length === 0) return;

      const section = document.createElement('section');
      section.className = 'period';
      section.dataset.period = period.key;

      section.innerHTML = `
        <div class="period-header">
          <div class="period-title">
            <span class="period-icon">${PERIOD_ICONS[period.key]}</span>
            ${period.label}
          </div>
          <span class="period-range">${period.range}</span>
        </div>
        <div class="period-rows"></div>
      `;

      const rowsWrap = section.querySelector('.period-rows');

      rows.forEach(appt => {
        const row = document.createElement('div');
        row.className = 'row';
        row.innerHTML = `
          <span class="row-time">${appt.time}</span>
          <span class="row-who"><span class="pet-name">${escapeHtml(appt.pet)}</span><span class="sep">/</span><span class="tutor-name">${escapeHtml(appt.tutor)}</span></span>
          <span class="row-service">${escapeHtml(appt.service)}</span>
          <button type="button" class="row-remove" data-id="${appt.id}">Remover agendamento</button>
        `;
        rowsWrap.appendChild(row);
      });

      periodsContainer.appendChild(section);
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /* ---------------- Data selecionada ---------------- */

  function setSelectedDate(isoDate) {
    selectedDate = isoDate;
    selectedDateLabel.textContent = formatDateBR(isoDate);
    dateInput.value = isoDate;
    render();
  }

  dateInput.addEventListener('change', () => {
    if (dateInput.value) setSelectedDate(dateInput.value);
  });

  datePickerBtn.addEventListener('click', () => {
    if (typeof dateInput.showPicker === 'function') {
      dateInput.showPicker();
    } else {
      dateInput.focus();
    }
  });

  /* ---------------- Remover agendamento ---------------- */

  periodsContainer.addEventListener('click', (event) => {
    const btn = event.target.closest('.row-remove');
    if (!btn) return;

    const id = btn.dataset.id;
    const appt = appointments.find(a => a.id === id);
    if (!appt) return;

    appointments = appointments.filter(a => a.id !== id);
    saveAppointments();
    render();

    showToast(`Agendamento de ${appt.pet} removido.`, {
      actionLabel: 'Desfazer',
      duration: 5000,
      onAction: () => {
        appointments.push(appt);
        saveAppointments();
        render();
      }
    });
  });

  /* ---------------- Modal: abrir/fechar ---------------- */

  function openModal() {
    appointmentForm.reset();
    formDateInput.value = selectedDate;
    modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => document.getElementById('tutor').focus(), 150);
  }

  function closeModal() {
    modalOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  openModalBtn.addEventListener('click', openModal);
  closeModalBtn.addEventListener('click', closeModal);

  modalOverlay.addEventListener('click', (event) => {
    if (event.target === modalOverlay) closeModal();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modalOverlay.classList.contains('open')) {
      closeModal();
    }
  });

  /* ---------------- Máscara de telefone ---------------- */

  phoneInput.addEventListener('input', () => {
    let digits = phoneInput.value.replace(/\D/g, '').slice(0, 11);

    let formatted = digits;
    if (digits.length > 0) formatted = `(${digits.slice(0, 2)}`;
    if (digits.length >= 3) formatted += `) ${digits.slice(2, 3)}`;
    if (digits.length >= 4) formatted += ` ${digits.slice(3, 7)}`;
    if (digits.length >= 8) formatted += `-${digits.slice(7, 11)}`;

    phoneInput.value = formatted;
  });

  /* ---------------- Criar agendamento ---------------- */

  appointmentForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const data = new FormData(appointmentForm);
    const tutor = data.get('tutor').trim();
    const pet = data.get('pet').trim();
    const phone = data.get('phone').trim();
    const service = data.get('service').trim();
    const date = data.get('date');
    const time = data.get('time');

    if (!tutor || !pet || !phone || !service || !date || !time) {
      showToast('Preencha todos os campos para agendar.');
      return;
    }

    appointments.push({ id: cryptoId(), date, time, pet, tutor, phone, service });
    saveAppointments();

    closeModal();
    setSelectedDate(date);
    showToast(`Agendamento de ${pet} criado com sucesso!`);
  });

  /* ---------------- Inicialização ---------------- */

  setSelectedDate(selectedDate);
})();
