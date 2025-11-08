# 🏗️ Drywall Management System

A comprehensive, production-ready full-stack application for managing drywall installation projects with real-time progress tracking, material requests, and offline capabilities.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.2-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)

## ✨ Features

### 📊 Complete Project Management
- **5-Phase Tracking System**: Plasterboard Fixing → Taping → Second Coat → Top Coat → Sanding
- **Real-time Progress Updates**: Visual progress bars and status indicators
- **Photo & Audio Documentation**: Upload photos and record audio notes for each phase
- **Undo Functionality**: Revert phase updates with complete history tracking

### 👥 Role-Based Access Control
- **Admin**: Full system access and user management
- **Supervisor**: Create activities, approve material requests, manage teams
- **Trade Worker**: Update phases, request materials, document work

### 📦 Material Management
- **Request System**: Submit material requests with justification
- **Approval Workflow**: Supervisors review and approve/reject requests
- **Urgency Levels**: LOW, NORMAL, URGENT, CRITICAL
- **Activity Linking**: Associate requests with specific activities

### 🌐 Offline-First Architecture
- **Service Worker**: PWA with offline capabilities
- **IndexedDB**: Local data caching and sync queue
- **Automatic Sync**: Background synchronization when online
- **Retry Logic**: Failed requests automatically retry

### 🎨 Modern UI/UX
- **Gradient Design**: Beautiful orange-pink gradients throughout
- **Responsive**: Works perfectly on desktop, tablet, and mobile
- **Real-time Updates**: Instant feedback on all actions
- **Toast Notifications**: User-friendly success/error messages

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- PostgreSQL 14 or higher
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd drypro2
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/drywall_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
PORT=3001
NODE_ENV=development
```

4. **Set up the database**
```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed demo data
npx tsx server/seed.ts
```

5. **Start the development servers**
```bash
# Start both frontend and backend
npm run dev

# Or start them separately:
npm run dev:client  # Frontend on http://localhost:3000
npm run dev:server  # Backend on http://localhost:3001
```

6. **Access the application**

Open your browser to `http://localhost:3000`

### 🔑 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@demo.com | demo123 |
| Supervisor | supervisor@demo.com | demo123 |
| Worker | worker@demo.com | demo123 |

## 📁 Project Structure

```
drypro2/
├── src/                          # Frontend React application
│   ├── components/               # React components
│   │   ├── ui/                  # shadcn/ui base components
│   │   ├── Layout.tsx           # Main layout with navigation
│   │   ├── ActivityCard.tsx     # Activity list card
│   │   ├── ActivityDetailModal.tsx  # Full activity view
│   │   ├── PhaseProgress.tsx    # 5-phase tracking UI
│   │   ├── CreateActivityModal.tsx  # Activity creation form
│   │   └── ...
│   ├── pages/                   # Page components
│   │   ├── Login.tsx            # Authentication page
│   │   ├── Dashboard.tsx        # Stats and overview
│   │   ├── Activities.tsx       # Activity management
│   │   ├── MaterialRequests.tsx # Material request system
│   │   └── Settings.tsx         # User preferences
│   ├── store/                   # Zustand state management
│   │   ├── authStore.ts         # Authentication state
│   │   ├── activityStore.ts     # Activities state
│   │   ├── phaseStore.ts        # Phase updates state
│   │   ├── materialStore.ts     # Materials & requests state
│   │   └── siteStore.ts         # Sites state
│   ├── lib/                     # Utilities
│   │   ├── axios.ts             # API client configuration
│   │   ├── utils.ts             # Helper functions
│   │   └── offline-db.ts        # IndexedDB for offline mode
│   ├── App.tsx                  # Main app with routing
│   ├── main.tsx                 # Entry point
│   └── index.css                # Global styles
├── server/                      # Backend Express server
│   ├── server.ts                # Main server file
│   └── seed.ts                  # Database seeding script
├── prisma/                      # Database
│   └── schema.prisma            # Database schema
├── public/                      # Static assets
├── uploads/                     # Uploaded files (photos/audio)
│   ├── photos/
│   └── audio/
└── package.json                 # Dependencies
```

## 🗄️ Database Schema

### Core Tables
- **users**: User accounts with role-based access
- **sites**: Construction sites
- **activities**: Work units/patches
- **phases**: 5 phases per activity with progress tracking
- **phase_history**: Audit trail for undo functionality
- **photos**: Phase documentation images
- **audio_notes**: Voice notes for phases

### Material Management
- **materials**: Available materials catalog
- **material_requests**: Worker requests for materials

### System
- **notifications**: User notifications
- **sync_queue**: Offline sync pending actions

## 🔧 Technology Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI component library
- **Zustand** - State management
- **React Router** - Navigation
- **Axios** - HTTP client
- **Dexie** - IndexedDB wrapper
- **React Dropzone** - File uploads
- **Sonner** - Toast notifications
- **Lucide Icons** - Icon library

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **Prisma** - ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Multer** - File uploads

## 📱 PWA Features

The application is a Progressive Web App with:
- **Offline Support**: Works without internet connection
- **Add to Home Screen**: Install as a native app
- **Background Sync**: Syncs data when connection restored
- **Push Notifications**: Real-time updates (future feature)

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based authorization
- SQL injection prevention via Prisma
- XSS protection
- CORS configuration
- File upload validation

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Activities
- `GET /api/activities` - List activities (filtered by role)
- `GET /api/activities/:id` - Get activity details
- `POST /api/activities` - Create activity (Supervisor+)
- `PATCH /api/activities/:id` - Update activity

### Phases
- `PATCH /api/phases/:id` - Update phase (with file upload)
- `POST /api/phases/:id/undo` - Undo last phase update

### Materials
- `GET /api/materials` - List materials
- `GET /api/material-requests` - List requests
- `POST /api/material-requests` - Create request
- `PATCH /api/material-requests/:id/approve` - Approve request
- `PATCH /api/material-requests/:id/reject` - Reject request

### Other
- `GET /api/sites` - List sites
- `GET /api/users` - List users (Admin/Supervisor)
- `GET /api/notifications` - User notifications
- `POST /api/sync` - Offline sync endpoint
- `GET /api/dashboard/stats` - Dashboard statistics

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Type checking
npm run type-check

# Linting
npm run lint
```

## 🏗️ Building for Production

```bash
# Build frontend
npm run build

# Build backend
npm run build:server

# Start production server
NODE_ENV=production node dist/server.js
```

## 🌍 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | postgresql://user:pass@localhost:5432/db |
| JWT_SECRET | Secret key for JWT tokens | your-256-bit-secret |
| PORT | Backend server port | 3001 |
| NODE_ENV | Environment mode | development/production |

## 📈 Future Enhancements

- [ ] Real-time collaboration with WebSockets
- [ ] Advanced reporting and analytics
- [ ] Time tracking per phase
- [ ] Cost estimation and tracking
- [ ] Team chat functionality
- [ ] Mobile native apps (React Native)
- [ ] Email notifications
- [ ] Calendar integration
- [ ] Export to PDF/Excel
- [ ] Multi-language support

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

Built with ❤️ by the Drywall Management Team

## 🙏 Acknowledgments

- shadcn/ui for the beautiful component library
- Prisma for the excellent ORM
- All the open-source contributors

## 📞 Support

For support, email support@drywallmanager.com or open an issue on GitHub.

---

**Happy Building! 🏗️**
