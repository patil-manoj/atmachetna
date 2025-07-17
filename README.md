# Atma Chethana - Counseling Management System

A comprehensive web application for managing student counseling services with separate dashboards for administrators and students.

## Features

### Admin/Counsellor Dashboard
- Student management (view, add, edit student profiles)
- Appointment scheduling and management
- Dashboard with statistics and overview
- Session notes and follow-up tracking
- Email notifications

### Student Dashboard
- Personal profile view
- Appointment history and upcoming sessions
- Request new appointments
- View session summaries and recommendations
- Progress tracking

## Tech Stack

### Backend
- Node.js with Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing
- Nodemailer for email notifications

### Frontend
- React 18 with Vite
- Tailwind CSS for styling
- React Router for navigation
- Axios for API calls
- Heroicons for icons

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Git

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory:
   ```bash
   # Database
   MONGODB_URI=mongodb://localhost:27017/atma-chethana
   # Or for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/atma-chethana

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d

   # Bcrypt Configuration
   BCRYPT_SALT_ROUNDS=12

   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Email Configuration (Optional - for email notifications)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM=noreply@atmachetna.com
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```

5. Create sample data (optional):
   ```bash
   npm run sample-data
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the frontend directory:
   ```bash
   VITE_API_BASE_URL=http://localhost:5000/api
   VITE_APP_NAME=Atma Chethana
   ```

4. Start the frontend development server:
   ```bash
   npm run dev
   ```

## Default Login Credentials

### After running the sample data script:

**Administrator:**
- Email: admin@atmachetna.com
- Password: admin123

**Students:**
- Email: john.doe@student.com / Password: student123
- Email: alice.smith@student.com / Password: student123
- Email: michael.johnson@student.com / Password: student123

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login (admin or student)
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - Logout

### Students
- `GET /api/students` - Get all students (admin only)
- `GET /api/students/me` - Get student's own profile
- `POST /api/students` - Create new student (admin only)
- `PUT /api/students/:id` - Update student (admin only)

### Appointments
- `GET /api/appointments` - Get appointments (filtered by role)
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment
- `PATCH /api/appointments/:id/confirm` - Confirm appointment
- `PATCH /api/appointments/:id/complete` - Complete appointment

### Statistics
- `GET /api/stats/dashboard` - Get dashboard statistics

## Usage

### For Administrators/Counsellors:

1. Login with admin credentials
2. Access the admin dashboard to:
   - View and manage student profiles
   - Schedule and manage appointments
   - View statistics and analytics
   - Manage session notes and follow-ups

### For Students:

1. Login with student credentials
2. Access the student dashboard to:
   - View personal profile information
   - See appointment history and upcoming sessions
   - Request new appointments
   - View progress and session summaries

## Development

### Backend Development
- Run `npm run dev` for development with nodemon
- API will be available at `http://localhost:5000`

### Frontend Development
- Run `npm run dev` for development server
- Frontend will be available at `http://localhost:5173`

### Database Schema

#### Student Model
- Personal Information (name, email, phone, etc.)
- Academic Information (class, school, subjects, etc.)
- Counseling Information (session notes, risk level, etc.)
- Authentication (password, student ID, role)

#### Appointment Model
- Student and counsellor references
- Appointment details (date, time, type, mode)
- Status tracking (pending, confirmed, completed, etc.)
- Session notes and follow-up information

#### Admin Model
- Basic information (name, email, role)
- Authentication (password, last login)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
