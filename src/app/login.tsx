import { useRouter } from 'expo-router';
import * as React from 'react';
import { useEffect } from 'react';

import LogoSvg from '@/components/svg/logo';
import LogoWhiteSvg from '@/components/svg/logo-white';
import { Box } from '@/components/ui/box';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { FocusAwareStatusBar } from '@/components/ui/focus-aware-status-bar';
import { Text } from '@/components/ui/text';
import { useSelectedTheme } from '@/hooks';
import { useApp } from '@/providers/app.provider';

/**
 * Login screen component with Dynamic authentication
 */
export default function LoginScreen() {
  const { selectedTheme } = useSelectedTheme();
  const { isAuthenticated, isAuthLoading, showAuthModal } = useApp();
  const router = useRouter();

  // Redirect to home if user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.navigate('/');
    }
  }, [isAuthenticated, router]);

  return (
    <Box className="flex-1 bg-white">
      <FocusAwareStatusBar />

      {/* Main content container with centered flex layout */}
      <Box className="flex-1 items-center justify-center px-6">
        {/* Logo and title section */}
        <Box className="mb-6 w-full items-center justify-center">
          {selectedTheme === 'dark' ? <LogoWhiteSvg width={120} height={120} /> : <LogoSvg width={120} height={120} />}

          <Text className="text-center text-3xl font-bold text-primary-600">Rozo POS</Text>

          <Text className="mt-2 text-center text-base text-gray-600">Simple and efficient point of sale system</Text>
        </Box>

        {/* Button section */}
        <Button
          size="lg"
          variant="outline"
          action="primary"
          className="w-full flex-row items-center justify-center space-x-2 rounded-xl"
          onPress={showAuthModal}
          isDisabled={isAuthLoading}
        >
          {isAuthLoading && <ButtonSpinner />}
          <ButtonText>{isAuthLoading ? 'Loading...' : 'Sign in'}</ButtonText>
        </Button>
      </Box>
    </Box>
  );
}
