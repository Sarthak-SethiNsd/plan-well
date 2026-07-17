# Changelog

All notable changes to the **Plan Well** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.0] - 2026-07-14

### Added
- **Protein Supplement Support:** Added optional supplement entry to the planning form. Users can manually enter nutrition values (Calories, Protein, Carbohydrates, Fat, Fibre) from a Protein Powder or Protein Bar label, specifying whether values are per serving or per 100 g.
- **Supplement Priority Reduction Loop:** Implemented Stage 6 in `lib/planner.js` to offset protein supplement targets by dynamically scaling back primary protein sources (Soya TVP, Paneer, Tofu, Eggs, Non-Veg) in $25\text{g}$ iterations.
- **Form UI Supplement Formats:** Added dynamic add/remove supplement rows to `InputForm.js` supporting per-100g and per-serving options.
- **Animated Progress Checklist:** Introduced a step-by-step visual progress checklist card when generating plans, featuring delayed entry animations and checkbox validations.

### Changed
- **Results Layout Clean-up:** Removed legacy "Swap" buttons, quality badges, and calorie budget labels from the main results page and history cards for cleaner aesthetics.
- **Professional PDF Generation:** Redesigned PDF exports to output as clean nutrition report sheets with premium styling, summary cards, and highlighted macro blocks.

---

## [1.0.0] - 2026-07-03

### Added
- **Core 7-Day Planning Engine:** Implemented a 5-stage rule-based calculator for Indian menu planning.
- **Firebase Auth Setup:** Integrated Google Sign-In with automated database logging.
- **Firestore Document Sync:** Implemented auto-saving for generated meal plans under user accounts.
- **Feedback Logging:** Added Cloud Firestore feedback collection for logged-in accounts.
- **Dashboard Interface:** Dedicated 'My Plans' view displaying historical meal plans with deletion support.
- **Responsive Web Layout:** Built a modern forest-green styled viewport optimized for desktop, tablet, and mobile browsers.

---

[1.1.0]: https://github.com/Sarthak-SethiNsd/plan-well/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/Sarthak-SethiNsd/plan-well/releases/tag/v1.0.0
