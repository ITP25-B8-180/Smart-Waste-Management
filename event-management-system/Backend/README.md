# Event Management System - Backend

This is the backend API for the Event Management System, built with Node.js, Express.js, and MongoDB.

## Features

- **User Authentication**: JWT-based authentication with password hashing
- **Role-based Access Control**: Admin and user roles with appropriate permissions
- **CRUD Operations**: Complete CRUD for users, events, and bookings
- **Input Validation**: Request validation using express-validator
- **Error Handling**: Comprehensive error handling middleware
- **Database Integration**: MongoDB with Mongoose ODM

## API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /register` - Register a new user
- `POST /login` - User login
- `GET /me` - Get current user profile

### User Routes (`/api/users`)
- `GET /` - Get all users (Admin only)
- `GET /:id` - Get user by ID
- `PUT /:id` - Update user profile
- `PUT /:id/password` - Update user password
- `DELETE /:id` - Deactivate user (Admin only)
- `PUT /:id/activate` - Activate user (Admin only)

### Event Routes (`/api/events`)
- `GET /` - Get all events with pagination and filtering
- `GET /:id` - Get event by ID
- `POST /` - Create new event
- `PUT /:id` - Update event
- `DELETE /:id` - Delete event
- `GET /user/:userId` - Get events by user

### Booking Routes (`/api/bookings`)
- `GET /` - Get all bookings (Admin only)
- `GET /user/:userId` - Get user's bookings
- `POST /` - Create new booking
- `PUT /:id` - Update booking status
- `DELETE /:id` - Cancel booking

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/event_management
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

3. Start the server:
```bash
npm run dev
```

## Environment Variables

- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `NODE_ENV` - Environment (development/production)

## Database Models

### User Model
- User authentication and profile information
- Role-based access (admin/user)
- Account activation status

### Event Model
- Event details and metadata
- Organizer reference
- Attendee tracking
- Status management

### Booking Model
- User-event relationship
- Booking status and payment tracking
- Unique constraint on user-event pairs

## Middleware

- **Authentication**: JWT token verification
- **Authorization**: Role-based access control
- **Validation**: Input validation and sanitization
- **Error Handling**: Centralized error handling

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Input validation and sanitization
- CORS protection
- Role-based access control

## Development

```bash
# Start development server
npm run dev

# Start production server
npm start
```

## Testing

The API can be tested using tools like Postman or curl. All endpoints require proper authentication headers for protected routes.

Example authentication header:
```
Authorization: Bearer <your_jwt_token>
```
