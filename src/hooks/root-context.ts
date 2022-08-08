import { createContext } from 'react';
import { RootStore } from '../rendering/root-store';

export const RootContext = createContext<RootStore | undefined>(undefined);
