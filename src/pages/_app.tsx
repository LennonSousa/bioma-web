import type { AppProps } from 'next/app';
import Head from 'next/head';
import { NextSeo } from 'next-seo';

import { SideBarProvider } from '../contexts/SideBarContext';
import { AuthProvider } from '../contexts/AuthContext';
import { NotificationsProvider } from '../contexts/NotificationsContext';
import { Header } from '../components/Header';
import Sidebar from '../components/Sidebar';

import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/global.css';

import styles from '../styles/app.module.css';

function MyApp({ Component, pageProps }: AppProps) {
  return <>
    <NextSeo titleTemplate="%s | Plataforma Bioma" defaultTitle="Plataforma de gerenciamento." />

    <Head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </Head>

    <NotificationsProvider>
      <AuthProvider>
        <SideBarProvider>
          <div className={styles.wrapper}>
            <Header />
            <div className={styles.main}>
              <Sidebar />

              <section className={styles.content}>
                <Component {...pageProps} />
              </section>
            </div>
          </div>
        </SideBarProvider>
      </AuthProvider>
    </NotificationsProvider>
  </>
}

export default MyApp;

