import { useState, useCallback } from 'react';
import { Blocklock, encodeCiphertextToSolidity, encodeCondition } from 'blocklock-js';
import { ethers, getBytes } from 'ethers';
import { useEthersSigner, useEthersProvider } from './useEthers';
import { useAccount } from 'wagmi';
import { useNetworkConfig } from './useNetworkConfig';
import { BLOCKLOCK_CONTRACT_ABI, CONTRACT_ABI } from '@/lib/contract';

export function useBlocklock() {
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [encryptionError, setEncryptionError] = useState<string | null>(null);
  const signer = useEthersSigner();
  const provider = useEthersProvider();
  const { chainId } = useAccount();
  const { CONTRACT_ADDRESS, secondsPerBlock, gasConfig } = useNetworkConfig();

  const encryptData = useCallback(async (
    data: string,
    blocksAhead: string,
    onSuccess?: (result: any) => void
  ) => {
    if (!signer || !provider || !chainId) {
      throw new Error("Please connect your wallet");
    }

    setIsEncrypting(true);
    setEncryptionError(null);

    try {
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );

      // Calculate target block height based on blocks ahead
      const currentBlock = await provider.getBlockNumber();

      const blocksToAdd = Number(blocksAhead);
      if (Number.isNaN(blocksToAdd) || blocksToAdd <= 0) {
        throw new Error("Please enter a valid number of blocks ahead");
      }

      const blockHeight = BigInt(currentBlock + blocksToAdd);
      console.log(
        `Current block: ${currentBlock}, Target block: ${blockHeight.toString()}`
      );

      // Set the message to encrypt
      const msgBytes = ethers.AbiCoder.defaultAbiCoder().encode(
        ["string"],
        [data]
      );
      const encodedMessage = getBytes(msgBytes);
      console.log("Encoded message:", encodedMessage);

      // Encrypt the encoded message using Blocklock.js library
      const blocklockjs = Blocklock.createFromChainId(signer, chainId);
      const cipherMessage = blocklockjs.encrypt(encodedMessage, blockHeight);
      console.log("Ciphertext:", cipherMessage);

      const callbackGasLimit = gasConfig.callbackGasLimitDefault;

      const feeData = await provider.getFeeData();

      if (!feeData.maxFeePerGas) {
        throw new Error("No fee data found");
      }

      const blocklockContract = new ethers.Contract(
        gasConfig.blocklockAddress,
        BLOCKLOCK_CONTRACT_ABI,
        signer
      );

      const requestPrice = (await blocklockContract.estimateRequestPriceNative(
        callbackGasLimit,
        feeData.maxFeePerGas
      )) as bigint;

      const requestCallBackPrice =
        requestPrice +
        (requestPrice * BigInt(gasConfig.gasBufferPercent)) / BigInt(100);

      console.log(
        "Request CallBack price:",
        ethers.formatEther(requestCallBackPrice),
        "ETH"
      );

      const conditionBytes = encodeCondition(blockHeight);

      const tx = await contract.createTimelockRequestWithDirectFunding(
        callbackGasLimit,
        currentBlock,
        blockHeight,
        conditionBytes,
        encodeCiphertextToSolidity(cipherMessage),
        { value: requestCallBackPrice }
      );

      await tx.wait(2);

      console.log("Transaction sent:", tx);

      // Get request ID from receipt exactly like MyDefiNominee
      const requestId = tx.hash; // Using transaction hash as request ID

      console.log("Request ID:", requestId);
      console.log("Ciphertext:", cipherMessage);

      // Call success callback
      if (onSuccess) {
        onSuccess({
          requestId: requestId,
          ciphertext: cipherMessage,
          blocksAhead: blocksAhead,
          transactionHash: tx.hash
        });
      }

      return {
        success: true,
        requestId: requestId,
        ciphertext: cipherMessage,
        blocksAhead: blocksAhead,
        message: 'Data encrypted successfully with real blocklock!',
        transactionHash: tx.hash
      };

    } catch (error: any) {
      console.error('❌ Blocklock encryption error:', error);
      const errorMessage = `Encryption failed: ${error.message}`;
      setEncryptionError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsEncrypting(false);
    }
  }, [signer, provider, chainId, CONTRACT_ADDRESS, gasConfig]);

  const decryptData = useCallback(async (
    requestId: string,
    onSuccess?: (result: any) => void
  ) => {
    if (!signer || !provider || !chainId) {
      throw new Error('Wallet not connected');
    }

    try {
      const blocklockjs = Blocklock.createFromChainId(signer, chainId);

      console.log('🔓 Starting REAL blocklock decryption...', {
        requestId: requestId
      });

      // REAL blocklock decryption using MyDefiNominee pattern
      const decryptedData = await blocklockjs.decryptWithId(BigInt(requestId));

      if (decryptedData) {
        const decryptedString = new TextDecoder().decode(decryptedData);
        console.log('✅ Blocklock decryption successful:', {
          requestId: requestId,
          dataLength: decryptedData.length
        });

        // Call success callback
        if (onSuccess) {
          onSuccess({
            requestId: requestId,
            decryptedData: decryptedString
          });
        }

        return {
          success: true,
          decryptedData: decryptedString,
          message: 'Data decrypted successfully with real blocklock!'
        };
      } else {
        throw new Error('Decryption key not yet available - target block not reached');
      }

    } catch (error: any) {
      console.error('❌ Blocklock decryption error:', error);
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }, [signer, provider, chainId]);

  return {
    encryptData,
    decryptData,
    isEncrypting,
    encryptionError,
    isNetworkSupported: !!CONTRACT_ADDRESS
  };
}
