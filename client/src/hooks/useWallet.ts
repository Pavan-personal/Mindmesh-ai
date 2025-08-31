import { useAccount, useChainId } from "wagmi";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export function useWallet() {
  const { user, updateUserWallet } = useAuth();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  
  // Check if we're on Base networks (both Sepolia and mainnet)
  const isBaseSepolia = chainId === 84532;
  const isBaseMainnet = chainId === 8453;
  const isBaseNetwork = isBaseSepolia || isBaseMainnet;

  // Update wallet address in database when wallet connects or changes
  useEffect(() => {
    if (isConnected && address && user) {
      // Sync if no wallet address or if wallet address changed
      if (!user.walletAddress || user.walletAddress !== address) {
        console.log("🔄 Auto-updating wallet address in database:", {
          current: user.walletAddress,
          new: address,
          action: !user.walletAddress ? "initial sync" : "address change"
        });
        updateUserWallet(address).catch(error => {
          console.error("Failed to auto-update wallet address:", error);
        });
      }
    }
  }, [isConnected, address, user, updateUserWallet]);

  return {
    isConnected,
    address,
    chainId,
    isBaseSepolia,
    isBaseMainnet,
    isBaseNetwork,
  };
}
