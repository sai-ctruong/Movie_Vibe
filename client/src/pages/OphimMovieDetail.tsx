import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ophimService } from '../services/ophimService';
import { ArrowLeft, Play, Calendar, Clock, Globe, Star, Film, Users, Clapperboard, Share2, Heart } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OphimMovieDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['ophim-movie', slug],
    queryFn: () => ophimService.getMovieBySlug(slug!),
    enabled: !!slug,
  });

  const movie = data?.data?.item;
  const cdnImage = data?.data?.APP_DOMAIN_CDN_IMAGE || 'https://img.ophim.live';

  const getImageUrl = (path: string) => {
    if (!path) return 'https://via.placeholder.com/300x450';
    if (path.startsWith('http')) return path;
    return `${cdnImage}/uploads/movies/${path}`;
  };

  const handleWatch = () => {
    if (movie?.episodes?.[0]?.server_data?.[0]) {
       navigate(`/ophim/watch/${movie.slug}/${movie.episodes[0].server_data[0].slug}`);
    } else {
       toast.error('Chưa có tập phim nào');
    }
  };

  const cdnUrl = data?.data?.APP_DOMAIN_CDN_IMAGE;
  const backdropUrl = movie?.poster_url ? getImageUrl(movie.poster_url) : getImageUrl(movie?.thumb_url || '');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600" />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-[#141414] flex flex-col items-center justify-center text-white">
        <h1 className="text-2xl mb-4 font-bold">Không tìm thấy phim</h1>
        <button
          onClick={() => navigate(-1)}
          className="bg-green-600 px-6 py-2 rounded hover:bg-green-700 transition font-medium"
        >
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414] text-white overflow-hidden relative">
      {/* Blurred Backdrop */}
      <div 
        className="absolute inset-0 bg-cover bg-center blur-3xl opacity-30 scale-110 pointer-events-none"
        style={{ backgroundImage: `url(${backdropUrl})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/80 to-transparent pointer-events-none" />

      {/* Main Content Container */}
      <div className="relative z-10 container mx-auto px-4 md:px-12 pt-28 pb-12">
        {/* Breadcrumb / Back */}
        <button
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center space-x-2 text-gray-400 hover:text-white transition group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Quay lại</span>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
           {/* Left Column: Poster & Actions */}
           <div className="md:col-span-4 lg:col-span-3">
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-gray-800 group">
                 <img 
                   src={getImageUrl(movie.thumb_url)} 
                   alt={movie.name}
                   className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                 />
                 <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow">
                    {movie.quality}
                 </div>
                 <div className="absolute top-2 right-2 bg-black/80 text-white text-xs font-bold px-2 py-1 rounded shadow backdrop-blur">
                    {movie.lang}
                 </div>
              </div>

              <button 
                 onClick={handleWatch}
                 className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-lg font-bold text-lg flex items-center justify-center transition-all shadow-lg hover:shadow-red-600/30"
              >
                 <Play className="w-5 h-5 mr-2 fill-current" />
                 XEM PHIM
              </button>
              
              <div className="grid grid-cols-2 gap-3 mt-3">
                 <button className="flex items-center justify-center space-x-2 bg-gray-800 hover:bg-gray-700 py-3 rounded-lg text-sm font-medium transition">
                    <Heart className="w-4 h-4" />
                    <span>Yêu thích</span>
                 </button>
                 <button className="flex items-center justify-center space-x-2 bg-gray-800 hover:bg-gray-700 py-3 rounded-lg text-sm font-medium transition">
                    <Share2 className="w-4 h-4" />
                    <span>Chia sẻ</span>
                 </button>
              </div>
           </div>

           {/* Middle Column: Detail Info */}
           <div className="md:col-span-8 lg:col-span-9 space-y-6">
              <div>
                 <h1 className="text-4xl md:text-5xl font-anton tracking-wide mb-2 leading-tight">
                    {movie.name}
                 </h1>
                 <h2 className="text-xl text-gray-400 font-light italic">
                    {movie.origin_name} ({movie.year})
                 </h2>
              </div>

              {/* Stats Row */}
              <div className="flex flex-wrap items-center gap-4 text-sm md:text-base border-y border-gray-800 py-4 my-6">
                 {movie.time && (
                    <div className="flex items-center text-gray-300">
                       <Clock className="w-4 h-4 mr-2 text-green-500" />
                       {movie.time}
                    </div>
                 )}
                 <div className="flex items-center text-gray-300">
                    <Calendar className="w-4 h-4 mr-2 text-green-500" />
                    {movie.year}
                 </div>
                 <div className="flex items-center text-gray-300">
                    <Globe className="w-4 h-4 mr-2 text-green-500" />
                    {movie.country?.[0]?.name || 'N/A'}
                 </div>
                 <div className="flex items-center text-gray-300">
                    <Clapperboard className="w-4 h-4 mr-2 text-green-500" />
                     {movie.type === 'single' ? 'Phim lẻ' : 
                     movie.type === 'series' ? 'Phim bộ' :
                     movie.type === 'hoathinh' ? 'Hoạt hình' : 'TV Show'}
                 </div>
                 <div className="flex items-center text-yellow-500 font-bold ml-auto">
                    <Star className="w-5 h-5 mr-1 fill-current" />
                    {movie.tmdb?.vote_average ? movie.tmdb.vote_average.toFixed(1) : '8.5'}
                 </div>
              </div>

              {/* Description */}
              <div>
                 <h3 className="text-white font-bold text-lg mb-2 flex items-center">
                    <Film className="w-5 h-5 mr-2 text-red-500" />
                    Nội dung phim
                 </h3>
                 <div 
                    className="text-gray-300 leading-relaxed text-base bg-gray-900/50 p-6 rounded-xl border border-gray-800"
                    dangerouslySetInnerHTML={{ __html: movie.content }}
                 />
              </div>

              {/* Cast & Crew */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <h3 className="text-white font-medium mb-3 flex items-center">
                       <Users className="w-4 h-4 mr-2 text-blue-500" />
                       Đạo diễn
                    </h3>
                    <div className="flex flex-wrap gap-2">
                       {movie.director && movie.director.length > 0 ? (
                           movie.director.map(d => (
                              <span key={d} className="text-sm text-gray-400 hover:text-white transition cursor-pointer">
                                 {d}
                              </span>
                           ))
                       ) : <span className="text-gray-500 text-sm">Đang cập nhật</span>}
                    </div>
                 </div>
                 <div>
                    <h3 className="text-white font-medium mb-3 flex items-center">
                       <Users className="w-4 h-4 mr-2 text-purple-500" />
                       Diễn viên
                    </h3>
                    <div className="flex flex-wrap gap-2">
                       {movie.actor && movie.actor.length > 0 ? (
                           movie.actor.map(a => (
                              <span key={a} className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white px-3 py-1 rounded-full text-xs transition cursor-pointer">
                                 {a}
                              </span>
                           ))
                       ) : <span className="text-gray-500 text-sm">Đang cập nhật</span>}
                    </div>
                 </div>
              </div>

              {/* Genres */}
              <div>
                 <h3 className="text-white font-medium mb-3">Thể loại</h3>
                 <div className="flex flex-wrap gap-2">
                    {movie.category && movie.category.length > 0 && movie.category.map(c => (
                       <span key={c.id} className="border border-gray-700 hover:border-green-500 text-gray-400 hover:text-green-500 px-3 py-1 rounded text-sm transition cursor-pointer">
                          {c.name}
                       </span>
                    ))}
                 </div>
              </div>
           </div>
        </div>

        {/* EPISODE LIST (For Series) or BOTTOM SECTION */}
        <div className="mt-16">
            <h3 className="text-2xl font-bold mb-6 text-white border-l-4 border-red-600 pl-4">
               {movie.episodes?.length > 0 ? 'Danh Sách Tập' : 'Phim Đề Xuất'}
            </h3>
            
            {movie.episodes && movie.episodes.length > 0 ? (
               <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                  {movie.episodes.map((server: any, idx: number) => (
                    <div key={idx} className="mb-6 last:mb-0">
                       <h4 className="text-green-500 font-bold mb-3 uppercase text-sm tracking-wider">
                          {server.server_name}
                       </h4>
                       <div className="flex flex-wrap gap-2">
                          {server.server_data.map((ep: any) => (
                             <button
                                key={ep.slug}
                                onClick={() => navigate(`/ophim/watch/${movie.slug}/${ep.slug}`)}
                                className="min-w-[48px] h-10 flex items-center justify-center bg-gray-800 hover:bg-green-600 text-gray-300 hover:text-white rounded transition font-medium text-sm"
                             >
                                {ep.name}
                             </button>
                          ))}
                       </div>
                    </div>
                  ))}
               </div>
            ) : (
               <div className="text-gray-500 italic">Đang cập nhật phim đề xuất...</div>
            )}
        </div>
      </div>
    </div>
  );
}
