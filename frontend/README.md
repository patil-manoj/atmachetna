# Atma-Chethana - Counsellor Administration System

A modern React-based web application for counsellor administration, designed to manage student data, appointments, and counselling sessions efficiently.

## 🚀 Features

- **Admin Authentication**: Secure login system for counsellors
- **Student Management**: Comprehensive student database with search and filtering
- **Appointment System**: Book, confirm, and manage counselling appointments
- **Email Notifications**: Automated email confirmations and reminders
- **Dashboard Analytics**: Overview of student statistics and appointment metrics
- **Responsive Design**: Mobile-friendly interface with professional styling

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS with custom components
- **Routing**: React Router DOM
- **HTTP Client**: Axios with interceptors
- **UI Components**: Headless UI + Heroicons
- **State Management**: React Context API

## 📦 Installation

1. Clone the repository
```bash
git clone <repository-url>
cd atmachetna/frontend
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development server
```bash
npm run dev
```

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.jsx
│   ├── StudentsList.jsx
│   ├── AppointmentsList.jsx
│   ├── StatsCards.jsx
│   └── Tabs.jsx
├── pages/              # Page components
│   ├── LoginPage.jsx
│   └── Dashboard.jsx
├── context/            # React Context providers
│   └── AuthContext.jsx
├── utils/              # Utility functions
│   └── api.js
└── assets/             # Static assets
```

## 🎨 Styling

The application uses Tailwind CSS with custom utility classes:
- `.btn-primary` - Primary action buttons
- `.btn-secondary` - Secondary action buttons
- `.card` - Card containers
- `.input-field` - Form input fields

## 🔌 API Integration

All API calls are centralized in `src/utils/api.js` with:
- Automatic token handling
- Request/response interceptors
- Error handling
- Environment-based configuration

## 📱 Responsive Design

The application is fully responsive with:
- Mobile-first approach
- Flexible grid layouts
- Touch-friendly interactions
- Optimized for tablets and desktops

## 🚦 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔒 Authentication

The app includes a complete authentication system with:
- JWT token management
- Protected routes
- Automatic token refresh
- Secure logout functionality

## 📧 Email Features

- Appointment confirmation emails
- Reminder notifications
- Custom email templates
- SMTP integration ready

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request
