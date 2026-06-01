// static/js/tour-core.js
// Centralized tour scaffolding for guided UI walk-throughs

export class Tour {
  constructor(steps, tourName) {
    this.steps = steps;
    this.tourName = tourName;
    this.currentStep = 0;
    this.halo = null;
    window.currentTourStep = this.currentStep;
    window.tourSteps = this.steps;
    window.tourHalo = this.halo;
  }

  start() {
    this.currentStep = 0;
    window.currentTourStep = this.currentStep;
    document.body.classList.add('tour-active');
    this.showStep();
  }

  showStep() {
    if (!this.steps || this.currentStep >= this.steps.length) {
      cancelActiveTour();
      return;
    }

    const step = this.steps[this.currentStep];
    if (step.onBefore) step.onBefore();

    const target = document.querySelector(step.selector);
    if (!target) {
      this.currentStep++;
      window.currentTourStep = this.currentStep;
      this.showStep();
      return;
    }

    this.makeHalo(target, step.text, step.placement || 'bottom');
  }

  makeHalo(target, text, placement) {
    this.clearHalos();
    
    // Add highlight class to target
    target.classList.add('odysseus-highlight', 'odysseus-highlight-click');

    // Create the halo
    this.halo = document.createElement('div');
    this.halo.className = 'tour-halo';
    window.tourHalo = this.halo;
    document.body.appendChild(this.halo);

    const rect = target.getBoundingClientRect();
    const pad = 6;
    this.halo.style.left = (rect.left - pad) + 'px';
    this.halo.style.top = (rect.top - pad) + 'px';
    this.halo.style.width = (rect.width + pad * 2) + 'px';
    this.halo.style.height = (rect.height + pad * 2) + 'px';

    // Create tooltip
    const tooltip = document.createElement('div');
    tooltip.id = 'tour-tooltip';
    tooltip.className = 'tour-tooltip visible';
    
    // Counter
    const p = document.createElement('p');
    p.innerHTML = text;
    const progress = document.createElement('div');
    progress.className = 'tour-progress';
    progress.textContent = `Step ${this.currentStep + 1} of ${this.steps.length}`;
    
    tooltip.appendChild(progress);
    tooltip.appendChild(p);

    const nextBtn = document.createElement('button');
    nextBtn.textContent = this.currentStep === this.steps.length - 1 ? 'Finish' : 'Next';
    nextBtn.className = 'tour-next-btn';
    nextBtn.onclick = (e) => {
      e.stopPropagation();
      e.preventDefault();
      this.currentStep++;
      window.currentTourStep = this.currentStep;
      if (this.currentStep < this.steps.length) {
        this.showStep();
      } else {
        cancelActiveTour();
      }
    };
    tooltip.appendChild(nextBtn);

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Skip Tour';
    closeBtn.className = 'tour-skip-btn';
    closeBtn.onclick = (e) => {
      e.stopPropagation();
      e.preventDefault();
      cancelActiveTour();
    };
    tooltip.appendChild(closeBtn);

    document.body.appendChild(tooltip);

    // Initial position
    this.positionTooltip(tooltip, rect, placement);
  }

  positionTooltip(tooltip, rect, placement) {
    const tipRect = tooltip.getBoundingClientRect();
    const gap = 16;
    let top, left;

    switch (placement) {
      case 'bottom':
        top = rect.bottom + gap;
        left = rect.left + (rect.width / 2) - (tipRect.width / 2);
        break;
      case 'top':
        top = rect.top - tipRect.height - gap;
        left = rect.left + (rect.width / 2) - (tipRect.width / 2);
        break;
      case 'left':
        top = rect.top + (rect.height / 2) - (tipRect.height / 2);
        left = rect.left - tipRect.width - gap;
        break;
      case 'right':
        top = rect.top + (rect.height / 2) - (tipRect.height / 2);
        left = rect.right + gap;
        break;
      default:
        top = rect.bottom + gap;
        left = rect.left;
    }

    // Keep on screen
    const pad = 12;
    left = Math.max(pad, Math.min(left, window.innerWidth - tipRect.width - pad));
    top = Math.max(pad, Math.min(top, window.innerHeight - tipRect.height - pad));

    tooltip.style.top = top + 'px';
    tooltip.style.left = left + 'px';
  }

  clearHalos() {
    document.querySelectorAll('.odysseus-highlight, .odysseus-highlight-click')
      .forEach(e => e.classList.remove('odysseus-highlight', 'odysseus-highlight-click'));
    document.querySelectorAll('.tour-halo').forEach(e => e.remove());
    document.getElementById('tour-tooltip')?.remove();
  }
}

export function cancelActiveTour(reason) {
  document.querySelectorAll('.odysseus-highlight, .odysseus-highlight-click')
    .forEach(e => e.classList.remove('odysseus-highlight', 'odysseus-highlight-click'));
  document.querySelectorAll('.tour-halo').forEach(e => e.remove());
  document.getElementById('tour-tooltip')?.remove();
  document.body?.classList.remove('tour-active');

  window.currentTourStep = 0;
  window.tourSteps = [];
  window.tourHalo = null;
}
