import type { AppProps } from 'next/app';
import { AppThemeProvider } from '../context/ThemeContext';
import { Web3Provider } from '../context/Web3Context';
import { SettingsProvider } from '../context/SettingsContext';
import { AdminProvider } from '../context/AdminContext';
import Layout from '../components/layout/Layout';
import { ToastContainer } from 'react-toastify';
import { useRouter } from 'next/router';
import 'react-toastify/dist/ReactToastify.css';

export default function App({ Component, pageProps }: AppProps) {
  const router     = useRouter();
  const isAdminPage = router.pathname.startsWith('/admin');

  // Admin pages get no exchange layout
  if (isAdminPage) {
    return (
      <AdminProvider>
        <Component {...pageProps} />
      </AdminProvider>
    );
  }

  return (
    <AppThemeProvider>
      <SettingsProvider>
        <Web3Provider>
          <AdminProvider>
            <Layout>
              <Component {...pageProps} />
            </Layout>
            <ToastContainer
              position="bottom-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              pauseOnHover
              theme="colored"
            />
          </AdminProvider>
        </Web3Provider>
      </SettingsProvider>
    </AppThemeProvider>
  );
}
