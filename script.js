/* iCodejr free-trial page: booking flow, personalisation and learning plan. */

const CONFIG = {
  // Where booking requests are sent as JSON (a CRM webhook, Zapier, HubSpot form endpoint, etc.).
  // Left empty, the page runs in demo mode: it logs the booking to the console and shows the confirmation.
  bookingEndpoint: '',
  whatsappDisplay: '+971 50 694 2633',
  timeZone: 'Asia/Dubai',
  bookableDays: 14, // parents can book from tomorrow up to this many days ahead
};

/* Demo availability. Replace with real mentor availability from your scheduling system.
   Times are GST (24h). The UAE weekend is Saturday and Sunday. */
const SLOT_TEMPLATE = {
  weekday: [
    { group: 'After school', times: ['15:00', '16:00', '17:00'] },
    { group: 'Evening', times: ['18:00', '19:00', '20:00'] },
  ],
  weekend: [
    { group: 'Morning', times: ['09:00', '10:00', '11:00'] },
    { group: 'Afternoon', times: ['14:00', '15:00', '16:00'] },
  ],
};

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const smooth = reduceMotion ? 'auto' : 'smooth';

const state = {
  step: 1, name: '', age: '', interest: '', day: null, time: null, weekStart: 0, done: false,
  planAge: '7-8', planTrack: 'combined',
};

const poss = n => (/s$/i.test(n) ? `${n}'` : `${n}'s`);
const displayName = () => state.name.trim();

/* ---------- Personalisation ---------- */

$$('.nm-or, .nm-or-cap, .nm-poss').forEach(el => { el.dataset.def = el.textContent; });

function personalize() {
  const n = displayName();
  $$('.nm-or, .nm-or-cap').forEach(el => { el.textContent = n || el.dataset.def; });
  $$('.nm-poss').forEach(el => { el.textContent = n ? poss(n) : el.dataset.def; });
  $('#peek-title').textContent = $('#pv-title').textContent;
  $('#build-line').textContent = ICJ.builds[Preview.scene || 'game'].line.replace('{N}', n || 'Your child');
  $('#closer-cta').textContent = n ? `Book ${poss(n)} free class` : 'Book the free class';
  if (!qfTouched.has('qf-child')) $('#qf-child').value = n;
  if (!qfTouched.has('qf-age') && state.age) $('#qf-age').value = state.age;
  $$('.rp-initial').forEach(el => { el.textContent = n ? n.charAt(0).toUpperCase() : '?'; });
  $('#dock-btn').textContent = n && state.step > 1 ? `Continue ${poss(n)} booking` : 'Book free class';
  renderPlan();
}

/* ---------- Booking steps ---------- */

const form = $('#booking');
const card = $('#book-card');

function showStep(n, { focus = true } = {}) {
  state.step = n;
  $$('.step', form).forEach(fs => { fs.hidden = +fs.dataset.step !== n; });
  $$('.progress li').forEach(li => {
    const p = +li.dataset.p;
    li.classList.toggle('done', p < n);
    if (p === n) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
  });
  hideErrors();
  if (n === 3 && !state.day) selectFirstDay();
  if (n === 4) renderChosen();
  if (focus) {
    const q = $(`.step[data-step="${n}"] .step-q`, form);
    q.focus({ preventScroll: true });
    const r = card.getBoundingClientRect();
    if (r.top < 0 || r.top > innerHeight * 0.6) card.scrollIntoView({ behavior: smooth, block: 'start' });
  }
  personalize();
}

function stepError(msg, focusEl) {
  const err = $(`.step[data-step="${state.step}"] .step-error`, form);
  err.textContent = msg;
  err.hidden = false;
  if (focusEl) focusEl.focus();
  return false;
}
function hideErrors() { $$('.step-error', form).forEach(e => { e.hidden = true; }); }

function validateStep(n) {
  if (n === 1) {
    if (!displayName()) return stepError('Add your child’s first name.', $('#child-name'));
    if (!state.age) return stepError('Pick your child’s age.', $('.age-row input'));
  }
  if (n === 2 && !state.interest) return stepError('Pick one, or choose “Not sure yet”.', $('.interest-grid input'));
  if (n === 3) {
    if (!state.day) return stepError('Pick a day for the class.', $('#days input:not(:disabled)'));
    if (!state.time) return stepError('Pick a time for the class.', $('#slots input:not(:disabled)'));
  }
  return true;
}

function next() {
  if (!validateStep(state.step)) return;
  showStep(Math.min(4, state.step + 1));
}

$$('[data-next]', form).forEach(b => b.addEventListener('click', next));
$$('[data-back]', form).forEach(b => b.addEventListener('click', () => showStep(Math.max(1, state.step - 1))));

$('#child-name').addEventListener('input', e => {
  const cleaned = e.target.value.replace(/[^\p{L}\p{M}' -]/gu, '');
  if (cleaned !== e.target.value) e.target.value = cleaned;
  const n = cleaned.replace(/\s+/g, ' ').trim();
  state.name = n ? n.charAt(0).toUpperCase() + n.slice(1) : '';
  $('#hint').classList.toggle('gone', !!state.name);
  Preview.update({ name: state.name });
  personalize();
  hideErrors();
});

$('.age-row').addEventListener('change', e => {
  state.age = e.target.value;
  Preview.update({ age: state.age });
  setPlanAge(state.age);
  setFaqAge(state.age);
  personalize();
  hideErrors();
});

$('.interest-grid').addEventListener('change', e => {
  state.interest = e.target.value;
  Preview.update({ interest: state.interest });
  setPlanTrack({ coding: 'coding', robotics: 'robotics' }[state.interest] || 'combined');
  personalize();
  hideErrors();
  setTimeout(() => { if (state.step === 2) showStep(3); }, 380);
});

/* ---------- Days and slots ---------- */

function dubaiToday() {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: CONFIG.timeZone, year: 'numeric', month: '2-digit', day: '2-digit' })
    .formatToParts(new Date()).reduce((o, p) => (o[p.type] = p.value, o), {});
  return new Date(Date.UTC(+parts.year, +parts.month - 1, +parts.day, 12));
}

