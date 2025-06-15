import { CheckIcon, Funnel } from 'lucide-react-native';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetItem,
  ActionsheetItemText,
} from '@/components/ui/actionsheet';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { type MerchantOrderStatus } from '@/resources/schema/order';

type Props = {
  onStatusChange: (status: MerchantOrderStatus) => void;
};

export function FilterOrderActionSheet({ onStatusChange }: Props) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<MerchantOrderStatus>('COMPLETED');

  const orderStatuses: MerchantOrderStatus[] = ['PENDING', 'COMPLETED', 'FAILED', 'DISCREPANCY'];

  const handleStatusSelect = (status: MerchantOrderStatus) => {
    setSelectedStatus(status);
    onStatusChange(status);
    setIsOpen(false);
  };

  const getStatusLabel = (status: MerchantOrderStatus) => {
    return t(`order.status.${status.toLowerCase()}`);
  };

  return (
    <>
      <Button variant="outline" size="xs" onPress={() => setIsOpen(true)} className="rounded-xl">
        <ButtonIcon as={Funnel} />
        <ButtonText>{getStatusLabel(selectedStatus)}</ButtonText>
      </Button>

      <Actionsheet isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <ActionsheetBackdrop />
        <ActionsheetContent>
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>

          <Box className="w-full p-4">
            <Text className="mb-4 text-lg font-semibold">{t('order.filterByStatus')}</Text>

            {orderStatuses.map((status) => (
              <ActionsheetItem
                key={status}
                onPress={() => handleStatusSelect(status)}
                className="flex-row items-center justify-between py-3"
              >
                <ActionsheetItemText className="flex-1">{getStatusLabel(status)}</ActionsheetItemText>
                {selectedStatus === status && <CheckIcon />}
              </ActionsheetItem>
            ))}
          </Box>
        </ActionsheetContent>
      </Actionsheet>
    </>
  );
}
