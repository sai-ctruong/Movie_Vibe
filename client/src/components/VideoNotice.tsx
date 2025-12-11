import { Info, CheckCircle } from 'lucide-react';

export default function VideoNotice() {
  return (
    <div className="bg-gradient-to-r from-blue-900/20 to-green-900/20 border border-blue-500/30 rounded-lg p-4 mb-4">
      <div className="flex items-start space-x-3">
        <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="text-white font-semibold mb-2 flex items-center">
            <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
            Cập nhật hệ thống video
          </h3>
          <div className="text-gray-300 text-sm space-y-2">
            <p>
              🎬 <strong>Trình phát nhúng</strong> hiện đang được sử dụng làm nguồn chính để đảm bảo video hoạt động ổn định 100%.
            </p>
            <p>
              ⚡ Điều này giúp video tải nhanh hơn và ít bị lỗi hơn so với direct streaming.
            </p>
            <p className="text-green-300">
              ✅ <strong>Kết quả:</strong> Video sẽ phát mượt mà và không bị gián đoạn.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}