/**
 * @file Token Operations Module
 *
 * This module provides functions for interacting with ERC20 tokens on the blockchain
 * using Dynamic.xyz and Viem. It supports standard operations like checking balances,
 * transferring tokens, and managing allowances.
 *
 * The module supports two transfer methods:
 * 1. Standard transfers using Dynamic's Viem extension
 * 2. Gasless transfers using ZeroDev's account abstraction
 *
 * @example
 * // Get token balance
 * const balance = await getTokenBalance(wallet, token);
 * console.log(`Balance: ${balance.formattedBalance} ${token.label}`);
 *
 * // Transfer tokens (standard)
 * const result = await transferToken(wallet, recipientAddress, '10.5', token);
 * if (result.success) {
 *   console.log(`Transfer successful: ${result.transactionHash}`);
 * }
 *
 * // Transfer tokens (gasless with ZeroDev)
 * const result = await transferTokenZeroDev(wallet, recipientAddress, '5.0', token);
 *
 * // Check allowance
 * const allowance = await checkTokenAllowance(wallet, spenderAddress, token);
 *
 * // Approve spender
 * const approval = await approveTokenSpender(wallet, spenderAddress, '100', token);
 */

import { type BaseWallet } from '@dynamic-labs/types';
import type { Address } from 'viem';
import { encodeFunctionData, formatUnits, parseUnits } from 'viem';

import type { Token } from '@/lib/tokens';
import { dynamicClient } from '@/modules/dynamic/dynamic-client';

/**
 * Standard ERC20 ABI for the functions we need
 * This includes the essential methods for token operations:
 * - balanceOf: Check token balance
 * - transfer: Send tokens
 * - allowance: Check spending permissions
 * - approve: Grant spending permissions
 */
const erc20Abi = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: 'balance', type: 'uint256' }],
  },
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: 'success', type: 'bool' }],
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: 'remaining', type: 'uint256' }],
  },
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: 'success', type: 'bool' }],
  },
] as const;

/**
 * Result of a token balance query
 * @typedef {Object} TokenBalanceResult
 * @property {string} balance - The token balance as a string
 * @property {bigint} balanceRaw - The raw token balance as a bigint
 * @property {string} formattedBalance - The formatted token balance as a string
 * @property {Token} token - The token object
 */
export type TokenBalanceResult = {
  balance: string;
  balanceRaw: bigint;
  formattedBalance: string;
  token: Token;
};

/**
 * Result of a token transfer operation
 *
 * @typedef {Object} TokenTransferResult
 * @property {boolean} success - Whether the transfer was successful
 * @property {string} [transactionHash] - The hash of the transaction if successful
 * @property {Error} [error] - Error object if the transfer failed
 */
export type TokenTransferResult = {
  success: boolean;
  transactionHash?: string;
  error?: Error;
};

/**
 * Get the balance of a token for a wallet
 *
 * @param wallet - The wallet to check the balance for
 * @param token - The token to check the balance of
 * @returns A TokenBalanceResult object with the balance information or null if parameters are invalid
 *
 * @example
 * // Get the balance of USDC for the primary wallet
 * const balance = await getTokenBalance(primaryWallet, merchantToken);
 * if (balance) {
 *   console.log(`Balance: ${balance.formattedBalance} ${token.label}`);
 * }
 */
export async function getTokenBalance(wallet: BaseWallet, token: Token): Promise<TokenBalanceResult | null> {
  try {
    if (!wallet?.address || !token?.address) {
      return null;
    }

    // Create a public client using the token's network chain
    const publicClient = dynamicClient.viem.createPublicClient({
      chain: token.network.chain,
    });

    // Get the raw balance
    const balanceRaw = await publicClient.readContract({
      address: token.address as Address,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [wallet.address as Address],
    });

    // Format the balance according to the token's decimal places
    const balance = formatUnits(balanceRaw, token.decimal);

    // Create a nicely formatted balance string with limited decimal places
    const formattedBalance = Number(balance).toFixed(Math.min(token.maxDecimals, token.decimal));

    return {
      balance,
      balanceRaw,
      formattedBalance,
      token,
    };
  } catch (error) {
    console.error('Error getting token balance:', error);
    return null;
  }
}

