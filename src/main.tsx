import { createRoot } from "react-dom/client";
import { WagmiProvider } from "wagmi";
import App from "./App.tsx";
import { wagmiConfig } from "./lib/wagmi";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <WagmiProvider config={wagmiConfig}>
    <App />
  </WagmiProvider>
);
