/* ============================================
   FazTicket - Main JavaScript
   Fixes: WA number, counter selector, delete
   ============================================ */

/* ── Correct WhatsApp number ── */
const WA = '6285751787232';

/* ---- Loading Screen ---- */
window.addEventListener('load', () => {
  const loader = document.getElementById('loading-screen');
  if (loader) {
    setTimeout(() => {
      loader.classList.add('hidden');
      setTimeout(() => loader.remove(), 700);
    }, 1800);
  }
});

/* ---- Dark Mode Toggle ---- */
const dmToggle = document.getElementById('darkModeToggle');
const body = document.body;

if (localStorage.getItem('darkMode') === 'true') {
  body.classList.add('dark-mode');
  if (dmToggle) dmToggle.textContent = '☀️';
}
if (dmToggle) {
  dmToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');
    dmToggle.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('darkMode', isDark);
  });
}

/* ---- Scroll-to-Top ---- */
const scrollTopBtn = document.getElementById('scrollTop');
window.addEventListener('scroll', () => {
  if (scrollTopBtn) scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
});
if (scrollTopBtn) {
  scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ---- Animate on Scroll ---- */
const animateEls = document.querySelectorAll('.animate-on-scroll');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
animateEls.forEach(el => observer.observe(el));

/* ---- Counter Animation ----
   Supports BOTH .stat-number (index/homepage) AND .kpi-number (statistik page)
   so counters fire on whichever page is loaded.
*/
function animateCounter(el, target, duration = 1500) {
  let start = 0;
  const step = (ts) => {
    if (!start) start = ts;
    const progress = Math.min((ts - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target).toLocaleString('id');
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target.toLocaleString('id'); // ensure final value exact
  };
  requestAnimationFrame(step);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      if (!isNaN(target)) animateCounter(el, target);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.4 });

// Target BOTH class names used across pages
document.querySelectorAll('.stat-number[data-target], .kpi-number[data-target]').forEach(el => {
  counterObserver.observe(el);
});

/* ---- Navbar Active Link ---- */
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
  const href = link.getAttribute('href');
  if (href === currentPage || (currentPage === '' && href === 'index.html')) {
    link.classList.add('active');
  }
});

/* ---- FAQ Accordion ---- */
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const answer = btn.nextElementSibling;
    const icon   = btn.querySelector('.faq-icon');
    const isOpen = answer.classList.contains('open');
    document.querySelectorAll('.faq-answer').forEach(a => a.classList.remove('open'));
    document.querySelectorAll('.faq-icon').forEach(i => i.classList.remove('rotated'));
    if (!isOpen) {
      answer.classList.add('open');
      if (icon) icon.classList.add('rotated');
    }
  });
});

/* ---- Booking Form ---- */
const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
  bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name         = document.getElementById('b-name')?.value.trim();
    const email        = document.getElementById('b-email')?.value.trim();
    const phone        = document.getElementById('b-phone')?.value.trim();
    const date         = document.getElementById('b-date')?.value;
    const mountain     = document.getElementById('b-mountain')?.value;
    const participants = document.getElementById('b-participants')?.value;

    if (!name || !email || !mountain || !date) {
      alert('Mohon lengkapi semua field yang wajib diisi.');
      return;
    }

    // WhatsApp message to ADMIN (your number)
    const waMsg = encodeURIComponent(
      `🏔 *Pemesanan Tiket FazTicket*\n\n` +
      `👤 Nama: ${name}\n` +
      `📧 Email: ${email}\n` +
      `📞 WhatsApp Pemesan: ${phone}\n` +
      `📅 Tanggal Pendakian: ${date}\n` +
      `🗻 Gunung: ${mountain}\n` +
      `👥 Jumlah Peserta: ${participants} orang\n\n` +
      `Mohon konfirmasi pemesanan saya. Terima kasih! 🙏`
    );

    // Save to localStorage for Data Pendaki page
    const bookings = JSON.parse(localStorage.getItem('fazticket_bookings') || '[]');
    bookings.push({
      id: Date.now(),
      name, email, phone, date, mountain, participants,
      status: 'Confirmed',
      route: 'Via Tamiajeng'
    });
    localStorage.setItem('fazticket_bookings', JSON.stringify(bookings));

    showBookingPopup(name, mountain, date, waMsg, email);
  });
}

