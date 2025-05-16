import { useState, useEffect } from "react";

const themes = ["latte", "frappe", "macchiato", "mocha"];

const ThemeToggler = () => {
  // Load saved theme or default to 'latte'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "latte";
  });

  // When theme changes, update localStorage and body class
  useEffect(() => {
    localStorage.setItem("theme", theme);

    // Remove all theme classes from <body>
    themes.forEach(t => document.body.classList.remove(t));

    // Add current theme class to <body>
    document.body.classList.add(theme);
  }, [theme]);

  // Handler to cycle themes
  const toggleTheme = () => {
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  return (
    <button
      onClick={toggleTheme}
      className="bg-ctp-pink text-white px-4 py-2 rounded hover:bg-ctp-mauve transition-colors"
    >
      LOL: {theme.charAt(0).toUpperCase() + theme.slice(1)}
    </button>
  );
};

export default ThemeToggler;