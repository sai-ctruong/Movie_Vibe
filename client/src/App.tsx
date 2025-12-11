import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from './store/slices/authSlice';
import { authService } from './services/authService';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Browse from './pages/Browse';
import Watch from './pages/Watch';
import MovieDetail from './pages/MovieDetail';
import Profile from './pages/Profile';
import Search from './pages/Search';
import Admin from './pages/Admin';
import NguoncMovieDetail from './pages/NguoncMovieDetail';
import NguoncWatch from './pages/NguoncWatch';
import OphimMovieDetail from './pages/OphimMovieDetail';
import OphimWatch from './pages/OphimWatch';
import OphimSearch from './pages/OphimSearch';
import OphimBrowse from './pages/OphimBrowse';
import VideoTest from './pages/VideoTest';

// Layout
import Header from './components/layout/Header';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      dispatch(setUser(user));
    }
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-netflix-black">
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <>
                <Header />
                <Home />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/browse"
          element={
            <ProtectedRoute>
              <>
                <Header />
                <Browse />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/movie/:id"
          element={
            <ProtectedRoute>
              <>
                <Header />
                <MovieDetail />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/watch/:id"
          element={
            <ProtectedRoute>
              <Watch />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <>
                <Header />
                <Profile />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <>
                <Header />
                <Search />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <>
                <Header />
                <Admin />
              </>
            </ProtectedRoute>
          }
        />

        {/* NguonC Routes */}
        <Route
          path="/nguonc/:slug"
          element={
            <ProtectedRoute>
              <>
                <Header />
                <NguoncMovieDetail />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/nguonc/watch/:slug/:episode"
          element={
            <ProtectedRoute>
              <NguoncWatch />
            </ProtectedRoute>
          }
        />

        {/* OPhim Routes */}
        <Route
          path="/ophim/:slug"
          element={
            <ProtectedRoute>
              <>
                <Header />
                <OphimMovieDetail />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/ophim/watch/:slug/:episode"
          element={
            <ProtectedRoute>
              <OphimWatch />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ophim/search"
          element={
            <ProtectedRoute>
              <>
                <Header />
                <OphimSearch />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/ophim/browse"
          element={
            <ProtectedRoute>
              <>
                <Header />
                <OphimBrowse />
              </>
            </ProtectedRoute>
          }
        />

        {/* Video Test Route */}
        <Route
          path="/video-test"
          element={
            <ProtectedRoute>
              <VideoTest />
            </ProtectedRoute>
          }
        />

        {/* Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

interface ProtectedRouteProps {
  children: JSX.Element;
  adminOnly?: boolean;
}

function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const isAuth = authService.isAuthenticated();
  const user = authService.getCurrentUser();

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default App;
