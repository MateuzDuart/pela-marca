import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import Navbar from './components/navbar/index.tsx';
import Footer from './components/Footer/index.tsx';
import Sidebar from './components/sidebar/index.tsx';
import './index.css';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { UserProvider } from './context/userContext.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function RootLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <React.StrictMode>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <UserProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
              <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
              <main>
                <App />
              </main>
              <Footer />
              <Toaster position="top-center" />
            </div>
          </UserProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<RootLayout />);
