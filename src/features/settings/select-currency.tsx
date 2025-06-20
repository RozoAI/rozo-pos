import { CheckIcon } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetItem,
  ActionsheetItemText,
} from '@/components/ui/actionsheet';
import { Pressable } from '@/components/ui/pressable';
import { Spinner } from '@/components/ui/spinner';
import { View } from '@/components/ui/view';
import { showToast } from '@/lib';
import { currencies as currencyList, defaultCurrency } from '@/lib/currencies';
import { useApp } from '@/providers/app.provider';
import { useCreateProfile } from '@/resources/api';

type CurrencyOption = {
  code: string;
  label: string;
};

type ActionSheetCurrencySwitcherProps = {
  trigger: (curr: string) => React.ReactNode;
  defaultValue?: string;
  value?: string;
};

export function ActionSheetCurrencySwitcher({ trigger, value }: ActionSheetCurrencySwitcherProps): React.ReactElement {
  const [selectedValue, setSelectedValue] = useState<string | undefined>(value);
  const [showActionsheet, setShowActionsheet] = useState<boolean>(false);

  const { mutate: updateProfile, data, error, isPending } = useCreateProfile();
  const { merchant, setMerchant } = useApp();

  // Memoize currencies to prevent unnecessary re-renders
  const currencies = useMemo<CurrencyOption[]>(() => {
    return Object.values(currencyList);
  }, []);

  // Create refs once and store them
  const itemRefs = useRef<Record<string, React.RefObject<any>>>({});

  // Initialize refs only once
  useEffect(() => {
    currencies.forEach((cur) => {
      if (!itemRefs.current[cur.code]) {
        itemRefs.current[cur.code] = React.createRef();
      }
    });
  }, [currencies]);

  // Update selected value when merchant data changes
  useEffect(() => {
    if (merchant?.default_currency) {
      setSelectedValue(merchant.default_currency.toLowerCase());
    }
  }, [merchant?.default_currency]);

  // Handle API response
  useEffect(() => {
    if (data) {
      setMerchant(data);
      setSelectedValue(data.default_currency.toLowerCase());

      showToast({
        message: 'Currency updated successfully',
        type: 'success',
      });
    } else if (error) {
      showToast({
        message: 'Failed to update currency',
        type: 'danger',
      });
    }
  }, [data, error, setMerchant]);

  // Memoized values
  const initialLabel = useMemo(() => {
    return currencies.find((curr) => curr.code === selectedValue?.toUpperCase())?.label || '-';
  }, [currencies, selectedValue]);

  const selectedLabel = useMemo(() => {
    return currencies.find((curr) => curr.code === selectedValue?.toUpperCase())?.label || initialLabel;
  }, [currencies, selectedValue, initialLabel]);

  const initialFocusRef = useMemo(() => {
    const currentCurrency = selectedValue?.toUpperCase() ?? defaultCurrency?.code;
    return itemRefs.current[currentCurrency];
  }, [selectedValue]);

  // Callbacks
  const handleClose = useCallback(() => setShowActionsheet(false), []);
  const handleOpen = useCallback(() => setShowActionsheet(true), []);

  const handleCurrencyChange = useCallback(
    (value: string) => {
      if (!merchant?.email) return;

      // eslint-disable-next-line unused-imports/no-unused-vars
      const { created_at, ...rest } = merchant;
      updateProfile({
        ...rest,
        default_currency: value.toUpperCase(),
      });

      handleClose();
    },
    [updateProfile, merchant, handleClose]
  );

  // Memoized currency item renderer
  const renderCurrencyItem = useCallback(
    (curr: CurrencyOption) => {
      const isActive = curr.code === selectedValue?.toUpperCase();
      return (
        <ActionsheetItem
          key={curr.code}
          ref={itemRefs.current[curr.code]}
          onPress={() => handleCurrencyChange(curr.code)}
          data-active={isActive}
        >
          <ActionsheetItemText className="flex w-full items-center justify-between">
            {curr.label}
            {isActive && <CheckIcon />}
          </ActionsheetItemText>
        </ActionsheetItem>
      );
    },
    [selectedValue, handleCurrencyChange]
  );

  return (
    <>
      <Pressable onPress={handleOpen} className="relative w-full">
        {trigger(selectedLabel ?? initialLabel)}
        {isPending && (
          <View className="absolute inset-x-0 top-0 z-10 flex size-full items-center justify-center bg-white/50 py-2">
            <Spinner />
          </View>
        )}
      </Pressable>

      <Actionsheet isOpen={showActionsheet} onClose={handleClose} trapFocus={false} initialFocusRef={initialFocusRef}>
        <ActionsheetBackdrop />
        <ActionsheetContent>
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          {currencies.map(renderCurrencyItem)}
        </ActionsheetContent>
      </Actionsheet>
    </>
  );
}
