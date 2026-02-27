import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Login from './pages/Login';
import SecuritySetup from './pages/SecuritySetup';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardPage from './pages/Dashboard';
import UsersPage from './pages/Users';
import AnnouncementsPage from './pages/Announcements';
import MetricsPage from './pages/Metrics';
import SettingsPage from './pages/Settings';
import SecurityMasterPage from './pages/SecurityMaster';
import RolesHubPage from './pages/roles/RolesHub';
import PharmacyHubPage from './pages/roles/PharmacyHub';
import PatientsPage from './pages/roles/Patients';
import DoctorsPage from './pages/roles/Doctors';
import RolePlaceholderPage from './pages/roles/RolePlaceholder';
import AcademyPage from './pages/Academy';
import SupportPage from './pages/Support';
import PaymentsPage from './pages/Payments';
import SpecialtiesPage from './pages/Specialties';

import { supabase } from './lib/supabase';

const App: React.FC = () => {
    const [vaultChecked, setVaultChecked] = React.useState(false);
    const [isInitialized, setIsInitialized] = React.useState<boolean | null>(null);

    React.useEffect(() => {
        const checkVault = async () => {
            try {
                const { data } = await supabase
                    .from('master_vault')
                    .select('is_initialized')
                    .maybeSingle();

                if (data) {
                    setIsInitialized(data.is_initialized);
                } else {
                    // If table is empty or doesn't exist yet (though it should)
                    setIsInitialized(false);
                }
            } catch (err) {
                console.error('Vault check failed:', err);
            } finally {
                setVaultChecked(true);
            }
        };
        checkVault();
    }, []);

    if (!vaultChecked) {
        return (
            <div className="h-screen w-screen bg-[#050505] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 border-t-2 border-blue-500 rounded-full animate-spin" />
                    <p className="text-blue-500 font-bold text-[10px] tracking-[0.3em] uppercase">Checking Security Protocols...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <Toaster position="top-right" richColors expand closeButton />
            <Routes>
                <Route path="/login" element={isInitialized === false ? <Navigate to="/security-setup" replace /> : <Login />} />
                <Route path="/security-setup" element={<SecuritySetup />} />
                <Route path="/dashboard" element={isInitialized === false ? <Navigate to="/security-setup" replace /> : <DashboardLayout />}>
                    <Route index element={<DashboardPage />} />
                </Route>
                <Route path="/" element={isInitialized === false ? <Navigate to="/security-setup" replace /> : <DashboardLayout />}>
                    <Route path="users" element={<UsersPage />} />
                    <Route path="academy" element={<AcademyPage />} />
                    <Route path="soporte" element={<SupportPage />} />
                    <Route path="roles" element={<RolesHubPage />} />
                    <Route path="roles/paciente" element={<PatientsPage />} />
                    <Route path="roles/medico" element={<DoctorsPage />} />
                    <Route path="roles/farmacias" element={<PharmacyHubPage />} />
                    <Route path="roles/:roleId" element={<RolePlaceholderPage />} />
                    <Route path="announcements" element={<AnnouncementsPage />} />
                    <Route path="metrics" element={<MetricsPage />} />
                    <Route path="configuracion" element={<SettingsPage />} />
                    <Route path="security" element={<SecurityMasterPage />} />
                    <Route path="pagos" element={<PaymentsPage />} />
                    <Route path="specialties" element={<SpecialtiesPage />} />
                </Route>
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </>
    );
};

export default App;
