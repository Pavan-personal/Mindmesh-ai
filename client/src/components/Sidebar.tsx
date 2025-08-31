import { useState } from "react";
import { Plus, Settings, LogOut, ChevronLeft, Wallet, CheckCircle, AlertCircle, FileText, Copy } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { CircleEllipsis } from "lucide-react";
import { getImageUrl } from "@/lib/api";
import { useWallet } from "@/hooks/useWallet";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { isConnected, isBaseSepolia, address } = useWallet();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const recentChats = [
    { id: 1, title: "Science Trivia Quiz" },
    { id: 2, title: "JavaScript Basics Test" },
    { id: 3, title: "React Hooks Mastery" },
  ];

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleBackdropClick = () => {
    setIsOpen(false);
  };

  const handleNewChat = () => {
    navigate('/new');
    setIsOpen(false);
  };

  const handleDashboard = () => {
    navigate('/dashboard');
    setIsOpen(false);
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={handleBackdropClick}
        ></div>
      )}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen w-64 bg-white shadow-lg flex flex-col 
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex-1 flex flex-col overflow-y-auto p-4">
          {/* New Chat Button */}
          <button 
            onClick={handleNewChat}
            className="w-full bg-black hover:bg-gray-800 text-white py-3 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Plus size={16} />
            <span>New Chat</span>
          </button>

          {/* Quiz Dashboard */}
          <button 
            onClick={handleDashboard}
            className="mt-4 w-full flex items-center gap-2 text-gray-700 hover:bg-gray-100 rounded-md p-2 text-sm transition-colors"
          >
            <FileText size={16} />
            <span>Quiz Dashboard</span>
          </button>

          {/* Settings
          <button className="mt-4 w-full flex items-center gap-2 text-gray-700 hover:bg-gray-100 rounded-md p-2 text-sm transition-colors">
            <Settings size={16} />
            <span>Settings</span>
          </button> */}

          {/* Wallet Status */}
          <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Wallet size={16} className="text-gray-600" />
              <span className="text-xs font-medium text-gray-700">Wallet Status</span>
            </div>
            
            {isConnected && isBaseSepolia ? (
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle size={14} />
                <span className="text-xs">Connected to Base Sepolia</span>
              </div>
            ) : isConnected ? (
              <div className="flex items-center gap-2 text-yellow-600">
                <AlertCircle size={14} />
                <span className="text-xs">Wrong Network</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle size={14} />
                <span className="text-xs">Not Connected</span>
              </div>
            )}
            
            {isConnected && address && (
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(address);
                  toast({
                    title: "Address Copied!",
                    description: "Wallet address copied to clipboard",
                    variant: "default",
                  });
                }}
                className="mt-1 text-xs text-gray-500 font-mono hover:text-gray-700 cursor-pointer flex items-center gap-1 transition-colors"
              >
                {address.slice(0, 6)}...{address.slice(-4)}
                <Copy size={10} />
              </button>
            )}
          </div>

          {/* Recent Chats */}
          <div className="mt-6">
            <h4 className="text-xs text-gray-500 uppercase tracking-wide font-medium px-2 mb-2">
              Recently Created
            </h4>
            <div className="space-y-1 mb-2">
              {recentChats.map((chat) => (
                <div key={chat.id}>
                  <button className="w-full text-left text-gray-800 hover:bg-gray-100 p-2 rounded-md text-sm truncate transition-colors">
                    {chat.title}
                  </button>
                </div>
              ))}
            </div>
            <h4 className="text-sm gap-2 flex text-black items-center p-2 hover:underline cursor-pointer">
              <CircleEllipsis color="rgba(0,0,0,0.7)" size={20} /> View all
            </h4>
          </div>
        </div>
        <button
          className={`fixed duration-500 z-20 top-4 -right-14 p-2 rounded-full ${
            isOpen ? "bg-white text-black" : "bg-black text-white"
          } shadow-md`}
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          {isOpen ? <ChevronLeft /> : <ChevronRight />}
        </button>{" "}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            {/* User Avatar */}
            <div className="w-12 h-12 flex justify-center items-center rounded-full overflow-hidden bg-black">
              {user?.image ? (
                <img
                  src={getImageUrl(user.image)}
                  alt={user?.name || "User"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/default-avatar.png";
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600">
                  {user?.name?.charAt(0) || "U"}
                </div>
              )}
            </div>

            {/* User Details */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-black truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email || "user@example.com"}
              </p>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="text-red-500 hover:text-red-700 p-1"
              aria-label="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
      <Toaster />
    </>
  );
};

export default Sidebar;
