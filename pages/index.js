import { useEffect, useRef, useState } from 'react'
import Head from 'next/head'
import { getFoodDatabase, generate7DayPlan } from '../lib/planner'
import InputForm from '../components/InputForm'
import Results from '../components/Results'
import AuthNav from '../components/AuthNav'
import { useAuth } from '../lib/useAuth'
import { saveMealPlan } from '../lib/firebase'
import styles from '../styles/Home.module.css'

/* ── Progress steps shown while generating (purely visual) ─────────────────── */
const STEPS = [
  { id: 1, label: 'Calculating your calorie target'        },
  { id: 2, label: 'Selecting suitable foods for your diet' },
  { id: 3, label: 'Building balanced meal combinations'    },
  { id: 4, label: 'Optimising nutrition across 7 days'     },
  { id: 5, label: 'Preparing your final meal plan…'        },
]

/* Delays (ms) at which each step becomes "done" while loading */
const STEP_DELAYS = [400, 900, 1500, 2200, 3100]

export default function Home() {
  const [loading,      setLoading]      = useState(false)
  const [planData,     setPlanData]     = useState(null)
  const [error,        setError]        = useState('')
  const [foods,        setFoods]        = useState(null)
  const [formResetKey, setFormResetKey] = useState(0)
  const [doneSteps,    setDoneSteps]    = useState([])   // ids of completed steps
  const [visibleSteps, setVisibleSteps] = useState([])   // ids of steps that have appeared

  const resultsRef = useRef(null)
  const topRef     = useRef(null)
  const timerRefs  = useRef([])
  const auth       = useAuth()

  /* Start / stop the visual progress animation whenever `loading` changes */
  useEffect(() => {
    if (loading) {
      setDoneSteps([])
      setVisibleSteps([])

      // Stagger each step's appearance, then mark it done 250 ms later
      STEPS.forEach((step, i) => {
        const appearDelay = i * 420
        const doneDelay   = appearDelay + 250

        const t1 = setTimeout(() => {
          setVisibleSteps(prev => prev.includes(step.id) ? prev : [...prev, step.id])
        }, appearDelay)

        const t2 = setTimeout(() => {
          setDoneSteps(prev => prev.includes(step.id) ? prev : [...prev, step.id])
        }, doneDelay)

        timerRefs.current.push(t1, t2)
      })
    } else {
      // Clear all pending timers when loading finishes or errors
      timerRefs.current.forEach(clearTimeout)
      timerRefs.current = []
    }

    return () => {
      timerRefs.current.forEach(clearTimeout)
      timerRefs.current = []
    }
  }, [loading])

  /* ── Generation handler (unchanged logic) ─────────────────────────────────── */
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
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150)
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
      topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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

        {/* ── Animated progress checklist ─────────────────────────────────── */}
        {loading && (
          <div className={styles.loadingSection}>
            <div className={styles.loadingCard}>
              <div className={styles.loadingHeader}>
                <span className={styles.loadingSpinnerRing} />
                <span className={styles.loadingHeading}>Creating Your 7-Day Plan…</span>
              </div>

              <ul className={styles.stepList}>
                {STEPS.map(step => {
                  const isVisible = visibleSteps.includes(step.id)
                  const isDone    = doneSteps.includes(step.id)
                  return (
                    <li
                      key={step.id}
                      className={`${styles.stepItem} ${isVisible ? styles.stepVisible : ''} ${isDone ? styles.stepDone : ''}`}
                    >
                      <span className={styles.stepIcon}>
                        {isDone ? '✓' : <span className={styles.stepDot} />}
                      </span>
                      <span className={styles.stepLabel}>{step.label}</span>
                    </li>
                  )
                })}
              </ul>

              <p className={styles.loadingNote}>
                This usually takes just a few seconds
              </p>
            </div>
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
