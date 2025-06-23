# SkylWorld - Social Media Platform with AdMob Integration

A modern web application that combines desktop browser functionality with social media features, built for monetization through Google AdMob.

## Features

- **Desktop Web Browser Interface**: Navigate to skyl.name.ng with sidebar navigation and toolbar
- **Mobile Social Media App**: Complete social platform with posts, comments, and user interactions
- **AdMob Integration**: Banner ads, interstitial ads, and rewarded video ads with coin system
- **PWA Functionality**: Install prompts, push notifications, auto-updates
- **Database Integration**: PostgreSQL with user management, posts, and activity tracking
- **Offline Support**: Service worker for offline functionality

## Quick Start

```bash
npm install
npm run db:push
npm run dev
```

## Deployment

This app is ready for free deployment on:
- **Vercel** (recommended)
- **Netlify** 
- **Railway**
- **Render**

See `FREE_DEPLOYMENT_GUIDE.md` for detailed instructions.

## AdMob Setup

Replace the test ad unit IDs in the following files with your real AdMob IDs:
- `client/src/components/AdMobBanner.tsx`
- `client/src/components/AdMobInterstitial.tsx`
- `client/src/components/AdMobRewarded.tsx`

See `ADMOB_SETUP.md` for complete instructions.

## Project Structure

```
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Shared types and schemas
├── package.json     # Dependencies
└── README.md        # This file
```

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Wouter
- **Backend**: Express, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Deployment**: Ready for Vercel/Netlify/Railway

## License

MIT License - Feel free to use for commercial purposes.