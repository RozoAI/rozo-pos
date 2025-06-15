import React from 'react';

import { FocusAwareStatusBar } from '@/components/ui/focus-aware-status-bar';
import { SettingScreen } from '@/features/settings/setting-screen';

export default function SettingsPage() {
  return (
    <>
      <FocusAwareStatusBar />
      <SettingScreen />
    </>
  );
}
