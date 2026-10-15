/* shared behaviour for the About and Contact pages */
document.addEventListener('DOMContentLoaded', () => {
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const lerp = (a, b, t) => a + (b - a) * t;

  const nav = $('#nav');
  addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 20), {passive:true});

  /* arrow cursor + dot trail while moving */
  const arrow = $('.arrow');
  if (fine && arrow && !reduce) {
    let mx = innerWidth / 2, my = innerHeight / 2, last = 0, on = 0;
    const dots = Array.from({length:18}, (_, i) => {
      const d = document.createElement('div'), r = 4.5 * (1 - i / 18 * .7);
      d.className = 'trail'; d.style.width = d.style.height = r * 2 + 'px'; document.body.append(d);
      return {el:d, x:mx, y:my, r};
    });
    addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; last = performance.now(); arrow.classList.add('on'); }, {passive:true});
    document.addEventListener('mouseleave', () => arrow.classList.remove('on'));
    (function frame(){
      arrow.style.transform = `translate(${mx}px,${my}px)`;
      const moving = performance.now() - last < 120;
      on = lerp(on, moving ? 1 : 0, moving ? .25 : .08);
      let px = mx, py = my;
      dots.forEach((d, i) => { d.x = lerp(d.x, px, .42); d.y = lerp(d.y, py, .42); d.el.style.transform = `translate(${d.x - d.r}px,${d.y - d.r}px)`; d.el.style.opacity = (on * (1 - i / dots.length * .7)).toFixed(3); px = d.x; py = d.y; });
      requestAnimationFrame(frame);
    })();
  }

  /* reveal on scroll */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), {rootMargin:'0px 0px -8% 0px'});
  $$('.rv').forEach(el => io.observe(el));

  /* count-up stats */
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; cio.unobserve(e.target);
    const el = e.target, n = +el.dataset.n, suf = el.dataset.s || '', t0 = performance.now();
    if (reduce) { el.textContent = n + suf; return; }
    (function tick(now){ const p = Math.min(1, (now - t0) / 1200); el.textContent = Math.round(n * (1 - Math.pow(1 - p, 3))) + suf; if (p < 1) requestAnimationFrame(tick); })(t0);
  }), {threshold:.5});
  $$('[data-n]').forEach(el => cio.observe(el));

  /* contact form: opens the visitor's email app with everything filled in */
  const form = $('#projectForm');
  if (form) form.addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(form), err = $('#fErr');
    const name = (f.get('name') || '').trim(), email = (f.get('email') || '').trim(), msg = (f.get('message') || '').trim();
    if (!name || !email || !msg || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { err.textContent = 'Please add your name, a valid email and a few words about the project.'; return; }
    err.textContent = '';
    const body = [
      `Name: ${name}`, `Email: ${email}`,
      f.get('company') ? `Company / website: ${f.get('company')}` : '',
      `Looking for: ${f.getAll('need[]').join(', ') || '—'}`,
      `Budget: ${f.get('budget') || '—'}`, '', msg
    ].filter(Boolean).join('\n');
    location.href = 'mailto:ayeshazubram@gmail.com?subject=' + encodeURIComponent('New project enquiry — ' + name) + '&body=' + encodeURIComponent(body);
  });
});
