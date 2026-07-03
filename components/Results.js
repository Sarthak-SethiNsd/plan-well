import { useState } from 'react'
import { saveFeedback } from '../lib/firebase'
import styles from '../styles/Results.module.css'

function fmt(n) {
  if (typeof n !== 'number') return n
  return Number.isInteger(n) ? n : parseFloat(n.toFixed(1))
}

function devLabel(val) { return val > 0 ? `+${fmt(val)}` : `${fmt(val)}` }

function MealCard({ meal }) {
  return (
    <div className={styles.mealCard}>
      <div className={styles.mealHeader}>
        <span className={styles.mealName}>{meal.meal}</span>
        <div className={styles.mealHeaderActions}>
          <span className={styles.mealBudget}>{fmt(meal.calorieBudget)} kcal budget</span>
          <button type="button" className={styles.swapBtn}>Swap</button>
        </div>
      </div>
      <div className={styles.mealItems}>
        {meal.items.map((item, i) => (
          <div key={i} className={styles.foodRow}>
            <span className={styles.foodName}>{item.name}</span>
            <span className={styles.foodQty}>{item.qty}{item.unit}</span>
          </div>
        ))}
      </div>
      <div className={styles.mealTotals}>
        <span>Cal: <strong>{fmt(meal.mealTotals.calories)}</strong> kcal</span>
        <span className={styles.pipe}>|</span>
        <span>Protein: <strong>{fmt(meal.mealTotals.protein)}</strong>g</span>
        <span className={styles.pipe}>|</span>
        <span>Carbs: <strong>{fmt(meal.mealTotals.carbs)}</strong>g</span>
        <span className={styles.pipe}>|</span>
        <span>Fat: <strong>{fmt(meal.mealTotals.fat)}</strong>g</span>
        <span className={styles.pipe}>|</span>
        <span>Fibre: <strong>{fmt(meal.mealTotals.fibre)}</strong>g</span>
      </div>
    </div>
  )
}

