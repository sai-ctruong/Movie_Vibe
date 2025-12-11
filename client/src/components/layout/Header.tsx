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
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black via-black/80 to-transparent backdrop-blur-sm">
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
              className="relative group"
            >
              <button className="flex items-center space-x-1 text-green-400 hover:text-green-300 transition font-medium py-4">
                <Zap className="w-4 h-4" />
                <span>OPhim VIP</span>
                <ChevronDown className="w-3 h-3 group-hover:rotate-180 transition-transform" />
              </button>
              
              <div className="absolute top-full left-0 w-64 bg-gray-900/95 backdrop-blur border border-gray-800 rounded-lg shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                <div className="px-4 py-2 border-b border-gray-800">
                  <span className="text-green-400 text-xs font-bold tracking-wider flex items-center">
                    <Zap className="w-3 h-3 mr-1" />
                    SERVER KHÔNG QUẢNG CÁO
                  </span>
                </div>
                <Link
                  to="/ophim/search"
                  className="flex items-center px-4 py-3 text-white hover:bg-green-600/20 transition border-l-2 border-transparent hover:border-green-500"
                >
                  <Search className="w-4 h-4 mr-3 text-green-500" />
                  Tìm Kiếm Phim
                </Link>
                <Link
                  to="/ophim/browse"
                  className="flex items-center px-4 py-3 text-white hover:bg-green-600/20 transition border-l-2 border-transparent hover:border-green-500"
                >
                  <Grid className="w-4 h-4 mr-3 text-green-500" />
                  Duyệt Thể Loại
                </Link>
              </div>
            </div>

            {/* Categories Dropdown */}
            <div className="relative group">
               <button className="flex items-center space-x-1 text-white hover:text-gray-300 transition font-medium py-4">
                  <span>Thể loại</span>
                  <ChevronDown className="w-3 h-3 group-hover:rotate-180 transition-transform" />
               </button>

               <div className="absolute top-full left-0 w-[400px] bg-gray-900/95 backdrop-blur border border-gray-800 rounded-lg shadow-xl p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 grid grid-cols-2 gap-2">
                  {[
                    { name: 'Hành Động', slug: 'hanh-dong' },
                    { name: 'Tình Cảm', slug: 'tinh-cam' },
                    { name: 'Hài Hước', slug: 'hai-huoc' },
                    { name: 'Kinh Dị', slug: 'kinh-di' },
                    { name: 'Tâm Lý', slug: 'tam-ly' },
                    { name: 'Viễn Tưởng', slug: 'vien-tuong' },
                    { name: 'Hoạt Hình', slug: 'hoat-hinh' },
                    { name: 'Học Đường', slug: 'hoc-duong' },
                    { name: 'Gia Đình', slug: 'gia-dinh' },
                    { name: 'Tài Liệu', slug: 'tai-lieu' },
                  ].map((cat) => (
                     <Link
                        key={cat.slug}
                        to={`/ophim/browse?category=${cat.slug}`}
                        className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded transition"
                     >
                        {cat.name}
                     </Link>
                  ))}
                  <div className="col-span-2 pt-2 border-t border-gray-800 mt-2">
                     <Link to="/ophim/browse" className="text-center block text-xs text-green-400 hover:underline">
                        Xem tất cả thể loại →
                     </Link>
                  </div>
               </div>
            </div>

            <Link to="/video-test" className="text-yellow-400 hover:text-yellow-300 transition text-sm">
              Video Test
            </Link>

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

            {showSearchDropdown && (
              <div className="absolute left-0 top-full mt-1 w-48 bg-gray-900/95 backdrop-blur border border-gray-800 rounded-lg shadow-xl py-1 z-50">
                <button
                  onClick={() => {
                    setSearchSource('ophim');
                    setShowSearchDropdown(false);
                  }}
                  className="w-full"
                >
                  <div className={`w-full flex items-center px-4 py-2.5 text-left transition ${
                    searchSource === 'ophim' ? 'bg-green-600/20 text-green-400' : 'text-white hover:bg-gray-800'
                  }`}>
                    <i className="fas fa-bolt w-4 h-4 mr-3"></i>
                    <div>
                      <div className="font-medium">OPhim</div>
                      <div className="text-xs text-gray-500">Không quảng cáo</div>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setSearchSource('local');
                    setShowSearchDropdown(false);
                  }}
                  className="w-full"
                >
                  <div className={`w-full flex items-center px-4 py-2.5 text-left transition ${
                    searchSource === 'local' ? 'bg-red-600/20 text-red-400' : 'text-white hover:bg-gray-800'
                  }`}>
                    <i className="fas fa-database w-4 h-4 mr-3"></i>
                    <div>
                      <div className="font-medium">Local DB</div>
                      <div className="text-xs text-gray-500">Phim trong server</div>
                    </div>
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
                  <i className="fas fa-sign-out-alt w-4 h-4 mr-3"></i>
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
