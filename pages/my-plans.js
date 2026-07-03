import { useEffect, useState } from 'react'
import Head from 'next/head'
import AuthNav from '../components/AuthNav'
import { deleteMealPlan, getMealPlans } from '../lib/firebase'
import { useAuth } from '../lib/useAuth'
import homeStyles from '../styles/Home.module.css'
import styles from '../styles/MyPlans.module.css'

function formatDate(value) {
  if (!value) return 'Date unavailable'
  const date = typeof value.toDate === 'function' ? value.toDate() : new Date(value)
  if (Number.isNaN(date.getTime())) return 'Date unavailable'
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function prettyDietType(value) {
  return {
    vegetarian: 'Vegetarian',
    'vegetarian+egg': 'Vegetarian + Egg',
    'non-vegetarian': 'Non-Vegetarian',
  }[value] || value
}

function SavedPlanDetails({ savedPlan }) {
  const plan = savedPlan?.plan
  if (!plan?.weeklyPlan) {
    return <p className={styles.emptyText}>This saved plan could not be displayed.</p>
  }

  return (
    <div className={styles.detailStack}>
      {plan.weeklyPlan.map(day => (
        <section key={day.day} className={styles.detailDay}>
          <h3>Day {day.day}</h3>
          {day.meals.map((meal, index) => (
            <div key={`${day.day}-${meal.meal}-${index}`} className={styles.detailMeal}>
              <div className={styles.detailMealHeader}>
                <strong>{meal.meal}</strong>
                <span>{meal.calorieBudget} kcal budget</span>
              </div>
              <div className={styles.detailFoods}>
                {meal.items.map((item, itemIndex) => (
                  <div key={`${item.name}-${itemIndex}`} className={styles.detailFoodRow}>
                    <span>{item.name}</span>
                    <strong>{item.qty}{item.unit}</strong>
                  </div>
                ))}
              </div>
              <p className={styles.detailMacros}>
                Cal: {meal.mealTotals.calories} kcal | Protein: {meal.mealTotals.protein}g | Carbs: {meal.mealTotals.carbs}g | Fat: {meal.mealTotals.fat}g
              </p>
            </div>
          ))}
        </section>
      ))}
    </div>
  )
}

export default function MyPlans() {
  const auth = useAuth()
  const [plans, setPlans] = useState([])
  const [loadingPlans, setLoadingPlans] = useState(false)
  const [error, setError] = useState('')
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [deletingId, setDeletingId] = useState('')

  useEffect(() => {
    if (auth.loading) return
    if (!auth.user) {
      setPlans([])
      setLoadingPlans(false)
      return
    }

    let active = true
    setLoadingPlans(true)
    setError('')

    getMealPlans(auth.user.uid)
      .then(items => {
        if (active) setPlans(items)
      })
      .catch(err => {
        console.error('Failed to load meal plans:', err)
        if (active) setError('We could not load your saved meal plans. Please try again.')
      })
      .finally(() => {
        if (active) setLoadingPlans(false)
      })

    return () => {
      active = false
    }
  }, [auth.loading, auth.user])

  async function handleDelete(planId) {
    const confirmed = window.confirm('Delete this saved meal plan? This cannot be undone.')
    if (!confirmed) return

    setDeletingId(planId)
    setError('')
    try {
      await deleteMealPlan(planId)
      setPlans(currentPlans => currentPlans.filter(plan => plan.id !== planId))
      if (selectedPlan?.id === planId) setSelectedPlan(null)
    } catch (err) {
      console.error('Failed to delete meal plan:', err)
      setError('We could not delete that meal plan. Please try again.')
    } finally {
      setDeletingId('')
    }
  }

  return (
    <>
      <Head>
        <title>My Meal Plans - Plan Well</title>
        <meta name="description" content="View saved Plan Well meal plans." />
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
          <section className={styles.pageHeader}>
            <h1>My Meal Plans</h1>
            <p>Review your saved 7-day meal plans and open the full details whenever you need them.</p>
          </section>

          {!auth.loading && !auth.user && (
            <div className={styles.stateCard}>Please sign in to view your saved meal plans.</div>
          )}

          {auth.user && loadingPlans && (
            <div className={styles.stateCard}>Loading your saved meal plans...</div>
          )}

          {auth.user && error && (
            <div className={styles.errorCard}>{error}</div>
          )}

          {auth.user && !loadingPlans && !error && plans.length === 0 && (
            <div className={styles.stateCard}>You haven't generated any meal plans yet.</div>
          )}

          {auth.user && plans.length > 0 && (
            <div className={styles.planGrid}>
              {plans.map(plan => (
                <article key={plan.id} className={styles.planCard}>
                  <div>
                    <p className={styles.dateLabel}>{formatDate(plan.createdAt)}</p>
                    <h2>{prettyDietType(plan.dietType)}</h2>
                  </div>
                  <dl className={styles.planMeta}>
                    <div><dt>Weight</dt><dd>{plan.weight} kg</dd></div>
                    <div><dt>State</dt><dd>{plan.state}</dd></div>
                    <div><dt>Meals</dt><dd>{plan.mealsPerDay} per day</dd></div>
                  </dl>
                  <div className={styles.cardActions}>
                    <button type="button" className={styles.primaryBtn} onClick={() => setSelectedPlan(plan)}>View Plan</button>
                    <button type="button" className={styles.dangerBtn} onClick={() => handleDelete(plan.id)} disabled={deletingId === plan.id}>
                      {deletingId === plan.id ? 'Deleting...' : 'Delete Plan'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>

        {selectedPlan && (
          <div className={styles.modalBackdrop} role="dialog" aria-modal="true" aria-label="Saved meal plan details">
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <div>
                  <p className={styles.dateLabel}>{formatDate(selectedPlan.createdAt)}</p>
                  <h2>{prettyDietType(selectedPlan.dietType)} Plan</h2>
                </div>
                <button type="button" className={styles.closeBtn} onClick={() => setSelectedPlan(null)}>Close</button>
              </div>
              <SavedPlanDetails savedPlan={selectedPlan} />
            </div>
          </div>
        )}
      </div>
    </>
  )
}
