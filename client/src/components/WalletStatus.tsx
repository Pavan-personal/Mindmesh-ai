import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { WalletConnect } from "./WalletConnect";
import { useWallet } from "@/hooks/useWallet";
import { useAuth } from "@/contexts/AuthContext";

interface WalletStatusProps {
  onWalletConnected: () => void;
}

export function WalletStatus({ onWalletConnected }: WalletStatusProps) {
  const [showWalletDialog, setShowWalletDialog] = useState(false);
  const { isConnected, address, isBaseSepolia } = useWallet();
  const { user } = useAuth();

  const handleWalletConnected = () => {
    onWalletConnected();
  };

  if (!isConnected) {
    return (
      <div className="text-center space-y-4">
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Wallet Not Connected</h3>
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

  if (!isBaseSepolia) {
    return (
      <div className="text-center space-y-4">
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Wrong Network</h3>
          <p className="text-gray-600 mb-4">
            Please switch to Base Sepolia network to continue
          </p>
          <Button
            onClick={() => setShowWalletDialog(true)}
            className="bg-black text-white hover:bg-gray-800"
          >
            Switch Network
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
    <div className="text-center space-y-4">
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-green-800">Wallet Connected</h3>
        <p className="text-gray-600 mb-2">
          Address: {address?.slice(0, 6)}...{address?.slice(-4)}
        </p>
        <p className="text-green-700 text-sm">✓ Base Sepolia Network</p>
      </div>
    </div>
  );
}
