import React, { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { googleLogout } from "@react-oauth/google";
import { api } from "@/lib/api";

interface AuthContextType {
  user: any;
  login: (response: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUserWallet: (walletAddress: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  logout: async () => {},
  updateUserWallet: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        try {
          const res = await api.get("/protected");
          setUser(res.data.user);
        } catch (error) {
          localStorage.removeItem("token");
          delete api.defaults.headers.common["Authorization"];
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (response: any) => {
    try {
      // Extract user info
      let email: string, name: string, googleId: string, picture: string;

      if (response.userInfo) {
        // Using useGoogleLogin approach
        email = response.userInfo.email;
        name = response.userInfo.name;
        googleId = response.userInfo.sub;
        picture = response.userInfo.picture;
      } else {
        // Using credential approach
        const decoded = jwtDecode(response.credential) as any;
        email = decoded.email;
        name = decoded.name;
        googleId = decoded.sub;
        picture = decoded.picture;
      }

      // Send to backend
      const res = await api.post("/auth/google", {
        token: response.credential || response.access_token,
        email,
        name,
        googleId,
        image: picture,
      });

      localStorage.setItem("token", res.data.token);
      api.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;

      const userRes = await api.get("/protected");
      setUser(userRes.data.user);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const logout = async () => {
    try {
      await api.post("/logout");
      localStorage.removeItem("token");
      delete api.defaults.headers.common["Authorization"];
      googleLogout();
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const updateUserWallet = async (walletAddress: string) => {
    try {
      const res = await api.post("/auth/wallet", {
        walletAddress,
        userId: user?.id
      });
      
      if (res.data.success) {
        // Update user state with new data from backend
        setUser(res.data.user);
        
        // Update the API authorization header with new token if provided
        if (res.data.token) {
          localStorage.setItem("token", res.data.token);
          api.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
        }
      }
    } catch (error) {
      console.error("Error updating wallet:", error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUserWallet }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