function DayCard({ day }) {
  const [open, setOpen] = useState(day.day === 1)
  return (
    <div className={styles.dayCard}>
      <button className={styles.dayHeader} onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <div className={styles.dayHeaderLeft}>
          <span className={styles.dayNumber}>Day {day.day}</span>
          {day.dayNote && <span className={styles.dayNote}>🥚 {day.dayNote}</span>}
        </div>
        <div className={styles.dayHeaderRight}>
          <span className={styles.chevron}>{open ? '▲' : '▼'}</span>
        </div>
      </button>
      {open && (
        <div className={styles.dayBody}>
          {day.meals.map((meal, i) => <MealCard key={i} meal={meal} />)}
          <div className={styles.dailySummary}>
            <p className={styles.dailySummaryTitle}>Daily Achieved</p>
            <div className={styles.macroGrid}>
              {[
                ['Calories', 'calories', 'kcal'],
                ['Protein',  'protein',  'g'],
                ['Carbs',    'carbs',    'g'],
                ['Fat',      'fat',      'g'],
                ['Fibre',    'fibre',    'g'],
              ].map(([label, key, unit]) => (
                <div key={key} className={styles.macroRow}>
                  <span className={styles.macroLabel}>{label}</span>
                  <span className={styles.macroAchieved}>{fmt(day.dailySummary.achieved[key])}{unit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function FoodReferenceTable({ plan, foods }) {
  const usedFoods = new Set()
  plan.weeklyPlan.forEach(day => day.meals.forEach(meal => meal.items.forEach(item => usedFoods.add(item.name))))
  const rows = [...usedFoods].sort().map(name => {
    const f = foods[name]
    if (!f) return null
    return { name, unit: f.serving.includes('ml') ? '100ml' : '100g', ...f }
  }).filter(Boolean)

  return (
    <div className={styles.refTableSection}>
      <h3 className={styles.sectionTitle}>📋 Food Reference</h3>
      <p className={styles.refTableNote}>All nutritional values used in your plan, per 100g or 100ml.</p>
      <div className={styles.tableWrapper}>
        <table className={styles.refTable}>
          <thead>
            <tr>
              <th>Food Name</th><th>Per</th><th>Calories</th><th>Protein</th><th>Carbs</th><th>Fat</th><th>Fibre</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className={i%2===0 ? styles.rowEven : styles.rowOdd}>
                <td className={styles.foodNameCell}>{row.name}</td>
                <td>{row.unit}</td>
                <td>{fmt(row.calories)} kcal</td>
                <td>{fmt(row.protein)}g</td>
                <td>{fmt(row.carbs)}g</td>
                <td>{fmt(row.fat)}g</td>
                <td>{fmt(row.fibre)}g</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function FeedbackForm({ user, isFirebaseConfigured }) {
  const [rating, setRating]       = useState(0)
  const [hovered, setHovered]     = useState(0)
  const [comment, setComment]     = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!user || !rating || submitting || !isFirebaseConfigured) return

    setSubmitting(true)
    setError('')
    try {
      await saveFeedback({ user, rating, feedback: comment.trim() })
      setSubmitted(true)
    } catch (err) {
      setError(err.message || 'We could not submit your feedback. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) return (
    <div className={styles.feedbackSubmitted}>
      <span className={styles.feedbackIcon}>🙏</span>
      <p>Thank you for your feedback! It helps us improve.</p>
    </div>
  )

  return (
    <form className={styles.feedbackForm} onSubmit={handleSubmit}>
      <h3 className={styles.sectionTitle}>💬 How was your experience?</h3>
      {!isFirebaseConfigured && (
        <p className={styles.feedbackNotice}>Firebase setup is required before feedback can be submitted.</p>
      )}
      {isFirebaseConfigured && !user && (
        <p className={styles.feedbackNotice}>Please sign in with Google before submitting feedback.</p>
      )}
      <div className={styles.stars}>
        {[1,2,3,4,5].map(s => (
          <button key={s} type="button"
            className={`${styles.star} ${s<=(hovered||rating) ? styles.starActive : ''}`}
            onMouseEnter={() => setHovered(s)} onMouseLeave={() => setHovered(0)}
            onClick={() => setRating(s)}>★</button>
        ))}
      </div>
      <textarea className={styles.feedbackText} rows={3}
        placeholder="Share your thoughts, suggestions, or report any issues…"
        value={comment} onChange={e => setComment(e.target.value)} />
      {error && <p className={styles.feedbackError}>{error}</p>}
      <button type="submit" className={styles.feedbackBtn} disabled={!user || !rating || submitting || !isFirebaseConfigured}>
        {submitting ? 'Submitting...' : 'Submit Feedback'}
      </button>
    </form>
  )
}

export default function Results({ plan, foods, user, isFirebaseConfigured, onStartNewPlan }) {
  const { inputs, nutritionTargets, weeklyPlan, weeklySummary } = plan
  const dietLabel = { vegetarian:'Vegetarian', 'vegetarian+egg':'Vegetarian + Egg', 'non-vegetarian':'Non-Vegetarian' }[inputs.dietType] || inputs.dietType

  return (
    <div className={styles.results}>
      <div className={styles.planHeader}>
        <h2 className={styles.planTitle}>🍽️ Your Personalised 7-Day Meal Plan</h2>
        <div className={styles.planMeta}>
          <span className={styles.metaBadge}>{dietLabel}</span>
          <span className={styles.metaBadge}>{inputs.state}</span>
          <span className={styles.metaBadge}>{inputs.mealsPerDay} meals/day</span>
          <span className={styles.metaBadge}>{inputs.weightKg} kg</span>
        </div>
      </div>

      <div className={styles.targetsCard}>
        <h3 className={styles.targetsTitle}>🎯 Your Daily Targets</h3>
        <div className={styles.targetsGrid}>
          {[['calories','kcal'],['protein','g Protein'],['carbs','g Carbs'],['fat','g Fat'],['fibre','g Fibre']].map(([k,lbl]) => (
            <div key={k} className={styles.targetItem}>
              <span className={styles.targetVal}>{fmt(nutritionTargets[k])}</span>
              <span className={styles.targetLbl}>{lbl}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.daysSection}>
        {weeklyPlan.map((day, i) => <DayCard key={i} day={day} />)}
      </div>

      <div className={styles.weeklySummaryCard}>
        <h3 className={styles.sectionTitle}>📊 Weekly Average</h3>
        <div className={styles.weeklyHeader}>
          <span className={styles.macroLabel}>Macro</span>
          <span className={styles.macroTarget}>Target</span>
          <span className={styles.macroAchieved}>Avg Achieved</span>
          <span className={styles.macroDev}>Avg Deviation</span>
        </div>
        {[['Calories','calories','kcal'],['Protein','protein','g'],['Carbs','carbs','g'],['Fat','fat','g'],['Fibre','fibre','g']].map(([label,key,unit]) => {
          const dev = weeklySummary.avgDailyDeviation[key]
          const tol = key==='calories' ? 50 : key==='carbs' ? 10 : 5
          const cls = Math.abs(dev)<=tol ? styles.devOk : dev>0 ? styles.devOver : styles.devUnder
          return (
            <div key={key} className={styles.weeklyMacroRow}>
              <span className={styles.macroLabel}>{label}</span>
              <span className={styles.macroTarget}>{fmt(nutritionTargets[key])}{unit}</span>
              <span className={styles.macroAchieved}>{fmt(weeklySummary.avgDailyAchieved[key])}{unit}</span>
              <span className={`${styles.macroDev} ${cls}`}>{devLabel(dev)}{unit}</span>
            </div>
          )
        })}
      </div>

      <div className={styles.reEvalNote}>
        <span className={styles.reEvalIcon}>⚠️</span>
        <p>If your weight has reduced by approximately <strong>2kg or more</strong> since starting this plan, re-generate with your updated weight for better accuracy.</p>
      </div>

      <FoodReferenceTable plan={plan} foods={foods} />
      <FeedbackForm user={user} isFirebaseConfigured={isFirebaseConfigured} />

      <div className={styles.newPlanSection}>
        <button type="button" className={styles.newPlanBtn} onClick={onStartNewPlan}>Start New Plan</button>
      </div>
    </div>
  )
}
