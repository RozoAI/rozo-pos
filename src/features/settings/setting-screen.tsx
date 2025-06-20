import * as Application from 'expo-application';
import { DollarSign, Languages, Palette } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native-gesture-handler';

import { type ModeType } from '@/components/gluestack-ui-provider';
import { Button, ButtonText } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { HStack } from '@/components/ui/hstack';
import { ChevronRightIcon, Icon } from '@/components/ui/icon';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { VStack } from '@/components/ui/vstack';
import { AccountSection } from '@/features/settings/account-section';
import { ActionSheetCurrencySwitcher } from '@/features/settings/select-currency';
import { ActionSheetLanguageSwitcher } from '@/features/settings/select-language';
import { ActionSheetThemeSwitcher } from '@/features/settings/theme-switcher';
import { useApp } from '@/providers/app.provider';

import { WalletAddressCard } from './wallet-address-card';
import { WalletBalanceCard } from './wallet-balance-card';

export function SettingScreen() {
  const { logout } = useApp();
  const { t } = useTranslation();

  return (
    <SafeAreaView className="flex-1">
      <ScrollView className="flex-1 py-6">
        <View className="mb-6">
          <Text className="text-2xl font-bold">{t('settings.title')}</Text>
          <Text className="text-sm text-gray-400">{t('settings.description')}</Text>
        </View>
        <VStack space="lg">
          <VStack className="items-start justify-between rounded-xl border border-background-300 bg-background-0 px-4 py-2">
            <AccountSection />
          </VStack>

          <VStack className="items-center justify-between divide-y divide-gray-200 rounded-xl border border-background-300 bg-background-0 px-4 py-2 dark:divide-[#2b2b2b]">
            <WalletAddressCard />
            <WalletBalanceCard />
          </VStack>

          <VStack className="items-center justify-between divide-y divide-gray-200 rounded-xl border border-background-300 bg-background-0 px-4 py-2 dark:divide-[#2b2b2b]">
            <ActionSheetCurrencySwitcher
              trigger={(curr) => (
                <HStack space="2xl" className="w-full flex-1 items-center justify-between px-2 py-3">
                  <HStack className="items-center" space="md">
                    <Icon as={DollarSign} className="mb-auto mt-1 stroke-[#747474]" />
                    <VStack className="items-start" space="xs">
                      <Text size="md">{t('settings.currency.title')}</Text>
                      <Text size="sm">{curr}</Text>
                    </VStack>
                  </HStack>
                  <Icon as={ChevronRightIcon} className="text-gray-400 dark:text-gray-50" />
                </HStack>
              )}
            />

            <Divider />

            <ActionSheetLanguageSwitcher
              trigger={(lg) => (
                <HStack space="2xl" className="w-full flex-1 items-center justify-between px-2 py-3">
                  <HStack className="items-center" space="md">
                    <Icon as={Languages} className="mb-auto mt-1 stroke-[#747474]" />
                    <VStack className="items-start" space="xs">
                      <Text size="md">{t('settings.language.title')}</Text>
                      <Text size="sm">{lg}</Text>
                    </VStack>
                  </HStack>
                  <Icon as={ChevronRightIcon} className="text-gray-400 dark:text-gray-50" />
                </HStack>
              )}
            />

            <Divider />
            <ActionSheetThemeSwitcher
              trigger={(selectedTheme: ModeType) => (
                <HStack space="2xl" className="w-full flex-1 items-center justify-between px-2 py-3">
                  <HStack className="items-center" space="md">
                    <Icon as={Palette} className="mb-auto mt-1 stroke-[#747474]" />
                    <VStack className="items-start" space="xs">
                      <Text size="md">{t('settings.theme.title')}</Text>
                      <Text size="sm">{t(`settings.theme.${selectedTheme}`)}</Text>
                    </VStack>
                  </HStack>
                  <Icon as={ChevronRightIcon} className="text-gray-400 dark:text-gray-50" />
                </HStack>
              )}
            />
          </VStack>

          <Button variant="link" size="sm" action="negative" onPress={logout} className="rounded-xl">
            <ButtonText>{t('settings.logout')}</ButtonText>
          </Button>

          {Application.nativeApplicationVersion && (
            <VStack space="sm">
              <Text className="text-center text-xs">
                {t('settings.version')} - {Application.nativeApplicationVersion}
              </Text>
            </VStack>
          )}
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}
