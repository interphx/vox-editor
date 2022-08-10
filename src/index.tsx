import React from 'react';
import ReactDOM from 'react-dom/client';
import { RootContext } from './hooks/root-context';
import { createDefaultRootStore } from './model/root-store';
import { Editor } from './ui/editor';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

const rootStore = createDefaultRootStore();

root.render(
    <React.StrictMode>
        <RootContext.Provider value={rootStore}>
            <Editor />
        </RootContext.Provider>
    </React.StrictMode>
);
