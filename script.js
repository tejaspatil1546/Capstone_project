// ============ Resolution lifecycle tracker animation ============
// Cycles the "Reported -> In Progress -> Resolved -> Closed" tracker
// in the hero section to visually communicate the status flow.

(function () {
  const stages = document.querySelectorAll('.tracker__stage');
  const fill = document.getElementById('trackerFill');

  if (!stages.length || !fill) return;

  let active = 0;
  const total = stages.length;

  function render() {
    stages.forEach((stage, i) => {
      stage.classList.toggle('is-active', i <= active);
    });
    const pct = (active / (total - 1)) * 100;
    fill.style.width = pct + '%';
  }

  render();

  setInterval(() => {
    active = (active + 1) % total;
    render();
  }, 2200);
})();
