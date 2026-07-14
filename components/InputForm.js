import { useEffect, useState } from 'react'
import { STATES } from '../lib/planner'
import styles from '../styles/InputForm.module.css'

const SUPP_TYPES = [
  { value: 'protein_powder', label: 'Protein Powder' },
  { value: 'protein_bar', label: 'Protein Bar' },
]

const MACRO_FIELDS = [
  { key: 'calories', label: 'Calories', unit: 'kcal', required: true },
  { key: 'protein', label: 'Protein', unit: 'g', required: true },
  { key: 'carbs', label: 'Carbohydrates', unit: 'g', required: true },
  { key: 'fat', label: 'Fat', unit: 'g', required: true },
  { key: 'fibre', label: 'Fibre', unit: 'g', required: true },
]

let supplementId = 0

function roundToOneDecimal(value) {
  return Math.round(value * 10) / 10
}

function createSupplement() {
  return { id: ++supplementId, type: '', macroBasis: '', servingGrams: '', calories: '', protein: '', carbs: '', fat: '', fibre: '' }
}

export default function InputForm({ onGenerate, loading, resetSignal }) {
  const [weight, setWeight] = useState('')
  const [state, setState] = useState('')
  const [dietType, setDietType] = useState('')
  const [meals, setMeals] = useState('')
  const [errors, setErrors] = useState({})
  const [supplements, setSupplements] = useState([])
  const [supplementErrors, setSupplementErrors] = useState({})

  useEffect(() => {
    setWeight('')
    setState('')
    setDietType('')
    setMeals('')
    setErrors({})
    setSupplements([])
    setSupplementErrors({})
  }, [resetSignal])

  function addSupplement() {
    if (supplements.length < 2) setSupplements(previous => [...previous, createSupplement()])
  }

  function removeSupplement(id) {
    setSupplements(previous => previous.filter(supplement => supplement.id !== id))
    setSupplementErrors(previous => {
      const next = { ...previous }
      delete next[id]
      return next
    })
  }

  function updateSupplement(id, field, value) {
    setSupplements(previous => previous.map(supplement => supplement.id === id ? { ...supplement, [field]: value } : supplement))
    setSupplementErrors(previous => {
      if (!previous[id]) return previous
      const next = { ...previous }
      delete next[id]
      return next
    })
  }

  function validatePlanFields() {
    const nextErrors = {}
    const parsedWeight = Number(weight)
    if (!weight) nextErrors.weight = 'Please enter your weight'
    else if (!Number.isFinite(parsedWeight)) nextErrors.weight = 'Please enter a valid number'
    else if (parsedWeight < 60 || parsedWeight > 100) nextErrors.weight = 'Weight must be between 60 kg and 100 kg'
    if (!state) nextErrors.state = 'Please select your state or union territory'
    if (!dietType) nextErrors.dietType = 'Please select your diet preference'
    if (!meals) nextErrors.meals = 'Please select meals per day'
    return nextErrors
  }

  function buildSupplements() {
    const nextErrors = {}
    const processedSupplements = []
    const typeCounts = supplements.reduce((counts, supplement) => {
      if (supplement.type) counts[supplement.type] = (counts[supplement.type] || 0) + 1
      return counts
    }, {})

    for (const supplement of supplements) {
      if (!supplement.type) continue
      if (typeCounts[supplement.type] > 1) {
        nextErrors[supplement.id] = 'Choose a different supplement type for each supplement.'
        continue
      }
      if (!supplement.macroBasis) {
        nextErrors[supplement.id] = 'Please choose how the nutrition values are listed.'
        continue
      }

      const values = {}
      const missingFields = MACRO_FIELDS.filter(field => supplement[field.key] === '').map(field => field.label)
      if (missingFields.length) {
        nextErrors[supplement.id] = `Please fill in all nutrition values: ${missingFields.join(', ')}.`
        continue
      }

      let invalid = false
      for (const field of MACRO_FIELDS) {
        const value = supplement[field.key]
        const parsed = Number(value)
        if (!Number.isFinite(parsed) || parsed < 0) {
          nextErrors[supplement.id] = 'Nutrition values must be non-negative numbers.'
          invalid = true
          break
        }
        values[field.key] = parsed
      }
      if (invalid) continue

      const servingGrams = Number(supplement.servingGrams)
      if (supplement.macroBasis === 'per100g' && (!Number.isFinite(servingGrams) || servingGrams <= 0)) {
        nextErrors[supplement.id] = 'Serving size must be greater than 0 grams.'
        continue
      }

      const conversionFactor = supplement.macroBasis === 'per100g' ? servingGrams / 100 : 1
      const perServing = {}
      for (const field of MACRO_FIELDS) perServing[field.key] = roundToOneDecimal(values[field.key] * conversionFactor)

      processedSupplements.push({
        type: supplement.type,
        macroBasis: supplement.macroBasis,
        servingGrams: supplement.macroBasis === 'per100g' ? servingGrams : null,
        perServing,
      })
    }

    return { nextErrors, processedSupplements }
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (loading) return

    const nextErrors = validatePlanFields()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    const { nextErrors: nextSupplementErrors, processedSupplements } = buildSupplements()
    setSupplementErrors(nextSupplementErrors)
    if (Object.keys(nextSupplementErrors).length) return

    onGenerate({ weight: Number(weight), state, dietType, mealsPerDay: Number(meals), supplements: processedSupplements })
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <h2 className={styles.formTitle}>Generate Your Plan</h2>
      <p className={styles.formSub}>Fill in your details to get a personalised 7-day meal plan</p>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="weight">Weight (kg)<span className={styles.labelHint}> · 60–100 kg only</span></label>
        <input id="weight" type="number" min={60} max={100} step={0.5} placeholder="e.g. 75" value={weight} onChange={event => setWeight(event.target.value)} className={`${styles.input} ${errors.weight ? styles.inputError : ''}`} />
        {errors.weight && <p className={styles.fieldError}>{errors.weight}</p>}
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="state">State or Union Territory</label>
        <p className={styles.fieldHint}>If your state or union territory is not listed, select <strong>All India</strong> — your region's food may not be present in our database.</p>
        <select id="state" value={state} onChange={event => setState(event.target.value)} className={`${styles.select} ${errors.state ? styles.inputError : ''}`}>
          <option value="">Select your state or union territory…</option>
          {STATES.map(item => <option key={item} value={item}>{item}</option>)}
        </select>
        {errors.state && <p className={styles.fieldError}>{errors.state}</p>}
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="diet">Diet Preference</label>
        <select id="diet" value={dietType} onChange={event => setDietType(event.target.value)} className={`${styles.select} ${errors.dietType ? styles.inputError : ''}`}>
          <option value="">Select diet type…</option>
          <option value="vegetarian">Vegetarian</option>
          <option value="vegetarian+egg">Vegetarian + Egg</option>
          <option value="non-vegetarian">Non-Vegetarian</option>
        </select>
        {errors.dietType && <p className={styles.fieldError}>{errors.dietType}</p>}
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="meals">Meals Per Day</label>
        <select id="meals" value={meals} onChange={event => setMeals(event.target.value)} className={`${styles.select} ${errors.meals ? styles.inputError : ''}`}>
          <option value="">Select number of meals…</option>
          <option value="2">2 meals</option><option value="3">3 meals</option><option value="4">4 meals</option><option value="5">5 meals</option><option value="6">6 meals</option>
        </select>
        {errors.meals && <p className={styles.fieldError}>{errors.meals}</p>}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Protein Supplements<span className={styles.labelHint}> · Optional</span></label>
        <p className={styles.fieldHint}>Enter the nutrition values from your supplement label. You can add up to 2 supplements.</p>

        {supplements.map(supplement => {
          const selectedByAnotherSupplement = new Set(
            supplements.filter(otherSupplement => otherSupplement.id !== supplement.id).map(otherSupplement => otherSupplement.type)
          )

          return (
          <div key={supplement.id} className={styles.supplementRow}>
            <div className={styles.supplementSelects}>
              <select aria-label="Supplement type" value={supplement.type} onChange={event => updateSupplement(supplement.id, 'type', event.target.value)} className={styles.select}>
                <option value="">Select supplement…</option>
                {SUPP_TYPES.map(type => <option key={type.value} value={type.value} disabled={selectedByAnotherSupplement.has(type.value)}>{type.label}</option>)}
              </select>
              <select aria-label="Nutrition value basis" value={supplement.macroBasis} onChange={event => updateSupplement(supplement.id, 'macroBasis', event.target.value)} className={styles.select} disabled={!supplement.type}>
                <option value="">Nutrition values are…</option>
                <option value="perServing">Per Serving</option>
                <option value="per100g">Per 100 g</option>
              </select>
            </div>

            {supplement.macroBasis && <>
              {supplement.macroBasis === 'per100g' && (
                <div className={styles.macroField}>
                  <label htmlFor={`supp-serving-${supplement.id}`}>Serving Size (grams)</label>
                  <input id={`supp-serving-${supplement.id}`} type="number" min="0.1" step="0.1" placeholder={supplement.type === 'protein_bar' ? 'e.g. 60' : 'e.g. 35'} value={supplement.servingGrams} onChange={event => updateSupplement(supplement.id, 'servingGrams', event.target.value)} className={styles.input} />
                </div>
              )}
              <p className={styles.macroHint}>Enter values {supplement.macroBasis === 'perServing' ? 'per serving.' : 'per 100 g.'}</p>
              <div className={styles.macroGrid}>
                {MACRO_FIELDS.map(field => (
                  <div key={field.key} className={styles.macroField}>
                    <label htmlFor={`supp-${field.key}-${supplement.id}`}>{field.label} *</label>
                    <input id={`supp-${field.key}-${supplement.id}`} type="number" min="0" step="0.1" inputMode="decimal" placeholder={field.unit} value={supplement[field.key]} onChange={event => updateSupplement(supplement.id, field.key, event.target.value)} className={styles.input} />
                  </div>
                ))}
              </div>
            </>}

            {supplementErrors[supplement.id] && <p className={styles.fieldError}>{supplementErrors[supplement.id]}</p>}
            <button type="button" className={styles.removeSupplementBtn} onClick={() => removeSupplement(supplement.id)}>× Remove</button>
          </div>
          )
        })}

        {supplements.length < 2 && <button type="button" className={styles.addSupplementBtn} onClick={addSupplement}>+ Add Supplement</button>}
      </div>

      <button type="submit" className={styles.submitBtn} disabled={loading}>
        {loading ? <span className={styles.btnLoading}><span className={styles.btnSpinner} />Generating your plan…</span> : '✨ Generate My 7-Day Plan'}
      </button>
    </form>
  )
}
