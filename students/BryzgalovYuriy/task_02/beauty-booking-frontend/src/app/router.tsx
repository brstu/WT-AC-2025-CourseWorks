import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from '../App';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Booking from '../pages/Booking';

function NotFound() {
  return (
    <div style={{ padding: 16 }}>
      <h2>Not Found</h2>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/booking" replace /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'booking', element: <Booking /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
