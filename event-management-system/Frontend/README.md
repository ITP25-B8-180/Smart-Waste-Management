# Event Management System - Frontend

This is the frontend application for the Event Management System, built with React, Tailwind CSS, and modern web technologies.

## Features

- **Responsive Design**: Mobile-first design with Tailwind CSS
- **User Authentication**: Login and registration with JWT tokens
- **Event Management**: Create, view, edit, and delete events
- **Booking System**: Book events with real-time availability
- **Admin Dashboard**: Comprehensive admin interface
- **Profile Management**: Update user information and passwords
- **Real-time Updates**: Live data synchronization

## Pages & Components

### Public Pages
- **Home**: Landing page with features and call-to-action
- **Login**: User authentication
- **Register**: User registration
- **Events**: Browse and search events
- **Event Details**: View individual event details

### Protected Pages (User)
- **Dashboard**: User dashboard with stats and recent activity
- **Profile**: User profile management
- **Create Event**: Event creation form
- **Edit Event**: Event editing form
- **My Bookings**: Personal booking history

### Admin Pages
- **Admin Dashboard**: System overview and analytics
- **User Management**: Manage user accounts
- **Event Management**: Manage all events
- **Booking Management**: Oversee all bookings

## Components

### Core Components
- **Navbar**: Navigation with role-based menu items
- **ProtectedRoute**: Route protection with authentication
- **AuthContext**: Global authentication state management

### UI Components
- **Cards**: Reusable card components
- **Forms**: Form components with validation
- **Modals**: Modal dialogs for confirmations
- **Loading States**: Loading spinners and skeletons

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Tech Stack

- **React 18**: UI library with hooks
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client for API calls
- **React Hook Form**: Form handling and validation
- **React Hot Toast**: Notification system
- **Lucide React**: Icon library
- **Date-fns**: Date manipulation

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── Navbar.jsx
│   └── ProtectedRoute.jsx
├── contexts/           # React contexts
│   └── AuthContext.jsx
├── pages/              # Page components
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   ├── Events.jsx
│   ├── EventDetails.jsx
│   ├── Profile.jsx
│   ├── CreateEvent.jsx
│   ├── EditEvent.jsx
│   ├── Bookings.jsx
│   └── admin/          # Admin pages
├── utils/              # Utility functions
│   └── api.js
├── App.jsx             # Main app component
├── main.jsx           # Entry point
└── index.css          # Global styles
```

## State Management

The application uses React Context for global state management:

- **AuthContext**: Manages user authentication state
- **Local State**: Component-level state with useState
- **API Integration**: Axios for HTTP requests

## Styling

The application uses Tailwind CSS with custom components:

- **Utility Classes**: Tailwind utility classes
- **Custom Components**: Reusable component classes
- **Responsive Design**: Mobile-first approach
- **Dark Mode**: Ready for dark mode implementation

## API Integration

The frontend communicates with the backend through:

- **Axios Instance**: Configured with base URL and interceptors
- **Authentication**: Automatic token attachment
- **Error Handling**: Centralized error handling
- **Loading States**: Loading indicators for async operations

## Form Handling

Forms are handled using React Hook Form:

- **Validation**: Client-side validation
- **Error Messages**: User-friendly error messages
- **Performance**: Optimized re-renders
- **Accessibility**: Proper form labels and ARIA attributes

## Routing

The application uses React Router for navigation:

- **Protected Routes**: Authentication-required routes
- **Admin Routes**: Role-based route protection
- **Nested Routes**: Organized route structure
- **Navigation**: Programmatic navigation

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

The frontend uses Vite's environment variable system:

- `VITE_API_URL`: Backend API URL (default: /api)
- `VITE_APP_NAME`: Application name

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- **Code Splitting**: Route-based code splitting
- **Lazy Loading**: Component lazy loading
- **Optimized Bundle**: Vite build optimization
- **Image Optimization**: Responsive images

## Accessibility

- **Semantic HTML**: Proper HTML structure
- **ARIA Labels**: Screen reader support
- **Keyboard Navigation**: Full keyboard support
- **Color Contrast**: WCAG compliant colors

## Testing

The application is ready for testing with:

- **Unit Tests**: Component testing
- **Integration Tests**: API integration testing
- **E2E Tests**: End-to-end testing
- **Accessibility Tests**: A11y testing
