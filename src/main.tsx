import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { RhAuthProvider } from '@restheart-cloud/kit-react';
import { App } from './App';
import { installConsentsInterceptor } from './consents-signal';
import { environment } from './environments/environment';
import './styles.css';

// Must run before the first request goes out, so no 451 is missed.
installConsentsInterceptor();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <RhAuthProvider config={{ apiBaseUrl: environment.apiUrl }}>
        <App />
      </RhAuthProvider>
    </BrowserRouter>
  </StrictMode>
);
