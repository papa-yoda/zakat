import { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import RetirementPage from './pages/RetirementPage';
import InvestmentsPage from './pages/InvestmentsPage';
import SavingsPage from './pages/SavingsPage';
import JewelryPage from './pages/JewelryPage';
import SettingsPage from './pages/SettingsPage';
import DataToolbar from './components/DataToolbar';
import { isLiteMode } from './api/client';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/retirement', label: 'Retirement' },
  { to: '/investments', label: 'Investments' },
  { to: '/savings', label: 'Savings' },
  { to: '/jewelry', label: 'Jewelry' },
  { to: '/settings', label: 'Settings' },
];

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <div className="flex min-h-screen bg-gray-50">
        {/* Mobile hamburger */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed top-4 left-4 z-50 rounded-md bg-white p-2 shadow md:hidden"
        >
          <svg className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {sidebarOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-30 bg-black/30 md:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-white shadow-lg transition-transform md:relative md:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900">
              Zakat Calculator
              {isLiteMode && <span className="ml-2 text-xs font-normal text-gray-400">lite</span>}
            </h2>
          </div>
          <nav className="space-y-1 px-3">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `block rounded-md px-3 py-2 text-sm font-medium ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <DataToolbar />
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6 pt-16 md:pt-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/retirement" element={<RetirementPage />} />
            <Route path="/investments" element={<InvestmentsPage />} />
            <Route path="/savings" element={<SavingsPage />} />
            <Route path="/jewelry" element={<JewelryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
