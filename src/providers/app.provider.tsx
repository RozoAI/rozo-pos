import { type BaseWallet } from '@dynamic-labs/types';
import { useRouter } from 'expo-router';
import React, { useCallback, useContext, useMemo } from 'react';
import { createContext, useEffect, useState } from 'react';

import { PageLoader } from '@/components/loader/loader';
import { showToast, storage } from '@/lib';
import { currencies, type CurrencyConfig } from '@/lib/currencies';
import { defaultToken, type Token, tokens } from '@/lib/tokens';
import { dynamicClient, useDynamic } from '@/modules/dynamic/dynamic-client';
// eslint-disable-next-line import/no-cycle
import { useCreateProfile, useGetProfile } from '@/resources/api';
import { type MerchantProfile } from '@/resources/schema/merchant';

interface IContextProps {
  isAuthenticated: boolean;
  token: string | undefined;
  merchant: MerchantProfile | undefined;
  defaultCurrency: CurrencyConfig | undefined;
  merchantToken: Token | undefined;
  wallets: BaseWallet[];
  primaryWallet: BaseWallet | undefined;
  isAuthLoading: boolean;
  showAuthModal: () => void;
  setToken: (token: string | undefined) => void;
  setMerchant: (merchant: MerchantProfile | undefined) => void;
  logout: () => Promise<void>;
}

export const AppContext = createContext<IContextProps>({
  isAuthenticated: false,
  token: undefined,
  merchant: undefined,
  defaultCurrency: undefined,
  merchantToken: undefined,
  wallets: [],
  primaryWallet: undefined,
  isAuthLoading: false,
  showAuthModal: () => {},
  setToken: () => {},
  setMerchant: () => {},
  logout: async () => {},
});

interface IProviderProps {
  children: React.ReactNode;
}

export const TOKEN_KEY = '_auth_token';