const DAY = 86400000;
const firstDay = new Date(dubaiToday().getTime() + DAY);
const lastDay = new Date(firstDay.getTime() + (CONFIG.bookableDays - 1) * DAY);
const fmt = (d, opts) => new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', ...opts }).format(d);
const dateOf = iso => new Date(`${iso}T12:00:00Z`);
const isWeekend = d => d.getUTCDay() === 0 || d.getUTCDay() === 6;

function to12h(t) {
  const [h, m] = t.split(':').map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`;
}

// Demo only: marks roughly a quarter of slots as taken, the same way on every visit.
function isTaken(day, time) {
  let h = 0;
  for (const ch of day + time) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h % 4 === 0;
}

function renderDays() {
  const start = new Date(firstDay.getTime() + state.weekStart * 7 * DAY);
  const days = Array.from({ length: 7 }, (_, i) => new Date(start.getTime() + i * DAY));
  $('#week-label').textContent = `${fmt(days[0], { day: 'numeric', month: 'short' })} – ${fmt(days[6], { day: 'numeric', month: 'short' })}`;
  $('#days').innerHTML = days.map(d => {
    const iso = d.toISOString().slice(0, 10);
    const off = d > lastDay;
    return `<label${isWeekend(d) ? ' class="wknd"' : ''}>
      <input type="radio" name="day" value="${iso}" ${off ? 'disabled' : ''} ${state.day === iso ? 'checked' : ''}
        aria-label="${fmt(d, { weekday: 'long', day: 'numeric', month: 'long' })}">
      <span><small>${fmt(d, { weekday: 'short' })}</small><b>${fmt(d, { day: 'numeric' })}</b></span>
    </label>`;
  }).join('');
  $('#week-prev').disabled = state.weekStart === 0;
  $('#week-next').disabled = new Date(start.getTime() + 7 * DAY) > lastDay;
}

function renderSlots() {
  const box = $('#slots');
  if (!state.day) {
    box.innerHTML = '<p class="slots-empty">Choose a day to see open times.</p>';
    return;
  }
  const groups = isWeekend(dateOf(state.day)) ? SLOT_TEMPLATE.weekend : SLOT_TEMPLATE.weekday;
  box.innerHTML = groups.map(g => `
    <div class="slot-group" role="radiogroup" aria-label="${g.group}">
      <p>${g.group}</p>
      <div>${g.times.map(t => {
        const taken = isTaken(state.day, t);
        return `<label><input type="radio" name="time" value="${t}" ${taken ? 'disabled' : ''} ${state.time === t ? 'checked' : ''}
          aria-label="${to12h(t)}${taken ? ', booked' : ''}"><span>${to12h(t)}</span></label>`;
      }).join('')}</div>
    </div>`).join('');
}

const slotShort = () => `${fmt(dateOf(state.day), { weekday: 'short', day: 'numeric', month: 'short' })} · ${to12h(state.time)}`;
const slotLong = () => `${fmt(dateOf(state.day), { weekday: 'long', day: 'numeric', month: 'long' })} · ${to12h(state.time)}`;

// Start step 3 on the soonest bookable day so open times are visible straight away.
function selectFirstDay() {
  const first = $('#days input:not(:disabled)');
  if (!first) return;
  first.checked = true;
  state.day = first.value;
  renderSlots();
}

$('#days').addEventListener('change', e => {
  state.day = e.target.value;
  state.time = null;
  Preview.update({ slot: '' });
  renderSlots();
  hideErrors();
});

$('#slots').addEventListener('change', e => {
  state.time = e.target.value;
  Preview.update({ slot: `${slotShort()} GST` });
  hideErrors();
});

$('#week-prev').addEventListener('click', () => { state.weekStart = Math.max(0, state.weekStart - 1); renderDays(); });
$('#week-next').addEventListener('click', () => { state.weekStart += 1; renderDays(); });

function renderChosen() {
  const n = displayName();
  $('#chosen').innerHTML = `<span><b></b><span></span></span><button type="button" class="link-btn">Change</button>`;
  $('#chosen b').textContent = `${poss(n)} free class`;
  $('#chosen span span').textContent = `${slotLong()} GST`;
  $('#chosen button').addEventListener('click', () => showStep(3));
}

/* ---------- Submit ---------- */

function normaliseMobile(raw) {
  const v = raw.trim();
  const digits = v.replace(/\D/g, '');
  if (v.startsWith('+') || digits.startsWith('00')) {
    const intl = digits.replace(/^00/, '');
    return intl.length >= 8 && intl.length <= 15 ? `+${intl}` : null;
  }
  const local = digits.replace(/^971/, '').replace(/^0/, '');
  return /^5\d{8}$/.test(local) ? `+971${local}` : null;
}

const prettyMobile = m => (m.startsWith('+971') ? `+971 ${m.slice(4, 6)} ${m.slice(6, 9)} ${m.slice(9)}` : m);

function utcStamp(iso, time, addMin = 0) {
  const [y, mo, d] = iso.split('-').map(Number);
  const [h, mi] = time.split(':').map(Number);
  const t = new Date(Date.UTC(y, mo - 1, d, h - 4, mi + addMin)); // GST is UTC+4 all year
  return t.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function calendarLinks(n) {
  const start = utcStamp(state.day, state.time);
  const end = utcStamp(state.day, state.time, 50);
  const title = `iCodejr free class for ${n}`;
  const details = `Live 1-on-1 trial class with an iCodejr mentor. Questions? WhatsApp ${CONFIG.whatsappDisplay}`;
  const g = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${end}&details=${encodeURIComponent(details)}`;
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//iCodejr//Free class//EN', 'BEGIN:VEVENT',
    `UID:${start}-${Math.random().toString(36).slice(2)}@icodejr.com`, `DTSTAMP:${utcStamp(new Date().toISOString().slice(0, 10), '04:00')}`,
    `DTSTART:${start}`, `DTEND:${end}`, `SUMMARY:${title}`, `DESCRIPTION:${details}`,
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
  return { g, ics: `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}` };
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  if (state.done) return;
  if (state.step < 4) { next(); return; }

  const parent = $('#parent-name');
  const mobileInput = $('#mobile');
  const email = $('#email');
  $$('#parent-name, #mobile, #email').forEach(i => i.removeAttribute('aria-invalid'));
  if (!parent.value.trim()) { parent.setAttribute('aria-invalid', 'true'); return stepError('Add your name so the mentor knows who to expect.', parent); }
  const mobile = normaliseMobile(mobileInput.value);
  if (!mobile) { mobileInput.setAttribute('aria-invalid', 'true'); return stepError('Enter a UAE mobile number, like 50 123 4567.', mobileInput); }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) { email.setAttribute('aria-invalid', 'true'); return stepError('Enter a valid email address, like name@example.com.', email); }

  const n = displayName();
  const params = new URLSearchParams(location.search);
  const booking = {
    childName: n,
    childAge: state.age,
    interest: state.interest,
    slotDate: state.day,
    slotTime: state.time,
    timeZone: CONFIG.timeZone,
    slotLabel: `${slotLong()} GST`,
    parentName: parent.value.trim(),
    mobile,
    email: email.value.trim(),
    source: 'trial-landing-page',
    utm: Object.fromEntries([...params].filter(([k]) => k.startsWith('utm_'))),
    submittedAt: new Date().toISOString(),
  };

  const btn = $('#submit');
  const label = btn.innerHTML;
  btn.disabled = true;
  btn.textContent = 'Booking…';
  try {
    if (CONFIG.bookingEndpoint) {
      const res = await fetch(CONFIG.bookingEndpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(booking),
      });
      if (!res.ok) throw new Error(`Booking endpoint returned ${res.status}`);
    } else {
      console.info('[demo mode] booking request', booking);
    }
    showDone(n, mobile);
  } catch (err) {
    console.error(err);
    stepError(`We couldn’t send your booking. Check your connection and try again, or WhatsApp us on ${CONFIG.whatsappDisplay}.`);
    btn.disabled = false;
    btn.innerHTML = label;
  }
});

