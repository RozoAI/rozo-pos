import clsx, { type ClassValue } from 'clsx';
import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react-native';
import React from 'react';
import { Dimensions, Platform } from 'react-native';
import { Linking } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { twMerge } from 'tailwind-merge';
import type { StoreApi, UseBoundStore } from 'zustand';

import { currencies } from '@/lib/currencies';
import { type MerchantOrder } from '@/resources/schema/order';

// Platform
export const IS_IOS = Platform.OS === 'ios';
export const IS_ANDROID = Platform.OS === 'android';
export const IS_WEB = Platform.OS === 'web';

// Dimensions
const { width, height } = Dimensions.get('screen');

export const WIDTH = width;
export const HEIGHT = height;

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const showToast = ({
  type = 'info',
  message = 'Something went wrong ',
}: {
  type: 'danger' | 'success' | 'warning' | 'info';
  message: string;
}) => {
  // Use different icon based on toast type
  const iconMap = {
    danger: <AlertCircle />,
    success: <CheckCircle />,
    warning: <AlertTriangle />,
    info: <Info />,
  };

  showMessage({
    message,
    type,
    duration: 4000,
    icon: iconMap[type],
  });
};

export function openLinkInBrowser(url: string) {
  Linking.canOpenURL(url).then((canOpen) => canOpen && Linking.openURL(url));
}

type WithSelectors<S> = S extends { getState: () => infer T } ? S & { use: { [K in keyof T]: () => T[K] } } : never;

export const createSelectors = <S extends UseBoundStore<StoreApi<object>>>(_store: S) => {
  let store = _store as WithSelectors<typeof _store>;
  store.use = {};
  for (let k of Object.keys(store.getState())) {
    (store.use as any)[k] = () => store((s) => s[k as keyof typeof s]);
  }

  return store;
};

export const formatAmount = (amountUnits: string, tokenSymbol: string): string => {
  // Convert from smallest unit (wei-like) to readable format
  // This is a simplified conversion - you might need more sophisticated logic
  const amount = Number.parseFloat(amountUnits) / Math.pow(10, 18); // Assuming 18 decimals
  return `${amount.toFixed(4)} ${tokenSymbol}`;
};

export const formatAddress = (address: string): string => {
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatTxHash = (txHash: string): string => {
  if (txHash.length <= 10) return txHash;
  return `${txHash.slice(0, 8)}...${txHash.slice(-6)}`;
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

export const getChainName = (chainId: number | string): string => {
  const id = typeof chainId === 'string' ? Number.parseInt(chainId) : chainId;
  switch (id) {
    case 1:
      return 'Ethereum';
    case 137:
      return 'Polygon';
    case 56:
      return 'BSC';
    case 43114:
      return 'Avalanche';
    default:
      return `Chain ${id}`;
  }
};

export function formatCurrency(amount: string | number, currencyCode: string = 'USD'): string {
  const config = currencies[currencyCode] || currencies.USD;
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) return `${config.symbol}0`;

  const parts = numAmount.toFixed(2).split('.');
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, config.thousandSeparator);
  const decimalPart = parts[1];

  return `${config.symbol}${integerPart}${config.decimalSeparator}${decimalPart}`;
}

export const getStatusActionType = (status: MerchantOrder['status']): 'success' | 'error' | 'warning' | 'info' | 'muted' => {
  const statusMap: Record<MerchantOrder['status'], 'success' | 'error' | 'warning' | 'info' | 'muted'> = {
    COMPLETED: 'success',
    PROCESSING: 'info',
    PENDING: 'warning',
    FAILED: 'error',
    DISCREPANCY: 'warning',
  };

  return statusMap[status] || 'muted';
};
