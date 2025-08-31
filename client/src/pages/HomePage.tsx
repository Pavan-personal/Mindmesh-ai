import React from "react";
import { Navigate } from "react-router-dom";
import Banner from "./Index";
import { useAuth } from "@/contexts/AuthContext";

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div>
      {!user ? (
        <>
          <Banner />
        </>
      ) : (
        <Navigate to="/new" />
      )}
    </div>
  );
};

export default HomePage;