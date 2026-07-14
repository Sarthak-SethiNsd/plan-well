import { useRef, useState } from 'react'
import Head from 'next/head'
import { getFoodDatabase, generate7DayPlan } from '../lib/planner'
import InputForm from '../components/InputForm'
import Results from '../components/Results'
import AuthNav from '../components/AuthNav'
import { useAuth } from '../lib/useAuth'
import { saveMealPlan } from '../lib/firebase'
import styles from '../styles/Home.module.css'

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [planData, setPlanData] = useState(null)
  const [error, setError] = useState('')
  const [foods, setFoods] = useState(null)
  const [formResetKey, setFormResetKey] = useState(0)
  const resultsRef = useRef(null)
  const topRef = useRef(null)
  const auth = useAuth()

  async function handleGenerate({ weight, state, dietType, mealsPerDay, supplements }) {
    if (loading) return
    setError('')
    setLoading(true)
    setPlanData(null)

    try {
      let db = foods
      if (!db) {
        db = await getFoodDatabase()
        setFoods(db)
      }
      const plan = generate7DayPlan(weight, state, dietType, mealsPerDay, db, supplements || [])
      setPlanData({ plan, foods: db })
      if (auth.user) {
        saveMealPlan({ user: auth.user, weight, state, dietType, mealsPerDay, plan })
          .catch(saveErr => console.error('Failed to save meal plan:', saveErr))
      }
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior:'smooth', block:'start' }), 100)
    } catch (err) {
      setError('We could not generate your plan right now. Please check your connection and try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function handleStartNewPlan() {
    setError('')
    setLoading(false)
    setPlanData(null)
    setFormResetKey(key => key + 1)
    setTimeout(() => {
      topRef.current?.scrollIntoView({ behavior:'smooth', block:'start' })
    }, 50)
  }

  return (
    <>
      <Head>
        <title>Plan Well - 7-Day Indian Meal Planner</title>
        <meta name="description" content="Plan Well creates personalised 7-day Indian weight loss meal plans based on your weight, state, and diet." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className={styles.page} ref={topRef}>
        <header className={styles.header}>
          <div className={styles.headerInner}>
            <div className={styles.logo}>
              <span className={styles.logoIcon}>🥗</span>
              <span className={styles.logoText}>Plan Well</span>
            </div>
            <AuthNav
              user={auth.user}
              loading={auth.loading}
              isConfigured={auth.isFirebaseConfigured}
              onSignIn={auth.signIn}
              onSignOut={auth.signOut}
            />
          </div>
        </header>

        <section className={styles.hero}>
          <h1 className={styles.heroTitle}>
            Plan Smart.<br />
            <span className={styles.heroAccent}>Eat Right.</span>
          </h1>
          <p className={styles.heroSub}>
            Based on your weight, state, and dietary preferences - get a science-backed 7-day meal plan with precise quantities tailored for weight loss.
          </p>
        </section>

        <section className={styles.formSection}>
          <InputForm onGenerate={handleGenerate} loading={loading} resetSignal={formResetKey} />
          {error && (
            <div className={styles.error}>
              <p>{error}</p>
              <button type="button" onClick={() => setError('')} className={styles.retryButton}>Try again</button>
            </div>
          )}
        </section>

        {loading && (
          <div className={styles.loadingSection}>
            <div className={styles.spinner} />
            <p className={styles.loadingText}>Generating your personalised 7-day meal plan...</p>
            <p className={styles.loadingSubText}>Fetching food database and calculating macros</p>
          </div>
        )}

        {planData && !loading && (
          <div ref={resultsRef}>
            <Results
              plan={planData.plan}
              foods={planData.foods}
              user={auth.user}
              isFirebaseConfigured={auth.isFirebaseConfigured}
              onStartNewPlan={handleStartNewPlan}
            />
          </div>
        )}

        <footer className={styles.footer}>
          <p>© 2026 Plan Well · Built for healthy India</p>
          <p className={styles.footerNote}>This tool is for guidance only. Consult a nutritionist for medical advice.</p>
        </footer>
      </div>
    </>
  )
}
