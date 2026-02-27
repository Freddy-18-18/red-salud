import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    BarChart3,
    Settings,
    LogOut,
    Bell,
    Search,
    Megaphone,
    User as UserIcon,
    ShieldCheck,
    Cpu,
    PanelLeftClose,
    PanelLeft,
    GraduationCap,
    LifeBuoy,
    Banknote,
    Stethoscope
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { usePermissions } from '@/hooks/usePermissions';

const SidebarItem = ({ to, icon: Icon, label, isCollapsed }: { to: string, icon: any, label: string, isCollapsed: boolean }) => (
    <NavLink
        to={to}
        className={({ isActive }) => `
      flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group relative
      ${isActive
                ? 'bg-white/[0.05] text-white'
                : 'text-slate-400 hover:bg-white/[0.03] hover:text-slate-200'}
    `}
    >
        {({ isActive }) => (
            <>
                <Icon className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isActive ? 'text-blue-400' : ''}`} />
                {!isCollapsed && (
                    <span className="text-sm font-medium tracking-tight whitespace-nowrap overflow-hidden transition-all duration-300">
                        {label}
                    </span>
                )}

                {isActive && !isCollapsed && (
                    <div className="absolute left-0 w-1 h-4 bg-blue-500 rounded-full" />
                )}

                {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap border border-white/10 shadow-xl">
                        {label}
                    </div>
                )}
            </>
        )}
    </NavLink>
);

const DashboardLayout: React.FC = () => {
    const { signOut } = useAuth();
    const { profile } = useAuthStore();
    const { hasAccessLevel, hasPermission, isRoot, accessLevel: currentLevel } = usePermissions();
    const navigate = useNavigate();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isPinned, setIsPinned] = useState(true);
    const [isHovering, setIsHovering] = useState(false);

    const actualCollapsed = isCollapsed && !isHovering;

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
        setIsPinned(!isPinned);
    };

    return (
        <div className="flex h-screen bg-black overflow-hidden text-slate-300 font-sans selection:bg-blue-500/30">
            {/* Sidebar Wrapper for Layout persistence */}
            <div
                className="relative flex-shrink-0 transition-all duration-300 ease-in-out"
                style={{ width: isCollapsed ? '72px' : '260px' }}
            >
                <motion.aside
                    initial={false}
                    animate={{
                        width: actualCollapsed ? '72px' : '260px',
                        transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
                    }}
                    onMouseEnter={() => !isPinned && setIsHovering(true)}
                    onMouseLeave={() => !isPinned && setIsHovering(false)}
                    className={`border-r border-white/5 bg-[#050505] flex flex-col p-4 z-50 h-full ${isCollapsed && isHovering ? 'absolute top-0 left-0 shadow-2xl border-r border-white/10' : 'relative'
                        }`}
                >
                    <div className={`flex items-center ${actualCollapsed ? 'justify-center' : 'justify-between'} mb-8 px-2`}>
                        {!actualCollapsed && (
                            <div className="flex items-center gap-3 group cursor-default">
                                <div className="p-2 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <ShieldCheck className="h-4 w-4 text-white" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-xs tracking-tight text-white leading-none">RED SALUD</span>
                                    <span className="text-[9px] text-blue-500 font-medium tracking-wider">CORP</span>
                                </div>
                            </div>
                        )}
                        {actualCollapsed && (
                            <div className="p-2 bg-blue-600 rounded-lg flex items-center justify-center">
                                <ShieldCheck className="h-4 w-4 text-white" />
                            </div>
                        )}

                        {!actualCollapsed && (
                            <button
                                onClick={toggleCollapse}
                                className="p-1.5 hover:bg-white/5 rounded-md text-slate-500 hover:text-white transition-colors"
                            >
                                {isPinned ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
                            </button>
                        )}
                    </div>

                    <div className={`mb-4 px-2 ${actualCollapsed ? 'text-center' : ''}`}>
                        {!actualCollapsed ? (
                            <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest">General</span>
                        ) : (
                            <div className="h-px bg-white/5 w-full" />
                        )}
                    </div>

                    <nav className="flex-1 space-y-0.5 overflow-y-auto custom-scrollbar pr-1">
                        <SidebarItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" isCollapsed={actualCollapsed} />
                        <SidebarItem to="/pagos" icon={Banknote} label="Gestión de Pagos" isCollapsed={actualCollapsed} />
                        {hasAccessLevel(2) && <SidebarItem to="/roles" icon={Users} label="Hub de Roles" isCollapsed={actualCollapsed} />}
                        {(hasPermission('can_manage_users') || hasAccessLevel(4)) && <SidebarItem to="/users" icon={UserIcon} label="Monitor Global" isCollapsed={actualCollapsed} />}
                        {(hasPermission('can_broadcast_announcements') || hasAccessLevel(3)) && <SidebarItem to="/announcements" icon={Megaphone} label="Avisos Sistema" isCollapsed={actualCollapsed} />}
                        {hasAccessLevel(3) && <SidebarItem to="/metrics" icon={BarChart3} label="Métricas" isCollapsed={actualCollapsed} />}
                        <SidebarItem to="/academy" icon={GraduationCap} label="Academy" isCollapsed={actualCollapsed} />
                        <SidebarItem to="/specialties" icon={Stethoscope} label="Especialidades" isCollapsed={actualCollapsed} />
                        <SidebarItem to="/soporte" icon={LifeBuoy} label="Soporte" isCollapsed={actualCollapsed} />

                        <div className={`pt-6 pb-2 px-2 ${actualCollapsed ? 'text-center' : ''}`}>
                            {!actualCollapsed ? (
                                <div className="h-px bg-white/5 w-full mb-4" />
                            ) : null}
                            {!actualCollapsed && <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest">Sistema</span>}
                        </div>
                        {hasAccessLevel(4) && <SidebarItem to="/configuracion" icon={Settings} label="Configuración" isCollapsed={actualCollapsed} />}
                        {isRoot && <SidebarItem to="/security" icon={Cpu} label="Seguridad Maestra" isCollapsed={actualCollapsed} />}
                    </nav>

                    <div className="mt-auto pt-4 border-t border-white/5 relative">
                        <div className={`flex items-center gap-3 p-2 rounded-xl transition-colors hover:bg-white/[0.03] group ${actualCollapsed ? 'justify-center' : ''}`}>
                            <div className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center border border-white/10 relative overflow-hidden shrink-0">
                                <UserIcon className="h-4 w-4 text-blue-400" />
                            </div>
                            {!actualCollapsed && (
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-white truncate">{profile?.full_name?.split(' ')[0] || 'Admin'}</p>
                                    <p className="text-[10px] text-slate-500 font-medium truncate uppercase tracking-tighter italic">Lvl {currentLevel}</p>
                                </div>
                            )}
                            {!actualCollapsed && (
                                <button
                                    onClick={handleLogout}
                                    className="p-1.5 hover:bg-red-500/10 rounded-md text-slate-600 hover:text-red-400 transition-colors"
                                >
                                    <LogOut className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        {actualCollapsed && (
                            <button
                                onClick={handleLogout}
                                className="mt-2 w-full flex justify-center p-2 hover:bg-red-500/10 rounded-xl text-slate-600 hover:text-red-400 transition-colors"
                            >
                                <LogOut className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </motion.aside>
            </div>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 relative">
                {/* Custom Navigation Bar / Header */}
                <header className="h-20 border-b border-white/5 bg-slate-950/20 backdrop-blur-md flex items-center justify-between px-10 z-10 relative">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-4 bg-white/[0.02] border border-white/[0.05] px-5 py-2.5 rounded-2xl w-80 group focus-within:w-96 focus-within:bg-white/[0.04] focus-within:border-blue-500/30 transition-all duration-500">
                            <Search className="h-4 w-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="ACCESO RÁPIDO: BUSCAR RIF, USUARIO..."
                                className="bg-transparent border-none outline-none text-[10px] font-black text-white placeholder:text-slate-700 w-full tracking-widest uppercase"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-5">
                        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">SISTEMA ONLINE</span>
                        </div>

                        <button className="relative p-3 text-slate-500 hover:text-blue-400 transition-all bg-white/[0.02] hover:bg-white/[0.05] rounded-2xl border border-white/[0.05] group">
                            <Bell className="h-5 w-5 transition-transform group-hover:rotate-12" />
                            <span className="absolute top-3.5 right-3.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-[#020617] shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                        </button>

                        <div className="w-px h-6 bg-white/10 mx-2" />

                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">PROTOCOLO v4.2</span>
                        </div>
                    </div>
                </header>

                <section className="flex-1 overflow-y-auto p-10 custom-scrollbar relative">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="relative z-10"
                    >
                        <Outlet />
                    </motion.div>
                </section>
            </main>
        </div>
    );
};

export default DashboardLayout;
