// pages/api/terabox.js
import axios from 'axios';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Use POST.' 
    });
  }

  try {
    const { url } = req.body;

    // Validate input
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ 
        success: false, 
        error: 'URL is required and must be a string' 
      });
    }

    // Validate Terabox URL
    if (!isValidTeraboxUrl(url)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid Terabox URL. Please provide a valid Terabox sharing link.' 
      });
    }

    // Extract sharing ID from URL
    const shareId = extractShareId(url);
    if (!shareId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Could not extract share ID from URL' 
      });
    }

    console.log('Processing URL:', url);
    console.log('Extracted Share ID:', shareId);

    // Get download link using Terabox API
    const downloadData = await getTeraboxDownloadLink(shareId, url);
    
    return res.status(200).json({
      success: true,
      data: downloadData
    });

  } catch (error) {
    console.error('Terabox API Error:', error.message);
    
    // Handle specific errors
    if (error.message.includes('Cookie not configured')) {
      return res.status(500).json({ 
        success: false, 
        error: 'Server configuration error. Please contact administrator.' 
      });
    }
    
    if (error.message.includes('Invalid share')) {
      return res.status(404).json({ 
        success: false, 
        error: 'Share not found or expired. Please check the URL.' 
      });
    }

    return res.status(500).json({ 
      success: false, 
      error: 'Failed to get download link. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Validate if URL is from supported Terabox domains
 */
function isValidTeraboxUrl(url) {
  const teraboxDomains = [
    'terabox.com',
    '1024tera.com',
    'teraboxapp.com',
    'nephobox.com',
    'freeterabox.com',
    'momerybox.com',
    'tibibox.com',
    'dubox.com',
    'teraboxlink.com'
  ];
  
  try {
    const urlObj = new URL(url);
    return teraboxDomains.some(domain => urlObj.hostname.includes(domain));
  } catch {
    return false;
  }
}

/**
 * Extract share ID from various Terabox URL formats
 */
function extractShareId(url) {
  const patterns = [
    /\/s\/([a-zA-Z0-9_-]+)/,              // /s/1abc2def
    /surl=([a-zA-Z0-9_-]+)/,              // ?surl=1abc2def
    /\/share\/link\?surl=([a-zA-Z0-9_-]+)/, // /share/link?surl=1abc2def
    /\/web\/share\/link\?surl=([a-zA-Z0-9_-]+)/, // /web/share/link?surl=1abc2def
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Main function to get download links from Terabox
 */
async function getTeraboxDownloadLink(shareId, originalUrl) {
  const COOKIE = process.env.TERABOX_COOKIE;
  
  if (!COOKIE || COOKIE.trim() === '') {
    throw new Error('Cookie not configured. Please set TERABOX_COOKIE in environment variables.');
  }

  // Common headers for all requests
  const headers = {
    'Cookie': COOKIE,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': 'https://www.terabox.com/',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
  };

  try {
    // Step 1: Get share info
    console.log('Fetching share info for:', shareId);
    
    const shareInfoUrl = `https://www.terabox.com/api/shorturlinfo?surl=${shareId}&root=1`;
    const shareInfoResponse = await axios.get(shareInfoUrl, { 
      headers,
      timeout: 15000 // 15 second timeout
    });

    const shareInfo = shareInfoResponse.data;
    console.log('Share info response:', shareInfo);

    if (shareInfo.errno !== 0) {
      throw new Error(`Invalid share: ${shareInfo.errmsg || 'Unknown error'}`);
    }

    const fileList = shareInfo.list;
    if (!fileList || fileList.length === 0) {
      throw new Error('No files found in the share');
    }

    // Step 2: Get download links for files
    const results = [];
    const maxFiles = Math.min(fileList.length, 10); // Limit to 10 files

    for (let i = 0; i < maxFiles; i++) {
      const file = fileList[i];
      
      try {
        console.log(`Processing file ${i + 1}/${maxFiles}: ${file.server_filename}`);
        
        // Build download API URL
        const downloadUrl = buildDownloadUrl(shareInfo, file.fs_id);
        
        const downloadResponse = await axios.get(downloadUrl, {
          headers: {
            ...headers,
            'Referer': originalUrl,
          },
          timeout: 10000
        });

        const downloadData = downloadResponse.data;
        
        if (downloadData.errno === 0 && downloadData.list && downloadData.list.length > 0) {
          const fileData = downloadData.list[0];
          
          results.push({
            filename: file.server_filename,
            size: formatFileSize(file.size),
            sizeBytes: file.size,
            downloadUrl: fileData.dlink,
            thumbnail: extractThumbnail(file),
            fileType: getFileType(file.server_filename),
            fsId: file.fs_id,
            md5: file.md5 || null,
            path: file.path || '/',
            isdir: file.isdir === 1
          });
        } else {
          console.warn(`Failed to get download link for: ${file.server_filename}`);
        }
      } catch (fileError) {
        console.error(`Error processing file ${file.server_filename}:`, fileError.message);
        // Continue with other files
      }
    }

    if (results.length === 0) {
      throw new Error('Could not get download links for any files. The share might be password protected or expired.');
    }

    return {
      shareTitle: shareInfo.title || fileList[0].server_filename,
      shareId: shareId,
      files: results,
      totalFiles: fileList.length,
      processedFiles: results.length,
      shareUrl: originalUrl,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please try again.');
    }
    if (error.response?.status === 403) {
      throw new Error('Access denied. Please check your cookie or the share might be private.');
    }
    if (error.response?.status === 404) {
      throw new Error('Share not found. Please check the URL.');
    }
    throw error;
  }
}

/**
 * Build download URL with proper parameters
 */
function buildDownloadUrl(shareInfo, fsId) {
  const params = new URLSearchParams({
    sign: shareInfo.sign,
    timestamp: shareInfo.timestamp,
    fid_list: `[${fsId}]`,
    primaryid: shareInfo.primaryid,
    uk: shareInfo.uk,
    product: 'share',
    type: 'nolimit'
  });

  return `https://www.terabox.com/api/download?${params.toString()}`;
}

/**
 * Extract thumbnail URL from file data
 */
function extractThumbnail(file) {
  if (file.thumbs) {
    // Try different thumbnail sizes
    return file.thumbs.url3 || file.thumbs.url2 || file.thumbs.url1 || null;
  }
  return null;
}

/**
 * Format file size in human readable format
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Determine file type based on extension
 */
function getFileType(filename) {
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  
  const typeMap = {
    // Video
    'mp4': 'video', 'avi': 'video', 'mkv': 'video', 'mov': 'video', 
    'wmv': 'video', 'flv': 'video', 'webm': 'video', 'm4v': 'video', 
    '3gp': 'video', 'ogv': 'video',
    
    // Audio
    'mp3': 'audio', 'wav': 'audio', 'flac': 'audio', 'aac': 'audio', 
    'm4a': 'audio', 'ogg': 'audio', 'opus': 'audio', 'wma': 'audio',
    
    // Image
    'jpg': 'image', 'jpeg': 'image', 'png': 'image', 'gif': 'image', 
    'bmp': 'image', 'webp': 'image', 'svg': 'image', 'tiff': 'image',
    'ico': 'image', 'heic': 'image',
    
    // Document
    'pdf': 'document', 'doc': 'document', 'docx': 'document', 
    'txt': 'document', 'rtf': 'document', 'odt': 'document',
    'xls': 'document', 'xlsx': 'document', 'ppt': 'document', 'pptx': 'document',
    
    // Archive
    'zip': 'archive', 'rar': 'archive', '7z': 'archive', 'tar': 'archive',
    'gz': 'archive', 'bz2': 'archive', 'xz': 'archive',
    
    // Code
    'js': 'code', 'html': 'code', 'css': 'code', 'json': 'code',
    'xml': 'code', 'sql': 'code', 'py': 'code', 'java': 'code'
  };
  
  return typeMap[extension] || 'other';
}