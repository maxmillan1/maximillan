const glow = document.querySelector('.cursor-glow');
const progressBar = document.querySelector('.scroll-progress span');
const menu = document.querySelector('.menu-toggle');
const links = document.querySelector('.nav-links');

if (glow && window.matchMedia('(pointer: fine)').matches) {
  window.addEventListener('pointermove', (event) => {
    glow.style.left = `${event.clientX}px`;
    glow.style.top = `${event.clientY}px`;
  });
}

const setMenuState = (isOpen) => {
  if (!menu || !links) return;
  links.classList.toggle('open', isOpen);
  menu.setAttribute('aria-expanded', String(isOpen));
  menu.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
};

menu?.addEventListener('click', () => setMenuState(!links.classList.contains('open')));
document.querySelectorAll('.nav-links a').forEach((link) => link.addEventListener('click', () => setMenuState(false)));
document.addEventListener('pointerdown', (event) => {
  if (!links?.classList.contains('open') || links.contains(event.target) || menu?.contains(event.target)) return;
  setMenuState(false);
});
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && links?.classList.contains('open')) {
    setMenuState(false);
    menu?.focus();
  }
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

const counters = document.querySelectorAll('.count');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const element = entry.target;
    const target = Number(element.dataset.target);
    const duration = 1200;
    const startTime = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      element.textContent = `${Math.floor(progress * target)}${target === 98 ? '' : '+'}`;
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
    counterObserver.unobserve(element);
  });
}, { threshold: 0.8 });

counters.forEach((counter) => counterObserver.observe(counter));

const updateScrollProgress = () => {
  if (!progressBar) return;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = `${scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0}%`;
};

window.addEventListener('scroll', updateScrollProgress, { passive: true });
updateScrollProgress();

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const id = link.getAttribute('href');
    if (!id || id.length <= 1 || link.classList.contains('case-study-trigger')) return;
    const target = document.querySelector(id);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

const canAnimate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Nova Creative: autoplaying brand, product, and web design slider. */
const novaSlider = document.querySelector('[data-slider]');
if (novaSlider) {
  const slides = [...novaSlider.querySelectorAll('.nova-slide')];
  const dots = [...novaSlider.querySelectorAll('.nova-dot')];
  const previous = novaSlider.querySelector('.nova-prev');
  const next = novaSlider.querySelector('.nova-next');
  let activeIndex = 0;
  let timer;
  let touchStartX = 0;
  let touchStartY = 0;

  const showSlide = (index) => {
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => slide.classList.toggle('is-active', slideIndex === activeIndex));
    dots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === activeIndex;
      dot.classList.toggle('is-active', isActive);
      dot.setAttribute('aria-selected', String(isActive));
    });
  };

  const startSlider = () => {
    if (!canAnimate) return;
    window.clearInterval(timer);
    timer = window.setInterval(() => showSlide(activeIndex + 1), 4300);
  };

  previous?.addEventListener('click', () => { showSlide(activeIndex - 1); startSlider(); });
  next?.addEventListener('click', () => { showSlide(activeIndex + 1); startSlider(); });
  dots.forEach((dot, index) => dot.addEventListener('click', () => { showSlide(index); startSlider(); }));
  novaSlider.addEventListener('mouseenter', () => window.clearInterval(timer));
  novaSlider.addEventListener('mouseleave', startSlider);
  novaSlider.addEventListener('touchstart', (event) => {
    const touch = event.changedTouches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    window.clearInterval(timer);
  }, { passive: true });
  novaSlider.addEventListener('touchend', (event) => {
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    if (Math.abs(deltaX) > 42 && Math.abs(deltaX) > Math.abs(deltaY)) {
      showSlide(activeIndex + (deltaX < 0 ? 1 : -1));
    }
    startSlider();
  }, { passive: true });
  novaSlider.addEventListener('focusin', () => window.clearInterval(timer));
  novaSlider.addEventListener('focusout', startSlider);
  showSlide(0);
  startSlider();
}

