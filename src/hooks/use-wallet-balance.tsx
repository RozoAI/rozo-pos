import { useCallback, useEffect, useState } from 'react';

import { getTokenBalance, type TokenBalanceResult } from '@/modules/dynamic/token-operations';
import { useApp } from '@/providers/app.provider';

type UseWalletBalanceResult = {
  balance: TokenBalanceResult | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useWalletBalance(): UseWalletBalanceResult {
  const { primaryWallet, merchantToken } = useApp();

  const [balance, setBalance] = useState<TokenBalanceResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!primaryWallet || !merchantToken) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (primaryWallet && merchantToken) {
        const balance = await getTokenBalance(primaryWallet, merchantToken);
        setBalance(balance);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch balance');
    } finally {
      setIsLoading(false);
    }
  }, [primaryWallet, merchantToken]);

  // Fetch balance on component mount and when dependencies change
  useEffect(() => {
    if (primaryWallet || merchantToken) {
      fetchBalance();
    }
  }, []);

  return {
    balance,
    isLoading,
    error,
    refetch: fetchBalance,
  };
}