function showDone(n, mobile) {
  state.done = true;
  const [h] = state.time.split(':').map(Number);
  const endTime = `${String(h).padStart(2, '0')}:50`;
  $('#done-title').textContent = `${poss(n)} free class`;
  $('#done-when').textContent = `${fmt(dateOf(state.day), { weekday: 'long', day: 'numeric', month: 'long' })}, ${to12h(state.time).replace(/ (am|pm)$/, '')}–${to12h(endTime)} GST`;
  $('#done-mobile').textContent = `${prettyMobile(mobile)} on WhatsApp`;
  const links = calendarLinks(n);
  $('#gcal').href = links.g;
  $('#ics').href = links.ics;
  form.hidden = true;
  $('.progress').hidden = true;
  $('.bc-title').textContent = 'All set';
  const done = $('#done');
  done.hidden = false;
  done.focus({ preventScroll: true });
  card.scrollIntoView({ behavior: smooth, block: 'start' });
  updateDock();
}

/* ---------- Learning plan ---------- */

function setPlanAge(age) {
  state.planAge = age;
  const r = $(`input[name="plan-age"][value="${age}"]`);
  if (r) r.checked = true;
  renderPlan();
}

function setPlanTrack(track) {
  state.planTrack = track;
  const r = $(`input[name="plan-track"][value="${track}"]`);
  if (r) r.checked = true;
  renderPlan();
}

function renderPlan() {
  const paths = ICJ.paths[state.planAge];
  const kg = !!paths.package;
  const track = kg ? 'package' : state.planTrack;
  const courses = paths[track];
  const n = displayName();
  $('#track-ctl').hidden = kg;
  $('#doc-title').textContent = n ? `Learning path for ${n}` : 'Learning path for your child';
  $('#doc-age').textContent = `${ICJ.ages[state.planAge].label} · ${ICJ.ages[state.planAge].grades}`;
  $('#doc-track').textContent = ICJ.tracks[track];
  const list = $('#doc-path');
  const twoCol = courses.length > 7;
  list.classList.toggle('two-col', twoCol);
  // Fill the two columns top to bottom so the path reads in order.
  list.style.gridTemplateRows = twoCol ? `repeat(${Math.ceil(courses.length / 2)}, auto)` : '';
  list.innerHTML = courses.map((c, i) => `<li${i === 0 ? ' class="first"' : ''}><span class="n">${i + 1}</span><span class="c"></span>${i === 0 ? '<em>Starts here</em>' : ''}</li>`).join('');
  $$('.c', list).forEach((el, i) => { el.textContent = courses[i]; });
  const note = ICJ.notes[state.interest || 'unsure'].replace('{C}', courses[0]);
  $('#doc-note').textContent = `Mentor's note: ${note}`;
  if (typeof Filmstrip !== 'undefined') Filmstrip.content();
}

$$('input[name="plan-age"]').forEach(r => r.addEventListener('change', () => { state.planAge = r.value; renderPlan(); }));
$$('input[name="plan-track"]').forEach(r => r.addEventListener('change', () => { state.planTrack = r.value; renderPlan(); }));

/* ---------- Scroll to booking, mobile dock ---------- */

