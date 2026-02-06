import { Heart, Github, Mail, AlertTriangle } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0a0a0a] border-t border-gray-800 mt-auto">
      {/* Disclaimer Banner */}
      <div className="bg-yellow-900/20 border-y border-yellow-900/30 py-4">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-200/90 leading-relaxed">
              <strong className="font-bold">THÔNG BÁO QUAN TRỌNG:</strong> Đây là dự án học tập, nghiên cứu về công nghệ web và streaming. 
              Không có mục đích thương mại. Tất cả nội dung phim được lấy từ các API công khai và thuộc bản quyền của chủ sở hữu. 
              Nếu bạn là chủ sở hữu bản quyền và muốn gỡ nội dung, vui lòng liên hệ.
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="md:col-span-2">
            <h3 className="text-red-600 text-2xl font-bold mb-4 flex items-center">
              <span className="bg-red-600 text-white px-2 py-1 rounded mr-2">M</span>
              MovieFlix
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Dự án học tập về xây dựng nền tảng streaming video với React, Node.js, và MongoDB. 
              Mục đích nghiên cứu công nghệ web hiện đại và kiến trúc microservices.
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
              <span>for learning purposes</span>
            </div>
          </div>

          {/* Educational Purpose */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Mục Đích Học Tập
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• React & TypeScript</li>
              <li>• Video Streaming (HLS)</li>
              <li>• RESTful API Design</li>
              <li>• Database Management</li>
              <li>• UI/UX Design</li>
            </ul>
          </div>

          {/* Contact & Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Liên Hệ
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition"
                >
                  <Github className="w-4 h-4" />
                  <span>GitHub</span>
                </a>
              </li>
              <li>
                <a 
                  href="mailto:contact@example.com"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition"
                >
                  <Mail className="w-4 h-4" />
                  <span>Email</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-xs text-center md:text-left">
            © {currentYear} MovieFlix Educational Project. All movie content belongs to their respective copyright owners.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="px-3 py-1 bg-gray-800 rounded-full">Non-Commercial</span>
            <span className="px-3 py-1 bg-gray-800 rounded-full">Educational Use Only</span>
          </div>
        </div>

        {/* Copyright Notice */}
        <div className="mt-6 p-4 bg-gray-900/50 rounded-lg border border-gray-800">
          <p className="text-xs text-gray-500 text-center leading-relaxed">
            <strong className="text-gray-400">Disclaimer:</strong> This is a student project for educational purposes only. 
            All movie content, images, and metadata are sourced from public APIs and belong to their respective copyright holders. 
            This project does not host any copyrighted content and is not intended for commercial use. 
            If you are a copyright owner and wish to have content removed, please contact us immediately.
          </p>
        </div>
      </div>
    </footer>
  );
}
