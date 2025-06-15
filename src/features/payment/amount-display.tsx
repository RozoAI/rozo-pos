import { Convert } from 'easy-currencies';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { useApp } from '@/providers/app.provider';

import type { DynamicStyles } from './types';

type AmountDisplayProps = {
  amount: string;
  dynamicStyles: DynamicStyles;
  onExchangeAmount: (amount: string) => void;
};

export function AmountDisplay({ amount, dynamicStyles, onExchangeAmount }: AmountDisplayProps) {
  const { defaultCurrency } = useApp();
  const { t } = useTranslation();
  // State for USD equivalent amount
  const [usdAmount, setUsdAmount] = useState('0.00');
  const [exchangeLoading, setExchangeLoading] = useState(false);

  // Format amount with appropriate decimal and thousand separators
  const formattedAmount = useMemo(() => {
    if (!amount || amount === '0') return '0';

    // Handle decimal separator
    const decimalSeparator = defaultCurrency?.decimalSeparator || '.';
    const parts = amount.split(decimalSeparator);
    const integerPart = parts[0];
    const decimalPart = parts.length > 1 ? parts[1] : '';

    // Format integer part with thousand separators
    const thousandSeparator = defaultCurrency?.thousandSeparator || ',';
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);

    // Return formatted amount with decimal part if exists
    return decimalPart ? `${formattedInteger}${decimalSeparator}${decimalPart}` : formattedInteger;
  }, [amount, defaultCurrency]);

  // Debounced currency conversion
  const debouncedConvertCurrency = useCallback(() => {
    // Convert to numeric value based on currency's decimal separator
    let numericAmount: number;
    if (defaultCurrency?.decimalSeparator === ',') {
      numericAmount = parseFloat(amount.replace(/\./g, '').replace(',', '.'));
    } else {
      numericAmount = parseFloat(amount.replace(/,/g, ''));
    }

    if (isNaN(numericAmount) || numericAmount === 0) {
      setUsdAmount('0.00');
      return;
    }

    // Handle minimum amount validation - minimum is 0.01
    if (numericAmount > 0 && numericAmount < 0.01) {
      setUsdAmount('0.00');
      return;
    }

    // If already in USD, return the same amount
    if (defaultCurrency?.code === 'USD') {
      setUsdAmount(numericAmount.toFixed(2));
      return;
    }

    // Use a timeout for debouncing
    const timer = setTimeout(async () => {
      try {
        setExchangeLoading(true);
        const converted = await Convert(numericAmount)
          .from(defaultCurrency?.code ?? 'USD')
          .to('USD');

        // Apply minimum amount validation to converted amount as well
        const finalAmount = converted < 0.01 && converted > 0 ? 0 : converted;
        setUsdAmount(finalAmount.toFixed(2));

        setExchangeLoading(false);
      } catch (error) {
        console.error('Currency conversion error:', error);
        // Fallback calculation if API fails
        setUsdAmount('--');

        setExchangeLoading(false);
      }
    }, 500); // 500ms debounce time

    return () => clearTimeout(timer);
  }, [amount, defaultCurrency]);

  useEffect(() => {
    onExchangeAmount(usdAmount);
  }, [usdAmount]);

  // Effect to trigger the debounced conversion
  useEffect(() => {
    const cleanup = debouncedConvertCurrency();
    return cleanup;
  }, [debouncedConvertCurrency]);

  return (
    <View className="items-center px-2">
      <Card className={`w-full rounded-xl shadow-soft-1 ${dynamicStyles.spacing.cardPadding}`}>
        <Text className="text-center text-gray-500 dark:text-gray-200">{t('general.amount')}</Text>
        <Text className={`my-3 text-center font-bold text-gray-800 dark:text-gray-200 ${dynamicStyles.fontSize.amount}`}>
          {`${formattedAmount} ${defaultCurrency?.code}`}
        </Text>
        {/* USD Conversion */}
        {defaultCurrency?.code !== 'USD' && (
          <View className="mt-1 rounded-lg bg-gray-100 p-2 dark:bg-gray-800">
            <Text className={`text-center text-gray-600 dark:text-gray-200 ${dynamicStyles.fontSize.label}`}>
              {exchangeLoading ? <Spinner size="small" /> : `≈ ${usdAmount} USD`}
            </Text>
          </View>
        )}
        <Text className={`mt-2 text-center text-gray-500 ${dynamicStyles.fontSize.label}`}>
          {t('payment.enterPaymentAmount')}
        </Text>
      </Card>
    </View>
  );
}
// End of Selection