$$('[data-scroll-book]').forEach(a => a.addEventListener('click', e => {
  e.preventDefault();
  card.scrollIntoView({ behavior: smooth, block: 'start' });
  setTimeout(() => {
    const target = state.done ? $('#done') : (state.step === 1 && !displayName() ? $('#child-name') : $(`.step[data-step="${state.step}"] .step-q`));
    target.focus({ preventScroll: true });
  }, reduceMotion ? 0 : 600);
}));

let cardVisible = true;
let ctaVisible = false;
function updateDock() {
  const dock = $('#dock');
  const show = !cardVisible && !ctaVisible && !state.done;
  dock.classList.toggle('show', show);
  dock.setAttribute('aria-hidden', String(!show));
  $('#dock-btn').tabIndex = show ? 0 : -1;
}
new IntersectionObserver(([entry]) => { cardVisible = entry.isIntersecting; updateDock(); }, { threshold: 0.1 }).observe(card);
new IntersectionObserver(([entry]) => { ctaVisible = entry.isIntersecting; updateDock(); }, { threshold: 0.1 }).observe($('.cta-card'));

/* ---------- Press cards and video player ---------- */

const isEmbeddable = p => !!p.video && p.video.type !== 'link';

// Video cards for the news row and the student videos row. Clicking a card opens the shared player.
function renderVideoCards(row, list) {
  row.innerHTML = list.map((p, i) => {
    const external = p.video?.type === 'link';
    const playable = !!p.video;
    const outletMark = (cls, alt) => (p.logo
      ? `<img class="${cls}" src="${p.logo}" alt="${alt}" loading="lazy">`
      : p.logoText ? `<span class="${cls} pc-wordmark"${alt ? '' : ' aria-hidden="true"'}>${p.logoText}</span>` : '');
    const media = p.thumb ? `<img class="pc-thumb" src="${p.thumb}" alt="" loading="lazy"${p.thumbPos ? ` style="object-position: ${p.thumbPos}"` : ''}>` : outletMark('pc-big-logo', '');
    const badge = !playable
      ? '<span class="pc-soon">Video coming soon</span>'
      : external
        ? `<span class="pc-dur">Watch on ${p.outlet} ↗</span>`
        : (p.duration ? `<span class="pc-dur">${p.duration}</span>` : '');
    const inner = `
      <span class="pc-media${p.thumb ? '' : ' no-thumb'}">
        ${media}
        ${playable && (p.thumb || !external) ? `<span class="pc-play"><svg aria-hidden="true"><use href="#i-play"/></svg></span>` : ''}
        ${badge}
      </span>
      <span class="pc-body">
        ${outletMark('pc-logo', p.outlet)}
        <b class="pc-title"></b>
        <span class="pc-date"></span>
      </span>`;
    return external
      ? `<a class="press-card" href="${p.video.url}" target="_blank" rel="noopener" data-i="${i}">${inner}</a>`
      : `<button type="button" class="press-card${playable ? '' : ' soon'}" data-i="${i}"${playable ? '' : ' aria-disabled="true"'}>${inner}</button>`;
  }).join('');
  $$('.press-card', row).forEach((el, i) => {
    $('.pc-title', el).textContent = list[i].title;
    $('.pc-date', el).textContent = list[i].date || list[i].outlet;
  });
  row.onclick = e => {
    const cardEl = e.target.closest('.press-card');
    // Link cards are plain links to the outlet's page; "coming soon" cards do nothing.
    if (!cardEl || cardEl.tagName === 'A' || cardEl.classList.contains('soon')) return;
    Player.open(list, +cardEl.dataset.i, cardEl);
  };
}

function renderPress() { renderVideoCards($('#press-row'), ICJ.press); }

// Student testimonial videos. The section stays hidden until ICJ.studentVideos has entries.
function renderStories() {
  const list = ICJ.studentVideos || [];
  $('#stories').hidden = !list.length;
  if (list.length) renderVideoCards($('#stories-row'), list);
}

const Player = (() => {
  const dialog = $('#player');
  const frame = $('#player-frame');
  let items = [];
  let index = 0;
  let opener = null;

  const playable = () => items.map((p, i) => (isEmbeddable(p) ? i : -1)).filter(i => i >= 0);

  function embedFor(v, title) {
    const t = title.replace(/"/g, '&quot;');
    if (v.type === 'youtube') {
      const id = encodeURIComponent(v.id);
      return { html: `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1" title="${t}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`, original: `https://www.youtube.com/watch?v=${id}` };
    }
    if (v.type === 'vimeo') {
      const id = encodeURIComponent(v.id);
      return { html: `<iframe src="https://player.vimeo.com/video/${id}?autoplay=1&dnt=1" title="${t}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`, original: `https://vimeo.com/${id}` };
    }
    if (v.type === 'mp4') {
      return { html: `<video controls autoplay playsinline${v.poster ? ` poster="${v.poster}"` : ''}><source src="${v.src}" type="video/mp4"></video>`, original: v.src };
    }
    if (v.type === 'instagram') {
      const base = v.url.split('?')[0].replace(/\/?$/, '/');
      return { html: `<iframe class="ig" src="${base}embed/" title="${t}" allowfullscreen></iframe>`, original: v.url };
    }
    return { html: '', original: '#' };
  }

  function show(i) {
    index = i;
    const p = items[i];
    const list = playable();
    const embed = embedFor(p.video, `${p.outlet}: ${p.title}`);
    $('#player-logo').hidden = !p.logo;
    if (p.logo) $('#player-logo').src = p.logo;
    $('#player-outlet').textContent = [p.outlet, p.date].filter(Boolean).join(' · ');
    $('#player-title').textContent = p.title;
    frame.classList.toggle('portrait', p.video.type === 'instagram' || !!p.video.portrait);
    frame.innerHTML = embed.html;
    $('#player-src').href = embed.original;
    $('#player-src').textContent = p.video.type === 'instagram' ? 'Open on Instagram' : 'Open original';
    $('#player-count').textContent = `${list.indexOf(i) + 1} of ${list.length}`;
    $('#player-prev').hidden = $('#player-next').hidden = list.length < 2;
  }

  function step(dir) {
    const list = playable();
    const pos = list.indexOf(index);
    show(list[(pos + dir + list.length) % list.length]);
  }

  function open(list, i, from) {
    items = list;
    opener = from;
    show(i);
    dialog.showModal();
    document.documentElement.classList.add('no-scroll');
  }

  // Runs for every way of closing (button, backdrop, Esc) and is safe to run twice.
  function cleanup() {
    frame.innerHTML = ''; // removing the embed stops playback
    document.documentElement.classList.remove('no-scroll');
    if (opener) { opener.focus(); opener = null; }
  }

  function close() {
    if (dialog.open) dialog.close();
    cleanup();
  }

  dialog.addEventListener('close', cleanup);
  dialog.addEventListener('click', e => { if (e.target === dialog) close(); });
  dialog.addEventListener('keydown', e => {
    if (frame.contains(e.target)) return; // leave arrow keys to the video's own controls
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'ArrowLeft') step(-1);
  });
  $('#player-close').addEventListener('click', close);
  $('#player-prev').addEventListener('click', () => step(-1));
  $('#player-next').addEventListener('click', () => step(1));

  return { open, close, step };
})();


