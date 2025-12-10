import express from 'express';
import axios from 'axios';

const router = express.Router();

/**
 * Proxy để fetch và serve nội dung m3u8 và video segments
 * Bypass CORS và các vấn đề DNS bằng cách server fetch thay cho client
 */

// Proxy m3u8 playlist
router.get('/m3u8', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Missing url parameter' });
    }

    // Decode URL nếu cần
    const decodedUrl = decodeURIComponent(url);
    
    // Fetch m3u8 content từ nguồn
    const response = await axios.get(decodedUrl, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://phim.nguonc.com/',
        'Origin': 'https://phim.nguonc.com',
      },
      responseType: 'text',
    });

    let content = response.data;
    
    // Parse base URL để resolve relative paths
    const baseUrl = decodedUrl.substring(0, decodedUrl.lastIndexOf('/') + 1);
    
    // Rewrite các URL trong m3u8 để proxy qua server
    // Handle both .ts segments and nested .m3u8 playlists
    content = content.replace(
      /^(?!#)(.+\.(ts|m3u8|key))$/gm,
      (match: string) => {
        if (match.startsWith('http://') || match.startsWith('https://')) {
          // Absolute URL - proxy nó
          return `/api/proxy/segment?url=${encodeURIComponent(match)}`;
        } else {
          // Relative URL - resolve và proxy
          const absoluteUrl = new URL(match, baseUrl).href;
          return `/api/proxy/segment?url=${encodeURIComponent(absoluteUrl)}`;
        }
      }
    );

    // Set headers cho response
    res.set({
      'Content-Type': 'application/vnd.apple.mpegurl',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache',
    });

    return res.send(content);
  } catch (error: any) {
    console.error('M3U8 Proxy Error:', error.message);
    
    if (error.code === 'ENOTFOUND') {
      return res.status(502).json({ 
        error: 'Không thể kết nối đến server nguồn. URL có thể không hợp lệ.',
        details: error.message 
      });
    }
    
    return res.status(500).json({ 
      error: 'Lỗi khi fetch m3u8',
      details: error.message 
    });
  }
});

// Proxy video segments (.ts files) và keys
router.get('/segment', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Missing url parameter' });
    }

    const decodedUrl = decodeURIComponent(url);
    
    // Fetch segment content
    const response = await axios.get(decodedUrl, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://phim.nguonc.com/',
        'Origin': 'https://phim.nguonc.com',
      },
      responseType: 'arraybuffer',
    });

    // Determine content type based on URL
    let contentType = 'video/mp2t';
    if (decodedUrl.endsWith('.m3u8')) {
      contentType = 'application/vnd.apple.mpegurl';
    } else if (decodedUrl.endsWith('.key')) {
      contentType = 'application/octet-stream';
    }

    res.set({
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=86400',
    });

    return res.send(Buffer.from(response.data));
  } catch (error: any) {
    console.error('Segment Proxy Error:', error.message);
    return res.status(500).json({ 
      error: 'Lỗi khi fetch segment',
      details: error.message 
    });
  }
});

// Kiểm tra URL m3u8 có hoạt động không
router.get('/check', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Missing url parameter' });
    }

    const decodedUrl = decodeURIComponent(url);
    
    // HEAD request để kiểm tra
    const response = await axios.head(decodedUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://phim.nguonc.com/',
      },
    });

    return res.json({ 
      available: true, 
      status: response.status,
      contentType: response.headers['content-type']
    });
  } catch (error: any) {
    return res.json({ 
      available: false, 
      error: error.message,
      code: error.code
    });
  }
});

// Extract m3u8 URL từ embed page
router.get('/extract', async (req, res) => {
  try {
    const { embed } = req.query;
    
    if (!embed || typeof embed !== 'string') {
      return res.status(400).json({ error: 'Missing embed parameter' });
    }

    const embedUrl = decodeURIComponent(embed);
    
    // Fetch embed page
    const response = await axios.get(embedUrl, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    const html = response.data;
    
    // Extract data-obf attribute
    const obfMatch = html.match(/data-obf="([^"]+)"/);
    if (!obfMatch) {
      return res.status(404).json({ error: 'Không tìm thấy dữ liệu video' });
    }

    // Decode base64 data
    const obfData = JSON.parse(Buffer.from(obfMatch[1], 'base64').toString());
    
    // Decode nested base64
    const streamData = JSON.parse(Buffer.from(obfData.sUb, 'base64').toString());
    
    // Construct m3u8 URL - the token 't' is the actual stream URL
    // Format: https://domain/token.m3u8
    const m3u8Url = streamData.t + '.m3u8';
    
    // Kiểm tra xem URL có phải là relative hay absolute
    let finalUrl = m3u8Url;
    if (!m3u8Url.startsWith('http')) {
      // Có thể cần thêm domain - thử các domain phổ biến
      finalUrl = `https://vid2a41.site/${m3u8Url}`;
    }
    
    return res.json({ 
      success: true,
      m3u8: finalUrl,
      hash: streamData.h,
      token: streamData.t
    });
  } catch (error: any) {
    console.error('Extract Error:', error.message);
    return res.status(500).json({ 
      error: 'Không thể extract video URL',
      details: error.message 
    });
  }
});

// Proxy m3u8 từ extracted URL (với domain resolver)
router.get('/stream', async (req, res) => {
  try {
    const { token } = req.query;
    
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: 'Missing token parameter' });
    }

    // Thử nhiều domain phổ biến
    const domains = [
      'vid2a41.site',
      'vid2a42.site',
      'vid2a43.site',
      'vid2a44.site',
      'vid2a45.site',
      'stream.phimmoi.net',
    ];
    
    let content = null;
    let workingUrl = '';
    
    for (const domain of domains) {
      try {
        const url = `https://${domain}/${token}.m3u8`;
        const response = await axios.get(url, {
          timeout: 8000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': '*/*',
            'Referer': 'https://embed15.streamc.xyz/',
          },
          responseType: 'text',
        });
        
        if (response.data && response.data.includes('#EXTM3U')) {
          content = response.data;
          workingUrl = url;
          break;
        }
      } catch (e) {
        // Try next domain
        continue;
      }
    }
    
    if (!content) {
      return res.status(502).json({ 
        error: 'Không thể tải video từ các nguồn có sẵn'
      });
    }
    
    // Rewrite URLs trong m3u8
    const baseUrl = workingUrl.substring(0, workingUrl.lastIndexOf('/') + 1);
    content = content.replace(
      /^(?!#)(.+\.(ts|m3u8|key))$/gm,
      (match: string) => {
        if (match.startsWith('http://') || match.startsWith('https://')) {
          return `/api/proxy/segment?url=${encodeURIComponent(match)}`;
        } else {
          const absoluteUrl = new URL(match, baseUrl).href;
          return `/api/proxy/segment?url=${encodeURIComponent(absoluteUrl)}`;
        }
      }
    );
    
    res.set({
      'Content-Type': 'application/vnd.apple.mpegurl',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache',
    });
    
    return res.send(content);
  } catch (error: any) {
    console.error('Stream Error:', error.message);
    return res.status(500).json({ 
      error: 'Lỗi stream video',
      details: error.message 
    });
  }
});

export default router;
