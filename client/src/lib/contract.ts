import { ethers } from "ethers";

export const CONTRACT_ADDRESS_FILECOIN =
  "0x2Eb638C8d78673A14322aBE1d0317AD32F3f5249";

export const CONTRACT_ADDRESS_CALIBRATION =
  "0x0F75cB85debC7A32a8B995362F28393E84ABABA6";

export const CONTRACT_ADDRESS_ARBITRUM_SEPOLIA =
  "0xBCF043CFB1D15cbAa22075B5FDA0554E3410Fa04";
export const CONTRACT_ADDRESS_OPTIMISM_SEPOLIA =
  "0x77d0A7cBa96AA6d739BEc63Ac53602c0f30a7947";
export const CONTRACT_ADDRESS_BASE_SEPOLIA =
  "0x6913a0E073e9009e282b7C5548809Ac8274f2e9B";

export const CHAIN_ID_TO_ADDRESS = {
  "314": CONTRACT_ADDRESS_FILECOIN,
  "314159": CONTRACT_ADDRESS_CALIBRATION,
  "421614": CONTRACT_ADDRESS_ARBITRUM_SEPOLIA,
  "11155420": CONTRACT_ADDRESS_OPTIMISM_SEPOLIA,
  "84532": CONTRACT_ADDRESS_BASE_SEPOLIA,
};

export const CHAIN_ID_BLOCK_TIME = {
  "314": 30,
  "314159": 30,
  "421614": 1,
  "11155420": 2,
  "84532": 1,
};

export const CHAIN_ID_GAS_CONFIG = {
  "137": {
    gasLimit: 10_000,
    maxFeePerGas: ethers.parseUnits("0.2", "gwei"),
    maxPriorityFeePerGas: ethers.parseUnits("0.2", "gwei"),
    gasBufferPercent: 100,
    callbackGasLimitDefault: 100_000,
    gasMultiplierDefault: 10,
    blocklockAddress: "0x82Fed730CbdeC5A2D8724F2e3b316a70A565e27e",
  },
  "314": {
    gasLimit: 5_000_000,
    maxFeePerGas: ethers.parseUnits("0.2", "gwei"),
    maxPriorityFeePerGas: ethers.parseUnits("0.2", "gwei"),
    gasBufferPercent: 400,
    callbackGasLimitDefault: 444_000_000,
    gasMultiplierDefault: 50,
    blocklockAddress: "0x34092470CC59A097d770523931E3bC179370B44b",
  },
  "314159": {
    gasLimit: 5_000_000,
    maxFeePerGas: ethers.parseUnits("0.2", "gwei"),
    maxPriorityFeePerGas: ethers.parseUnits("0.2", "gwei"),
    gasBufferPercent: 400,
    callbackGasLimitDefault: 444_000_000,
    gasMultiplierDefault: 50,
    blocklockAddress: "0xF00aB3B64c81b6Ce51f8220EB2bFaa2D469cf702",
  },
  "421614": {
    gasLimit: 100_000,
    maxFeePerGas: ethers.parseUnits("0.2", "gwei"),
    maxPriorityFeePerGas: ethers.parseUnits("0.2", "gwei"),
    gasBufferPercent: 100,
    callbackGasLimitDefault: 1_000_000,
    gasMultiplierDefault: 10,
    blocklockAddress: "0xd22302849a87d5B00f13e504581BC086300DA080",
  },
  "11155420": {
    gasLimit: 100_000,
    maxFeePerGas: ethers.parseUnits("0.2", "gwei"),
    maxPriorityFeePerGas: ethers.parseUnits("0.2", "gwei"),
    gasBufferPercent: 100,
    callbackGasLimitDefault: 1_000_000,
    gasMultiplierDefault: 10,
    blocklockAddress: "0xd22302849a87d5B00f13e504581BC086300DA080",
  },
  "84532": {
    gasLimit: 100_000,
    maxFeePerGas: ethers.parseUnits("0.2", "gwei"),
    maxPriorityFeePerGas: ethers.parseUnits("0.2", "gwei"),
    gasBufferPercent: 100,
    callbackGasLimitDefault: 1_000_000,
    gasMultiplierDefault: 10,
    blocklockAddress: "0x82Fed730CbdeC5A2D8724F2e3b316a70A565e27e", // ✅ Use library's default contract (has all functions)
  },
};

export const BLOCKLOCK_CONTRACT_ABI = [
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
];

export const CONTRACT_ABI = [
  {
    inputs: [
      {
        internalType: "uint32",
        name: "callbackGasLimit",
        type: "uint32",
      },
      {
        internalType: "uint32",
        name: "_encryptedAt",
        type: "uint32",
      },
      {
        internalType: "uint32",
        name: "_decryptedAt",
        type: "uint32",
      },
      {
        internalType: "bytes",
        name: "condition",
        type: "bytes",
      },
      {
        components: [
          {
            components: [
              {
                internalType: "uint256[2]",
                name: "x",
                type: "uint256[2]",
              },
              {
                internalType: "uint256[2]",
                name: "y",
                type: "uint256[2]",
              },
            ],
            internalType: "struct BLS.PointG2",
            name: "u",
            type: "tuple",
          },
          {
            internalType: "bytes",
            name: "v",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "w",
            type: "bytes",
          },
        ],
        internalType: "struct TypesLib.Ciphertext",
        name: "encryptedData",
        type: "tuple",
      },
    ],
    name: "createTimelockRequestWithDirectFunding",
    outputs: [
      {
        internalType: "uint256",
        name: "requestId",
        type: "uint256",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
];
