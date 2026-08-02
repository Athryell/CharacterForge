import React, { useEffect } from 'react';
import DNDCharacterCreator from '../systems/dnd5e2024/components/DNDCharacterCreator';
import DHCharacterCreator from '../systems/daggerheart/components/DHCharacterCreator';
import { createCustomDefaultState } from '../systems/custom/data/mechanics';

function CustomCreatorBridge({ onComplete }) {
  useEffect(() => {
    onComplete(createCustomDefaultState());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

export default function CharacterCreator({ onComplete, onCancel, systemId = 'dnd5e2024' }) {
  if (systemId === 'daggerheart') return <DHCharacterCreator onComplete={onComplete} onCancel={onCancel} />;
  if (systemId === 'custom')      return <CustomCreatorBridge onComplete={onComplete} />;
  return <DNDCharacterCreator onComplete={onComplete} onCancel={onCancel} />;
}
