/* ============================================================
   toggle-theme.js  —  Coller ce script avant </body>
   ============================================================ */

(function () {
    const STORAGE_KEY = 'theme';
    const body        = document.body;

    /* --- Restaure la préférence sauvegardée --- */
    if (localStorage.getItem(STORAGE_KEY) === 'night') {
        body.classList.add('night-mode');
    }

    /* --- Crée le bouton toggle --- */
    const wrapper = document.createElement('div');
    wrapper.className = 'theme-toggle-wrapper';

    const label = document.createElement('span');
    label.className = 'theme-toggle-label';
    label.textContent = body.classList.contains('night-mode') ? 'Dark Mode' : 'Light Mode';

    const btn = document.createElement('button');
    btn.className = 'theme-toggle';
    btn.setAttribute('aria-label', 'Basculer mode jour / nuit');

    const knob = document.createElement('span');
    knob.className = 'knob';

    btn.appendChild(knob);
    wrapper.appendChild(label);
    wrapper.appendChild(btn);
    document.body.appendChild(wrapper);

    /* --- Logique de bascule --- */
    btn.addEventListener('click', () => {
        const isNight = body.classList.toggle('night-mode');
        label.textContent = isNight ? 'Dark Mode' : 'Light Mode';
        localStorage.setItem(STORAGE_KEY, isNight ? 'night' : 'day');
    });
})();