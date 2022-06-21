import '../styles/globals.css';
import { Toaster } from 'react-hot-toast';
// as は別名にしたいとき.
import { SessionProvider as AuthProvider } from "next-auth/react";

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <>
      <AuthProvider session={session}>
        <Component {...pageProps} />
      </AuthProvider>
      <Toaster />
    </>
  );
}

export default MyApp;
