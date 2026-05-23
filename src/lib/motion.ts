import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function reducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function initMotion(): void {
  if (reducedMotion()) {
    document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }

  const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
  function raf(time: number) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
  lenis.on('scroll', ScrollTrigger.update);

  const heroH1 = document.querySelector('.hero-h1');
  if (heroH1) {
    gsap.from(heroH1.children, {
      opacity: 0, y: 18, duration: 0.6, stagger: 0.04, ease: 'power2.out',
    });
  }
  const heroSub = document.querySelector('.hero-sub');
  if (heroSub) {
    gsap.from(heroSub, {
      opacity: 0, y: 12, duration: 0.5, delay: 0.4, ease: 'power2.out',
    });
  }

  document.querySelectorAll<HTMLElement>('.section-hdr').forEach((el) => {
    gsap.from(el, {
      opacity: 0, y: 18, duration: 0.6, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 80%' },
    });
  });

  document.querySelectorAll<HTMLElement>('.metric-num').forEach((el) => {
    const text = el.textContent ?? '';
    const match = text.match(/^([\d.]+)/);
    if (!match) return;
    const final = parseFloat(match[1]);
    const unitNode = el.querySelector('.metric-unit')?.outerHTML ?? '';
    const obj = { val: 0 };
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          val: final,
          duration: 1.2,
          ease: 'power2.out',
          onUpdate: () => {
            const display = final >= 10 ? Math.floor(obj.val) : obj.val.toFixed(1);
            el.innerHTML = `${display}${unitNode}`;
          },
        });
      },
    });
  });
}
