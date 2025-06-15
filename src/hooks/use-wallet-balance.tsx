'use client';

import { useCallback, useEffect, useState } from 'react';
import { type Address, formatEther } from 'viem';
import { mainnet } from 'viem/chains';

import { dynamicClient } from '@/modules/dynamic/dynamic-client';

const publicViemClient = dynamicClient.viem.createPublicClient({ chain: mainnet });

export const useWalletBalance = (address: Address) => {
  const [balance, setBalance] = useState<string>('0.00');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const walletBalance = await publicViemClient.getBalance({ address });
      const formattedBalance = formatEther(BigInt(walletBalance || '0'));
      setBalance(Number.parseFloat(formattedBalance).toFixed(4));
    } catch (err) {
      console.error('Error fetching balance:', err);
      setError('Failed to fetch balance');
      setBalance('0.00');
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return {
    balance,
    isLoading,
    error,
    refetch: fetchBalance,
  };
};
