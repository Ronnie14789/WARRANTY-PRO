import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Sidebar } from './components/layout/sidebar';
import { Topbar } from './components/layout/topbar';
import { ClaimWizardPage } from './pages/claim-wizard-page';
import { ClaimsPage } from './pages/claims-page';
import { DashboardPage } from './pages/dashboard-page';
import { InvestigationsPage } from './pages/investigations-page';

const App = () => {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 lg:flex">
      <Sidebar />
      <div className="flex-1">
        <Topbar darkMode={darkMode} onToggleMode={() => setDarkMode((mode) => !mode)} />
        <main className="p-4 md:p-6">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/claims/new" element={<ClaimWizardPage />} />
            <Route path="/claims" element={<ClaimsPage />} />
            <Route path="/investigations" element={<InvestigationsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;
