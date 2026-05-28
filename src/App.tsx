import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import "iconify-icon";
import Layout from "./components/Layout";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import HypothesisLab from "./pages/HypothesisLab";
import BioLLM from "./pages/BioLLM";
import Labs from "./pages/Labs";
import Feed from "./pages/Feed";
import IPNFT from "./pages/IPNFT";
import DataMarket from "./pages/DataMarket";
import Campaigns from "./pages/Campaigns";
import Agents from "./pages/Agents";
import Dashboard from "./pages/Dashboard";
import Protocol from "./pages/Protocol";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Biosecurity from "./pages/Biosecurity";
import NotFound from "./pages/NotFound.tsx";

const App = () => (
  <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="hypothesis-lab" element={<HypothesisLab />} />
            <Route path="biollm" element={<BioLLM />} />
            <Route path="labs" element={<Labs />} />
            <Route path="feed" element={<Feed />} />
            <Route path="ip-nft" element={<IPNFT />} />
            <Route path="data-market" element={<DataMarket />} />
            <Route path="campaigns" element={<Campaigns />} />
            <Route path="agents" element={<Agents />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="protocol" element={<Protocol />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="terms" element={<Terms />} />
            <Route path="biosecurity" element={<Biosecurity />} />
            {/* Legacy redirects */}
            <Route path="explore" element={<Navigate to="/hypothesis-lab" replace />} />
            <Route path="nodes" element={<Navigate to="/labs" replace />} />
            <Route path="network" element={<Navigate to="/ip-nft" replace />} />
            <Route path="ecosystem" element={<Navigate to="/protocol" replace />} />
            <Route path="start-scaling" element={<Navigate to="/dashboard" replace />} />
            <Route path="landing" element={<Navigate to="/" replace />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
  </TooltipProvider>
);

export default App;
