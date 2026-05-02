import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './pages/DashboardPage';
import ImportPage from './pages/ImportPage';
import TransactionsPage from './pages/TransactionsPage';
import CardPage from './pages/CardPage';
import RulesPage from './pages/RulesPage';
import GoalsPage from './pages/GoalsPage';
import ProvisionsPage from './pages/ProvisionsPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/importar" element={<ImportPage />} />
          <Route path="/transacoes" element={<TransactionsPage />} />
          <Route path="/cartao" element={<CardPage />} />
          <Route path="/regras" element={<RulesPage />} />
          <Route path="/metas" element={<GoalsPage />} />
          <Route path="/provisoes" element={<ProvisionsPage />} />
          <Route path="/configuracoes" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
