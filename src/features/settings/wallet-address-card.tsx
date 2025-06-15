import * as Clipboard from 'expo-clipboard';
import { Copy, Wallet } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button, ButtonIcon } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { formatAddress, showToast } from '@/lib';
import { useDynamic } from '@/modules/dynamic/dynamic-client';

export const WalletAddressCard = () => {
  const { t } = useTranslation();
  const { wallets } = useDynamic();
  const walletAddress = wallets.primary?.address;

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(walletAddress ?? '');
    showToast({
      message: t('general.copiedToClipboard'),
      type: 'success',
    });
  };

  return (
    <View className="w-full flex-row items-center justify-between px-2 py-3">
      <HStack className="items-center" space="md">
        <Icon as={Wallet} className="mb-auto mt-1 stroke-[#747474]" />
        <VStack className="items-start" space="xs">
          <Text size="md">{t('general.walletAddress')}</Text>
          <View className="flex-row items-center space-x-1">
            <Text className="text-primary-500">{formatAddress(walletAddress ?? '')}</Text>
          </View>
        </VStack>
      </HStack>

      <Button onPress={copyToClipboard} size="xs" variant="link" className="rounded-xl">
        <ButtonIcon as={Copy}></ButtonIcon>
      </Button>
    </View>
  );
};
