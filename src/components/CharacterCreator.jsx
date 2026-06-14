import DNDCharacterCreator from './creators/DNDCharacterCreator';
import DHCharacterCreator from './creators/DHCharacterCreator';

export default function CharacterCreator({ onComplete, onCancel, systemId = 'dnd5e2024' }) {
  if (systemId === 'daggerheart') return <DHCharacterCreator onComplete={onComplete} onCancel={onCancel} />;
  return <DNDCharacterCreator onComplete={onComplete} onCancel={onCancel} />;
}
