
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';
import {
    LayoutDashboard,
    Utensils,
    Dumbbell,
    BarChart,
    LogOut,
    Menu,
    User,
    Scale,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ModeToggle } from '@/components/common/ModeToggle';
import { DatePicker } from '@/components/common/DatePicker';

const routeTitles: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/meals': 'Meals',
    '/workouts': 'Workouts',
    '/weight': 'Weight',
    '/reports': 'Reports',
    '/profile': 'Profile',
};

export default function Layout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const logout = useAuthStore((state) => state.logout);
    const navigate = useNavigate();
    const location = useLocation();
    const headerTitle = routeTitles[location.pathname] ?? 'VitaTrack';

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/meals', label: 'Meals', icon: Utensils },
        { to: '/workouts', label: 'Workouts', icon: Dumbbell },
        { to: '/weight', label: 'Weight', icon: Scale },
        { to: '/reports', label: 'Reports', icon: BarChart },
        { to: '/profile', label: 'Profile', icon: User },
    ];

    return (
        <div className="min-h-screen bg-background flex">
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <aside className={cn(
                "fixed lg:static inset-y-0 left-0 z-40 w-64 border-r bg-card transition-transform duration-200 ease-in-out lg:translate-x-0",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="h-full flex flex-col">
                    <div className="h-14 flex items-center px-6 border-b font-bold text-lg tracking-tight">
                        VitaTrack
                    </div>
                    <div className="flex-1 py-4">
                        <nav className="grid items-start px-2 text-sm font-medium lg:px-4 space-y-1">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={({ isActive }) => cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                                        isActive ? "bg-muted text-primary" : "text-muted-foreground"
                                    )}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.label}
                                </NavLink>
                            ))}
                        </nav>
                    </div>
                    <div className="border-t p-4">
                        <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground" onClick={handleLogout}>
                            <LogOut className="h-4 w-4" />
                            Logout
                        </Button>
                    </div>
                </div>
            </aside>

            <div className="flex-1 flex flex-col min-h-screen min-w-0">
                <header className="h-14 lg:h-[60px] flex items-center gap-4 border-b bg-background/95 backdrop-blur px-4 sm:px-6 sticky top-0 z-30">
                    <Button variant="ghost" size="icon" className="lg:hidden -ml-2" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                        <Menu className="h-6 w-6" />
                    </Button>
                    <div className="w-full flex justify-between items-center gap-2">
                        <h1 className="font-semibold text-lg truncate">{headerTitle}</h1>
                        <div className="flex items-center gap-2 shrink-0">
                            <DatePicker />
                            <ModeToggle />
                        </div>
                    </div>
                </header>
                <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
