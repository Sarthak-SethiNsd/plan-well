// Shared PDF generation utility for Plan Well.
// Imported dynamically so the heavy jsPDF bundle is only loaded on button click.

function fmt(n) {
  if (typeof n !== 'number') return String(n)
  return Number.isInteger(n) ? String(n) : String(parseFloat(n.toFixed(1)))
}

function devLabel(val) {
  return val > 0 ? `+${fmt(val)}` : `${fmt(val)}`
}

/**
 * Generates and downloads a PDF of a Plan Well 7-day meal plan.
 *
 * @param {object} plan  - The full plan object: { inputs, nutritionTargets, weeklyPlan, weeklySummary }
 * @param {object|null} foods - Food database map (name → macros). If null, the food reference
 *                              table is omitted (e.g. when downloading a saved plan).
 */
export async function generateMealPlanPDF(plan, foods) {
  // Dynamic imports — keeps the bundle small; only loaded client-side on demand.
  const { jsPDF } = await import('jspdf')
  const autoTable = (await import('jspdf-autotable')).default

  const { inputs, nutritionTargets, weeklyPlan, weeklySummary } = plan

  const dietLabel = {
    vegetarian: 'Vegetarian',
    'vegetarian+egg': 'Vegetarian + Egg',
    'non-vegetarian': 'Non-Vegetarian',
  }[inputs.dietType] || inputs.dietType

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth  = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15
  const contentWidth = pageWidth - margin * 2

  // ── Colour palette ──────────────────────────────────────────────────────────
  const C = {
    darkGreen:   [23,  53,  37],
    sageGreen:   [166, 192, 174],
    white:       [255, 255, 255],
    lightGray:   [248, 249, 250],
    darkText:    [32,  55,  43],
    softText:    [93,  112, 100],
    rowAlt:      [241, 246, 242],
    totalsRow:   [218, 234, 221],
    warningBg:   [255, 248, 225],
    warningText: [120, 83,  15],
  }

  let y = 0

  // ── Helpers ─────────────────────────────────────────────────────────────────

  /** Check whether we need a new page before adding non-table content. */
  function checkPageBreak(needed = 20) {
    if (y + needed > pageHeight - 18) {
      doc.addPage()
      y = margin
    }
  }

  /** Print page numbers and footer line on every page. */
  function addFooters() {
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(7.5)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...C.softText)
      doc.text('Plan Well — planwell.vercel.app', margin, pageHeight - 7)
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 7, { align: 'right' })
      doc.setDrawColor(...C.sageGreen)
      doc.setLineWidth(0.3)
      doc.line(margin, pageHeight - 11, pageWidth - margin, pageHeight - 11)
    }
  }

  // ── PAGE 1: Header + Details + Targets + Weekly Summary ─────────────────────

  // Dark-green header bar
  doc.setFillColor(...C.darkGreen)
  doc.rect(0, 0, pageWidth, 50, 'F')

  doc.setTextColor(...C.white)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('Plan Well', margin, 22)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('7-Day Personalised Indian Meal Plan', margin, 31)

  const today = new Date().toLocaleDateString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
  doc.setFontSize(9)
  doc.text(`Generated: ${today}`, pageWidth - margin, 22, { align: 'right' })

  // Sage accent line below header
  doc.setFillColor(...C.sageGreen)
  doc.rect(0, 50, pageWidth, 2, 'F')

  y = 62

  // ── User details card ────────────────────────────────────────────────────────
  doc.setFillColor(...C.lightGray)
  doc.roundedRect(margin, y, contentWidth, 36, 3, 3, 'F')
  doc.setDrawColor(...C.sageGreen)
  doc.setLineWidth(0.4)
  doc.roundedRect(margin, y, contentWidth, 36, 3, 3, 'S')

  doc.setTextColor(...C.darkGreen)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Your Plan Details', margin + 5, y + 9)

  const col1x = margin + 5
  const col2x = margin + contentWidth / 2 + 5
  const rowH  = 7

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...C.darkText)

  doc.text(`Weight: ${inputs.weightKg} kg`,            col1x, y + 18)
  doc.text(`State: ${inputs.state}`,                   col2x, y + 18)
  doc.text(`Diet: ${dietLabel}`,                       col1x, y + 18 + rowH)
  doc.text(`Meals Per Day: ${inputs.mealsPerDay}`,     col2x, y + 18 + rowH)
  doc.text(`Est. Daily Calories: ${fmt(nutritionTargets.calories)} kcal`, col1x, y + 18 + rowH * 2)

  y += 44

  // ── Daily nutrition targets ──────────────────────────────────────────────────
  checkPageBreak(30)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...C.darkText)
  doc.text('Daily Nutrition Targets', margin, y)
  y += 4

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Calories', 'Protein', 'Carbohydrates', 'Fat', 'Fibre']],
    body: [[
      `${fmt(nutritionTargets.calories)} kcal`,
      `${fmt(nutritionTargets.protein)} g`,
      `${fmt(nutritionTargets.carbs)} g`,
      `${fmt(nutritionTargets.fat)} g`,
      `${fmt(nutritionTargets.fibre)} g`,
    ]],
    headStyles: { fillColor: C.darkGreen, textColor: C.white, fontStyle: 'bold', fontSize: 9, halign: 'center' },
    bodyStyles: { fontSize: 9, textColor: C.darkText, halign: 'center' },
    tableLineColor: [210, 220, 212],
    tableLineWidth: 0.2,
    theme: 'grid',
  })
  y = doc.lastAutoTable.finalY + 8

  // ── Weekly average summary ───────────────────────────────────────────────────
  checkPageBreak(55)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...C.darkText)
  doc.text('Weekly Average Summary', margin, y)
  y += 4

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Macro', 'Daily Target', 'Avg Achieved', 'Avg Deviation']],
    body: [
      ['Calories', `${fmt(nutritionTargets.calories)} kcal`, `${fmt(weeklySummary.avgDailyAchieved.calories)} kcal`, `${devLabel(weeklySummary.avgDailyDeviation.calories)} kcal`],
      ['Protein',  `${fmt(nutritionTargets.protein)} g`,    `${fmt(weeklySummary.avgDailyAchieved.protein)} g`,    `${devLabel(weeklySummary.avgDailyDeviation.protein)} g`],
      ['Carbs',    `${fmt(nutritionTargets.carbs)} g`,      `${fmt(weeklySummary.avgDailyAchieved.carbs)} g`,      `${devLabel(weeklySummary.avgDailyDeviation.carbs)} g`],
      ['Fat',      `${fmt(nutritionTargets.fat)} g`,        `${fmt(weeklySummary.avgDailyAchieved.fat)} g`,        `${devLabel(weeklySummary.avgDailyDeviation.fat)} g`],
      ['Fibre',    `${fmt(nutritionTargets.fibre)} g`,      `${fmt(weeklySummary.avgDailyAchieved.fibre)} g`,      `${devLabel(weeklySummary.avgDailyDeviation.fibre)} g`],
    ],
    headStyles: { fillColor: C.darkGreen, textColor: C.white, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: C.darkText },
    alternateRowStyles: { fillColor: C.rowAlt },
    tableLineColor: [210, 220, 212],
    tableLineWidth: 0.2,
    theme: 'grid',
    columnStyles: { 0: { fontStyle: 'bold' } },
  })

  // ── PAGES 2+: 7-Day Meal Plan ────────────────────────────────────────────────
  doc.addPage()
  y = margin

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...C.darkText)
  doc.text('7-Day Meal Plan', margin, y)
  doc.setFillColor(...C.sageGreen)
  doc.rect(margin, y + 3, contentWidth, 0.5, 'F')
  y += 10

  weeklyPlan.forEach((day) => {
    checkPageBreak(28)

    // Day header bar
    doc.setFillColor(...C.darkGreen)
    doc.roundedRect(margin, y, contentWidth, 9, 2, 2, 'F')
    doc.setTextColor(...C.white)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    const dayTitle = day.dayNote ? `Day ${day.day}  —  ${day.dayNote}` : `Day ${day.day}`
    doc.text(dayTitle, margin + 4, y + 6.2)
    y += 13

    day.meals.forEach((meal) => {
      checkPageBreak(32)

      // Meal name
      doc.setFontSize(9.5)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...C.darkGreen)
      doc.text(meal.meal, margin + 2, y)
      y += 4

      // Food items + totals row
      const foodRows = meal.items.map(item => [
        item.name,
        `${item.qty}${item.unit}`,
        `${fmt(item.macros.calories)} kcal`,
        `${fmt(item.macros.protein)} g`,
        `${fmt(item.macros.carbs)} g`,
        `${fmt(item.macros.fat)} g`,
        `${fmt(item.macros.fibre)} g`,
      ])

      const allRows = [
        ...foodRows,
        [
          'Meal Total', '',
          `${fmt(meal.mealTotals.calories)} kcal`,
          `${fmt(meal.mealTotals.protein)} g`,
          `${fmt(meal.mealTotals.carbs)} g`,
          `${fmt(meal.mealTotals.fat)} g`,
          `${fmt(meal.mealTotals.fibre)} g`,
        ],
      ]

      autoTable(doc, {
        startY: y,
        margin: { left: margin + 2, right: margin },
        head: [['Food Item', 'Qty', 'Calories', 'Protein', 'Carbs', 'Fat', 'Fibre']],
        body: allRows,
        headStyles: {
          fillColor: C.sageGreen,
          textColor: C.darkText,
          fontStyle: 'bold',
          fontSize: 7.5,
        },
        bodyStyles: { fontSize: 7.5, textColor: C.darkText },
        alternateRowStyles: { fillColor: C.rowAlt },
        tableLineColor: [210, 220, 212],
        tableLineWidth: 0.15,
        theme: 'grid',
        columnStyles: { 0: { cellWidth: 58 } },
        didParseCell: (data) => {
          if (data.row.index === allRows.length - 1) {
            data.cell.styles.fontStyle = 'bold'
            data.cell.styles.fillColor = C.totalsRow
            data.cell.styles.textColor = C.darkGreen
          }
        },
      })

      y = doc.lastAutoTable.finalY + 5
    })

    // Daily summary line
    checkPageBreak(10)
    const ds = day.dailySummary
    doc.setFontSize(8)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(...C.softText)
    doc.text(
      `Daily Total — Cal: ${fmt(ds.achieved.calories)} kcal | Protein: ${fmt(ds.achieved.protein)}g | Carbs: ${fmt(ds.achieved.carbs)}g | Fat: ${fmt(ds.achieved.fat)}g | Fibre: ${fmt(ds.achieved.fibre)}g`,
      margin + 2,
      y
    )
    y += 10
  })

  // ── Food Reference Table (only when foods DB is available) ────────────────────
  if (foods) {
    doc.addPage()
    y = margin

    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...C.darkText)
    doc.text('Food Reference Table', margin, y)
    doc.setFillColor(...C.sageGreen)
    doc.rect(margin, y + 3, contentWidth, 0.5, 'F')

    y += 9
    doc.setFontSize(8.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...C.softText)
    doc.text('All nutritional values used in your plan, per 100g or 100ml.', margin, y)
    y += 6

    const usedFoods = new Set()
    weeklyPlan.forEach(day =>
      day.meals.forEach(meal =>
        meal.items.forEach(item => usedFoods.add(item.name))
      )
    )

    const refRows = [...usedFoods].sort().map(name => {
      const f = foods[name]
      if (!f) return null
      const unit = f.serving.includes('ml') ? '100ml' : '100g'
      return [
        name, unit,
        `${fmt(f.calories)} kcal`,
        `${fmt(f.protein)} g`,
        `${fmt(f.carbs)} g`,
        `${fmt(f.fat)} g`,
        `${fmt(f.fibre)} g`,
      ]
    }).filter(Boolean)

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['Food Name', 'Per', 'Calories', 'Protein', 'Carbs', 'Fat', 'Fibre']],
      body: refRows,
      headStyles: { fillColor: C.darkGreen, textColor: C.white, fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 8, textColor: C.darkText },
      alternateRowStyles: { fillColor: C.rowAlt },
      tableLineColor: [210, 220, 212],
      tableLineWidth: 0.15,
      theme: 'grid',
      columnStyles: { 0: { cellWidth: 62 } },
    })

    y = doc.lastAutoTable.finalY + 12
  }

  // ── Notes & Disclaimer ────────────────────────────────────────────────────────
  checkPageBreak(55)

  // Warning box
  doc.setFillColor(...C.warningBg)
  doc.roundedRect(margin, y, contentWidth, 28, 3, 3, 'F')
  doc.setDrawColor(220, 180, 50)
  doc.setLineWidth(0.4)
  doc.roundedRect(margin, y, contentWidth, 28, 3, 3, 'S')

  doc.setFontSize(9.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...C.warningText)
  doc.text('Weight Update Recommendation', margin + 5, y + 9)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...C.darkText)
  const noteLines = doc.splitTextToSize(
    'If your weight has reduced by approximately 2 kg or more since starting this plan, re-generate with your updated weight for better accuracy.',
    contentWidth - 10
  )
  doc.text(noteLines, margin + 5, y + 17)
  y += 36

  // Disclaimer text
  doc.setFontSize(8)
  doc.setFont('helvetica', 'italic')
  doc.setTextColor(...C.softText)
  const disclaimerLines = doc.splitTextToSize(
    'Disclaimer: Plan Well is intended for educational and planning purposes only. It does not provide medical advice. Users with medical conditions or specific dietary requirements should consult a qualified healthcare professional or nutritionist before making dietary changes.',
    contentWidth
  )
  doc.text(disclaimerLines, margin, y)

  // ── Add footers to all pages, then save ──────────────────────────────────────
  addFooters()

  const dateStr = new Date().toISOString().split('T')[0]
  doc.save(`PlanWell-MealPlan-${dateStr}.pdf`)
}
