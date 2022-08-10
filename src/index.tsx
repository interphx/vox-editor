import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app';
import { RootContext } from './hooks/root-context';
import './index.css';
import { createDefaultRootStore } from './model/root-store';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

const rootStore = createDefaultRootStore();
(window as any).rootStore = rootStore;

root.render(
    <React.StrictMode>
        <RootContext.Provider value={rootStore}>
            <App />
        </RootContext.Provider>
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
