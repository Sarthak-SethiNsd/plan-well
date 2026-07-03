import { useEffect, useState } from 'react'
import { STATES } from '../lib/planner'
import styles from '../styles/InputForm.module.css'

export default function InputForm({ onGenerate, loading, resetSignal }) {
  const [weight, setWeight]     = useState('')
  const [state, setState]       = useState('')
  const [dietType, setDietType] = useState('')
  const [meals, setMeals]       = useState('')
  const [errors, setErrors]     = useState({})

  useEffect(() => {
    setWeight('')
    setState('')
    setDietType('')
    setMeals('')
    setErrors({})
  }, [resetSignal])

  function validate() {
    const e = {}
    const w = parseFloat(weight)
    if (!weight)                e.weight = 'Please enter your weight'
    else if (isNaN(w))          e.weight = 'Please enter a valid number'
    else if (w < 60 || w > 100) e.weight = 'Weight must be between 60kg and 100kg'
    if (!state)    e.state    = 'Please select your state or union territory'
    if (!dietType) e.dietType = 'Please select your diet preference'
    if (!meals)    e.meals    = 'Please select meals per day'
    return e
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (loading) return
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length) return
    onGenerate({ weight: parseFloat(weight), state, dietType, mealsPerDay: parseInt(meals) })
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <h2 className={styles.formTitle}>Generate Your Plan</h2>
      <p className={styles.formSub}>Fill in your details to get a personalised 7-day meal plan</p>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="weight">
          Weight (kg)<span className={styles.labelHint}> · 60–100 kg only</span>
        </label>
        <input
          id="weight" type="number" min={60} max={100} step={0.5}
          placeholder="e.g. 75" value={weight}
          onChange={e => setWeight(e.target.value)}
          className={`${styles.input} ${errors.weight ? styles.inputError : ''}`}
        />
        {errors.weight && <p className={styles.fieldError}>{errors.weight}</p>}
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="state">State or Union Territory</label>
        <p className={styles.fieldHint}>
          If your state or union territory is not listed, select <strong>All India</strong> — your region's food may not be present in our database.
        </p>
        <select
          id="state" value={state} onChange={e => setState(e.target.value)}
          className={`${styles.select} ${errors.state ? styles.inputError : ''}`}
        >
          <option value="">Select your state or union territory…</option>
          {STATES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {errors.state && <p className={styles.fieldError}>{errors.state}</p>}
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="diet">Diet Preference</label>
        <select
          id="diet" value={dietType} onChange={e => setDietType(e.target.value)}
          className={`${styles.select} ${errors.dietType ? styles.inputError : ''}`}
        >
          <option value="">Select diet type…</option>
          <option value="vegetarian">Vegetarian</option>
          <option value="vegetarian+egg">Vegetarian + Egg</option>
          <option value="non-vegetarian">Non-Vegetarian</option>
        </select>
        {errors.dietType && <p className={styles.fieldError}>{errors.dietType}</p>}
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="meals">Meals Per Day</label>
        <select
          id="meals" value={meals} onChange={e => setMeals(e.target.value)}
          className={`${styles.select} ${errors.meals ? styles.inputError : ''}`}
        >
          <option value="">Select number of meals…</option>
          <option value="2">2 meals</option>
          <option value="3">3 meals</option>
          <option value="4">4 meals</option>
          <option value="5">5 meals</option>
          <option value="6">6 meals</option>
        </select>
        {errors.meals && <p className={styles.fieldError}>{errors.meals}</p>}
      </div>

      <button type="submit" className={styles.submitBtn} disabled={loading}>
        {loading ? (
          <span className={styles.btnLoading}>
            <span className={styles.btnSpinner} />Generating Your Plan...
          </span>
        ) : '✨ Generate My 7-Day Plan'}
      </button>
    </form>
  )
}
