import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import QRCode from 'react-qr-code';

import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { CloseIcon, Icon } from '@/components/ui/icon';
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@/components/ui/modal';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { usePaymentStatus } from '@/hooks/use-payment-status';
import { useApp } from '@/providers/app.provider';

import { PaymentSuccess } from './payment-success';
import { type DynamicStyles } from './types';

type PaymentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  amount: string;
  exchangeAmount: string;
  dynamicStyles: DynamicStyles;
  paymentUrl?: string;
  orderId?: string;
};

export function PaymentModal({
  paymentUrl,
  isOpen,
  onClose,
  amount,
  exchangeAmount,
  dynamicStyles,
  orderId,
}: PaymentModalProps): React.ReactElement {
  const { t } = useTranslation();
  const { defaultCurrency, merchant } = useApp();
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [showSuccessView, setShowSuccessView] = useState(false);

  // Use our custom hook to handle payment status updates
  const { isCompleted } = usePaymentStatus(merchant?.merchant_id, orderId);
  // Generate QR code when modal opens
  useEffect(() => {
    if (isOpen && paymentUrl) {
      setQrCodeUrl(paymentUrl);
    } else {
      setQrCodeUrl(null);
    }

    // Reset states when modal opens
    if (isOpen) {
      setShowSuccessView(false);
    }
  }, [isOpen, paymentUrl]);

  // Watch for payment status changes
  useEffect(() => {
    if (isCompleted) {
      // Show success view after a brief delay
      setTimeout(() => {
        setShowSuccessView(true);
      }, 500);
    }
  }, [isCompleted]);

  // Handle payment verification
  // const handleVerifyPayment = useCallback(() => {
  //   checkPaymentStatus();
  // }, [checkPaymentStatus]);

  // Handle back to home
  const handleBackToHome = useCallback(() => {
    // Reset states
    setShowSuccessView(false);
    onClose();
  }, [onClose]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalBackdrop />
      <ModalContent>
        {!showSuccessView && (
          <ModalHeader className="mb-2">
            <Heading size="md" className="text-typography-950">
              {t('payment.PaymentQRCode')}
            </Heading>
            <ModalCloseButton>
              <Icon
                as={CloseIcon}
                size="md"
                className="stroke-background-400 group-[:active]/modal-close-button:stroke-background-900 group-[:focus-visible]/modal-close-button:stroke-background-900 group-[:hover]/modal-close-button:stroke-background-700"
              />
            </ModalCloseButton>
          </ModalHeader>
        )}
        <ModalBody className={showSuccessView ? '!m-0' : ''}>
          {showSuccessView ? (
            <PaymentSuccess
              defaultCurrency={defaultCurrency}
              amount={amount}
              exchangeAmount={exchangeAmount}
              dynamicStyles={dynamicStyles}
              onPrintReceipt={() => {}}
              onBackToHome={handleBackToHome}
              merchant={merchant}
            />
          ) : (
            <View className="items-center justify-center">
              {/* QR Code */}
              <View className="mb-4 size-64 items-center justify-center rounded-xl border bg-white p-3">
                {qrCodeUrl ? (
                  <QRCode value={qrCodeUrl} size={256} />
                ) : (
                  <View className="items-center justify-center">
                    <Spinner />
                  </View>
                )}
              </View>

              {/* Amount Information */}
              <View className="mb-6 w-full items-center">
                <Text className="mb-1 text-gray-500 dark:text-gray-400">{t('payment.amountToPay')}</Text>
                <Text
                  className={`text-center font-bold text-gray-800 dark:text-gray-200 ${dynamicStyles.fontSize.modalAmount}`}
                >
                  {`${amount} ${defaultCurrency?.code}`}
                </Text>
                <View className="mt-1 rounded-lg bg-gray-100 p-2 dark:bg-gray-800">
                  <Text className={`text-center text-gray-600 dark:text-gray-200 ${dynamicStyles.fontSize.label}`}>
                    ≈ {exchangeAmount} USD
                  </Text>
                </View>
              </View>
            </View>
          )}
        </ModalBody>
        {!showSuccessView && (
          <ModalFooter className="flex w-full flex-col items-center gap-2">
            <>
              {/* <Button
                onPress={handleVerifyPayment}
                isDisabled={isLoading || isCompleted}
                className="w-full rounded-xl"
                size={dynamicStyles.size.buttonSize as 'sm' | 'md' | 'lg'}
              >
                {isLoading ? <ButtonSpinner /> : <ButtonText>{t('payment.verifyPayment')}</ButtonText>}
              </Button> */}
              <Button
                variant="link"
                onPress={onClose}
                className="w-full"
                size={dynamicStyles.size.buttonSize as 'sm' | 'md' | 'lg'}
              >
                <ButtonText>{t('general.cancel')}</ButtonText>
              </Button>
            </>
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
}
