# Plan Well

Plan Well is a meal planning website that helps users create structured 7-day Indian meal plans for healthier eating and weight-management goals. Each meal plan is personalized using the user's weight, state, diet preference, and preferred number of meals per day.

The website focuses on providing practical, easy-to-follow meal plans based on a carefully designed rule-based planning system and a curated Indian food database.

## Features

- Personalized 7-day Indian meal plans
- State-based meal recommendations
- Vegetarian, Vegetarian + Egg, and Non-Vegetarian meal plans
- Adjustable meals per day
- Google Sign-In
- Automatic user profile creation
- Automatic saving of meal plans for signed-in users
- View previously generated meal plans
- Delete saved meal plans
- Feedback submission for signed-in users
- Responsive interface for desktop and mobile devices

## Installation

```bash
npm install
```

## Running Locally

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

To create a production build:

```bash
npm run build
```

To run the production build locally:

```bash
npm run start
```

## Environment Variables

Create a `.env.local` file in the project root using `.env.local.example` as a template.

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

Do not commit `.env.local`.

## Firebase Setup

1. Create a Firebase project.
2. Register a Web App.
3. Copy the Firebase configuration into `.env.local`.
4. Enable Google Authentication.
5. Create a Cloud Firestore database.
6. Configure Firestore rules for users, feedback, and meal plans.
7. If Firestore requests a composite index for saved meal plans, create the suggested index using `userId` and `createdAt`.

## Project Structure

```text
components/        Reusable React components
data/              Editable JSON content
lib/               Firebase and meal-planning helpers
pages/             Next.js Pages Router
public/            Static assets
styles/            CSS modules and global styles
```

## Technologies Used

- Next.js
- React
- Firebase Authentication
- Firebase Firestore
- CSS Modules

## Future Improvements

- Add automated testing
- Add nutrition analytics
- Add PDF export for meal plans
- Improve account-level meal plan management
- Support additional health goals

## Disclaimer

Plan Well is intended for educational and planning purposes only. It does not provide medical advice. Users with medical conditions or specific dietary requirements should consult a qualified healthcare professional or nutritionist before making dietary changes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.