import { Header } from '../components/Header';
import Sidebar from '../components/Sidebar';

import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/global.css';

import styles from '../styles/app.module.css';

function MyApp({ Component, pageProps }) {
  return <div className={styles.wrapper}>
    <Header />
    <div className={styles.main}>
      <Sidebar />

      <section className={styles.content}>
        <Component {...pageProps} />
      </section>
    </div>
  </div>
}

export default MyApp
