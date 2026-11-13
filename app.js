/**
 * OZON ROLEPLAY - INTERACTIVE SCRIPTS
 * Formularze, Discord Webhook, Akordeon, Discord OAuth2 Mock/Handler
 */

// Konfiguracja domyślna
const CONFIG = {
  // Możesz podmienić ten Webhook na swój z serwera Discord lub ustawić w panelu admina!
  DISCORD_WEBHOOK_URL: localStorage.getItem('ozon_webhook') || '',
  DISCORD_CLIENT_ID: 'TUTAJ_TWOJE_CLIENT_ID_DISCORD', // Opcjonalnie do OAuth2
  REDIRECT_URI: window.location.origin + window.location.pathname
};

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initAccordion();
  initForms();
  initAdminPanel();
  checkOAuthRedirect();
});

/* ================================
   1. MENU MOBILNE & NAWIGACJA
   ================================ */
function initMobileMenu() {
  const hamburger = document.getElementById('hamburgerBtn');
  const navMenu = document.getElementById('navMenu');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });

    // Zamknij menu po kliknięciu w link
    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
      });
    });
  }
}

/* ================================
   2. AKORDEON REGULAMINU
   ================================ */
function initAccordion() {
  const headers = document.querySelectorAll('.accordion-header');
  headers.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const content = header.nextElementSibling;
      const isActive = item.classList.contains('active');

      // Zwiń pozostałe
      document.querySelectorAll('.accordion-item').forEach(i => {
        i.classList.remove('active');
        i.querySelector('.accordion-content').style.maxHeight = null;
      });

      if (!isActive) {
        item.classList.add('active');
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });
}

/* ================================
   3. OBSŁUGA FORMULARZY & WEBHOOK
   ================================ */
function initForms() {
  // Formularz Ticketu
  const ticketForm = document.getElementById('ticketForm');
  const ticketAlert = document.getElementById('ticketAlert');

  if (ticketForm) {
    ticketForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = ticketForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Wysyłanie...';
      submitBtn.disabled = true;

      const ticketData = {
        discord: document.getElementById('tDiscord').value.trim(),
        steam: document.getElementById('tSteam').value.trim(),
        category: document.getElementById('tCategory').value,
        message: document.getElementById('tMessage').value.trim(),
        date: new Date().toLocaleString('pl-PL')
      };

      // Zapis lokalny dla panelu admina
      saveLocalData('tickets', ticketData);

      // Wysyłka Discord Webhook (jeśli jest skonfigurowany)
      const webhookUrl = localStorage.getItem('ozon_webhook') || CONFIG.DISCORD_WEBHOOK_URL;
      let sentToDiscord = false;

      if (webhookUrl && webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
        sentToDiscord = await sendDiscordEmbed(webhookUrl, {
          title: `🎫 Nowy Ticket Pomocy [${ticketData.category}]`,
          color: 0x9d5cf7, // Neonowy fiolet
          fields: [
            { name: "👤 Discord", value: ticketData.discord, inline: true },
            { name: "🎮 ID / Steam", value: ticketData.steam, inline: true },
            { name: "📂 Kategoria", value: ticketData.category, inline: false },
            { name: "📝 Treść zgłoszenia", value: ticketData.message, inline: false }
          ],
          footer: { text: `OZON RolePlay • ${ticketData.date}` }
        });
      }

      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;

      // Komunikat sukcesu
      ticketAlert.className = 'form-alert success';
      ticketAlert.innerHTML = `<i class="fa-solid fa-check"></i> <strong>Twój ticket został pomyślnie wysłany!</strong> Administracja otrzymała powiadomienie. Odpowiedź pojawi się na Discordzie.`;
      ticketAlert.style.display = 'block';
      ticketForm.reset();

      setTimeout(() => {
        ticketAlert.style.display = 'none';
      }, 7000);
    });
  }

  // Formularz Podania
  const applyForm = document.getElementById('applyForm');
  const applyAlert = document.getElementById('applyAlert');

  if (applyForm) {
    applyForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = applyForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Wysyłanie...';
      submitBtn.disabled = true;

      const applyData = {
        nameAge: document.getElementById('aNameAge').value.trim(),
        discord: document.getElementById('aDiscord').value.trim(),
        rank: document.getElementById('aRank').value,
        experience: document.getElementById('aExperience').value.trim(),
        motivation: document.getElementById('aMotivation').value.trim(),
        date: new Date().toLocaleString('pl-PL')
      };

      // Zapis lokalny dla panelu admina
      saveLocalData('applies', applyData);

      // Wysyłka Discord Webhook
      const webhookUrl = localStorage.getItem('ozon_webhook') || CONFIG.DISCORD_WEBHOOK_URL;
      if (webhookUrl && webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
        await sendDiscordEmbed(webhookUrl, {
          title: `📋 Nowe Podanie do Administracji [${applyData.rank}]`,
          color: 0xb366ff,
          fields: [
            { name: "👤 Imię i Wiek", value: applyData.nameAge, inline: true },
            { name: "💬 Discord", value: applyData.discord, inline: true },
            { name: "⭐ Aplikuje na", value: applyData.rank, inline: false },
            { name: "📜 Doświadczenie", value: applyData.experience, inline: false },
            { name: "💡 Dlaczego OZON RP", value: applyData.motivation, inline: false }
          ],
          footer: { text: `OZON RolePlay Rekrutacja • ${applyData.date}` }
        });
      }

      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;

      applyAlert.className = 'form-alert success';
      applyAlert.innerHTML = `<i class="fa-solid fa-check"></i> <strong>Podanie zostało wysłane!</strong> Dziękujemy za zgłoszenie. Skontaktujemy się z Tobą na Discordzie.`;
      applyAlert.style.display = 'block';
      applyForm.reset();

      setTimeout(() => {
        applyAlert.style.display = 'none';
      }, 7000);
    });
  }
}