/* Case-study modal content is static portfolio copy, rendered on demand. */
const caseStudies = {
  nova: {
    label: 'Brand / Web Design',
    title: 'Nova Creative.',
    summary: 'A flexible visual system for a creative studio that wants every touchpoint to feel intentional, from identity to the web.',
    metrics: [['03', 'design directions'], ['01', 'visual system'], ['4w', 'concept sprint'], ['∞', 'room to move']],
    challenge: 'Nova needed a point of view that could hold bold campaigns, thoughtful digital work, and physical design without feeling like three separate brands.',
    approach: 'I started with a modular identity language: a confident monogram, a sharp grid, and a small set of contrast rules. That system then expands into product, editorial, and web compositions without losing recognition.',
    outcome: 'A visual direction that feels expressive at first glance and structured underneath, giving the studio a reusable foundation for future work.',
    visual: '<div class="design-case-visual design-case-identity"><img src="assets/design-identity-new.png" alt="Nova Creative identity system artwork"><span>Grid / contrast / recognition</span></div>'
  },
  identity: {
    label: 'Art direction / Identity',
    title: 'Signal / 01.',
    summary: 'An identity study built around modular geometry, controlled contrast, and a mark that can move between print and digital.',
    metrics: [['01', 'identity system'], ['04', 'core shapes'], ['03', 'accent colors'], ['∞', 'applications']],
    challenge: 'The identity needed to feel distinctive in a crowded creative space while staying flexible enough for future campaigns and responsive digital layouts.',
    approach: 'I built the visual language from a small kit of circles, bars, crop lines, and paper textures. The acid-lime signal creates recognition; the grid keeps every composition disciplined.',
    outcome: 'A repeatable art-direction system with enough tension to feel contemporary and enough structure to stay consistent across formats.',
    visual: '<div class="design-case-visual design-case-identity"><img src="assets/design-identity-new.png" alt="Abstract acid-lime identity system artwork"><span>Geometry / rhythm / signal</span></div>'
  },
  packaging: {
    label: 'Packaging / Print',
    title: 'Objects / 02.',
    summary: 'A tactile package family that uses material contrast and a shared graphic language to make simple objects feel considered.',
    metrics: [['04', 'package forms'], ['02', 'paper stocks'], ['01', 'graphic seal'], ['360°', 'system thinking']],
    challenge: 'The package series needed to feel like one collection while giving each object enough visual space to stand on its own in a physical retail environment.',
    approach: 'I used matte charcoal surfaces, uncoated ivory stock, and one high-energy lime seal. The layout gives the geometry room to breathe, while the printed textures reward a closer look.',
    outcome: 'A family of packages that feels tactile, easy to recognize, and ready to extend into inserts, labels, and point-of-sale print.',
    visual: '<div class="design-case-visual design-case-packaging"><img src="assets/design-packaging-new.png" alt="Abstract packaging and print design artwork"><span>Material / hierarchy / touch</span></div>'
  },
  campaign: {
    label: 'Campaign / Art direction',
    title: 'Motion / 03.',
    summary: 'A kinetic campaign language where color, direction, and layered surfaces create a strong sense of movement before a message is even read.',
    metrics: [['05', 'motion rules'], ['02', 'hero colors'], ['01', 'campaign gesture'], ['∞', 'formats']],
    challenge: 'The campaign needed to stop the scroll without relying on dense copy or a single static composition that could not adapt to multiple placements.',
    approach: 'I designed a diagonal gesture system with translucent ribbons, cobalt flashes, and sharp crop points. Each element can shift independently, so the artwork can animate across social, web, and launch materials.',
    outcome: 'A flexible campaign direction with built-in momentum: recognizable in a still frame, but ready to move when the story needs more energy.',
    visual: '<div class="design-case-visual design-case-campaign"><img src="assets/design-campaign-new.png" alt="Kinetic lime and cobalt campaign artwork"><span>Gesture / pace / impact</span></div>'
  },
  pulse: {
    label: 'Web application / Analytics',
    title: 'Pulse Analytics.',
    summary: 'A focused analytics dashboard that turns scattered growth signals into one calm, actionable view.',
    metrics: [['+42%', 'conversion lift'], ['06', 'core metrics'], ['2.4s', 'load time'], ['24/7', 'live visibility']],
    challenge: 'The team had data in too many places. Important changes were hard to spot, and weekly reporting took time away from making decisions.',
    approach: 'I designed a modular dashboard with a clear hierarchy: headline KPIs first, trend context second, and drill-down detail only when it is needed. Motion is used as feedback, not decoration.',
    outcome: 'A faster daily workflow with a visual language that makes performance shifts obvious. The interface gives the team a shared source of truth for growth conversations.',
    visual: '<div class="pulse-visual"><div class="pulse-chart"><i style="--height:32%"></i><i style="--height:48%"></i><i style="--height:41%"></i><i style="--height:63%"></i><i style="--height:58%"></i><i style="--height:78%"></i><i style="--height:93%"></i></div><div class="pulse-line"></div></div>'
  },
  form: {
    label: 'E-commerce / SEO',
    title: 'Form Objects.',
    summary: 'A product-led commerce experience where strong editorial direction and technical SEO work together.',
    metrics: [['3.4×', 'qualified traffic'], ['+58%', 'organic clicks'], ['92', 'technical score'], ['01', 'clear story']],
    challenge: 'Form Objects had beautiful products but a thin discovery layer. Search engines and first-time shoppers both needed more context before the product made sense.',
    approach: 'I built an SEO-first content structure around collections, intent-led product copy, internal linking, metadata, and a lightweight browsing path that keeps the brand feeling considered.',
    outcome: 'A stronger path from search to product: more useful landing pages, clearer category relationships, and a storefront that preserves the quiet, tactile character of the objects.',
    visual: '<div class="seo-visual"><div class="seo-funnel"><div><span>Discover / search</span><span>94%</span></div><div><span>Collection pages</span><span>76%</span></div><div><span>Product detail</span><span>60%</span></div><div><span>Qualified action</span><span>45%</span></div></div></div>'
  },
  electro: {
    label: 'Website / Brand system',
    title: 'Electro Connect.',
    summary: 'A service-business website that gives customers confidence, clarity, and a direct route to a quote.',
    metrics: [['03', 'service promises'], ['01', 'clear CTA'], ['100%', 'responsive'], ['EC', 'brand system']],
    challenge: 'Electrical services can feel complex from the outside. The website needed to communicate reliability quickly while giving different customer types a simple next step.',
    approach: 'I paired a bold identity with a plain-language content structure: what the team does, why it matters, what it costs to get started, and how to make contact.',
    outcome: 'A sharper digital home for a hands-on team, with a visual system that feels capable and a booking path that removes friction before the first conversation.',
    visual: '<div class="electro-visual"><div class="electro-path"><div class="electro-node"><span>01</span><strong>Need</strong><em>signal</em></div><b class="electro-arrow">→</b><div class="electro-node"><span>02</span><strong>Trust</strong><em>clarity</em></div><b class="electro-arrow">→</b><div class="electro-node"><span>03</span><strong>Quote</strong><em>action</em></div><b class="electro-arrow">→</b><div class="electro-node"><span>04</span><strong>Build</strong><em>impact</em></div></div></div>'
  }
};

