import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

interface WalletConnectProps {
  isOpen: boolean;
  onClose: () => void;
  onWalletConnected: () => void;
}

export function WalletConnect({ isOpen, onClose, onWalletConnected }: WalletConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, updateUserWallet } = useAuth();

  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      if (typeof window.ethereum === "undefined") {
        throw new Error("MetaMask or other wallet not found. Please install MetaMask.");
      }

      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const account = accounts[0];

      if (!account) {
        throw new Error("No account selected");
      }

      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      
      if (chainId !== "0x2105") { // Base Sepolia chain ID
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x2105" }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [{
                chainId: "0x2105",
                chainName: "Base Sepolia",
                nativeCurrency: {
                  name: "ETH",
                  symbol: "ETH",
                  decimals: 18,
                },
                rpcUrls: ["https://sepolia.base.org"],
                blockExplorerUrls: ["https://sepolia.basescan.org"],
              }],
            });
          } else {
            throw new Error("Failed to switch to Base Sepolia network");
          }
        }
      }

      // Store wallet address in user table
      await updateUserWallet(account);

      onWalletConnected();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Connect Wallet</DialogTitle>
          <DialogDescription>
            Connect your wallet to Base Sepolia network to continue
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}
          
          <Button
            onClick={connectWallet}
            disabled={isConnecting}
            className="w-full bg-black text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {isConnecting ? "Connecting..." : "Connect MetaMask"}
          </Button>
          
          <p className="text-sm text-gray-600 text-center">
            Make sure you have MetaMask installed and are connected to Base Sepolia network
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

declare global {
  interface Window {
    ethereum?: any;
  }
}
