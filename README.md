# Scorer App - Hyper-Local Cricket Match Scoring

A mobile-first web application for scorers to manage and update live scores for hyper-local cricket matches. Built with Next.js 16, React 19, and TypeScript.

## 🚀 Features

- **Mobile-First Design**: Optimized for mobile devices with responsive UI
- **Real-Time Updates**: WebSocket integration for live score updates
- **Match Management**: Create, view, and update cricket matches
- **Scorer Dashboard**: Track your scoring activity and statistics
- **Authentication**: Secure login and registration for scorers
- **Modern Tech Stack**: Next.js 16, React 19, TypeScript, Tailwind CSS

## 📋 Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0
- Backend API running (NestJS backend)

## 🛠️ Installation

1. **Clone the repository** (or navigate to scorer-app directory):
   ```bash
   cd scorer-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and update:
   - `NEXT_PUBLIC_API_URL`: Your backend API URL
   - `NEXT_PUBLIC_WS_URL`: Your WebSocket URL

4. **Run development server**:
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3001`

## 📁 Project Structure

```
scorer-app/
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── login/        # Login page
│   │   ├── register/     # Registration page
│   │   ├── dashboard/    # Scorer dashboard
│   │   └── matches/      # Match management pages
│   ├── components/       # React components
│   │   └── ui/          # UI components (Button, Input, Card, etc.)
│   ├── contexts/        # React contexts (AuthContext)
│   ├── lib/             # Utilities and API client
│   │   ├── api.ts       # API client (Axios)
│   │   └── socket.ts    # WebSocket client
│   └── types/           # TypeScript type definitions
├── public/              # Static assets
├── .env.example         # Environment variables template
├── next.config.mjs      # Next.js configuration
├── tailwind.config.ts   # Tailwind CSS configuration
└── tsconfig.json        # TypeScript configuration
```

## 🔧 Available Scripts

- `npm run dev` - Start development server on port 3001
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🌐 Deployment

### Vercel Deployment

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare scorer-app for deployment"
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Select the `scorer-app` directory as the root
   - Add environment variables:
     - `NEXT_PUBLIC_API_URL`: Your production backend API URL
     - `NEXT_PUBLIC_WS_URL`: Your production WebSocket URL
   - Click "Deploy"

3. **Environment Variables in Vercel**:
   - Go to Project Settings → Environment Variables
   - Add:
     ```
     NEXT_PUBLIC_API_URL=https://api.scorenews.net
     NEXT_PUBLIC_WS_URL=wss://api.scorenews.net
     ```

### Manual Deployment

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Start production server**:
   ```bash
   npm run start
   ```

## 🔐 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `https://api.scorenews.net` |
| `NEXT_PUBLIC_WS_URL` | WebSocket server URL | `wss://api.scorenews.net` |
| `NODE_ENV` | Node environment | `production` |

## 📱 API Integration

The app connects to a NestJS backend API. Ensure your backend is running and accessible at the URL specified in `NEXT_PUBLIC_API_URL`.

### API Endpoints Used:
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/scorer/register` - Scorer registration
- `GET /api/v1/scorer/profile` - Get scorer profile
- `GET /api/v1/scorer/matches` - Get scorer's matches
- `POST /api/v1/cricket/local/matches` - Create new match
- `PUT /api/v1/cricket/local/matches/:id/score` - Update match score
- `GET /api/v1/cricket/local/matches/:id` - Get match details

## 🧪 Testing

```bash
# Type checking
npm run type-check

# Linting
npm run lint
```

## 🐛 Troubleshooting

### Build Errors
- Ensure Node.js version >= 20.0.0
- Clear `.next` folder and `node_modules`, then reinstall:
  ```bash
  rm -rf .next node_modules
  npm install
  ```

### API Connection Issues
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS settings on backend
- Ensure backend is running and accessible

### WebSocket Issues
- Verify `NEXT_PUBLIC_WS_URL` uses correct protocol (`ws://` for HTTP, `wss://` for HTTPS)
- Check WebSocket server is running on backend

## 📄 License

Private project for Scorenews.net

## 👥 Support

For issues or questions, contact the development team.
