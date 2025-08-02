// components/TeraboxDownloader.jsx
import React, { useState } from 'react';
import { Download, Link, AlertCircle, Loader, FileText, Film, Music, Image, Archive, Code, CheckCircle, ExternalLink, Copy, Clock, Lock } from 'lucide-react';

const TeraboxDownloader = () => {
  const [url, setUrl] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError('Please enter a valid Terabox URL');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);
    setCopySuccess('');

    try {
      const response = await fetch('/api/terabox', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url: url.trim(),
          password: password.trim()
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      if (data.success) {
        setResult(data.data);
      } else {
        throw new Error(data.error || 'Unknown error occurred');
      }
    } catch (err) {
      console.error('Download error:', err);
      let errorMessage = err.message || 'Failed to get download link. Please try again.';
      
      // Check if password is required
      if (errorMessage.toLowerCase().includes('password')) {
        setShowPassword(true);
        errorMessage = 'This share is password protected. Please enter the password below.';
      }
      
      // Provide more helpful error messages
      if (errorMessage.includes('Cookie not configured')) {
        errorMessage = 'Server configuration error: Terabox cookie not set. Please contact administrator.';
      } else if (errorMessage.includes('Share not found')) {
        errorMessage = 'Share not found or expired. Please check if the URL is correct and publicly accessible.';
      } else if (errorMessage.includes('Access denied')) {
        errorMessage = 'Access denied. The share might be private or the server configuration needs updating.';
      } else if (errorMessage.includes('password protected')) {
        errorMessage = 'This share is password protected and cannot be processed.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle download
  const handleDownload = (downloadUrl, filename) => {
    if (downloadUrl) {
      // For Terabox direct links, we need to open in new tab with proper referer
      // The browser will handle the download with correct headers
      window.open(downloadUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Handle copy download link with instructions
  const copyDownloadLink = async (downloadUrl, filename) => {
    try {
      await navigator.clipboard.writeText(downloadUrl);
      setCopySuccess(`Download link copied! Open in new tab or use download manager.`);
      setTimeout(() => setCopySuccess(''), 5000);
    } catch (err) {
      console.error('Failed to copy:', err);
      setCopySuccess('Failed to copy');
    }
  };

  // Copy to clipboard
  const copyToClipboard = async (text, type = 'URL') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(`${type} copied to clipboard!`);
      setTimeout(() => setCopySuccess(''), 3000);
    } catch (err) {
      console.error('Failed to copy:', err);
      setCopySuccess('Failed to copy');
    }
  };

  // Get file type icon
  const getFileIcon = (fileType) => {
    const iconProps = { className: "w-5 h-5" };
    
    switch (fileType) {
      case 'video': return <Film {...iconProps} />;
      case 'audio': return <Music {...iconProps} />;
      case 'image': return <Image {...iconProps} />;
      case 'document': return <FileText {...iconProps} />;
      case 'archive': return <Archive {...iconProps} />;
      case 'code': return <Code {...iconProps} />;
      default: return <FileText {...iconProps} />;
    }
  };

  // Get file type color
  const getFileTypeColor = (fileType) => {
    switch (fileType) {
      case 'video': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'audio': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'image': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'document': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'archive': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'code': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-black/40"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      
      {/* Animated Background Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-600/15 rounded-full blur-2xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-violet-600 rounded-full mb-6 shadow-2xl">
            <Download className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
            Terabox Downloader
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Get direct download links from Terabox sharing URLs instantly. Fast, reliable, and secure.
          </p>
        </div>

        {/* Main Form */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-700/50">
            <div className="space-y-6">
              <div>
                <label className="block text-white text-lg font-medium mb-3">
                  Terabox Share URL
                </label>
                <div className="relative">
                  <Link className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://terabox.com/s/1abc... or https://1024tera.com/s/1abc..."
                    className="w-full pl-12 pr-4 py-4 bg-gray-800/60 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password Field (only show if needed) */}
              {showPassword && (
                <div>
                  <label className="block text-white text-lg font-medium mb-3">
                    Password (Optional)
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password (if required)"
                      className="w-full pl-12 pr-4 py-4 bg-gray-800/60 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                      disabled={loading}
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading || !url.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-violet-600 text-white py-4 px-8 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-violet-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-300 shadow-xl"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Download className="w-5 h-5" />
                    <span>Get Download Links</span>
                  </div>
                )}
              </button>
            </div>

            {/* Copy Success Message */}
            {copySuccess && (
              <div className="mt-4 bg-emerald-900/30 border border-emerald-600/30 rounded-xl p-3 flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <p className="text-emerald-300 text-sm">{copySuccess}</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-6 bg-red-900/30 border border-red-600/30 rounded-xl p-4 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-300 font-medium">Error</p>
                  <p className="text-red-200 text-sm mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Results */}
            {result && (
              <div className="mt-8 space-y-6">
                {/* Share Info */}
                <div className="bg-emerald-900/30 border border-emerald-600/30 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
                      <CheckCircle className="w-6 h-6 text-emerald-400" />
                      <span>Download Ready!</span>
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-300">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(result.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                    <div className="bg-gray-800/60 rounded-lg p-3">
                      <p className="text-gray-400">Share Title</p>
                      <p className="text-white font-medium truncate">{result.shareTitle}</p>
                    </div>
                    <div className="bg-gray-800/60 rounded-lg p-3">
                      <p className="text-gray-400">Total Files</p>
                      <p className="text-white font-medium">{result.totalFiles}</p>
                    </div>
                    <div className="bg-gray-800/60 rounded-lg p-3">
                      <p className="text-gray-400">Available Downloads</p>
                      <p className="text-white font-medium">{result.processedFiles}</p>
                    </div>
                  </div>
                </div>

                {/* Files List */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">Files ({result.files.length})</h4>
                  
                  {result.files.map((file, index) => (
                    <div key={file.fsId || index} className="bg-gray-800/60 border border-gray-600/50 rounded-xl p-6 hover:bg-gray-700/60 transition-all duration-300">
                      <div className="flex items-start space-x-4">
                        {/* File Thumbnail or Icon */}
                        <div className={`flex-shrink-0 w-16 h-16 rounded-lg border flex items-center justify-center ${getFileTypeColor(file.fileType)}`}>
                          {file.thumbnail ? (
                            <img 
                              src={file.thumbnail} 
                              alt={file.filename}
                              className="w-full h-full rounded-lg object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className={`${file.thumbnail ? 'hidden' : 'flex'} items-center justify-center w-full h-full`}>
                            {getFileIcon(file.fileType)}
                          </div>
                        </div>

                        {/* File Info */}
                        <div className="flex-1 min-w-0">
                          <h5 className="text-lg font-medium text-white mb-2 truncate" title={file.fullPath || file.filename}>
                            {file.filename}
                          </h5>
                          
                          {/* Show full path if different from filename */}
                          {file.fullPath && file.fullPath !== file.filename && (
                            <p className="text-sm text-gray-400 mb-2 truncate" title={file.fullPath}>
                              📁 {file.fullPath}
                            </p>
                          )}
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300 mb-4">
                            <span className="flex items-center space-x-1">
                              <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                              <span>{file.size}</span>
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getFileTypeColor(file.fileType)}`}>
                              {file.fileType.toUpperCase()}
                            </span>
                            {file.md5 && (
                              <span className="text-xs text-gray-400 font-mono">
                                MD5: {file.md5.substring(0, 8)}...
                              </span>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handleDownload(file.downloadUrl, file.filename)}
                              className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-lg"
                            >
                              <Download className="w-4 h-4" />
                              <span>Open Link</span>
                            </button>
                            
                            <button
                              onClick={() => copyDownloadLink(file.downloadUrl, file.filename)}
                              className="inline-flex items-center space-x-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 px-4 py-2 rounded-lg font-medium transition-all duration-300"
                            >
                              <Copy className="w-4 h-4" />
                              <span>Copy Link</span>
                            </button>
                            
                            <button
                              onClick={() => window.open(file.downloadUrl, '_blank')}
                              className="inline-flex items-center space-x-2 bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 px-4 py-2 rounded-lg font-medium transition-all duration-300"
                            >
                              <ExternalLink className="w-4 h-4" />
                              <span>New Tab</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Download Instructions */}
                <div className="mt-6 bg-amber-900/30 border border-amber-600/30 rounded-xl p-4">
                  <h5 className="text-amber-300 font-medium mb-2 flex items-center space-x-2">
                    <span>⚡</span>
                    <span>Download Tips:</span>
                  </h5>
                  <ul className="text-amber-200 text-sm space-y-1">
                    <li>• Use "Copy Link" button and paste in download manager (IDM, JDownloader)</li>
                    <li>• Or click "New Tab" to open download link in new browser tab</li>
                    <li>• Direct download may require proper referer headers</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-12 bg-gray-900/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
            <h3 className="text-2xl font-semibold text-white mb-6">How to use</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-medium text-white mb-4">📋 Instructions:</h4>
                <ol className="text-gray-300 space-y-3">
                  <li className="flex items-start space-x-2">
                    <span className="bg-purple-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                    <span>Copy the Terabox sharing link</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="bg-purple-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                    <span>Paste it in the input field above</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="bg-purple-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                    <span>Click "Get Download Links" button</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="bg-purple-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
                    <span>Wait for processing (10-30 seconds)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="bg-purple-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">5</span>
                    <span>Download files or copy direct links</span>
                  </li>
                </ol>
              </div>
              
              <div>
                <h4 className="text-lg font-medium text-white mb-4">🔗 Supported Domains:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                    <span>terabox.com</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                    <span>1024tera.com</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                    <span>teraboxapp.com</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                    <span>nephobox.com</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                    <span>freeterabox.com</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                    <span>dubox.com</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-6 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-yellow-300 font-medium mb-2">Important Notes:</p>
                  <ul className="text-yellow-200 text-sm space-y-1">
                    <li>• Direct download links are temporary and may expire</li>
                    <li>• Large files may take longer to process</li>
                    <li>• This service respects Terabox's terms of service</li>
                    <li>• Only public shares are supported</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center space-x-2 text-gray-400 text-sm">
              <Download className="w-4 h-4" />
              <span>Made with ❤️ for easy file downloads</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeraboxDownloader;