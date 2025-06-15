import { createClient } from '@dynamic-labs/client';
import { useReactiveClient } from '@dynamic-labs/react-hooks';
import { ReactNativeExtension } from '@dynamic-labs/react-native-extension';
import { ViemExtension } from '@dynamic-labs/viem-extension';
import { WebExtension } from '@dynamic-labs/web-extension';
import { Platform } from 'react-native';

/**
 * Dynamic client configuration with deep linking support for authentication
 */
/**
 * Initialize the Dynamic client with appropriate extensions based on platform
 */
let client = createClient({
  environmentId: process.env.EXPO_PUBLIC_DYNAMIC_ENVIRONMENT_ID ?? '',
  appLogoUrl: 'https://rozo.ai/rozo-logo.png',
  appName: process.env.EXPO_PUBLIC_APP_NAME ?? 'Rozo POS',
});

// Always add ReactNativeExtension
client = client.extend(ReactNativeExtension());

// Add WebExtension only on web platform
if (Platform.OS === 'web') {
  client = client.extend(WebExtension());
}

export const dynamicClient = client.extend(ViemExtension());

export const useDynamic = () => useReactiveClient(dynamicClient);
