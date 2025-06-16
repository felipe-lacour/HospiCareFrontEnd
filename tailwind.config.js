/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",        // top-level HTML files
    "./**/*.html",     // nested HTML files (e.g. /pages/index.html)
    "./*.js",          // top-level JS modules
    "./**/*.js"        // nested JS modules
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

