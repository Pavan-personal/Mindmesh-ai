import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./contexts/AuthContext";
import ContextProvider from "./providers";
import HomePage from "./pages/HomePage";
import Dashboard from "./pages/DashBoard";
import QuizDashboard from "./pages/QuizDashboard";
import { ProtectedRoute } from "./components/ProtectedRoute";
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

function App() {
  if (!GOOGLE_CLIENT_ID) {
    return (
      <div className="p-8">
        Missing Google Client ID in environment variables
      </div>
    );
  }

  return (
    <ContextProvider>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route
                path="/new"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <QuizDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/auth/callback" element={<Navigate to="/" />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </GoogleOAuthProvider>
    </ContextProvider>
  );
}

export default App;