/* ---------- Footer ---------- */

// Link groups are accordions on phones and always open on wider screens.
const narrow = matchMedia('(max-width: 640px)');
function syncFooterCols() { $$('details.f-col').forEach(d => { d.open = !narrow.matches; }); }
narrow.addEventListener('change', syncFooterCols);
$$('details.f-col > summary').forEach(s => s.addEventListener('click', e => { if (!narrow.matches) e.preventDefault(); }));

/* ---------- Free class: live class replay ---------- */

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// What the shared screen shows while the child builds, per preview scene.
const REPLAY_CODE = {
  story:  { kind: 'blocks', lines: [['ev', 'when ⚑ clicked'], ['mo', 'move 2'], ['mo', 'move 2'], ['mo', 'jump'], ['lo', 'say "Hi!"']] },
  game:   { kind: 'blocks', lines: [['ev', 'when ⚑ clicked'], ['va', 'set score to 0'], ['ct', 'forever'], ['mo', 'go to mouse x'], ['ct', 'if touching Star?'], ['va', 'change score by 1']] },
  robot:  { kind: 'blocks', lines: [['ev', 'when ⚑ clicked'], ['mo', 'move forward 2'], ['mo', 'turn right'], ['mo', 'move forward 3'], ['lo', 'say "Made it!"']] },
  ai:     { kind: 'blocks', lines: [['ev', 'when ⚑ clicked'], ['se', 'ask "What shall we talk about?"'], ['ai', 'set reply to AI answer'], ['lo', 'say reply']] },
  python: { kind: 'code', lines: [['', 'import random'], ['', 'name = input("Your name? ")'], ['', 'secret = random.randint(1, 20)'], ['', 'guess = int(input("Guess: "))'], ['', 'while guess != secret:'], ['', '    guess = int(input("Again: "))'], ['', 'print("You got it,", name)']] },
};

// Runs an auto-advancing row while it is on screen, calling tick(ms since the last frame) on each frame.
// It never captures the page scroll: visitors scroll past freely and the row keeps its own place.
// Reduced-motion visitors start paused, and everyone gets a pause button.
function autoplay(row, btn, label, tick) {
  let visible = false;
  let paused = reduceMotion;
  let holdUntil = 0;
  let last = 0;
  let raf = 0;
  function frame(t) {
    raf = 0;
    if (!visible || paused) { last = 0; return; }
    if (last && t >= holdUntil) tick(Math.min(t - last, 100));
    last = t;
    raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf && visible && !paused) raf = requestAnimationFrame(frame); }
  function sync() {
    btn.classList.toggle('paused', paused);
    btn.setAttribute('aria-label', `${paused ? 'Play' : 'Pause'} ${label}`);
  }
  btn.addEventListener('click', () => { paused = !paused; sync(); kick(); });
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; kick(); }, { threshold: 0.35 }).observe(row);
  sync();
  return {
    hold(ms) { holdUntil = performance.now() + ms; },
    get paused() { return paused; },
  };
}

// Holds autoplay while someone swipes the row by hand, then calls onSettle once it comes to rest.
function watchSwipes(row, player, onSettle) {
  let byHand = false;
  let timer = 0;
  const grab = () => { byHand = true; player.hold(1500); };
  row.addEventListener('pointerdown', grab);
  row.addEventListener('wheel', e => { if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) grab(); }, { passive: true });
  row.addEventListener('keydown', e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') grab(); });
  row.addEventListener('scroll', () => {
    if (byHand) player.hold(1500);
    clearTimeout(timer);
    timer = setTimeout(() => { if (byHand) { byHand = false; onSettle(); } }, 150);
  }, { passive: true });
}

