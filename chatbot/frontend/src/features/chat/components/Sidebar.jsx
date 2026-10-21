import React from "react";
import {
  Home,
  MessageSquare,
  History,
  Bot,
  FolderClosed,
  Share2,
  Database,
  Headphones,
  Settings,
  Sparkles,
  LogOut,
  UserCheck,
} from "lucide-react";
import useAuth from "../../auth/hook/useAuth";

export const Sidebar = ({
  activeTab = "home",
  onTabChange,
  onToggleHistory,
  historyOpen = false,
  chatsCount = 0,
}) => {
  const { user, isAuthenticated, handleLogout } = useAuth();
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  const navItems = [
    { id: "home", icon: Home, label: "Home" },
    { id: "chats", icon: MessageSquare, label: "Chats" },
    { id: "history", icon: History, label: "History", badge: chatsCount },
    { id: "agents", icon: Bot, label: "AI Agents" },
    { id: "files", icon: FolderClosed, label: "Library" },
    { id: "share", icon: Share2, label: "Shared" },
    { id: "data", icon: Database, label: "Storage" },
  ];

  return (
    <aside className="fixed inset-x-0 bottom-0 z-30 flex h-14 w-full items-center justify-between border-t border-[#EAEAE7] bg-[#FBFBFA]/95 px-1 py-1 backdrop-blur md:static md:h-dvh md:w-[72px] md:flex-col md:border-r md:border-t-0 md:px-0 md:py-5 md:backdrop-blur-none shrink-0 select-none">
      {/* Top Logo */}
      <div className="flex min-w-0 flex-1 flex-col items-center gap-7 md:w-full md:flex-none">
        <button
          onClick={() => onTabChange?.("home")}
          className="group relative hidden h-10 w-10 items-center justify-center rounded-full hover:bg-neutral-100 transition-colors md:flex"
          title="AI Studio"
        >
          {/* Custom Aperture / Sunburst Geometric Logo from the reference image */}
          <div className="w-7 h-7 relative flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              className="w-7 h-7 text-[#121212] transition-transform duration-300 group-hover:rotate-45"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
              <path d="M12 2v3M12 19v3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M2 12h3M19 12h3M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" />
            </svg>
          </div>
        </button>

        {/* Navigation Items */}
        <nav className="flex w-full items-center justify-around gap-0.5 md:flex-col md:items-center md:gap-3 md:px-2.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.id === "history"
                ? historyOpen
                : activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === "history") {
                    onToggleHistory?.();
                  } else {
                    onTabChange?.(item.id);
                  }
                }}
                className={`group relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all duration-150 md:h-10 md:w-10 ${
                  isActive
                    ? "bg-[#F3E8FF] text-[#7C3AED] ring-1 ring-[#D8B4FE]/80 shadow-xs"
                    : "text-[#737373] hover:text-[#121212] hover:bg-[#F2F2EF]"
                }`}
                title={item.label}
              >
                <Icon className="w-5 h-5 stroke-[1.8]" />

                {/* Badge if chats exist */}
                {item.badge > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#7C3AED]" />
                )}

                {/* Floating tooltip */}
                <span className="pointer-events-none absolute left-14 z-50 hidden whitespace-nowrap rounded-md bg-[#1c1b1b] px-2.5 py-1 text-xs font-medium text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 md:block">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="relative flex items-center gap-1 md:w-full md:flex-col md:gap-3 md:px-2.5">
        <button
          className="group relative hidden h-10 w-10 items-center justify-center rounded-xl text-[#737373] hover:text-[#121212] hover:bg-[#F2F2EF] transition-colors md:flex"
          title="Support & Audio"
        >
          <Headphones className="w-5 h-5 stroke-[1.8]" />
          <span className="pointer-events-none absolute left-14 z-50 hidden whitespace-nowrap rounded-md bg-[#1c1b1b] px-2.5 py-1 text-xs font-medium text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 md:block">
            Audio & Support
          </span>
        </button>

        <button
          className="group relative hidden h-10 w-10 items-center justify-center rounded-xl text-[#737373] hover:text-[#121212] hover:bg-[#F2F2EF] transition-colors md:flex"
          title="Settings"
        >
          <Settings className="w-5 h-5 stroke-[1.8]" />
          <span className="pointer-events-none absolute left-14 z-50 hidden whitespace-nowrap rounded-md bg-[#1c1b1b] px-2.5 py-1 text-xs font-medium text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 md:block">
            Settings
          </span>
        </button>

        {/* User Avatar */}
        <div className="relative md:mt-1">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-violet-500 to-fuchsia-500 text-xs font-semibold text-white shadow-xs transition-all hover:ring-2 hover:ring-violet-300"
            title={user?.name || "Account"}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : "J"}
          </button>

          {/* User popup menu */}
          {showUserMenu && (
            <div className="absolute bottom-12 right-0 z-50 w-52 animate-in fade-in slide-in-from-left-2 rounded-2xl border border-[#EAEAE7] bg-white p-3 text-sm shadow-xl md:bottom-0 md:left-12 md:right-auto">
              <div className="px-2 py-1.5 border-b border-[#F0F0ED] mb-2">
                <p className="font-semibold text-neutral-900 truncate">
                  {user?.name || "Jason"}
                </p>
                <p className="text-xs text-neutral-500 truncate">
                  {user?.email || "jason@example.com"}
                </p>
                <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-green-50 text-green-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  {isAuthenticated ? "Backend Connected" : "Local Mode"}
                </span>
              </div>

              {isAuthenticated ? (
                <button
                  onClick={() => {
                    handleLogout();
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              ) : (
                <div className="space-y-1">
                  <a
                    href="/login"
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-violet-600" />
                    Sign In
                  </a>
                  <a
                    href="/register"
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-fuchsia-600" />
                    Create Account
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
