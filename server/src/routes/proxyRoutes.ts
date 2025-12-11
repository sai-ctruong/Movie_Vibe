import express from 'express';
import axios from 'axios';

const router = express.Router();

/**
 * Proxy để fetch và serve nội dung m3u8 và video segments
 * Bypass CORS và các vấn đề DNS bằng cách server fetch thay cho client
 */

// Proxy m3u8 playlist (TẠM THỜI TẮT - không sử dụng)
router.get('/m3u8', async (_req, res) => {
  return res.status(503).json({ 
    error: 'M3U8 proxy hiện tại không khả dụng',
    suggestion: 'Vui lòng sử dụng trình phát nhúng (embed)'
  });
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
    
    // Try multiple extraction methods
    let streamData = null;
    
    // Method 1: Extract data-obf attribute
    const obfMatch = html.match(/data-obf="([^"]+)"/);
    if (obfMatch) {
      try {
        const obfData = JSON.parse(Buffer.from(obfMatch[1], 'base64').toString());
        streamData = JSON.parse(Buffer.from(obfData.sUb, 'base64').toString());
      } catch (e) {
        console.log('Failed to decode data-obf:', e);
      }
    }
    
    // Method 2: Look for direct token in script tags
    if (!streamData) {
      const scriptMatch = html.match(/var\s+token\s*=\s*["']([^"']+)["']/);
      if (scriptMatch) {
        streamData = { t: scriptMatch[1] };
      }
    }
    
    // Method 3: Look for m3u8 URLs directly in the HTML
    if (!streamData) {
      const m3u8Match = html.match(/https?:\/\/[^"'\s]+\.m3u8/);
      if (m3u8Match) {
        return res.json({ 
          success: true,
          m3u8: m3u8Match[0],
          token: m3u8Match[0].split('/').pop()?.replace('.m3u8', '') || 'direct'
        });
      }
    }
    
    if (!streamData || !streamData.t) {
      return res.status(404).json({ error: 'Không tìm thấy dữ liệu video trong embed' });
    }
    
    return res.json({ 
      success: true,
      token: streamData.t,
      hash: streamData.h || null
    });
  } catch (error: any) {
    console.error('Extract Error:', error.message);
    return res.status(500).json({ 
      error: 'Không thể extract video URL',
      details: error.message 
    });
  }
});

// Proxy m3u8 từ extracted URL (TẠM THỜI TẮT - domains không hoạt động)
router.get('/stream', async (req, res) => {
  const { token } = req.query;
  
  // Direct streaming disabled - fallback to embed only
  
  return res.status(503).json({ 
    error: 'Direct streaming hiện tại không khả dụng',
    details: 'Các server video streaming đang gặp sự cố',
    suggestion: 'Vui lòng sử dụng trình phát nhúng (embed) thay thế',
    token: token
  });
});

// Test endpoint để kiểm tra domains
router.get('/test-domains', async (_req, res) => {
  const testDomains = [
    'embed15.streamc.xyz',
    'embed12.streamc.xyz',
    'vid2a41.site',
    'stream1.nguonc.com',
    'hls.nguonc.com',
  ];
  
  const results = [];
  
  for (const domain of testDomains) {
    try {
      const testUrl = `https://${domain}`;
      const response = await axios.head(testUrl, { 
        timeout: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        }
      });
      
      results.push({
        domain,
        status: 'accessible',
        statusCode: response.status,
        headers: {
          server: response.headers.server,
          contentType: response.headers['content-type']
        }
      });
    } catch (error: any) {
      results.push({
        domain,
        status: 'failed',
        error: error.code || error.message,
        message: error.message
      });
    }
  }
  
  return res.json({
    timestamp: new Date().toISOString(),
    results,
    summary: {
      total: testDomains.length,
      accessible: results.filter(r => r.status === 'accessible').length,
      failed: results.filter(r => r.status === 'failed').length
    }
  });
});

export default router;
