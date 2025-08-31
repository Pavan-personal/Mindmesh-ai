import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { WalletConnect } from "./WalletConnect";
import { useWallet } from "@/hooks/useWallet";
import { useAuth } from "@/contexts/AuthContext";

interface WalletCheckProps {
  onProceed: () => void;
  children?: React.ReactNode;
}

export function WalletCheck({ onProceed, children }: WalletCheckProps) {
  const [showWalletDialog, setShowWalletDialog] = useState(false);
  const { isConnected, address, isBaseSepolia } = useWallet();
  const { user } = useAuth();

  const handleWalletConnected = () => {
    // Wallet connected, user can now proceed
  };

  const handleProceed = () => {
    if (!isConnected || !isBaseSepolia) {
      setShowWalletDialog(true);
      return;
    }
    onProceed();
  };

  if (!isConnected || !isBaseSepolia) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Wallet Required</h3>
          <p className="text-gray-600 mb-4">
            Please connect your wallet to Base Sepolia network to continue
          </p>
          <Button
            onClick={() => setShowWalletDialog(true)}
            className="bg-black text-white hover:bg-gray-800"
          >
            Connect Wallet
          </Button>
        </div>
        
        <WalletConnect
          isOpen={showWalletDialog}
          onClose={() => setShowWalletDialog(false)}
          onWalletConnected={handleWalletConnected}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-green-800">Wallet Connected</h3>
        <p className="text-gray-600 mb-2">
          Address: {address?.slice(0, 6)}...{address?.slice(-4)}
        </p>
        <p className="text-green-700 text-sm">✓ Base Sepolia Network</p>
      </div>
      
      {children}
    </div>
  );
}
