import React from 'react';
import EmojiPickerLib from 'emoji-picker-react';

export default function EmojiPicker({ onSelect }) {
  return (
    <EmojiPickerLib
      onEmojiClick={(emojiData) => { if(onSelect) onSelect(emojiData.emoji); }}
      searchDisabled
      skinTonesDisabled
      previewConfig={{ showPreview: false }}
      lazyLoadEmojis
      width={340}
      height={360}
      emojiStyle="native"
      theme="light"
    />
  );
}
