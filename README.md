# Plan Well — 7-Day Indian Meal Planner

Plan Well is a professional, personalized 7-day meal planning application tailored specifically for Indian weight management and health goals. It integrates a rules-based meal generation engine with a curated Indian food database and cloud backend services to provide structure, convenience, and actionable nutrition guides for users.

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
- **Protein Supplement Support:**
  - Optionally add up to 2 protein supplements (Protein Powder or Protein Bar) to your plan.
  - Manually enter nutrition values from your supplement label (Calories, Protein, Carbohydrates, Fat, Fibre).
  - Specify whether label values are per serving or per 100 g; if per 100 g, provide the serving size in grams.
  - The planner adjusts whole-food protein quantities (Soya Chunks, Paneer, Tofu, Eggs, Non-Veg) to account for the supplement, keeping the overall plan balanced.
- **Interactive Progress Checklist:** A visual, animated step-by-step checklist is shown while the plan is being generated.
- **User Dashboard & Archive:**
  - Google Sign-In with automated user profile creation.
  - Automatic cloud archiving of generated plans for signed-in users.
  - History browsing and deletion support.
- **Downloadable PDF Reports:** Generates professional, shareable nutrition report sheets featuring personalized summary cards, a structured daily breakdown, and a consolidated Meal Nutrition Summary.
- **Feedback Submission:** Signed-in users can submit ratings and written feedback from within the application.

---

## Tech Stack

- **Framework:** Next.js (Pages Router)
- **UI Library:** React
- **Authentication:** Firebase Authentication (Google Auth Provider)
- **Database:** Cloud Firestore
- **Document Export:** Client-side PDF report generation
- **Styling:** Vanilla CSS (CSS Modules)

---

## Project Structure

```text
├── components/          # Reusable React components (Auth, Input Form, Results View)
├── data/                # Project data files (static JSON content)
├── lib/                 # Core business logic (Planner, PDF generation, Firebase configs)
│   ├── firebase.js      # Firebase authentication, user, and Firestore methods
│   ├── generatePDF.js   # PDF report styling, layouts, and print options
│   └── planner.js       # Target calculation & 6-stage heuristic planning engine
├── pages/               # Next.js page routes (index, about, my-plans)
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
- A Firebase Project (with Authentication & Firestore enabled)

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

4. Populate the `.env.local` file with your Firebase credentials:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

---

## Local Development

Start the Next.js development server:
```bash
npm run dev
```

The application runs locally at `http://localhost:3000`.

### Production Build
To test the production build locally:
```bash
npm run build
npm run start
```

---

## Usage

1. **User Profile Setup:** Open the portal and click Google Sign-In at the top right to enable plan archiving.
2. **Form Entry:** Enter your weight (within the validation limits), state, diet preference, and preferred meal frequency.
3. **Supplement Entry (Optional):** Click **"+ Add Supplement"** to add up to 2 protein supplements. For each supplement, select the type, choose whether the label values are per serving or per 100 g, then manually enter the nutrition values (Calories, Protein, Carbohydrates, Fat, Fibre) from your supplement label.
4. **Plan Generation:** Click **"Generate My 7-Day Plan"** and follow the progress checklist while your balanced plan is calculated.
5. **Review & Save:** Inspect your calories, macronutrients, and daily meal items. If signed in, the plan is automatically saved to your account.
6. **Export:** Click **"Download PDF"** to save a copy of the nutrition report.

---

## Validation & Algorithm Rules

### Input Form Constraints
- **Weight Range:** Restricted to values between `60.0 kg` and `100.0 kg`.
- **Fields:** State, Diet Preference, and Meals Per Day are required fields.
- **Supplements:** Up to 2 supplements maximum. Each supplement row requires a type, a label basis (per serving or per 100 g), and all five nutrition values (Calories, Protein, Carbohydrates, Fat, Fibre). If the label basis is per 100 g, a serving size in grams is also required.

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
3. **Stage 3 (Macro Tuning):** Adjusts overall carbohydrate, fat, and fibre totals using dal pools, fruit selections, and milk.
4. **Stage 4 (Local/Vegetarian Fill):** Appends non-meat regional selections to meet caloric deficits safely.
5. **Stage 5 (Macro Balancer):** Performs iterative minor trimming and adjustments on filler items to fit overall target limits.
6. **Stage 6 (Supplement Offset):** When supplements are entered, offsets the supplement protein by sequentially reducing whole-food protein sources in priority order: Cooked Soya Chunks (TVP) $\rightarrow$ Vegetarian Dinner Protein (Paneer) $\rightarrow$ Tofu / Egg / Non-veg. The supplement is then added to the Breakfast slot.

---

## Known Limitations

- **Heuristic Deviations:** In rare cases involving extreme inputs combined with high supplement protein loads, target macro bounds may experience slight deviations.
- **Local Database Scope:** Regional foods are mapped from a fixed dataset. If a region's specialized food is not present, selecting "All India" is the recommended default.
- **Next.js Windows Build Warning:** A timing race condition on Windows platform builds can occasionally output an `ENOENT _app.js.nft.json` warning during the trace phase. Re-running `npm run build` resolves this.

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## Acknowledgements

- Firebase documentation and team for web authentication and Firestore SDK support.