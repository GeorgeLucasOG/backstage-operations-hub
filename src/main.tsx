
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Clear any errors in the console to help with debugging
console.clear();

// Force a clean render
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("No root element found! The application cannot render.");
}

const root = createRoot(rootElement);
root.render(<App />);
