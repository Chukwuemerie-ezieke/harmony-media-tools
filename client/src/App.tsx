import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import MergePage from "@/pages/merge";
import { Analytics } from "@vercel/analytics/react";

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/merge" component={MergePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <AppRouter />
      <Analytics />
    </TooltipProvider>
  );
}

export default App;
