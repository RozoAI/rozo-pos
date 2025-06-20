// Start of Selection
import { Edit, Plus } from 'lucide-react-native';
import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from '@/components/ui/actionsheet';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Textarea, TextareaInput } from '@/components/ui/textarea';
import { View } from '@/components/ui/view';
import { VStack } from '@/components/ui/vstack';
import { cn } from '@/lib';

type ActionSheetPaymentNoteProps = {
  isEdit?: boolean;
  onSubmit?: (note: string) => void;
};

export function ActionSheetPaymentNote({ isEdit = false, onSubmit }: ActionSheetPaymentNoteProps): React.ReactElement {
  const [tempNote, setTempNote] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [showActionsheet, setShowActionsheet] = useState<boolean>(false);
  const { t } = useTranslation();

  const noteInputRef = useRef<any>(null);

  // Callbacks
  const handleClose = useCallback(() => {
    setShowActionsheet(false);
  }, []);

  const handleOpen = useCallback(() => {
    setShowActionsheet(true);
    // Focus on input when opened
    setTimeout(() => {
      noteInputRef.current?.focus();
    }, 100);
  }, []);

  const handleOnCancelNote = useCallback(() => {
    setShowActionsheet(false);
    setNote('');
  }, []);

  const handleOnSubmitNote = useCallback(() => {
    const trimmedNote = note.trim();
    setTempNote(trimmedNote);
    onSubmit?.(trimmedNote);
    handleClose();
  }, [note, onSubmit, handleClose]);

  const handleOnChangeNote = useCallback((text: string) => {
    setNote(text);
  }, []);

  return (
    <>
      <Button className={cn('text-center')} variant="link" onPress={handleOpen}>
        <ButtonIcon as={tempNote ? Edit : Plus} className="text-black dark:text-white" />
        <ButtonText className="text-black dark:text-white">
          {tempNote ? `${t('general.note')}: ${tempNote}` : t('general.addNote')}
        </ButtonText>
      </Button>

      <Actionsheet isOpen={showActionsheet} onClose={handleClose} trapFocus={false}>
        <ActionsheetBackdrop />
        <ActionsheetContent>
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>

          <VStack space="md" className="w-full">
            <Text className="text-center text-lg font-semibold">{t('payment.notes.title')}</Text>

            <View className="space-y-2">
              <Textarea size="md" isReadOnly={false} className="rounded-xl">
                <TextareaInput
                  placeholder={t('payment.notes.enterNote')}
                  ref={noteInputRef}
                  value={note}
                  onChangeText={handleOnChangeNote}
                  onSubmitEditing={handleOnSubmitNote}
                  returnKeyType="done"
                />
              </Textarea>

              <HStack space="sm" className="grid grid-rows-2">
                <Button className="w-full rounded-xl" onPress={handleOnSubmitNote}>
                  {t('general.submit')}
                </Button>
                <Button className="w-full rounded-xl" variant="link" onPress={isEdit ? handleClose : handleOnCancelNote}>
                  {isEdit ? 'Close' : 'Cancel'}
                </Button>
              </HStack>
            </View>
          </VStack>
        </ActionsheetContent>
      </Actionsheet>
    </>
  );
}
// End of Selection
