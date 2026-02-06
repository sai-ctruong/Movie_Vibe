import { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ophimService } from '../services/ophimService';
import VideoPlayer from '../components/VideoPlayer';
import { Loader2, Heart, Share2, Plus, Flag, Star, MessageSquare, Send, ThumbsUp, ThumbsDown } from 'lucide-react';

export default function OphimWatch() {
  const { slug, episode } = useParams();
  const navigate = useNavigate();
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  
  // Fetch Movie Details
  const { data: movieData, isLoading } = useQuery({
    queryKey: ['ophim-detail', slug],
    queryFn: () => ophimService.getMovieBySlug(slug || ''),
    enabled: !!slug,
  });

  const movie = movieData?.data?.item;
  
  // Effect to find current episode index
  useEffect(() => {
     if (movie?.episodes?.[0]?.server_data) {
        const index = movie.episodes[0].server_data.findIndex((ep: any) => ep.slug === episode);
        if (index !== -1) setCurrentEpisodeIndex(index);
     }
  }, [movie, episode]);

  const handleEpisodeChange = (newEpisodeSlug: string) => {
    navigate(`/ophim/watch/${slug}/${newEpisodeSlug}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#0f172a]">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!movie) return <div className="text-center text-white py-20">Không tìm thấy phim</div>;

  const currentEpData = movie.episodes?.[0]?.server_data?.[currentEpisodeIndex];
  const episodeList = movie.episodes?.[0]?.server_data || [];
  
  return (
    <div className="min-h-screen bg-[#0f172a] text-gray-200 font-sans pb-12">
      {/* ============ PLAYER SECTION ============ */}
      <section className="w-full bg-black shadow-2xl">
         <div className="w-full max-w-[1600px] mx-auto aspect-video max-h-[75vh] bg-black">
            {currentEpData ? (
               <VideoPlayer
                  episode={currentEpData}
               />
            ) : (
               <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
                  <p>Đang tải tập phim...</p>
               </div>
            )}
         </div>
      </section>

      {/* ============ ACTION BAR ============ */}
      <div className="w-full bg-[#111827] border-b border-[#1e293b]">
         <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Left Actions */}
            <div className="flex items-center gap-6 text-sm text-gray-400">
               <button className="flex items-center gap-2 hover:text-white transition-colors group">
                  <Heart className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
                  <span>Yêu thích</span>
               </button>
               <button className="flex items-center gap-2 hover:text-white transition-colors">
                  <Plus className="w-5 h-5" />
                  <span>Thêm vào DS</span>
               </button>
               <button className="flex items-center gap-2 hover:text-white transition-colors">
                  <Share2 className="w-5 h-5" />
                  <span>Chia sẻ</span>
               </button>
               <button className="flex items-center gap-2 hover:text-white transition-colors md:ml-4">
                  <Flag className="w-5 h-5" />
                  <span>Báo lỗi</span>
               </button>
            </div>

            {/* Right: Server Selector (Mock) */}
            <div className="flex items-center gap-3">
               <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Server:</span>
               <button className="px-4 py-1.5 bg-[#1e293b] border border-gray-700 rounded text-xs text-white hover:bg-gray-800 transition font-medium">
                  VIP Server 1
               </button>
               <button className="px-4 py-1.5 bg-transparent border border-gray-700 rounded text-xs text-gray-400 hover:bg-gray-800 transition">
                  Backup 1
               </button>
            </div>
         </div>
      </div>

      {/* ============ MAIN CONTENT GRID ============ */}
      <main className="max-w-[1600px] mx-auto px-4 md:px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
         
         {/* LEFT COLUMN (INFO + COMMENTS) */}
         <div className="lg:col-span-8 flex flex-col gap-10">
            
            {/* Movie Info Header */}
            <div className="flex flex-col md:flex-row gap-8 items-start">
               {/* Vertical Poster (Hidden on mobile to save space, visible on MD) */}
               <div className="w-[160px] shrink-0 hidden md:block rounded-xl overflow-hidden shadow-2xl border border-gray-800">
                  <img 
                     src={ophimService.getImageUrl(movie.thumb_url || movie.poster_url)} 
                     alt={movie.name}
                     className="w-full h-full object-cover aspect-[2/3]"
                     loading="lazy"
                     decoding="async"
                     onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src !== 'https://via.placeholder.com/300x450?text=No+Image') {
                           target.src = 'https://via.placeholder.com/300x450?text=No+Image';
                        }
                     }}
                  />
               </div>

               <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight">
                     {movie.name}
                  </h1>
                  <h2 className="text-lg text-blue-400 font-medium mb-4">
                     {movie.origin_name}
                  </h2>

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-3 mb-6">
                     <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">
                        IMDb 8.7
                     </span>
                     <span className="bg-[#1e293b] text-white border border-gray-600 text-xs px-2 py-0.5 rounded">
                        {movie.quality}
                     </span>
                     <span className="bg-[#1e293b] text-white border border-gray-600 text-xs px-2 py-0.5 rounded">
                        {movie.year}
                     </span>
                     <span className="bg-[#1e293b] text-white border border-gray-600 text-xs px-2 py-0.5 rounded">
                        {movie.time}
                     </span>
                     
                     <div className="w-px h-4 bg-gray-700 mx-2"></div>

                     {movie.category?.map(cat => (
                        <span key={cat.id} className="text-xs text-gray-300 bg-gray-800 px-2 py-1 rounded-full">
                           {cat.name}
                        </span>
                     ))}
                  </div>

                  {/* Synopsis */}
                  <p className="text-gray-300 leading-relaxed text-sm md:text-base mb-6 text-justify">
                     {movie.content?.replace(/<[^>]*>/g, '')}
                  </p>
                  
                  {/* Episodes List (Quick Select) */}
                   <div className="bg-[#1e293b] rounded-xl p-4 border border-gray-700/50 mb-6">
                     <h3 className="text-sm font-bold text-white mb-3">Danh sách tập</h3>
                     <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 pr-2">
                        {episodeList.map((ep) => (
                           <button
                              key={ep.slug}
                              onClick={() => handleEpisodeChange(ep.slug)}
                              className={`px-3 py-1.5 text-xs rounded transition-all ${
                                 ep.slug === episode 
                                    ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/30' 
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                              }`}
                           >
                              {ep.name}
                           </button>
                        ))}
                     </div>
                  </div>

                  {/* Playback Options (Visual Only) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div className="bg-gradient-to-r from-blue-900/20 to-[#1e293b] p-4 rounded-xl border border-blue-900/30 flex items-center gap-4">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                           <MessageSquare className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                           <h4 className="text-sm font-bold text-white">Phụ đề</h4>
                           <p className="text-xs text-gray-400">Tiếng Việt</p>
                        </div>
                     </div>
                     <div className="bg-gradient-to-r from-green-900/20 to-[#1e293b] p-4 rounded-xl border border-green-900/30 flex items-center gap-4">
                        <div className="p-2 bg-green-500/10 rounded-lg">
                           <Star className="w-5 h-5 text-green-400" />
                        </div>
                         <div>
                           <h4 className="text-sm font-bold text-white">Chất lượng</h4>
                           <p className="text-xs text-gray-400">Full HD / 4K</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Premium Banner */}
            <div className="w-full h-24 bg-gradient-to-r from-purple-900 to-indigo-900 rounded-xl flex items-center justify-center relative overflow-hidden border border-purple-500/20 shadow-lg">
               <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
               <span className="text-purple-100 font-bold tracking-widest text-lg z-10 text-center px-4">
                  TRẢI NGHIỆM VIP • KHÔNG QUẢNG CÁO
               </span>
               <button className="absolute right-4 md:right-8 bg-white text-purple-900 font-bold text-xs px-5 py-2 rounded-full hover:bg-gray-100 transition shadow-lg">
                  NÂNG CẤP
               </button>
            </div>

            {/* COMMENTS SECTION */}
            <div className="flex flex-col gap-6 pt-6 border-t border-gray-800">
               <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-white">Bình luận (4,281)</h3>
                  <div className="flex gap-2 ml-auto">
                     <button className="px-3 py-1 bg-white text-black text-xs font-bold rounded hover:bg-gray-200 transition">Mới nhất</button>
                     <button className="px-3 py-1 bg-[#1e293b] border border-gray-600 text-gray-300 text-xs font-bold rounded hover:bg-gray-700 transition">Nổi bật</button>
                  </div>
               </div>

               {/* Comment Input */}
               <div className="bg-[#111827] rounded-xl border border-gray-700 p-4">
                   <div className="relative">
                      <textarea 
                        ref={commentInputRef}
                        className="w-full bg-[#1e293b] border-none rounded-lg p-4 text-sm text-gray-200 placeholder:text-gray-500 focus:ring-1 focus:ring-blue-500 min-h-[100px]"
                        placeholder="Viết bình luận của bạn..."
                      ></textarea>
                   </div>
                   <div className="flex items-center justify-between mt-3 px-1">
                      <div className="flex items-center gap-2">
                         <label className="inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="relative w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                            <span className="ms-3 text-xs font-medium text-gray-400">Có chứa Spoilers?</span>
                         </label>
                      </div>
                      <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                         <span>Đăng</span>
                         <Send className="w-4 h-4 ml-1" />
                      </button>
                   </div>
               </div>

               {/* Mock Comments */}
               <div className="space-y-6">
                  {/* Commment 1 */}
                  <div className="flex gap-4">
                     <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden shrink-0 border border-gray-600">
                        <img src="https://ui-avatars.com/api/?name=Sarah+Connor&background=random" alt="User" />
                     </div>
                     <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                           <span className="font-bold text-sm text-white">Sarah Connor</span>
                           <span className="text-[10px] text-blue-400 border border-blue-500/30 bg-blue-500/10 px-1 rounded">PRO</span>
                           <span className="text-xs text-gray-500">2 giờ trước</span>
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed">
                           Phim quá hay, kỹ xảo đỉnh cao. Cảnh quay không gian nhìn choáng ngợp thực sự!
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                           <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-white transition">
                              <ThumbsUp className="w-3.5 h-3.5" /> 245
                           </button>
                           <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-white transition">
                               <ThumbsDown className="w-3.5 h-3.5" />
                           </button>
                           <button className="text-xs text-gray-500 hover:text-white transition">Trả lời</button>
                        </div>
                     </div>
                  </div>

                  {/* Comment 2 */}
                   <div className="flex gap-4">
                     <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden shrink-0 border border-gray-600">
                        <img src="https://ui-avatars.com/api/?name=John+Wick&background=random" alt="User" />
                     </div>
                     <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                           <span className="font-bold text-sm text-white">John Wick</span>
                           <span className="text-xs text-gray-500">5 giờ trước</span>
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed">
                           Nhạc phim Hans Zimmer không bao giờ làm thất vọng. Nghe nổi da gà.
                        </p>
                         <div className="flex items-center gap-4 mt-2">
                           <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-white transition">
                              <ThumbsUp className="w-3.5 h-3.5" /> 120
                           </button>
                           <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-white transition">
                               <ThumbsDown className="w-3.5 h-3.5" />
                           </button>
                           <button className="text-xs text-gray-500 hover:text-white transition">Trả lời</button>
                        </div>
                     </div>
                  </div>
               </div>

            </div>
         </div>

         {/* RIGHT COLUMN (SIDEBAR) */}
         <div className="lg:col-span-4 flex flex-col gap-8">
            
            {/* Rating Box */}
            <div className="bg-[#111827] rounded-xl border border-gray-700 p-6 flex items-center justify-between shadow-lg">
               <div>
                  <div className="flex items-center gap-2">
                     <Star className="w-7 h-7 text-yellow-500 fill-yellow-500" />
                     <span className="text-2xl font-bold text-white">9.0</span>
                  </div>
                  <span className="text-xs text-gray-500">Đánh giá chung</span>
               </div>
               <div className="h-8 w-px bg-gray-700"></div>
               <button className="bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Đánh giá
               </button>
            </div>

            {/* Cast & Crew */}
            {movie.actor && movie.actor.length > 0 && (
               <div>
                  <h3 className="text-lg font-bold text-white mb-4 border-l-4 border-blue-500 pl-3">Diễn viên</h3>
                  <div className="flex flex-col gap-4">
                     {movie.actor.map((actorName: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-4 group cursor-pointer hover:bg-white/5 p-2 rounded-lg transition">
                           <div className="w-12 h-12 rounded-full bg-gray-700 overflow-hidden shrink-0 border-2 border-transparent group-hover:border-blue-500 transition-all">
                              <img 
                                 src={`https://ui-avatars.com/api/?name=${actorName}&background=random`} 
                                 alt={actorName}
                                 className="w-full h-full object-cover" 
                              />
                           </div>
                           <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                                 {actorName}
                              </h4>
                              <p className="text-xs text-gray-500 truncate">Diễn viên</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            )}

            {/* You May Also Like / Trending */}
            <div className="mt-4">
               <h3 className="text-lg font-bold text-white mb-4 border-l-4 border-green-500 pl-3">Có thể bạn thích</h3>
               <div className="space-y-4">
                  {[1, 2, 3].map((_, i) => (
                     <div key={i} className="flex gap-3 group cursor-pointer bg-[#111827] p-2 rounded-lg hover:bg-[#1e293b] transition-colors border border-transparent hover:border-gray-700">
                        <div className="w-16 h-24 bg-gray-700 rounded overflow-hidden shrink-0">
                           <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=200&q=80)` }}></div>
                        </div>
                        <div className="flex flex-col justify-center">
                           <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                              Phim Gợi Ý {i + 1}
                           </h4>
                           <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                              <span>2024</span>
                              <span>•</span>
                              <span className="flex items-center gap-0.5">
                                 <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> 8.5
                              </span>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
               <button className="w-full mt-4 py-2 text-xs font-medium text-gray-400 bg-[#1e293b] rounded hover:text-white hover:bg-gray-700 transition-colors">
                  Xem tất cả đề xuất
               </button>
            </div>

         </div>
      </main>
    </div>
  );
}