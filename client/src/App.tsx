import { ThemeProvider } from 'next-themes';
import { RouterProvider } from 'react-router-dom';

import { router } from './core/routes';

function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      storageKey="vite-ui-theme"
    >
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
