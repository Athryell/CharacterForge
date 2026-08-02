import { useEffect } from 'react';
import { createCustomDefaultState } from '../data/mechanics';

// The custom system has no wizard: there are no rules to choose. This satisfies
// the creator slot by completing immediately with the default sheet, so the core
// needs no "does this system have a creator?" branch.
export default function CustomCreatorBridge({ onComplete }) {
  useEffect(() => {
    onComplete(createCustomDefaultState());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
