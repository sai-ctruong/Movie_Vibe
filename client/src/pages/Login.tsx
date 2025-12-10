import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film } from 'lucide-react';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';
import MoviePosterBackground from '../components/MoviePosterBackground';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authService.login(formData);
      toast.success('Login successful!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-netflix-black relative overflow-hidden">
      {/* Movie Poster Background with scrolling animation */}
      <MoviePosterBackground />
      
      <div className="relative z-10 w-full max-w-md p-8">
        <div className="bg-black bg-opacity-80 backdrop-blur-sm rounded-lg p-12 shadow-2xl">
          <div className="flex items-center justify-center mb-8">
            <Film className="w-12 h-12 text-netflix-red" />
            <span className="text-3xl font-bold text-netflix-red ml-2">MovieFlix</span>
          </div>

          <h1 className="text-3xl font-bold text-white mb-8">Sign In</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-400">
              New to MovieFlix?{' '}
              <Link to="/register" className="text-white hover:underline">
                Sign up now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