/**
 * Transfer tokens from the user's wallet to another address using standard transaction
 *
 * @param fromWallet - The wallet to send tokens from
 * @param toAddress - The recipient address
 * @param amount - The amount of tokens to send as a string (e.g., "10.5")
 * @param token - The token to transfer
 * @returns A TokenTransferResult object with the transaction status
 *
 * @example
 * // Transfer 5 USDC to a recipient
 * const result = await transferToken(
 *   primaryWallet,
 *   "0x1234...5678",
 *   "5.0",
 *   merchantToken
 * );
 *
 * if (result.success) {
 *   console.log(`Transfer successful: ${result.transactionHash}`);
 * } else {
 *   console.error(`Transfer failed: ${result.error?.message}`);
 * }
 */
// eslint-disable-next-line max-params
export async function transferToken(
  fromWallet: BaseWallet,
  toAddress: string,
  amount: string,
  token: Token
): Promise<TokenTransferResult> {
  try {
    if (!fromWallet?.address || !token?.address || !amount) {
      throw new Error('Missing required parameters for transfer');
    }

    // Parse the amount to the token's decimal places
    const amountInWei = parseUnits(amount, token.decimal);

    // Create a wallet client for sending transactions
    const walletClient = await dynamicClient.viem.createWalletClient({
      wallet: fromWallet,
    });

    if (!walletClient) {
      throw new Error('Could not get wallet client');
    }

    const publicClient = dynamicClient.viem.createPublicClient({
      chain: token.network.chain,
    });

    // Send the transaction
    const hash = await walletClient.writeContract({
      address: token.address as Address,
      abi: erc20Abi,
      functionName: 'transfer',
      args: [toAddress as Address, amountInWei],
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    return {
      success: true,
      transactionHash: receipt.receipt.transactionHash,
    };
  } catch (error) {
    console.error('Error transferring tokens:', error);
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * Transfer tokens from the user's wallet to another address using ZeroDev's account abstraction
 * for gasless transactions (user doesn't pay gas fees)
 *
 * @param fromWallet - The wallet to send tokens from
 * @param toAddress - The recipient address
 * @param amount - The amount of tokens to send as a string (e.g., "10.5")
 * @param token - The token to transfer
 * @returns A TokenTransferResult object with the transaction status
 *
 * @example
 * // Transfer 5 USDC to a recipient without requiring gas fees from the user
 * const result = await transferTokenZeroDev(
 *   primaryWallet,
 *   "0x1234...5678",
 *   "5.0",
 *   merchantToken
 * );
 *
 * if (result.success) {
 *   console.log(`Gasless transfer successful: ${result.transactionHash}`);
 * } else {
 *   console.error(`Transfer failed: ${result.error?.message}`);
 * }
 *
 * @requires Environment variables:
 * - EXPO_PUBLIC_ZERODEV_RPC: ZeroDev bundler RPC URL
 * - EXPO_PUBLIC_ZERODEV_PAYMASTER: ZeroDev paymaster URL (for gasless transactions)
 */
// eslint-disable-next-line max-params
export async function transferTokenZeroDev(
  fromWallet: BaseWallet,
  toAddress: string,
  amount: string,
  token: Token
): Promise<TokenTransferResult> {
  try {
    if (!process.env.EXPO_PUBLIC_ZERODEV_RPC) {
      throw new Error('Missing ZERODEV_RPC');
    }

    if (!process.env.EXPO_PUBLIC_ZERODEV_PAYMASTER) {
      throw new Error('Missing ZERODEV_PAYMASTER');
    }

    if (!fromWallet?.address || !token?.address || !amount) {
      throw new Error('Missing required parameters for transfer');
    }

    // Parse the amount to the token's decimal places
    const amountInWei = parseUnits(amount, token.decimal);

    // Create a wallet client for sending transactions
    const kernelClient = await dynamicClient.zeroDev.createKernelClient({
      wallet: fromWallet,
      chainId: token.network.chain.id,
      bundlerRpc: `${process.env.EXPO_PUBLIC_ZERODEV_RPC}/chain/${token.network.chain.id}`,
      paymasterRpc: process.env.EXPO_PUBLIC_ZERODEV_PAYMASTER
        ? `${process.env.EXPO_PUBLIC_ZERODEV_PAYMASTER}/chain/${token.network.chain.id}`
        : undefined,
    });

    if (!kernelClient) {
      throw new Error('Could not get wallet client');
    }

    // Send the transaction

    const userOpHash = await kernelClient.sendUserOperation({
      callData: await kernelClient.account.encodeCalls([
        {
          to: token.address as Address,
          value: BigInt(0),
          data: encodeFunctionData({
            abi: erc20Abi,
            functionName: 'transfer',
            args: [toAddress as Address, amountInWei],
          }),
        },
      ]),
    });
    /* const userOpHash = await kernelClient.sendUserOperation({
      callData: await kernelClient.account.encodeCalls([
        {
          data: '0x',
          to: zeroAddress,
          value: BigInt(0),
        },
        {
          data: '0x',
          to: zeroAddress,
          value: BigInt(0),
        },
      ]),
    }); */

    console.log('Sent UserOperation with hash:', userOpHash);
    const receipt = await kernelClient.waitForUserOperationReceipt({ hash: userOpHash });
    console.log('Transaction confirmed! Hash:', receipt.receipt.transactionHash);

    return {
      success: true,
      transactionHash: receipt.receipt.transactionHash,
    };
  } catch (error) {
    console.error('Error transferring tokens:', error);
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * Check if the user has approved a spender to use their tokens
 *
 * @param wallet - The wallet to check allowance for
 * @param spenderAddress - The address of the spender to check allowance for
 * @param token - The token to check allowance for
 * @returns The allowance amount as a formatted string, or '0' if there's an error
 *
 * @example
 * // Check if a smart contract is allowed to spend tokens on behalf of the user
 * const allowance = await checkTokenAllowance(
 *   primaryWallet,
 *   contractAddress,
 *   merchantToken
 * );
 * console.log(`Contract can spend ${allowance} ${token.label}`);
 */
export async function checkTokenAllowance(wallet: BaseWallet, spenderAddress: string, token: Token): Promise<string> {
  try {
    if (!wallet?.address || !token?.address) {
      return '0';
    }

    const publicClient = dynamicClient.viem.createPublicClient({
      chain: token.network.chain,
    });

    const allowanceRaw = await publicClient.readContract({
      address: token.address as Address,
      abi: erc20Abi,
      functionName: 'allowance',
      args: [wallet.address as Address, spenderAddress as Address],
    });

    return formatUnits(allowanceRaw, token.decimal);
  } catch (error) {
    console.error('Error checking token allowance:', error);
    return '0';
  }
}

/**
 * Approve a spender to use tokens on behalf of the user
 *
 * @param wallet - The wallet granting approval
 * @param spenderAddress - The address of the spender to approve
 * @param amount - The amount of tokens to approve as a string (e.g., "10.5")
 * @param token - The token to approve spending for
 * @returns A TokenTransferResult object with the transaction status
 *
 * @example
 * // Approve a smart contract to spend 100 tokens on behalf of the user
 * const result = await approveTokenSpender(
 *   primaryWallet,
 *   contractAddress,
 *   "100",
 *   merchantToken
 * );
 *
 * if (result.success) {
 *   console.log(`Approval successful: ${result.transactionHash}`);
 * } else {
 *   console.error(`Approval failed: ${result.error?.message}`);
 * }
 */
// eslint-disable-next-line max-params
export async function approveTokenSpender(
  wallet: BaseWallet,
  spenderAddress: string,
  amount: string,
  token: Token
): Promise<TokenTransferResult> {
  try {
    if (!wallet?.address || !token?.address || !amount) {
      throw new Error('Missing required parameters for approval');
    }

    // Parse the amount to the token's decimal places
    const amountInWei = parseUnits(amount, token.decimal);

    // Create a wallet client for sending transactions
    const walletClient = await dynamicClient.viem.createWalletClient({
      wallet,
    });

    if (!walletClient) {
      throw new Error('Could not get wallet client');
    }

    // Send the approval transaction
    const hash = await walletClient.writeContract({
      address: token.address as Address,
      abi: erc20Abi,
      functionName: 'approve',
      args: [spenderAddress as Address, amountInWei],
    });

    return {
      success: true,
      transactionHash: hash,
    };
  } catch (error) {
    console.error('Error approving token spender:', error);
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * Generate a URL to view a transaction on a block explorer
 *
 * @param transactionHash - The hash of the transaction to view
 * @param token - The token object containing network information
 * @returns A URL to view the transaction on the appropriate block explorer
 *
 * @example
 * // Generate a URL to view a transaction on Etherscan
 * const url = getTransactionUrl("0x1234...5678", merchantToken);
 * console.log(`View transaction: ${url}`);
 */
export function getTransactionUrl(transactionHash: string, token: Token): string {
  return `${token.network.transactionUrl}/${transactionHash}`;
}
