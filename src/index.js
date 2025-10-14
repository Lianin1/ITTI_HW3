// src/index.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App'; // 匯入新的 App 元件

const el = document.getElementById('react-root');
if (el) {
  createRoot(el).render(<App />); // 只渲染 App 元件
}