import React, { createContext, useContext, useState, useEffect } from 'react';

// Buat Context
const ThemeContext = createContext();

// Buat hook kustom untuk kemudahan penggunaan
export const useTheme = () => useContext(ThemeContext);

// Buat Provider
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light'); // Default 'light'

  // Efek ini berjalan saat komponen dimuat
  useEffect(() => {
    // 1. Cek localStorage dulu
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      setTheme(storedTheme);
    } else {
      // 2. Jika tidak ada, cek preferensi OS pengguna
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  // Efek ini berjalan setiap kali 'theme' berubah
  useEffect(() => {
    // 1. Simpan pilihan ke localStorage
    localStorage.setItem('theme', theme);
    // 2. Terapkan tema ke elemen <html>
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Fungsi untuk mengganti tema
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};