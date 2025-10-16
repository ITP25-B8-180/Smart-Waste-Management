import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, Plus, User } from 'lucide-react';
import UserAvatar from '../ui/UserAvatar';

export default function UserSidebar() {
    const { user } = useAuth();
    const navItems = [
        {
            path: '/user/dashboard',
            label: 'Dashboard',
            icon: <LayoutDashboard className="h-5 w-5" />
        },
        {
            path: '/user/add-request',
            label: 'Request Collection',
            icon: <Plus className="h-5 w-5" />
        },
        {
            path: '/user/profile',
            label: 'My Profile',
            icon: <User className="h-5 w-5" />
        },
    ];

    return (
        <div className="w-64 bg-white shadow-lg h-full">
            <div className="p-6">
                <h2 className="text-2xl font-bold text-emerald-700">My Account</h2>
            </div>
            <div className="px-6 pb-6">
                <div className="flex items-center space-x-3">
                    <UserAvatar user={user} size="md" />
                    <div>
                        <p className="font-medium text-gray-900">
                            {user?.firstName || user?.username || 'User'}
                        </p>
                        <p className="text-sm text-gray-500">
                            {user?.lastName || 'Member'}
                        </p>
                    </div>
                </div>
            </div>
            <nav className="px-4 pb-4">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center space-x-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                                isActive
                                    ? 'bg-emerald-600 text-white'
                                    : 'text-gray-700 hover:bg-emerald-100'
                            }`
                        }
                    >
                        <span className="text-emerald-600 group-hover:text-white">
                            {item.icon}
                        </span>
                        <span className="font-medium">{item.label}</span>
                    </NavLink>
                ))}
            </nav>
        </div>
    );
}