const Filmstrip = (() => {
  const vp = $('#film-viewport');
  const cards = $$('.film-card', vp);
  const dots = $$('.film-dots button');
  const segs = $$('.rseg i');
  const clock = $('#rp-min');
  const head = $('#playhead');
  const ranges = cards.map(c => [+c.dataset.from, +c.dataset.to]);
  // How long autoplay spends on each moment (ms). Building gets the longest so the code has time to type out.
  const DWELL = [4500, 8000, 5500, 6000];
  let lines = [];
  let idx = 0;
  let local = reduceMotion ? 1 : 0; // how far through the current moment, 0 → 1
  let rest = 0; // time spent on a finished moment before moving on
  let current = -1;

  function content() {
    const scene = Preview.scene || 'game';
    const code = REPLAY_CODE[scene];
    const box = $('#rp-code');
    box.className = `rp-code ${code.kind}`;
    box.innerHTML = code.lines.map(([c]) => `<span class="rp-line ${c}"></span>`).join('');
    lines = $$('.rp-line', box);
    lines.forEach((el, i) => { el.textContent = code.lines[i][1]; });
    $('#rp-build-title').textContent = `${displayName() ? poss(displayName()) : "your child's"} ${ICJ.builds[scene].noun}`;
    const paths = ICJ.paths[state.planAge];
    const courses = paths.package || paths[state.planTrack];
    $('#rp-plan-list').innerHTML = courses.slice(0, 3).map((c, i) => `<li${i === 0 ? ' class="first"' : ''}><span></span>${i === 0 ? '<em>Starts here</em>' : ''}</li>`).join('');
    $$('#rp-plan-list li span').forEach((el, i) => { el.textContent = courses[i]; });
    render();
  }

  // Scroll position that centres card i. The first and last cards rest against the ends.
  function leftFor(i) {
    const c = cards[i];
    return clamp(c.offsetLeft - (vp.clientWidth - c.offsetWidth) / 2, 0, vp.scrollWidth - vp.clientWidth);
  }

  // Draws the class clock, ruler and scenes for the current moment and how far through it we are.
  function render() {
    const [from, to] = ranges[idx];
    const minutes = from + local * (to - from);
    const secs = Math.floor(minutes * 60);
    clock.textContent = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
    head.style.left = `${(minutes / 50) * 100}%`;
    segs.forEach((el, i) => { el.style.transform = `scaleX(${i < idx ? 1 : i > idx ? 0 : local})`; });
    const stage = i => (idx > i ? 1 : idx < i ? 0 : local);
    lines.forEach((el, i) => el.classList.toggle('on', i < Math.ceil(stage(1) * lines.length) || idx > 1));
    cards[1].style.setProperty('--build', stage(1));
    cards[2].style.setProperty('--check', idx >= 2 ? Math.max(stage(2), idx > 2 ? 1 : 0.15) : 0);
    dots[idx].style.setProperty('--fill', local);
    if (idx !== current) {
      current = idx;
      cards.forEach((c, i) => c.classList.toggle('active', i === idx));
      dots.forEach((d, i) => d.setAttribute('aria-selected', String(i === idx)));
    }
  }

  // Moves to a moment (wrapping round) and plays it from the start, or shows it complete while paused.
  function go(i) {
    idx = (i + cards.length) % cards.length;
    local = player.paused ? 1 : 0;
    rest = 0;
    vp.scrollTo({ left: leftFor(idx), behavior: smooth });
    render();
  }

  const player = autoplay(vp, $('#film-play'), 'the class replay', dt => {
    if (local < 1) { local = Math.min(1, local + dt / DWELL[idx]); render(); return; }
    rest += dt;
    // A short beat on each finished moment, and a longer one before the replay starts again.
    if (rest >= (idx === cards.length - 1 ? 2500 : 700)) go(idx + 1);
  });

  // After a hand swipe, the moment nearest the middle becomes current and plays from its start.
  watchSwipes(vp, player, () => {
    const near = cards.reduce((best, _, i) => (Math.abs(leftFor(i) - vp.scrollLeft) < Math.abs(leftFor(best) - vp.scrollLeft) ? i : best), 0);
    if (near !== idx) { idx = near; local = player.paused ? 1 : 0; rest = 0; render(); }
    player.hold(0);
  });

  function layout() { vp.scrollTo({ left: leftFor(idx), behavior: 'instant' }); }

  dots.forEach(d => d.addEventListener('click', () => go(+d.dataset.go)));
  $('#film-prev').addEventListener('click', () => go(idx - 1));
  $('#film-next').addEventListener('click', () => go(idx + 1));
  addEventListener('resize', layout);
  return { content, layout };
})();

/* ---------- Student projects: colourful wall that steps along on its own ---------- */

