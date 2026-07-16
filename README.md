# Plan Well — 7-Day Indian Meal Planner

Plan Well is a professional, personalized 7-day meal planning application tailored specifically for Indian weight management and health goals. By integrating a rules-based meal generation engine with a curated Indian food database, Firebase backend services, and Gemini-powered smart label scanning, Plan Well provides structure, convenience, and actionable nutrition guides for users.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Local Development](#local-development)
- [Usage](#usage)
- [Validation & Algorithm Rules](#validation--algorithm-rules)
- [Known Limitations](#known-limitations)
- [License](#license)
- [Acknowledgements](#acknowledgements)

---

## Features

- **Personalized 7-Day Menus:** Custom-tailored meal calendars generated dynamically based on weight-loss criteria.
- **Regional & Diet Adaptability:**
  - Preferences: Vegetarian, Vegetarian + Egg, and Non-Vegetarian.
  - State-specific recommendations mapping localized food availability.
- **Flexible Meal Counts:** Generates meal structures supporting 2, 3, 4, 5, or 6 meals per day.
- **Smart Supplement Integration (Gemini OCR):**
  - Scan and extract nutrients from Protein Powder or Protein Bar labels using Gemini 2.0 Flash Vision.
  - Supports label basis of "Per 100g" (with configurable serving size) or "Per Serving".
  - Dynamically offsets and reduces primary whole-food protein quantities (Soya Chunks, Paneer, Tofu, Eggs, Non-Veg) in the generated plans.
- **Interactive UI Progress Checklist:** A visual, animated step-by-step checklist during the generation phase to enhance user experience.
- **User Dashboard & Archive:**
  - Google Sign-In with automated user profile creation in Firestore.
  - Automatic cloud archiving of generated plans for signed-in users.
  - History browsing and deletion support.
- **Premium PDF Reports:** Generates professional, clean-designed, shareable nutrition report sheets featuring personalized summary cards, structured daily breakdown layout, and a consolidated "Meal Nutrition Summary".
- **Structured Feedback System:** In-app rating and text submission logs saved directly to Cloud Firestore.

---

## Tech Stack

- **Framework:** Next.js (Pages Router)
- **UI Library:** React
- **Authentication:** Firebase Authentication (Google Auth Provider)
- **Database:** Cloud Firestore
- **AI Integration:** Google Gemini API (`gemini-2.0-flash`)
- **Document Export:** jsPDF & jsPDF-AutoTable
- **Styling:** Vanilla CSS (CSS Modules)

---

## Project Structure

```text
├── components/          # Reusable React components (Auth, Input Form, Results View)
├── data/                # Project data files (static JSON content)
├── lib/                 # Core business logic (Planner, PDF generation, Firebase configs)
│   ├── firebase.js      # Firebase authentication, user, and firestore methods
│   ├── generatePDF.js   # Premium jsPDF styling, layouts, and print options
│   └── planner.js       # Target calculation & 6-stage heuristic planning engine
├── pages/               # Next.js page routes (API routes & index/about/my-plans pages)
│   ├── api/
│   │   └── extract-supplement.js  # Server-side Gemini OCR processing endpoint
│   ├── index.js         # Landing / main workspace view
│   ├── about.js         # Informational / static content
│   └── my-plans.js      # Dashboard page for retrieving/managing saved plans
├── public/              # Static assets, fonts, icons
└── styles/              # Global stylesheets and modular component CSS files
```

---

## Installation

### Prerequisites
- Node.js (v18+ recommended)
- npm (v9+)
- A Firebase Project (with Auth & Firestore enabled)
- A Gemini API Key (from Google AI Studio)

### Step-by-Step Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/Sarthak-SethiNsd/plan-well.git
   cd plan-well
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Create your local environment configuration file:
   ```bash
   cp .env.local.example .env.local
   ```

4. Populate the `.env.local` file with your credentials:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   GEMINI_API_KEY=your_gemini_api_key
   ```

---

## Local Development

Start the Next.js development server:
```bash
npm run dev
```

The application will be running locally at `http://localhost:3000`.

### Production Build
To test the production build locally:
```bash
npm run build
npm run start
```

---

## Usage

1. **User Profile Setup:** Open the portal, click Google Sign-In at the top right to enable plan archiving.
2. **Form Entry:** Input your weight (within the validation limits), state, diet preference, and the preferred meal frequency.
3. **Supplement Upload (Optional):** Click "+ Add Supplement" to append up to 2 proteins. Set their details and upload a photo of the nutrition label.
4. **Plan Generation:** Click "Generate My 7-Day Plan" and follow the step-by-step progress checklist as the algorithm calculates your balanced diet.
5. **Review & Save:** Inspect your calories, macronutrients, and daily meal items. If signed in, the plan automatically commits to Firestore.
6. **Export:** Click "Download PDF" to retrieve the professional report sheet.

---

## Validation & Algorithm Rules

### Input Form Constraints
- **Weight Range:** Restricted to values between `60.0 kg` and `100.0 kg`.
- **Fields:** State, Diet Preference, and Meals Per Day are strictly required fields.
- **Supplements:** Limit of 2 maximum. Each active supplement row must have type, basis of nutrition, and label image provided. "Per 100g" basis requires the serving size in grams.

### Core Target Formula (Weight-Based)
For a user weighing $W$ kg:
- **Daily Calories ($C$):** $W \times 24$ kcal
- **Protein Goal ($P$):** $W \times 1.9$ g
- **Fat Goal ($F$):** $W \times 0.7$ g
- **Fibre Goal ($Fi$):** $(C \times 14) / 1000$ g
- **Carbohydrates Goal ($Carb$):** $(C - 4P - 9F) / 4$ g (subject to a minimum floor of $0$ g)

### Heuristic Generation Phases (planner.js)
1. **Stage 1 (Protein Allocation):** Seeds primary protein options in Breakfast, Lunch, and Dinner (e.g. Soya TVP, Paneer, Tofu, Egg, or Non-Veg) based on diet type and tier weight.
2. **Stage 2 (Base Energy Fill):** Fills out slot categories using standard carbohydrates, dairy, and grains (e.g. Oats, Roti, Rice, Curd, Milk) based on target meal counts.
3. **Stage 3 (Macro Tuning):** Adjusts overall carbohydrate, fat, and fiber totals using dal pools, fruit selections, and milk.
4. **Stage 4 (Local/Vegetarian Fill):** Appends non-meat regional selections to meet caloric deficits safely.
5. **Stage 5 (Macro Balancer):** Performs iterative minor trimming and adjustments on filler items to fit overall target limits.
6. **Stage 6 (Supplement Offset):** Offsets supplement protein content by sequentially subtracting $25\text{g}$ blocks of primary proteins in priority order: Cooked Soya Chunks (TVP) $\rightarrow$ Vegetarian Dinner Protein (Paneer) $\rightarrow$ Tofu / Egg / Non-veg. Inserts the scanned supplement item into the Breakfast slot.

---

## Known Limitations

- **Heuristic Deviations:** In rare cases of extreme inputs combined with heavy supplement loads, target macro bounds might experience slight deviations.
- **Local Database Scope:** Regional foods are mapped from a fixed spreadsheet dataset. If a region's specialized food is not listed, "All India" serves as the recommended default.
- **Next.js Windows Build Warning:** A timing race condition on Windows platform builds can occasionally output an `ENOENT _app.js.nft.json` warning during the trace phase. Re-running `npm run build` resolves this.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgements

- Firebase documentation and team for web authentication and Firestore SDK support.
- Gemini API Team for advanced vision capabilities in supplement OCR extraction.
- FPDF/jsPDF project communities for structural client-side layout export libraries.