import { RefreshCw, Wallet } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';

import { Button, ButtonIcon } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useWalletBalance } from '@/hooks/use-wallet-balance';
import { useDynamic } from '@/modules/dynamic/dynamic-client';

export const WalletBalanceCard = () => {
  const { t } = useTranslation();
  const { wallets } = useDynamic();

  const walletAddress = wallets.primary?.address;

  // Only call the hook if we have a valid wallet address
  const { balance, isLoading, error, refetch } = useWalletBalance(walletAddress as `0x${string}`);

  if (!walletAddress) {
    return null;
  }

  return (
    <View className="w-full flex-row items-center justify-between px-2 py-3">
      <HStack className="items-center" space="md">
        <Icon as={Wallet} className="mb-auto mt-1 stroke-[#747474]" />
        <VStack className="items-start" space="xs">
          <Text size="md">{t('general.walletBalance')}</Text>
          <View className="flex-row items-center space-x-1">
            {isLoading ? (
              <ActivityIndicator size="small" color="#3B82F6" />
            ) : error ? (
              <Text className="text-sm text-red-500">{error}</Text>
            ) : (
              <Text className="font-bold text-primary-500">{balance} USDC Base</Text>
            )}
          </View>
        </VStack>
      </HStack>

      <Button onPress={refetch} disabled={isLoading} size="xs" variant="link" className="rounded-xl">
        <ButtonIcon
          as={RefreshCw}
          style={{
            transform: [{ rotate: isLoading ? '360deg' : '0deg' }],
          }}
        ></ButtonIcon>
      </Button>
    </View>
  );
};