const modal = document.querySelector('#case-study-modal');
const modalPanel = modal?.querySelector('.case-modal-panel');
const modalClose = modal?.querySelector('.case-modal-close');
const modalLabel = document.querySelector('#case-modal-label');
const modalTitle = document.querySelector('#case-modal-title');
const modalSummary = document.querySelector('#case-modal-summary');
const modalMetrics = document.querySelector('#case-modal-metrics');
const modalChallenge = document.querySelector('#case-modal-challenge');
const modalApproach = document.querySelector('#case-modal-approach');
const modalOutcome = document.querySelector('#case-modal-outcome');
const modalVisual = document.querySelector('#case-modal-visual');
let lastCaseStudyTrigger = null;

const closeCaseStudy = () => {
  if (!modal) return;
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  lastCaseStudyTrigger?.focus();
};

const openCaseStudy = (key, trigger) => {
  const study = caseStudies[key];
  if (!modal || !study) return;
  lastCaseStudyTrigger = trigger;
  modalLabel.textContent = study.label;
  modalTitle.textContent = study.title;
  modalSummary.textContent = study.summary;
  modalChallenge.textContent = study.challenge;
  modalApproach.textContent = study.approach;
  modalOutcome.textContent = study.outcome;
  modalMetrics.innerHTML = study.metrics.map(([value, label]) => `<div class="case-metric"><strong>${value}</strong><span>${label}</span></div>`).join('');
  modalVisual.innerHTML = study.visual;
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  window.requestAnimationFrame(() => modalClose?.focus());
};

