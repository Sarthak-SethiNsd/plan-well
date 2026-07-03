import Head from 'next/head'
import AboutSection from '../components/AboutSection'
import AuthNav from '../components/AuthNav'
import aboutContent from '../data/about.json'
import { useAuth } from '../lib/useAuth'
import styles from '../styles/About.module.css'
import homeStyles from '../styles/Home.module.css'

export default function About() {
  const auth = useAuth()

  return (
    <>
      <Head>
        <title>{aboutContent.title} - Plan Well</title>
        <meta name="description" content={aboutContent.subtitle} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className={homeStyles.page}>
        <header className={homeStyles.header}>
          <div className={homeStyles.headerInner}>
            <a href="/" className={homeStyles.logo}>
              <span className={homeStyles.logoIcon}>🥗</span>
              <span className={homeStyles.logoText}>Plan Well</span>
            </a>
            <AuthNav
              user={auth.user}
              loading={auth.loading}
              isConfigured={auth.isFirebaseConfigured}
              onSignIn={auth.signIn}
              onSignOut={auth.signOut}
            />
          </div>
        </header>

        <main className={styles.pageShell}>
          <section className={styles.hero}>
            <h1>{aboutContent.title}</h1>
            <p>{aboutContent.subtitle}</p>
          </section>

          <div className={styles.sectionGrid}>
            {aboutContent.sections.map(section => (
              <AboutSection key={section.title} section={section} />
            ))}
          </div>
        </main>
      </div>
    </>
  )
}
