/* eslint-disable react/no-unstable-nested-components */
import { Redirect, Tabs } from 'expo-router';
import { HomeIcon, Settings2Icon, ShoppingBagIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { useApp } from '@/providers/app.provider';

export default function TabLayout() {
  const theme = useColorScheme();
  const { isAuthenticated } = useApp();
  const { t } = useTranslation();

  if (!isAuthenticated) {
    return <Redirect href="login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 64,
          paddingTop: 6,
          paddingBottom: 10,
          backgroundColor: theme?.colorScheme === 'dark' ? '#141419' : '#FFFFFF',
          elevation: 0,
          shadowOpacity: 0.5,
          borderTopColor: theme?.colorScheme === 'dark' ? '#141419' : '#E5E7EB',
        },
        tabBarActiveTintColor: '#0369A1', // Primary blue color
        tabBarInactiveTintColor: theme?.colorScheme === 'dark' ? '#FFFFFF' : '#6B7280', // Gray-500
        tabBarIconStyle: {
          marginBottom: -4,
        },
        tabBarAllowFontScaling: true,
        animation: 'fade' as const,
        tabBarLabelPosition: 'below-icon',
        tabBarLabel: ({ children, color, focused }: { children: string; color: string; focused: boolean }) => (
          <Text className={cn('text-sm font-medium', focused && `font-semibold`)} style={{ color }}>
            {children}
          </Text>
        ),
        sceneStyle: {
          padding: 16,
          backgroundColor: theme?.colorScheme === 'dark' ? '#141419' : '#FFFFFF',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('home.title'),
          tabBarIcon: ({ color }: any) => <Icon as={HomeIcon} size="md" color={color} />,
          tabBarButtonTestID: 'home-tab',
        }}
      />

      <Tabs.Screen
        name="orders"
        options={{
          title: t('order.title'),
          tabBarIcon: ({ color }: any) => <Icon as={ShoppingBagIcon} size="md" color={color} />,
          tabBarButtonTestID: 'orders-tab',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('settings.title'),
          tabBarIcon: ({ color }: any) => <Icon as={Settings2Icon} size="md" color={color} />,
          tabBarButtonTestID: 'settings-tab',
        }}
      />
    </Tabs>
  );
}
