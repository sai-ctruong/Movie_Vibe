import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, User, ChevronDown, Film, Zap, Grid, X } from 'lucide-react';
import { authService } from '../../services/authService';

type SearchSource = 'ophim' | 'local';

export default function Header() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showOphimMenu, setShowOphimMenu] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSource, setSearchSource] = useState<SearchSource>('ophim');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (searchSource === 'ophim') {
        navigate(`/ophim/search?q=${encodeURIComponent(searchQuery)}`);
      } else {
        navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      }
      setSearchQuery('');
      setShowSearchDropdown(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black via-black/80 to-transparent">
      <div className="flex items-center justify-between px-4 md:px-12 py-4">
        {/* Logo and Navigation */}
        <div className="flex items-center space-x-8">
          <Link to="/" className="flex items-center space-x-2">
            <Film className="w-8 h-8 text-netflix-red" />
            <span className="text-2xl font-bold text-netflix-red">MovieFlix</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-white hover:text-gray-300 transition">
              Home
            </Link>
            <Link to="/browse" className="text-white hover:text-gray-300 transition">
              Browse
            </Link>
            
            {/* OPhim Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setShowOphimMenu(true)}
              onMouseLeave={() => setShowOphimMenu(false)}
            >
              <button className="flex items-center space-x-1 text-green-400 hover:text-green-300 transition font-medium">
                <Zap className="w-4 h-4" />
                <span>OPhim</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              
              {showOphimMenu && (
                <div className="absolute left-0 mt-2 w-52 bg-gray-900/95 backdrop-blur border border-gray-800 rounded-lg shadow-xl py-2 z-50">
                  <div className="px-3 py-2 border-b border-gray-800">
                    <span className="text-green-400 text-xs font-semibold flex items-center">
                      <Zap className="w-3 h-3 mr-1" />
                      KHÔNG QUẢNG CÁO
                    </span>
                  </div>
                  <Link
                    to="/ophim/search"
                    className="flex items-center px-4 py-2.5 text-white hover:bg-green-600/20 transition"
                    onClick={() => setShowOphimMenu(false)}
                  >
                    <Search className="w-4 h-4 mr-3 text-green-500" />
                    Tìm Kiếm Phim
                  </Link>
                  <Link
                    to="/ophim/browse"
                    className="flex items-center px-4 py-2.5 text-white hover:bg-green-600/20 transition"
                    onClick={() => setShowOphimMenu(false)}
                  >
                    <Grid className="w-4 h-4 mr-3 text-green-500" />
                    Duyệt Thể Loại
                  </Link>
                </div>
              )}
            </div>

            {user?.role === 'admin' && (
              <Link to="/admin" className="text-white hover:text-gray-300 transition">
                Admin
              </Link>
            )}
          </nav>
        </div>

        {/* Search and Profile */}
        <div className="flex items-center space-x-4">
          {/* Enhanced Search */}
          <div ref={searchRef} className="relative hidden md:block">
            <form onSubmit={handleSearch} className="flex items-center">
              <div className={`flex items-center bg-gray-900/90 border rounded-lg transition-all ${
                isSearchFocused ? 'border-green-500 ring-1 ring-green-500/50' : 'border-gray-700'
              }`}>
                {/* Source Selector */}
                <button
                  type="button"
                  onClick={() => setShowSearchDropdown(!showSearchDropdown)}
                  className={`flex items-center px-3 py-2 border-r border-gray-700 hover:bg-gray-800 transition rounded-l-lg ${
                    searchSource === 'ophim' ? 'text-green-400' : 'text-gray-400'
                  }`}
                >
                  {searchSource === 'ophim' ? (
                    <>
                      <Zap className="w-4 h-4 mr-1" />
                      <span className="text-xs font-medium">OPhim</span>
                    </>
                  ) : (
                    <>
                      <Film className="w-4 h-4 mr-1" />
                      <span className="text-xs font-medium">Local</span>
                    </>
                  )}
                  <ChevronDown className="w-3 h-3 ml-1" />
                </button>

                {/* Search Input */}
                <div className="relative flex items-center">
                  <Search className="absolute left-3 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder={searchSource === 'ophim' ? 'Tìm phim không QC...' : 'Tìm phim local...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className="bg-transparent text-white pl-10 pr-8 py-2 w-56 focus:outline-none placeholder-gray-500"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 text-gray-500 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </form>

            {/* Source Dropdown */}
            {showSearchDropdown && (
              <div className="absolute left-0 top-full mt-1 w-48 bg-gray-900/95 backdrop-blur border border-gray-800 rounded-lg shadow-xl py-1 z-50">
                <button
                  onClick={() => {
                    setSearchSource('ophim');
                    setShowSearchDropdown(false);
                  }}
                  className={`w-full flex items-center px-4 py-2.5 text-left transition ${
                    searchSource === 'ophim' ? 'bg-green-600/20 text-green-400' : 'text-white hover:bg-gray-800'
                  }`}
                >
                  <Zap className="w-4 h-4 mr-3" />
                  <div>
                    <div className="font-medium">OPhim</div>
                    <div className="text-xs text-gray-500">Không quảng cáo</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setSearchSource('local');
                    setShowSearchDropdown(false);
                  }}
                  className={`w-full flex items-center px-4 py-2.5 text-left transition ${
                    searchSource === 'local' ? 'bg-red-600/20 text-red-400' : 'text-white hover:bg-gray-800'
                  }`}
                >
                  <Film className="w-4 h-4 mr-3" />
                  <div>
                    <div className="font-medium">Local DB</div>
                    <div className="text-xs text-gray-500">Phim trong server</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          <button className="text-white hover:text-gray-300 transition">
            <Bell className="w-6 h-6" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2 text-white hover:text-gray-300 transition"
            >
              <div className="w-8 h-8 bg-netflix-red rounded flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <ChevronDown className="w-4 h-4" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-900/95 backdrop-blur border border-gray-800 rounded-lg shadow-xl py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-800">
                  <p className="text-white font-medium">{user?.name || 'User'}</p>
                  <p className="text-gray-500 text-xs">{user?.email || ''}</p>
                </div>
                <Link
                  to="/profile"
                  className="flex items-center px-4 py-2.5 text-white hover:bg-gray-800 transition"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <User className="w-4 h-4 mr-3 text-gray-500" />
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-2.5 text-red-400 hover:bg-gray-800 transition"
                >
                  <span className="w-4 h-4 mr-3">🚪</span>
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
