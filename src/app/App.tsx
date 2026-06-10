import { RouterProvider } from 'react-router-dom';
import { AppProviders } from '@/app/providers/AppProviders';
import { router } from '@/app/router';

export const App = () => (
  <AppProviders>
    <RouterProvider router={router} />
  </AppProviders>
);

App.displayName = 'App';
