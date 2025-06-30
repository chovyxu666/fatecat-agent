
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Question from "./pages/Question";
import Cards from "./pages/Cards";
import Interpretation from "./pages/Interpretation";
import Chat from "./pages/Chat";
import BaziInput from "./pages/BaziInput";
import BaziResult from "./pages/BaziResult";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/question/:catId" element={<Question />} />
          <Route path="/cards/:catId" element={<Cards />} />
          <Route path="/interpretation/:catId" element={<Interpretation />} />
          <Route path="/chat/:catId" element={<Chat />} />
          <Route path="/bazi-input/:catId" element={<BaziInput />} />
          <Route path="/bazi-result/:catId" element={<BaziResult />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