function showBookingPopup(name, mountain, date, waMsg, email) {
  const popup = document.getElementById('bookingPopup');
  if (!popup) return;

  const pName     = document.getElementById('popup-name');
  const pMountain = document.getElementById('popup-mountain');
  const pDate     = document.getElementById('popup-date');
  const waBtn     = document.getElementById('popup-wa-btn');
  const emailBtn  = document.getElementById('popup-email-btn');

  if (pName)     pName.textContent     = name;
  if (pMountain) pMountain.textContent = mountain;
  if (pDate)     pDate.textContent     = date;

  // Send to YOUR WhatsApp (admin)
  if (waBtn)    waBtn.href    = `https://wa.me/${WA}?text=${waMsg}`;
  if (emailBtn) emailBtn.href = `mailto:fazticket@gmail.com?subject=Booking Tiket FazTicket - ${encodeURIComponent(name)}&body=Nama:%20${encodeURIComponent(name)}%0AGunung:%20${encodeURIComponent(mountain)}%0ATanggal:%20${encodeURIComponent(date)}`;

  popup.classList.add('show');
}

function closePopup() {
  const popup = document.getElementById('bookingPopup');
  if (popup) popup.classList.remove('show');
  const form = document.getElementById('bookingForm');
  if (form) form.reset();
}
window.closePopup = closePopup;

/* ---- filterTable (fallback — overridden by data-pendaki.html inline script) ---- */
window.filterTable = function() {
  const search       = (document.getElementById('hikerSearch')?.value || '').toLowerCase();
  const statusFilter = document.getElementById('statusFilter')?.value  || '';
  const mountainFilter = document.getElementById('mountainFilter')?.value || '';
  document.querySelectorAll('#hikerTableBody tr').forEach(row => {
    const matchSearch   = row.textContent.toLowerCase().includes(search);
    const matchStatus   = !statusFilter   || (row.dataset.status   === statusFilter);
    const matchMountain = !mountainFilter || (row.dataset.mountain === mountainFilter);
    row.style.display = (matchSearch && matchStatus && matchMountain) ? '' : 'none';
  });
};

/* ---- Equipment Rental WhatsApp ---- */
function rentItem(item, price) {
  const msg = encodeURIComponent(
    `🎒 *Sewa Alat FazTicket*\n\n` +
    `Saya ingin menyewa: *${item}*\n` +
    `Harga: ${price}\n\n` +
    `Mohon informasi ketersediaan dan syarat sewa. Terima kasih!`
  );
  window.open(`https://wa.me/${WA}?text=${msg}`, '_blank');
}
window.rentItem = rentItem;

/* ---- Smooth scroll with navbar offset ---- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
    }
  });
});

/* ---- Weather data ---- */
const weatherData = {
  'Penanggungan': { temp: 18, condition: 'Partly Cloudy', icon: '⛅',  humidity: 75, wind: '12 km/h', visibility: '8 km' },
  'Welirang':     { temp: 14, condition: 'Foggy',         icon: '🌫️', humidity: 88, wind: '8 km/h',  visibility: '3 km' },
  'Arjuno':       { temp: 12, condition: 'Light Rain',    icon: '🌧️', humidity: 92, wind: '15 km/h', visibility: '5 km' },
  'Bekel':        { temp: 20, condition: 'Sunny',         icon: '☀️',  humidity: 65, wind: '10 km/h', visibility: '12 km'},
};
window.weatherData = weatherData;

function updateWeather(mountainName) {
  const data = weatherData[mountainName] || weatherData['Penanggungan'];
  document.querySelectorAll('[data-weather-mountain]').forEach(el => {
    if (el.dataset.weatherMountain === mountainName) {
      const wi = el.querySelector('.weather-icon');
      const wt = el.querySelector('.weather-temp');
      const wd = el.querySelector('.weather-desc');
      if (wi) wi.textContent = data.icon;
      if (wt) wt.textContent = data.temp + '°C';
      if (wd) wd.textContent = data.condition;
    }
  });
}
window.updateWeather = updateWeather;
