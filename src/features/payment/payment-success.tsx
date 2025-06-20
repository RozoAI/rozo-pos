import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';

import CheckSvg from '@/components/svg/check';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { formatAddress } from '@/lib';
import { type CurrencyConfig } from '@/lib/currencies';
import { type MerchantProfile } from '@/resources/schema/merchant';

import { type DynamicStyles } from './types';

type PaymentSuccessProps = {
  amount: string;
  exchangeAmount: string;
  dynamicStyles: DynamicStyles;
  onPrintReceipt: () => void;
  onBackToHome: () => void;
  defaultCurrency?: CurrencyConfig;
  merchant?: MerchantProfile;
};

export function PaymentSuccess({
  amount,
  exchangeAmount,
  dynamicStyles,
  // onPrintReceipt,
  onBackToHome,
  defaultCurrency,
  merchant,
}: PaymentSuccessProps): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();

  // Handle print receipt
  // const handlePrintReceipt = () => {
  //   onPrintReceipt();
  // };

  // Handle back to home
  const handleBackToHome = () => {
    onBackToHome();
    router.replace('/');
  };

  return (
    <View className="items-center justify-between gap-4">
      <Box className="flex flex-col items-center justify-center gap-6">
        {/* Success Icon */}
        <CheckSvg width={200} height={150} />

        {/* Success Title and Subtitle */}
        <Box className="flex flex-col items-center justify-center gap-2">
          <Text className={`text-center font-bold text-gray-800 dark:text-gray-100 ${dynamicStyles.fontSize.title}`}>
            {t('payment.paymentSuccessful')}!
          </Text>
          <Text className="text-center text-gray-500 dark:text-gray-400">{t('payment.paymentSuccessfulDesc')}</Text>

          <View className="flex-row justify-between">
            <Text className="text-gray-500 dark:text-gray-400">{t('general.merchantId')}: </Text>
            <Text className="font-medium">{formatAddress(merchant?.merchant_id ?? '')}</Text>
          </View>
        </Box>
        {/* Amount Information */}
        <View className="w-full items-center rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
          <Text className="mb-1 text-gray-500 dark:text-gray-400">{t('general.amountPaid')}</Text>
          <Text className={`text-center font-bold text-gray-800 dark:text-gray-200 ${dynamicStyles.fontSize.modalAmount}`}>
            {`${amount} ${defaultCurrency?.code}`}
          </Text>
          <View className="mt-2 rounded-lg bg-gray-100 p-2 dark:bg-gray-700">
            <Text className={`text-center text-gray-600 dark:text-gray-300 ${dynamicStyles.fontSize.label}`}>
              ≈ {exchangeAmount} USD
            </Text>
          </View>
        </View>
      </Box>

      {/* Action Buttons */}
      <View className="w-full gap-3">
        {/* <Button
          onPress={handlePrintReceipt}
          className="w-full rounded-xl"
          size={dynamicStyles.size.buttonSize as 'sm' | 'md' | 'lg'}
        >
          <ButtonIcon as={PrinterIcon} />
          <ButtonText>{t('general.printReceipt')}</ButtonText>
        </Button> */}

        <Button
          variant="link"
          onPress={handleBackToHome}
          className="w-full rounded-xl"
          size={dynamicStyles.size.buttonSize as 'sm' | 'md' | 'lg'}
        >
          <ButtonText>{t('general.backToHome')}</ButtonText>
        </Button>
      </View>
    </View>
  );
}