document.querySelectorAll('.case-study-trigger').forEach((trigger) => {
  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    openCaseStudy(trigger.dataset.caseStudy, trigger);
  });
});

document.querySelectorAll('[data-design-study] .view-pill').forEach((trigger) => {
  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    const card = trigger.closest('[data-design-study]');
    openCaseStudy(card?.dataset.designStudy, trigger);
  });
});

modal?.querySelectorAll('[data-close-case]').forEach((element) => element.addEventListener('click', closeCaseStudy));
modalClose?.addEventListener('click', closeCaseStudy);
modalPanel?.addEventListener('click', (event) => event.stopPropagation());
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && modal?.getAttribute('aria-hidden') === 'false') closeCaseStudy();
});

const canTilt = window.matchMedia('(pointer: fine)').matches && canAnimate;
if (canTilt) {
  document.querySelectorAll('[data-tilt]').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${y * -2.4}deg) rotateY(${x * 2.4}deg) translateY(-5px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
}

/* Hero heading: a controlled scatter that resolves back into place as the page moves. */
const scatterHeading = document.querySelector('[data-scatter-heading]');
if (scatterHeading) {
  const accessibleText = 'I build digital experiences that move people.';
  scatterHeading.setAttribute('aria-label', accessibleText);
  let letterIndex = 0;

  const wrapLetters = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const fragment = document.createDocumentFragment();
      [...node.textContent].forEach((character) => {
        if (character === ' ') {
          fragment.appendChild(document.createTextNode(' '));
          return;
        }
        const letter = document.createElement('span');
        const driftX = ((letterIndex * 9) % 13) - 6;
        const driftY = ((letterIndex * 7) % 9) - 4;
        const rotation = ((letterIndex * 5) % 5) - 2;
        letter.className = 'scatter-letter';
        letter.textContent = character;
        letter.setAttribute('aria-hidden', 'true');
        letter.style.setProperty('--scatter-x', `${driftX}px`);
        letter.style.setProperty('--scatter-y', `${driftY}px`);
        letter.style.setProperty('--scatter-r', `${rotation}deg`);
        letter.style.setProperty('--scatter-delay', `${(letterIndex % 9) * 12}ms`);
        fragment.appendChild(letter);
        letterIndex += 1;
      });
      node.replaceWith(fragment);
      return;
    }
    if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'BR') {
      [...node.childNodes].forEach(wrapLetters);
    }
  };

  [...scatterHeading.childNodes].forEach(wrapLetters);
  const scatterLetters = [...scatterHeading.querySelectorAll('.scatter-letter')];
  const updateScatter = () => {
    if (!canAnimate || !scatterLetters.length) return;
    const travel = Math.min(Math.max((window.scrollY - 80) / 260, 0), 1);
    const intensity = Math.sin(travel * Math.PI);
    scatterHeading.style.setProperty('--scatter-intensity', intensity.toFixed(3));
    scatterLetters.forEach((letter) => {
      const x = Number.parseFloat(letter.style.getPropertyValue('--scatter-x')) * intensity;
      const y = Number.parseFloat(letter.style.getPropertyValue('--scatter-y')) * intensity;
      const rotation = Number.parseFloat(letter.style.getPropertyValue('--scatter-r')) * intensity;
      letter.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg)`;
    });
  };

  window.addEventListener('scroll', updateScatter, { passive: true });
  window.addEventListener('resize', updateScatter);
  updateScatter();
}
