import { Blocklock } from "blocklock-js";
import { Provider, ethers } from "ethers";

export class BlocklockService {
  private provider: Provider;

  // Base Sepolia configuration from MyDefiNominee
  private static readonly BASE_SEPOLIA_CONFIG = {
    chainId: 84532,
    blockTime: 1, // 1 second per block
    gasLimit: 100_000,
    maxFeePerGas: ethers.parseUnits("0.2", "gwei"),
    maxPriorityFeePerGas: ethers.parseUnits("0.2", "gwei"),
    callbackGasLimitDefault: 1_000_000,
    gasMultiplierDefault: 10,
    gasBufferPercent: 100,
    blocklockAddress: "0x82Fed730CbdeC5A2D8724F2e3b316a70A565e27e"
  };

  // Contract addresses from MyDefiNominee
  private static readonly CONTRACT_ADDRESS_BASE_SEPOLIA = "0x6913a0E073e9009e282b7C5548809Ac8274f2e9B";

  constructor(rpcUrl: string) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
  }

  // Get current block number
  async getCurrentBlock(): Promise<string> {
    try {
      const currentBlock = await this.provider.getBlockNumber();
      return currentBlock.toString();
    } catch (error) {
      console.error('Error getting current block:', error);
      return "0";
    }
  }

  // Calculate target block for exam start time
  async calculateTargetBlock(examStartTime: Date): Promise<string> {
    try {
      const now = new Date();
      const timeDiff = examStartTime.getTime() - now.getTime();
      const secondsDiff = Math.ceil(timeDiff / 1000);
      
      // Base Sepolia: 1 block per second
      const targetBlocks = secondsDiff;
      
      // Get current block and add target blocks
      const currentBlock = await this.provider.getBlockNumber();
      const targetBlock = currentBlock + targetBlocks;
      
      console.log('🎯 Target block calculation:', {
        now: now.toISOString(),
        examStartTime: examStartTime.toISOString(),
        timeDiffSeconds: secondsDiff,
        currentBlock: currentBlock.toString(),
        targetBlock: targetBlock.toString()
      });
      
      return targetBlock.toString();
      
    } catch (error) {
      console.error('Error calculating target block:', error);
      // Fallback: add 1000 blocks (roughly 16.7 minutes)
      const currentBlock = await this.provider.getBlockNumber();
      return (currentBlock + 1000).toString();
    }
  }

  // Check if decryption is ready
  async isDecryptionReady(targetBlock: string): Promise<boolean> {
    try {
      const currentBlock = await this.provider.getBlockNumber();
      const isReady = currentBlock >= parseInt(targetBlock);
      
      console.log('🔓 Decryption readiness check:', {
        currentBlock: currentBlock.toString(),
        targetBlock: targetBlock,
        isReady: isReady
      });
      
      return isReady;
    } catch (error) {
      console.error('Error checking decryption readiness:', error);
      return false;
    }
  }

  // Get transaction price estimate (for user to pay) - using MyDefiNominee pattern
  async calculateTransactionPrice(): Promise<string> {
    try {
      console.log('💰 Calculating transaction price estimate...');
      
      // Get blocklock contract for price estimation
      const blocklockContract = new ethers.Contract(
        BlocklockService.BASE_SEPOLIA_CONFIG.blocklockAddress,
        [
          {
            inputs: [
              { internalType: "uint32", name: "_callbackGasLimit", type: "uint32" },
              { internalType: "uint256", name: "_requestGasPriceWei", type: "uint256" },
            ],
            name: "estimateRequestPriceNative",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
          },
        ],
        this.provider
      );

      // Estimate gas price for Base Sepolia
      const gasPrice = await this.provider.getFeeData();
      const estimatedGas = BlocklockService.BASE_SEPOLIA_CONFIG.gasLimit;
      
      // Calculate estimated cost using MyDefiNominee pattern
      const callbackGasLimit = BlocklockService.BASE_SEPOLIA_CONFIG.callbackGasLimitDefault;
      
      if (!gasPrice.maxFeePerGas) {
        throw new Error("No fee data found");
      }

      const requestPrice = await blocklockContract.estimateRequestPriceNative(
        callbackGasLimit,
        gasPrice.maxFeePerGas
      );

      const requestCallBackPrice =
        requestPrice +
        (requestPrice * BigInt(BlocklockService.BASE_SEPOLIA_CONFIG.gasBufferPercent)) / BigInt(100);
      
      console.log('💰 Transaction price estimate:', {
        requestPrice: ethers.formatEther(requestPrice),
        totalPrice: ethers.formatEther(requestCallBackPrice),
        gasPrice: ethers.formatUnits(gasPrice.maxFeePerGas, "gwei"),
        estimatedGas: estimatedGas
      });
      
      return ethers.formatEther(requestCallBackPrice);
    } catch (error) {
      console.error('Error calculating transaction price:', error);
      return '0.001'; // Fallback estimate
    }
  }

  // Get blocklock contract address for frontend
  getBlocklockContractAddress(): string {
    return BlocklockService.BASE_SEPOLIA_CONFIG.blocklockAddress;
  }

  // Get main contract address for frontend
  getMainContractAddress(): string {
    return BlocklockService.CONTRACT_ADDRESS_BASE_SEPOLIA;
  }

  // Get decryption key from blocklock contract
  async getDecryptionKey(ciphertext: string, condition: string): Promise<string> {
    try {
      console.log('🔓 Getting decryption key from blocklock contract...');
      
      // This would call the real blocklock contract to get the decryption key
      // For now, we'll return a placeholder since this requires the actual contract interaction
      
      console.log('📊 Decryption request:', {
        ciphertextLength: ciphertext.length,
        condition: condition
      });
      
      // TODO: Implement real contract call to get decryption key
      // This would involve calling the blocklock contract's decryption method
      
      throw new Error('Real blocklock decryption not yet implemented on server side. Use client-side decryption.');
      
    } catch (error) {
      console.error('❌ Error getting decryption key:', error);
      throw error;
    }
  }

  // Get network configuration for frontend
  getNetworkConfig() {
    return BlocklockService.BASE_SEPOLIA_CONFIG;
  }
}

