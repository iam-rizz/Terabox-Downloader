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
    const { url, password = '' } = req.body;

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
    console.log('Password provided:', password ? 'Yes' : 'No');

    // Get download link using TeraXtract API method
    const downloadData = await getTeraboxDownloadLink(shareId, password);
    
    return res.status(200).json({
      success: true,
      data: downloadData
    });

  } catch (error) {
    console.error('Terabox API Error:', error.message);
    
    // Handle specific errors
    if (error.message.includes('API not available')) {
      return res.status(503).json({ 
        success: false, 
        error: 'Service temporarily unavailable. Please try again later.' 
      });
    }
    
    if (error.message.includes('Share not found')) {
      return res.status(404).json({ 
        success: false, 
        error: 'Share not found or expired. Please check the URL.' 
      });
    }

    if (error.message.includes('Password required')) {
      return res.status(400).json({ 
        success: false, 
        error: 'This share is password protected. Please provide the password.' 
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
 * Main function to get download links from Terabox using TeraXtract API method
 */
async function getTeraboxDownloadLink(shareId, password = '') {
  const API_BASE = 'https://terabox.hnn.workers.dev';
  
  try {
    console.log('Using TeraXtract API method...');
    
    // Step 1: Get file info using TeraXtract API
    const infoResponse = await axios.get(`${API_BASE}/api/get-info-new`, {
      params: {
        shorturl: shareId,
        pwd: password
      },
      headers: {
        'Referer': `${API_BASE}/`,
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Host': 'terabox.hnn.workers.dev',
        'Accept': '*/*',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36'
      },
      timeout: 20000
    });

    const infoData = infoResponse.data;
    console.log('Info API response:', infoData);

    // Check if the response is successful
    if (!infoData.ok) {
      if (infoData.msg && infoData.msg.includes('password')) {
        throw new Error('Password required for this share');
      }
      throw new Error(infoData.msg || 'Share not found or expired');
    }

    // Extract file information
    if (!infoData.list || infoData.list.length === 0) {
      throw new Error('No files found in the share');
    }

    const { shareid, uk, sign, timestamp } = infoData;
    const results = [];
    
    // Helper function to collect all files from the list (including files in folders)
    const collectAllFiles = (items, parentPath = '') => {
      const allFiles = [];
      
      for (const item of items) {
        const currentPath = parentPath ? `${parentPath}/${item.filename}` : item.filename;
        
        if (item.is_dir === "1" && item.children && Array.isArray(item.children)) {
          // This is a folder with children - recursively collect files from it
          console.log(`Found folder: ${item.filename} with ${item.children.length} children`);
          const childFiles = collectAllFiles(item.children, currentPath);
          allFiles.push(...childFiles);
        } else if (item.is_dir === "0") {
          // This is a file
          allFiles.push({
            ...item,
            fullPath: currentPath
          });
        }
      }
      
      return allFiles;
    };

    const allFiles = collectAllFiles(infoData.list);
    const maxFiles = Math.min(allFiles.length, 10); // Process up to 10 files
    
    console.log(`Total files found: ${allFiles.length}, processing first ${maxFiles}`);

    // Step 2: Get download links for each file
    for (let i = 0; i < maxFiles; i++) {
      const file = allFiles[i];
      
      try {
        console.log(`Processing file ${i + 1}/${maxFiles}: ${file.fullPath || file.filename}`);
        console.log(`File details:`, file);
        
        // Skip if this is somehow still a directory
        if (file.is_dir === "1") {
          console.log(`Skipping directory: ${file.filename}`);
          continue;
        }

        // Add delay between requests to avoid rate limiting
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // Get download link using TeraXtract API
        console.log(`Making download request for file ${file.filename} with fs_id: ${file.fs_id}`);
        console.log(`Request payload:`, {
          shareid: shareid,
          uk: uk,
          sign: sign,
          timestamp: timestamp,
          fs_id: file.fs_id
        });
        
        const downloadResponse = await axios.post(`${API_BASE}/api/get-download`, {
          shareid: shareid,
          uk: uk,
          sign: sign,
          timestamp: timestamp,
          fs_id: file.fs_id
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Referer': `${API_BASE}/`,
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Host': 'terabox.hnn.workers.dev',
            'Accept': '*/*',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36'
          },
          timeout: 20000
        });

        const downloadData = downloadResponse.data;
        console.log(`Download API response for ${file.filename}:`, downloadData);

        if (downloadData.downloadLink) {
          results.push({
            filename: file.filename,
            fullPath: file.fullPath || file.filename,
            size: formatFileSize(parseInt(file.size)),
            sizeBytes: parseInt(file.size),
            downloadUrl: downloadData.downloadLink,
            thumbnail: file.thumbs?.url3 || file.thumbs?.url2 || file.thumbs?.url1 || null,
            fileType: getFileType(file.filename),
            fsId: file.fs_id,
            md5: file.md5 || null,
            path: file.path || file.fullPath || '/',
            isdir: false,
            category: file.category || '1'
          });
        } else {
          console.warn(`No download link found for: ${file.fullPath || file.filename}`);
        }

      } catch (fileError) {
        console.error(`Error processing file ${file.fullPath || file.filename}:`, fileError.message);
        continue;
      }
    }

    if (results.length === 0) {
      throw new Error('Could not get download links for any files. The files might be password protected or expired.');
    }

    return {
      shareTitle: infoData.title || (results.length > 0 ? results[0].filename : 'Terabox Share'),
      shareId: shareId,
      files: results,
      totalFiles: allFiles.length,
      processedFiles: results.length,
      timestamp: new Date().toISOString(),
      method: 'TeraXtract API'
    };

  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please try again.');
    }
    if (error.response?.status === 403) {
      throw new Error('API not available. Service might be temporarily down.');
    }
    if (error.response?.status === 404) {
      throw new Error('Share not found. Please check the URL.');
    }
    
    // Re-throw with original message if it's already a custom error
    if (error.message.includes('Password required') || 
        error.message.includes('Share not found') ||
        error.message.includes('No files found')) {
      throw error;
    }
    
    throw new Error(`API Error: ${error.message}`);
  }
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