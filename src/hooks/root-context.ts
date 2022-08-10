import { createContext } from 'react';
import { RootStore } from '../model/root-store';

export const RootContext = createContext<RootStore | undefined>(undefined);
