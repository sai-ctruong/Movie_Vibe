import axios from 'axios';

export interface VideoSource {
  url: string;
  type: 'hls' | 'mp4' | 'embed';
  quality?: string;
  label?: string;
}

export interface StreamResult {
  success: boolean;
  sources: VideoSource[];
  error?: string;
  fallbackEmbed?: string;
}

class VideoService {




  async getVideoSources(episode: any): Promise<StreamResult> {
    const sources: VideoSource[] = [];
    let fallbackEmbed = episode.embed;

    const m3u8Url = episode.m3u8 || episode.link_m3u8;
    const embedUrl = episode.embed || episode.link_embed;

    // Blacklist broken domains
    const isBrokenDomain = (url: string) => {
      return url.includes('phimmoi.net') || url.includes('googleusercontent.com');
    };

    // ƯU TIÊN STREAM TRỰC TIẾP (m3u8)
    if (m3u8Url && !isBrokenDomain(m3u8Url)) {
      sources.push({
        url: m3u8Url,
        type: 'hls',
        quality: 'auto',
        label: '⚡ Stream Nhanh'
      });
    }

    // Dự phòng bằng Embed Player
    if (embedUrl) {
      sources.push({
        url: embedUrl,
        type: 'embed',
        quality: 'auto',
        label: '🎬 Server Dự Phòng (Embed)'
      });
    }

    return {
      success: sources.length > 0,
      sources,
      fallbackEmbed,
      error: sources.length === 0 ? 'Không tìm thấy nguồn video khả dụng' : undefined
    };
  }

  async checkStreamHealth(url: string): Promise<{ healthy: boolean; error?: string }> {
    try {
      const response = await axios.get(url, { 
        timeout: 3000,
        responseType: 'text',
        maxContentLength: 1024 // Only read first 1KB
      });
      
      const isM3U8 = response.data.includes('#EXTM3U') || response.data.includes('#EXT-X-');
      return { healthy: isM3U8 };
    } catch (error: any) {
      return { 
        healthy: false, 
        error: error.message 
      };
    }
  }
}

export const videoService = new VideoService();