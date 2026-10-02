import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

if ('virtualKeyboard' in navigator) {
  (navigator as any).virtualKeyboard.overlaysContent = true;
}

createRoot(document.getElementById("root")!).render(<App />);
