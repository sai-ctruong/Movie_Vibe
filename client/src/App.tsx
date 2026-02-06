import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from './store/slices/authSlice';
import { authService } from './services/authService';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Browse = lazy(() => import('./pages/Browse'));
const Watch = lazy(() => import('./pages/Watch'));
const MovieDetail = lazy(() => import('./pages/MovieDetail'));
const Profile = lazy(() => import('./pages/Profile'));
const Search = lazy(() => import('./pages/Search'));
const Admin = lazy(() => import('./pages/Admin'));
const NguoncMovieDetail = lazy(() => import('./pages/NguoncMovieDetail'));
const NguoncWatch = lazy(() => import('./pages/NguoncWatch'));
const OphimMovieDetail = lazy(() => import('./pages/OphimMovieDetail'));
const OphimWatch = lazy(() => import('./pages/OphimWatch'));
const OphimSearch = lazy(() => import('./pages/OphimSearch'));
const OphimBrowse = lazy(() => import('./pages/OphimBrowse'));

// Layout - keep Header eager loaded since it's used on most pages
const Header = lazy(() => import('./components/layout/Header'));
const Footer = lazy(() => import('./components/layout/Footer'));

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      dispatch(setUser(user));
    }
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-netflix-black flex flex-col">
      <Suspense fallback={<LoadingSpinner />}>
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
                  <Footer />
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
                  <Footer />
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
                  <Footer />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/watch/:id"
            element={
              <ProtectedRoute>
                <>
                  <Header />
                  <Watch />
                  <Footer />
                </>
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
                  <Footer />
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
                  <Footer />
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
                  <Footer />
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
                  <Footer />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/nguonc/watch/:slug/:episode"
            element={
              <ProtectedRoute>
                <>
                  <Header />
                  <NguoncWatch />
                  <Footer />
                </>
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
                  <Footer />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ophim/watch/:slug/:episode"
            element={
              <ProtectedRoute>
                <>
                  <Header />
                  <OphimWatch />
                  <Footer />
                </>
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
                  <Footer />
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
                  <Footer />
                </>
              </ProtectedRoute>
            }
          />

          {/* Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
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