const ProjectRow = (() => {
  const vp = $('#proj-viewport');
  const track = $('#proj-track');
  const DWELL = 3200; // ms each view stays before the row moves on by one card
  let filter = 'all';
  let wait = 0;
  let ticking = false;

  function render() {
    const wanted = filter.split(' ');
    const list = ICJ.projects.filter(p => filter === 'all' || wanted.includes(p.category));
    track.innerHTML = list.map(p => `
      <figure class="pcard cat-${p.category}">
        <div class="pcard-media">
          <img src="${p.image}" alt="" loading="lazy" width="640" height="512">
          <span class="age-badge"><small>Age</small>${p.age}</span>
        </div>
        <figcaption>
          <span class="pcard-pills"><span class="pc-pill tool">${p.tool}</span><span class="pc-pill cat">${ICJ.projectCategories[p.category]}</span></span>
          <b></b>
          <span class="pcard-by"><i aria-hidden="true">${p.student.charAt(0)}</i><span></span></span>
        </figcaption>
      </figure>`).join('');
    $$('.pcard', track).forEach((card, i) => {
      $('img', card).alt = list[i].alt;
      $('b', card).textContent = list[i].title;
      $('.pcard-by span', card).textContent = `${list[i].student}, ${list[i].age}`;
    });
    vp.scrollLeft = 0;
    wait = 0;
    update();
  }

  function stats() {
    const ages = ICJ.projects.map(p => p.age);
    const tools = [...new Set(ICJ.projects.map(p => p.tool))];
    $('#proj-stats').innerHTML = [
      `${ICJ.projects.length} featured projects`,
      `Ages ${Math.min(...ages)}–${Math.max(...ages)}`,
      `Built in ${tools.join(' & ')}`,
    ].map((t, i) => `<li class="is-${['blue', 'green', 'orange'][i]}">${t}</li>`).join('');
  }

  // Scroll positions where a card lines up with the left edge, ending at the far end of the row.
  function stops() {
    const max = vp.scrollWidth - vp.clientWidth;
    const pad = parseFloat(getComputedStyle(vp).scrollPaddingLeft) || 0;
    const all = $$('.pcard', track).map(c => clamp(c.offsetLeft - pad, 0, max));
    return all.filter((x, i) => i === 0 || x - all[i - 1] > 8);
  }

  // Moves one card along, wrapping back to the start after the last view.
  function step(dir) {
    const s = stops();
    wait = 0;
    if (s.length < 2) return;
    const here = s.reduce((best, x, i) => (Math.abs(x - vp.scrollLeft) < Math.abs(s[best] - vp.scrollLeft) ? i : best), 0);
    vp.scrollTo({ left: s[(here + dir + s.length) % s.length], behavior: smooth });
  }

  function update() {
    ticking = false;
    const cards = $$('.pcard', track);
    const max = vp.scrollWidth - vp.clientWidth;
    const p = max > 0 ? vp.scrollLeft / max : 0;
    vp.classList.toggle('at-start', p < 0.01);
    vp.classList.toggle('at-end', max <= 0 || p > 0.99);
    // Which cards are mostly in view, e.g. "2–4 of 6"
    const view = vp.getBoundingClientRect();
    const seen = cards.map((c, i) => {
      const r = c.getBoundingClientRect();
      return Math.min(r.right, view.right) - Math.max(r.left, view.left) >= r.width * 0.6 ? i + 1 : 0;
    }).filter(Boolean);
    const first = seen[0] || 1;
    const lastSeen = seen[seen.length - 1] || first;
    $('#proj-count').textContent = `${first === lastSeen ? first : `${first}–${lastSeen}`} of ${cards.length}`;
    $('#proj-bar').style.setProperty('--p', cards.length ? lastSeen / cards.length : 1);
    ['#proj-prev', '#proj-next', '#proj-play'].forEach(id => { $(id).disabled = max <= 0; });
  }

  const player = autoplay(vp, $('#proj-play'), 'the project slideshow', dt => {
    wait += dt;
    if (wait >= DWELL) step(1);
  });
  watchSwipes(vp, player, () => { wait = 0; player.hold(3000); });

  $('#proj-prev').addEventListener('click', () => step(-1));
  $('#proj-next').addEventListener('click', () => step(1));
  $$('input[name="proj-filter"]').forEach(r => r.addEventListener('change', () => { filter = r.value; render(); }));
  vp.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener('resize', update);
  return { render, stats, update };
})();

/* ---------- FAQ filtered by age ---------- */

let faqAge = 'all';

function renderFaq() {
  const groups = [];
  if (faqAge !== 'all') groups.push([`For ages ${ICJ.ages[faqAge].label}`, ICJ.faq[faqAge], 'age']);
  groups.push([faqAge === 'all' ? 'Every family asks' : 'For every family', ICJ.faq.general, 'general']);
  const list = $('#faq-list');
  list.dataset.age = faqAge;
  $('.faq-sec').dataset.age = faqAge;
  // Each group collapses, which keeps the page short: the age group starts open, "For every family" starts closed.
  list.innerHTML = groups.map(([, items, kind], g) => `
    <details class="faq-cat ${kind}"${g === 0 ? ' open' : ''}>
      <summary><span class="faq-group ${kind}"></span><span class="faq-count">${items.length} questions</span><span class="faq-chev" aria-hidden="true"></span></summary>
      <div class="faq-cat-list">${items.map(([, , topic]) => `
        <details class="faq-card">
          <summary><span class="topic t-${topic}"></span><span class="q"></span><span class="faq-x" aria-hidden="true"></span></summary>
          <p></p>
        </details>`).join('')}
      </div>
    </details>`).join('');
  $$('.faq-group', list).forEach((el, i) => { el.textContent = groups[i][0]; });
  const all = groups.flatMap(([, items]) => items);
  $$('.faq-card', list).forEach((d, i) => {
    $('.topic', d).textContent = ICJ.faqTopics[all[i][2]];
    $('.q', d).textContent = all[i][0];
    $('p', d).textContent = all[i][1];
  });
  const n = displayName();
  $('#faq-for').textContent = faqAge === 'all'
    ? "Pick your child's age to see the questions parents of that age ask most."
    : `Showing questions for ages ${ICJ.ages[faqAge].label}${n ? `, like ${n}` : ''}, plus the ones every family asks.`;
}

// Small count badges on the age pills.
$$('input[name="faq-age"]').forEach(r => {
  const n = r.value === 'all' ? ICJ.faq.general.length : ICJ.faq[r.value].length;
  r.nextElementSibling.insertAdjacentHTML('beforeend', `<em>${n}</em>`);
});

function setFaqAge(age) {
  faqAge = age;
  const r = $(`input[name="faq-age"][value="${age}"]`);
  if (r) r.checked = true;
  renderFaq();
}

$$('input[name="faq-age"]').forEach(r => r.addEventListener('change', () => setFaqAge(r.value)));

/* ---------- Google rating strip ---------- */

