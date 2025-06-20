/**
 * Hook for handling token transfers
 *
 * This hook provides functions for transferring tokens using both standard
 * and gasless (ZeroDev) methods, with loading and error state management.
 */

import { useCallback, useMemo, useState } from 'react';
import { type Address } from 'viem';

import { useDynamic } from '@/modules/dynamic/dynamic-client';
import { type TokenTransferResult, transferToken, transferTokenZeroDev } from '@/modules/dynamic/token-operations';
import { useApp } from '@/providers/app.provider';

type TransferStatus = {
  isLoading: boolean;
  error: string | null;
  transactionHash: string | null;
  success: boolean;
};

type UseTokenTransferResult = {
  isAbleToTransfer: boolean;
  transfer: (toAddress: Address, amount: string, useGasless?: boolean) => Promise<TokenTransferResult>;
  status: TransferStatus;
  resetStatus: () => void;
};

/**
 * Hook to handle token transfers with loading and error states
 *
 * @returns Object containing transfer function, transfer status, and reset function
 *
 * @example
 * const { transfer, status, resetStatus } = useTokenTransfer();
 *
 * // Transfer tokens in a component
 * const handleTransfer = async () => {
 *   const result = await transfer('0x1234...5678', '10.5', true); // true for gasless
 *   if (result.success) {
 *     console.log('Transfer successful!');
 *   }
 * };
 *
 * // Display status in component
 * return (
 *   <View>
 *     {status.isLoading && <ActivityIndicator />}
 *     {status.error && <Text className="text-red-500">{status.error}</Text>}
 *     {status.success && (
 *       <Text className="text-green-500">
 *         Transfer successful! Tx: {status.transactionHash}
 *       </Text>
 *     )}
 *     <Button onPress={handleTransfer} disabled={status.isLoading}>
 *       Transfer Tokens
 *     </Button>
 *   </View>
 * );
 */
export function useTokenTransfer(): UseTokenTransferResult {
  const { merchantToken } = useApp();
  const { wallets } = useDynamic();

  const [status, setStatus] = useState<TransferStatus>({
    isLoading: false,
    error: null,
    transactionHash: null,
    success: false,
  });

  /**
   * Reset the transfer status
   */
  const resetStatus = useCallback(() => {
    setStatus({
      isLoading: false,
      error: null,
      transactionHash: null,
      success: false,
    });
  }, []);

  /**
   * Transfer tokens to an address
   *
   * @param toAddress - Recipient address
   * @param amount - Amount to transfer as a string
   * @param useGasless - Whether to use gasless transactions via ZeroDev
   * @returns Result of the transfer operation
   */
  const transfer = useCallback(
    async (toAddress: Address, amount: string, useGasless = false): Promise<TokenTransferResult> => {
      if (!wallets.primary || !merchantToken) {
        const error = new Error('Wallet or token not available');
        setStatus({
          isLoading: false,
          error: error.message,
          transactionHash: null,
          success: false,
        });
        return { success: false, error };
      }

      setStatus({
        isLoading: true,
        error: null,
        transactionHash: null,
        success: false,
      });

      try {
        // Use either standard or gasless transfer based on parameter
        const result = useGasless
          ? await transferTokenZeroDev(wallets.primary, toAddress, amount, merchantToken)
          : await transferToken(wallets.primary, toAddress, amount, merchantToken);

        setStatus({
          isLoading: false,
          error: null,
          transactionHash: result.transactionHash || null,
          success: result.success,
        });

        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to transfer tokens';
        setStatus({
          isLoading: false,
          error: errorMessage,
          transactionHash: null,
          success: false,
        });
        return {
          success: false,
          error: err instanceof Error ? err : new Error(errorMessage),
        };
      }
    },
    [wallets.primary, merchantToken]
  );

  const isAbleToTransfer = useMemo(() => {
    return !!(wallets.primary && merchantToken);
  }, [wallets.primary, merchantToken]);
  return {
    isAbleToTransfer,
    transfer,
    status,
    resetStatus,
  };
}