export const AppProvider: React.FC<IProviderProps> = ({ children }) => {
  const { refetch: fetchProfile, data: profileData, error: profileError } = useGetProfile();
  const { mutateAsync: createProfile } = useCreateProfile();
  const { auth, wallets, ui } = useDynamic();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const router = useRouter();

  const [token, setToken] = useState<string | undefined>();
  const [merchant, setMerchant] = useState<MerchantProfile>();
  const [userWallets, setUserWallets] = useState<BaseWallet[]>([]);

  // Initialize the application with auth state
  const initApp = async () => {
    setIsLoading(true);
    const token = auth?.token;

    // Set token if available
    if (token) {
      setToken(token);
      storage.set(TOKEN_KEY, token);
    } else {
      // Clear token if not available
      setToken(undefined);
      storage.delete(TOKEN_KEY);
      setTimeout(() => {
        setIsLoading(false);
      }, 3000);
    }
  };

  // Handle wallet information
  const updateWalletInfo = () => {
    if (wallets?.userWallets) {
      /* const formattedWallets: UserWallet[] = wallets.userWallets.map((wallet: any) => ({
        address: wallet.address,
        chain: wallet.chain,
        walletKey: wallet.key,
        isConnected: wallet.isAuthenticated,
      })); */
      setUserWallets(wallets.userWallets);
    }
  };

  // Get primary wallet (EVM wallet by default)
  const primaryWallet = useMemo(() => {
    return userWallets.find((wallet) => wallet.chain === 'EVM');
  }, [userWallets]);

  const merchantToken = useMemo(() => {
    if (merchant?.default_token_id) {
      return tokens.find((token) => token.key === merchant?.default_token_id);
    }
    return defaultToken;
  }, [merchant]);

  // Get default currency from merchant profile
  const defaultCurrency = useMemo(() => {
    const currency = merchant?.default_currency ?? 'USD';
    return currencies[currency];
  }, [merchant]);

  // Logout function
  const logout = async () => {
    try {
      await dynamicClient.auth.logout();
      setToken(undefined);
      setMerchant(undefined);
      setUserWallets([]);
      storage.delete(TOKEN_KEY);
      router.replace('/login');
    } catch (_err) {
      showToast({
        type: 'danger',
        message: 'Failed to logout',
      });
    }
  };

  // Initialize app when auth token changes
  useEffect(() => {
    initApp();
  }, [auth?.token]);

  // Update wallet information when wallets change
  useEffect(() => {
    updateWalletInfo();
  }, [wallets?.userWallets]);

  // Fetch merchant profile when token is available
  useEffect(() => {
    if (token) {
      setIsLoading(true);
      fetchProfile();
    }
  }, [token, fetchProfile]);

  // Handle merchant profile data and errors
  useEffect(() => {
    if (profileData) {
      setIsLoading(false);
      setMerchant(profileData);
    }

    if (profileError) {
      showToast({
        type: 'danger',
        message: profileError?.message ?? 'Failed to get profile',
      });

      setIsLoading(false);
      router.replace('/error');
    }
  }, [profileData, profileError, router]);

  /**
   * Show the authentication modal
   */
  const showAuthModal = useCallback(() => {
    ui.auth.show();
  }, [ui]);

  // No longer need separate handleProfileCreationSuccess function
  // as we're handling success directly in the createMerchantProfile function

  /**
   * Create merchant profile with user data
   */
  const createMerchantProfile = useCallback(
    async (user: any) => {
      try {
        const evmWallet = userWallets.find((wallet) => wallet.chain === 'EVM');

        await createProfile({
          email: user?.email ?? '',
          display_name: user?.email ?? '',
          description: '',
          logo_url: '',
          default_currency: defaultCurrency.code,
          default_language: 'EN',
          default_token_id: defaultToken?.key,
          wallet_address: evmWallet?.address ?? '',
        });

        // Handle success directly here
        if (auth.token) {
          setToken(auth.token);
          showToast({
            type: 'success',
            message: 'Welcome to Rozo POS',
          });
          setIsAuthLoading(false);
          router.navigate('/');
        }
      } catch (error: any) {
        // Handle error directly here
        showToast({
          type: 'danger',
          message: error?.message ?? 'Failed to create profile',
        });
        setIsAuthLoading(false);
      }
    },
    [createProfile, userWallets, auth.token, router]
  );

  // No longer need separate useEffects for profile creation success/error
  // as we're handling them directly in the createMerchantProfile function

  // Set up auth event listeners
  useEffect(() => {
    const authInitHandler = () => {
      setIsAuthLoading(true);
    };

    const authSuccessHandler = (user: any) => {
      setIsAuthLoading(true);

      if (user) {
        createMerchantProfile(user);
      } else {
        showToast({
          type: 'danger',
          message: 'Failed to login',
        });
        setIsAuthLoading(false);
      }
    };

    const authFailedHandler = () => {
      showToast({
        type: 'danger',
        message: 'Authentication failed',
      });
      setIsAuthLoading(false);
    };

    const authLogoutHandler = () => {
      setToken(undefined);
      storage.delete(TOKEN_KEY);
      router.replace('/login');
    };

    // Add event listeners
    auth.on('authInit', authInitHandler);
    auth.on('authSuccess', authSuccessHandler);
    auth.on('authFailed', authFailedHandler);
    auth.on('loggedOut', authLogoutHandler);

    // Clean up event listeners
    return () => {
      auth.off('authInit', authInitHandler);
      auth.off('authSuccess', authSuccessHandler);
      auth.off('authFailed', authFailedHandler);
      auth.off('loggedOut', authLogoutHandler);
    };
  }, [auth, createMerchantProfile, router]);

  const contextPayload = useMemo(
    () => ({
      isAuthenticated: !!token,
      token,
      merchant,
      defaultCurrency,
      merchantToken,
      wallets: userWallets,
      primaryWallet,
      isAuthLoading,
      showAuthModal,
      setToken,
      setMerchant,
      logout,
    }),
    [token, merchant, userWallets, primaryWallet, isAuthLoading, showAuthModal]
  );

  return <AppContext.Provider value={contextPayload}>{isLoading ? <PageLoader /> : children}</AppContext.Provider>;
};

export const useApp = () => useContext(AppContext);