// Fixed Google score plus a slow ticker of real parent reviews (ICJ.googleReviews in data.js).
// The booking card shows the same real reviews one at a time, in a fresh random order on every visit.
function renderCardReviews() {
  const box = $('#bc-reviews');
  const list = [...ICJ.googleReviews.reviews].sort(() => Math.random() - 0.5);
  const stars = '<svg aria-hidden="true"><use href="#i-star"/></svg>'.repeat(5);
  box.innerHTML = list.map(() => `
    <figure class="bc-review">
      <span class="rs-stars" role="img" aria-label="5 out of 5 stars">${stars}</span>
      <blockquote><q></q></blockquote>
      <figcaption><svg class="rs-g" aria-hidden="true"><use href="#i-google"/></svg><span></span> · Google review</figcaption>
    </figure>`).join('');
  const items = $$('.bc-review', box);
  items.forEach((el, i) => {
    $('q', el).textContent = list[i].text;
    $('figcaption span', el).textContent = list[i].name;
  });
  let at = 0;
  items[0].classList.add('on');
  if (reduceMotion || items.length < 2) return;
  let hovered = false;
  box.addEventListener('pointerenter', () => { hovered = true; });
  box.addEventListener('pointerleave', () => { hovered = false; });
  setInterval(() => {
    if (hovered || document.hidden) return;
    items[at].classList.remove('on');
    at = (at + 1) % items.length;
    items[at].classList.add('on');
  }, 5000);
}

function renderRatingStrip() {
  const g = ICJ.googleReviews;
  const badge = $('#rs-badge');
  badge.href = g.url;
  badge.setAttribute('aria-label', `Rated ${g.rating} out of 5 on Google reviews. Opens Google.`);
  $('#rs-score').textContent = g.rating.toFixed(1);
  const tints = ['blue', 'yellow', 'green', 'pink', 'orange'];
  const stars = '<svg aria-hidden="true"><use href="#i-star"/></svg>'.repeat(5);
  const track = $('#rs-track');
  track.innerHTML = g.reviews.map((r, i) => `
    <li class="rs-item">
      <span class="rs-ava is-${tints[i % tints.length]}" aria-hidden="true"></span>
      <span class="rs-stars" role="img" aria-label="5 out of 5 stars">${stars}</span>
      <q></q>
      <span class="rs-who"></span>
    </li>`).join('');
  $$('.rs-item', track).forEach((li, i) => {
    $('.rs-ava', li).textContent = g.reviews[i].name.charAt(0);
    $('q', li).textContent = g.reviews[i].text;
    $('.rs-who', li).textContent = g.reviews[i].name;
  });
  // A second, hidden copy makes the ticker loop seamlessly. The speed stays the same however many reviews there are.
  track.append(...$$('.rs-item', track).map(li => { const copy = li.cloneNode(true); copy.setAttribute('aria-hidden', 'true'); return copy; }));
  track.style.setProperty('--dur', `${Math.round(track.scrollWidth / 2 / 40)}s`);
}

/* ---------- Closing card: a short booking form ---------- */

// Parents who reach the end of the page can book here without scrolling back up. The team follows up on WhatsApp to pick a time.
const quickForm = $('#quick-form');
const qfTouched = new Set();
quickForm.addEventListener('input', e => qfTouched.add(e.target.id));

quickForm.addEventListener('submit', async e => {
  e.preventDefault();
  const err = $('#qf-error');
  const fail = (msg, el) => {
    err.textContent = msg;
    err.hidden = false;
    if (el) { el.setAttribute('aria-invalid', 'true'); el.focus(); }
  };
  err.hidden = true;
  $$('[aria-invalid]', quickForm).forEach(el => el.removeAttribute('aria-invalid'));
  const parent = $('#qf-parent');
  const child = $('#qf-child');
  const age = $('#qf-age');
  const mobileInput = $('#qf-mobile');
  const email = $('#qf-email');
  if (!parent.value.trim()) return fail('Add your name so we know who to contact.', parent);
  if (!child.value.trim()) return fail("Add your child's first name.", child);
  if (!age.value) return fail("Choose your child's age.", age);
  const mobile = normaliseMobile(mobileInput.value);
  if (!mobile) return fail('Enter a UAE mobile number, like 50 123 4567.', mobileInput);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) return fail('Enter a valid email address, like name@example.com.', email);

  const params = new URLSearchParams(location.search);
  const lead = {
    childName: child.value.trim(),
    childAge: age.value,
    parentName: parent.value.trim(),
    mobile,
    email: email.value.trim(),
    source: 'trial-landing-page-closing-form',
    utm: Object.fromEntries([...params].filter(([k]) => k.startsWith('utm_'))),
    submittedAt: new Date().toISOString(),
  };
  const btn = $('#qf-submit');
  const label = btn.innerHTML;
  btn.disabled = true;
  btn.textContent = 'Booking…';
  try {
    if (CONFIG.bookingEndpoint) {
      const res = await fetch(CONFIG.bookingEndpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(lead),
      });
      if (!res.ok) throw new Error(`Booking endpoint returned ${res.status}`);
    } else {
      console.info('[demo mode] closing form request', lead);
    }
    $('#qf-done-title').textContent = `Thanks, ${lead.parentName.split(' ')[0]}!`;
    $('#qf-done-text').textContent = `We'll message you on WhatsApp at ${prettyMobile(mobile)} to pick a time for ${poss(lead.childName)} free class.`;
    quickForm.hidden = true;
    $('#qf-done').hidden = false;
    $('#qf-done').focus();
  } catch (error) {
    console.error(error);
    fail(`We couldn’t send your booking. Check your connection and try again, or WhatsApp us on ${CONFIG.whatsappDisplay}.`);
    btn.disabled = false;
    btn.innerHTML = label;
  }
});

/* ---------- Init ---------- */

// Duplicate the school logos so the marquee loops seamlessly.
const logoTrack = $('.logo-track');
logoTrack.append(...[...logoTrack.children].map(img => {
  const copy = img.cloneNode();
  copy.alt = '';
  copy.setAttribute('aria-hidden', 'true');
  return copy;
}));

renderDays();
renderSlots();
Preview.update({});
renderPlan();
renderPress();
renderStories();
renderFaq();
renderRatingStrip();
renderCardReviews();
syncFooterCols();
personalize();
ProjectRow.stats();
ProjectRow.render();
Filmstrip.layout();
addEventListener('load', () => { Filmstrip.layout(); ProjectRow.update(); });
showStep(1, { focus: false });
