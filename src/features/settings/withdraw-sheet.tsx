import { zodResolver } from '@hookform/resolvers/zod';
import { BanknoteArrowDown, InfoIcon } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Keyboard } from 'react-native';
import { type Address } from 'viem';
import { z } from 'zod';

import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from '@/components/ui/actionsheet';
import { Alert, AlertIcon, AlertText } from '@/components/ui/alert';
import { Button, ButtonIcon, ButtonSpinner, ButtonText } from '@/components/ui/button';
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from '@/components/ui/form-control';
import { HStack } from '@/components/ui/hstack';
import { Input, InputField } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useTokenTransfer } from '@/hooks/use-token-transfer';
import { showToast } from '@/lib';
import { type TokenBalanceResult } from '@/modules/dynamic/token-operations';

type Props = {
  onClose?: () => void;
  onSuccess?: () => void;
  balance?: TokenBalanceResult;
};

type FormValues = {
  withdrawAddress: string;
  amount: string;
};

export function WithdrawActionSheet({ onClose, onSuccess, balance }: Props) {
  const { t } = useTranslation();
  const { isAbleToTransfer, transfer } = useTokenTransfer();

  const [open, setOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const MIN_AMOUNT = 0.01;
  const maxAmount = useMemo(() => (balance?.balance ? parseFloat(balance?.balance) : 0), [balance]);

  // Create Zod schema for form validation
  const createFormSchema = () => {
    return z.object({
      withdrawAddress: z.string().trim().min(1, t('validation.required')),
      amount: z
        .string()
        .trim()
        .min(1, t('validation.required'))
        .refine((val) => !isNaN(parseFloat(val)), {
          message: t('validation.invalidAmount'),
        })
        .refine((val) => parseFloat(val) >= MIN_AMOUNT, {
          message: t('validation.minAmount', { min: MIN_AMOUNT }),
        })
        .refine((val) => parseFloat(val) <= maxAmount, {
          message: t('validation.maxAmount', { max: maxAmount }),
        }),
    });
  };

  const formSchema = createFormSchema();

  const {
    control,
    handleSubmit: hookFormSubmit,
    formState: { errors, isValid },
    setValue,
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      withdrawAddress: '',
      amount: '',
    },
    mode: 'onChange',
  });

  const onSubmit = async (data: FormValues) => {
    Keyboard.dismiss();
    setIsSubmitting(true);

    try {
      if (isAbleToTransfer) {
        const result = await transfer(data.withdrawAddress as Address, data.amount, true);

        if (result.success) {
          showToast({
            message: t('withdraw.success'),
            type: 'success',
          });

          resetForm();
          onSuccess?.();
        } else {
          throw result.error;
        }
      }
    } catch (error: any) {
      showToast({
        message: `${t('withdraw.error')}: ${error.message}`,
        type: 'danger',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    reset();
    setIsSubmitting(false);
    setOpen(false);
  };

  const handleClose = () => {
    resetForm();
    onClose?.();
  };

  const setMaxAmount = () => {
    setValue('amount', maxAmount.toString(), { shouldValidate: true });
  };

  return (
    <>
      <Button
        isDisabled={parseFloat(balance?.balance ?? '0') < MIN_AMOUNT}
        size="sm"
        className="rounded-xl"
        onPress={() => setOpen(true)}
      >
        <ButtonIcon as={BanknoteArrowDown}></ButtonIcon>
        <ButtonText>{t('general.withdraw')}</ButtonText>
      </Button>

      <Actionsheet isOpen={open} onClose={handleClose}>
        <ActionsheetBackdrop />
        <ActionsheetContent className="pb-8">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>

          <VStack className="w-full" space="lg">
            <Text size="xl" className="text-center font-semibold">
              {t('general.withdraw')}
            </Text>

            <VStack space="md">
              <Alert action="info" className="flex w-full flex-row items-start gap-4 self-center py-4">
                <AlertIcon as={InfoIcon} className="mt-1" />
                <VStack className="flex-1">
                  <Text className="font-semibold text-typography-900" size="xs">
                    Information
                  </Text>
                  <AlertText className="font-light text-typography-900" size="xs">
                    Currently, withdrawals are only supported for{' '}
                    <Text className="font-semibold text-typography-900" size="xs">
                      USDC on Base network.
                    </Text>{' '}
                    Please ensure the receiving wallet address is compatible with{' '}
                    <Text className="font-semibold text-typography-900" size="xs">
                      Base network
                    </Text>{' '}
                    to avoid loss of funds.
                  </AlertText>
                </VStack>
              </Alert>
              <Controller
                control={control}
                name="withdrawAddress"
                render={({ field: { onChange, value } }) => (
                  <FormControl isInvalid={!!errors.withdrawAddress}>
                    <FormControlLabel>
                      <FormControlLabelText>{t('general.walletAddress')}</FormControlLabelText>
                    </FormControlLabel>
                    <Input>
                      <InputField
                        placeholder={t('withdraw.walletAddressPlaceholder')}
                        value={value}
                        onChangeText={onChange}
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    </Input>
                    {errors.withdrawAddress && (
                      <FormControlError>
                        <FormControlErrorText>{errors.withdrawAddress.message}</FormControlErrorText>
                      </FormControlError>
                    )}
                  </FormControl>
                )}
              />

              <Controller
                control={control}
                name="amount"
                render={({ field: { onChange, value } }) => (
                  <FormControl isInvalid={!!errors.amount}>
                    <FormControlLabel>
                      <FormControlLabelText>{t('general.amount')}</FormControlLabelText>
                    </FormControlLabel>
                    <VStack space="xs">
                      <Input>
                        <InputField
                          placeholder="0.00"
                          value={value}
                          onChangeText={(text) => {
                            // Only allow numbers, comma, and dot - no negative signs
                            const sanitizedText = text.replace(/[^0-9.,]/g, '');
                            onChange(sanitizedText);
                          }}
                          keyboardType="decimal-pad"
                        />
                      </Input>
                      <HStack className="items-center justify-between">
                        <Button
                          size="xs"
                          variant="link"
                          className="underline"
                          onPress={setMaxAmount}
                          disabled={maxAmount === 0}
                        >
                          <ButtonText>
                            {t('general.max')}: {maxAmount.toFixed(2)}
                          </ButtonText>
                        </Button>
                      </HStack>
                    </VStack>
                    {errors.amount && (
                      <FormControlError>
                        <FormControlErrorText>{errors.amount.message}</FormControlErrorText>
                      </FormControlError>
                    )}
                  </FormControl>
                )}
              />
            </VStack>

            <HStack space="sm" className="grid grid-rows-2">
              <Button onPress={hookFormSubmit(onSubmit)} isDisabled={isSubmitting || !isValid} className="w-full rounded-xl">
                {isSubmitting && <ButtonSpinner />}
                <ButtonText>{isSubmitting ? t('general.processing') : t('general.submit')}</ButtonText>
              </Button>
              <Button onPress={handleClose} isDisabled={isSubmitting} className="w-full rounded-xl" variant="link">
                <ButtonText>{t('general.cancel')}</ButtonText>
              </Button>
            </HStack>
          </VStack>
        </ActionsheetContent>
      </Actionsheet>
    </>
  );
}
