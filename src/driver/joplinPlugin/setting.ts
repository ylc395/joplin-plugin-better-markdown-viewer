import { SettingItem, SettingItemType } from 'api/types';
import { BEHAVIOR_IN_VIEW_MODE, DEFAULT_PORT, PORT, SECTION_NAME } from '../constants';

export enum Behaviors {
  None,
  Editor,
  EditorView,
}

const setting: Record<string, SettingItem> = {
  [BEHAVIOR_IN_VIEW_MODE]: {
    label: 'What happen when double clicking In View-only layout',
    isEnum: true,
    options: {
      [Behaviors.None]: 'Nothing happens',
      [Behaviors.Editor]: 'Toggle out Editor',
      [Behaviors.EditorView]: 'Toggle out Editor-View',
    },
    type: SettingItemType.Int,
    public: true,
    value: Behaviors.EditorView,
    section: SECTION_NAME,
    description: 'Actual Effect depends on your layout button sequence setting',
  },
  [PORT]: {
    label: 'Port',
    type: SettingItemType.Int,
    public: true,
    value: DEFAULT_PORT,
    section: SECTION_NAME,
    description: 'This plugin will open a port to enable the communication between editor and previewer. Restart Joplin to take effect.',
  },
};

export default setting;
