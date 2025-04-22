  const toggleBtn = document.getElementById('toggle-theme');
  const lightTheme = document.getElementById('light-theme');
  const darkTheme = document.getElementById('dark-theme');
  const app = document.getElementById('app');

  toggleBtn.addEventListener('click', () => {
    app.style.opacity = 0; // start fade out

    setTimeout(() => {
      const isDark = !darkTheme.disabled;
      darkTheme.disabled = isDark;
      lightTheme.disabled = !isDark;
      toggleBtn.textContent = isDark ? 'Toggle Theme' : 'Back to Light';

      app.style.opacity = 1; // fade back in
    }, 300); // wait for fade out before switch
  });