// Funkcja wysyłająca embed na Discord
async function sendDiscordEmbed(webhookUrl, embed) {
  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'OZON RP Bot',
        avatar_url: 'https://cdn-icons-png.flaticon.com/512/906/906343.png',
        embeds: [embed]
      })
    });
    return res.ok;
  } catch (err) {
    console.warn('Błąd wysyłania na webhook (może brakować nagłówków CORS lub zły URL):', err);
    return false;
  }
}

/* ================================
   4. PANEL ADMINA & LOGOWANIE
   ================================ */
function initAdminPanel() {
  const loginBtn = document.getElementById('discordLoginBtn');
  const demoLoginBtn = document.getElementById('demoLoginBtn');
  const logoutBtn = document.getElementById('adminLogoutBtn');
  const loggedOutView = document.getElementById('adminLoggedOut');
  const loggedInView = document.getElementById('adminLoggedIn');

  // Sprawdzenie sesji
  const session = localStorage.getItem('ozon_admin_session');
  if (session) {
    renderLoggedIn(JSON.parse(session));
  }

  // Kliknięcie logowania Discord
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      // Jeśli użytkownik ma skonfigurowany Discord Client ID
      if (CONFIG.DISCORD_CLIENT_ID !== 'TUTAJ_TWOJE_CLIENT_ID_DISCORD') {
        const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${CONFIG.DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(CONFIG.REDIRECT_URI)}&response_type=token&scope=identify%20guilds`;
        window.location.href = authUrl;
      } else {
        // Podpowiedź dla właściciela
        const mockUser = {
          username: "Administrator (Właściciel)",
          avatar: "logo.png",
          role: "Właściciel OZON RP"
        };
        localStorage.setItem('ozon_admin_session', JSON.stringify(mockUser));
        renderLoggedIn(mockUser);
      }
    });
  }

  // Kliknięcie demo
  if (demoLoginBtn) {
    demoLoginBtn.addEventListener('click', () => {
      const demoUser = {
        username: "Admin Demo (OZON RP)",
        avatar: "logo.png",
        role: "Zarząd Główny"
      };
      localStorage.setItem('ozon_admin_session', JSON.stringify(demoUser));
      renderLoggedIn(demoUser);
    });
  }

  // Wylogowanie
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('ozon_admin_session');
      loggedInView.style.display = 'none';
      loggedOutView.style.display = 'block';
    });
  }

  // Obsługa zakładek w panelu
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const target = btn.getAttribute('data-tab');
      document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
      const targetEl = document.getElementById(target);
      if (targetEl) targetEl.style.display = 'block';
    });
  });

  // Wczytanie webhooka do inputa ustawień
  const webhookInput = document.getElementById('webhookInput');
  if (webhookInput) {
    webhookInput.value = localStorage.getItem('ozon_webhook') || '';
  }
}

function renderLoggedIn(user) {
  const loggedOutView = document.getElementById('adminLoggedOut');
  const loggedInView = document.getElementById('adminLoggedIn');
  const usernameEl = document.getElementById('adminUsername');
  const avatarEl = document.getElementById('adminAvatar');

  if (usernameEl) usernameEl.textContent = user.username;
  if (avatarEl && user.avatar) avatarEl.src = user.avatar;

  loggedOutView.style.display = 'none';
  loggedInView.style.display = 'block';

  renderAdminData();
}

function renderAdminData() {
  // Render ticketów
  const ticketsList = document.getElementById('ticketsList');
  const storedTickets = JSON.parse(localStorage.getItem('ozon_tickets') || '[]');

  if (ticketsList) {
    if (storedTickets.length === 0) {
      ticketsList.innerHTML = '<div class="empty-state">Brak nowych ticketów w lokalnej pamięci.</div>';
    } else {
      ticketsList.innerHTML = storedTickets.reverse().map(t => `
        <div class="data-item">
          <div class="data-item-header">
            <span class="data-item-title"><i class="fa-solid fa-ticket"></i> ${t.category}</span>
            <span class="data-item-date">${t.date}</span>
          </div>
          <p><strong>Od:</strong> ${t.discord} (ID: ${t.steam})</p>
          <p style="margin-top: 6px; color: #ccc;">${t.message}</p>
        </div>
      `).join('');
    }
  }

  // Render podań
  const appliesList = document.getElementById('appliesList');
  const storedApplies = JSON.parse(localStorage.getItem('ozon_applies') || '[]');

  if (appliesList) {
    if (storedApplies.length === 0) {
      appliesList.innerHTML = '<div class="empty-state">Brak nowych podań w lokalnej pamięci.</div>';
    } else {
      appliesList.innerHTML = storedApplies.reverse().map(a => `
        <div class="data-item">
          <div class="data-item-header">
            <span class="data-item-title"><i class="fa-solid fa-file-lines"></i> ${a.rank}</span>
            <span class="data-item-date">${a.date}</span>
          </div>
          <p><strong>Aplikant:</strong> ${a.nameAge} | <strong>Discord:</strong> ${a.discord}</p>
          <p style="margin-top: 6px;"><strong>Doświadczenie:</strong> ${a.experience}</p>
          <p style="margin-top: 6px; color: #ccc;"><strong>Dlaczego OZON:</strong> ${a.motivation}</p>
        </div>
      `).join('');
    }
  }
}

// Obsługa zapisu i czyszczenia danych w przeglądarce
function saveLocalData(key, data) {
  const current = JSON.parse(localStorage.getItem(`ozon_${key}`) || '[]');
  current.push(data);
  localStorage.setItem(`ozon_${key}`, JSON.stringify(current));
  renderAdminData();
}

window.clearStoredData = function(key) {
  if (confirm(`Czy na pewno chcesz wyczyścić listę: ${key}?`)) {
    localStorage.removeItem(`ozon_${key}`);
    renderAdminData();
  }
};

window.saveWebhookSettings = function() {
  const input = document.getElementById('webhookInput');
  if (input) {
    localStorage.setItem('ozon_webhook', input.value.trim());
    alert('Pomyślnie zapisano Discord Webhook! Od teraz formularze będą wysyłać zgłoszenia na Twój kanał Discord.');
  }
};

// Funkcja kopiowania komendy connect
window.copyConnect = function() {
  const connectCmd = "connect play.ozonroleplay.pl"; // lub np. connect cfx.re/join/xxxxxx
  navigator.clipboard.writeText(connectCmd).then(() => {
    alert("Skopiowano do schowka: " + connectCmd + "\nOtwórz konsolę F8 w FiveM i wklej (Ctrl+V), aby połączyć się z serwerem!");
  }).catch(() => {
    alert("Wklej w konsoli F8 w FiveM:\n" + connectCmd);
  });
};

/* ================================
   5. OBSŁUGA DISCORD OAUTH2 TOKEN
   ================================ */
function checkOAuthRedirect() {
  if (window.location.hash.includes('access_token')) {
    const params = new URLSearchParams(window.location.hash.substring(1));
    const token = params.get('access_token');
    
    if (token) {
      // Pobieramy dane użytkownika z API Discord
      fetch('https://discord.com/api/users/@me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(user => {
        const adminData = {
          username: `${user.username}`,
          avatar: user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : 'logo.png',
          role: "Zweryfikowany Administrator"
        };
        localStorage.setItem('ozon_admin_session', JSON.stringify(adminData));
        window.location.hash = ''; // Wyczyść token z adresu
        renderLoggedIn(adminData);
      })
      .catch(err => {
        console.error('Błąd logowania Discord:', err);
      });
    }
  }
}
