import Head from 'next/head';
import { NextSeo } from 'next-seo';

import { Header } from '../components/Header';
import Sidebar from '../components/Sidebar';

import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/global.css';

import styles from '../styles/app.module.css';

function MyApp({ Component, pageProps }) {
  return <>
    <NextSeo titleTemplate="Bioma | %s" defaultTitle="Plataforma de gerenciamento." />

    <Head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </Head>

    <div className={styles.wrapper}>
      <Header />
      <div className={styles.main}>
        <Sidebar />

        <section className={styles.content}>
          <Component {...pageProps} />
        </section>
      </div>
    </div>
  </>
}

export default MyApp
