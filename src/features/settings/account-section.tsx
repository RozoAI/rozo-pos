import React from 'react';

import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useApp } from '@/providers/app.provider';

export function AccountSection() {
  const { merchant } = useApp();

  return (
    <VStack space="sm">
      <Box className="flex-row items-center">
        <Avatar className="mr-2" size="sm">
          <AvatarFallbackText>{merchant?.display_name?.slice(0, 2) || '-'}</AvatarFallbackText>
          <AvatarImage
            source={{
              uri: merchant?.logo_url || undefined,
            }}
            alt="image"
          />
        </Avatar>
        <Box className="flex flex-col">
          <Heading size="sm">{merchant?.display_name ?? '-'}</Heading>
          <Text size="xs" className="text-typography-500">
            {merchant?.email ?? '-'}
          </Text>
        </Box>
      </Box>
    </VStack>
  );
}
