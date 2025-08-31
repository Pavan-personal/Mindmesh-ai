import React from "react";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { Button } from "@mui/material";
import GoogleIcon from "../assets/search.png";
import { useAuth } from "../contexts/AuthContext";

export const GoogleLoginButton = ({
  Element,
}: {
  Element?: React.ComponentType<{ onClick: () => void }>;
}): JSX.Element => {
  const { login } = useAuth();

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      // Get user profile info
      try {
        const userInfo = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
            withCredentials: false,
          }
        );

        await login({
          credential: tokenResponse.access_token,
          userInfo: userInfo.data,
        });
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    },
    onError: () => console.error("Login failed"),
  });

  return Element ? (
    <Element
      onClick={() => {
        handleGoogleLogin();
      }}
    />
  ) : (
    <Button
      variant="contained"
      startIcon={<img src={GoogleIcon} alt="Google" width={24} height={24} />}
      onClick={() => handleGoogleLogin()}
      sx={{
        width: "100%",
        bgcolor: "black",
        color: "white",
        textTransform: "none",
        fontWeight: 600,
        py: 1.5,
        px: 3,
        borderRadius: 2,
        boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
        "&:hover": {
          bgcolor: "#333",
        },
      }}
    >
      Continue with Google
    </Button>
  );
};