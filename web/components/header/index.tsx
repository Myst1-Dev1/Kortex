'use client';

import { Bell, Menu, Moon, Sun } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { useUser } from "@/services/user";
import { useTheme } from "@/services/theme";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationDropdown } from "@/components/sections/Notifications/notificationDropdown";

interface HeaderProps {
    setIsSideBarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function Header({ setIsSideBarOpen }:HeaderProps) {
    const path = usePathname();
    const { theme, toggleTheme } = useTheme();

    const { user } = useUser();
    const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
    const [isNotifOpen, setIsNotifOpen] = useState(false);

    return (
        <>
            <header className="border-b border-[#C8C4D5] dark:border-gray-700 w-full bg-white dark:bg-gray-900">
                <div className="w-full flex justify-between items-center px-3 lg:px-10 py-3">
                    <div className="flex lg:block">
                        <Menu onClick={() => setIsSideBarOpen(true)} className="lg:hidden block mr-4 m-auto dark:text-gray-300" />
                        {path === '/dashboard' 
                            ? 
                            <h2 className="text-xl font-semibold dark:text-gray-100">Painel</h2> 
                            :
                           ''
                        }
                    </div>
                    <div className="shrink-0 flex items-center gap-5 relative">
                        <div className="relative">
                            <Bell
                                onClick={() => setIsNotifOpen((prev) => !prev)}
                                className="w-5 h-5 font-semibold cursor-pointer transition-all duration-500 hover:scale-110 dark:text-gray-300"
                            />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full px-1">
                                    {unreadCount > 99 ? "99+" : unreadCount}
                                </span>
                            )}
                            {isNotifOpen && (
                                <NotificationDropdown
                                    notifications={notifications}
                                    onMarkAsRead={markAsRead}
                                    onMarkAllAsRead={markAllAsRead}
                                    onDelete={deleteNotification}
                                    onClose={() => setIsNotifOpen(false)}
                                />
                            )}
                        </div>
                        <button onClick={toggleTheme} className="cursor-pointer">
                            {theme === "light" ? (
                                <Moon className="w-5 h-5 font-semibold transition-all duration-500 hover:scale-110 dark:text-gray-300" />
                            ) : (
                                <Sun className="w-5 h-5 font-semibold transition-all duration-500 hover:scale-110 text-yellow-400" />
                            )}
                        </button>
                        <Image 
                            width={40} 
                            height={40} 
                            className="w-10 h-10 object-cover rounded-full aspect-square" 
                            alt="foto do usuário logado" 
                            src={user && user?.avatarUrl ? user?.avatarUrl : "/images/userImg.jpg"} 
                        />
                    </div>
                </div>
            </header>
        </>
    )
}