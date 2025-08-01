import React, { useState } from 'react';
import { Download, Link, AlertCircle, Loader } from 'lucide-react';

const TeraboxDownloader = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Simulasi API call untuk mendapatkan download link
  const fetchDownloadLink = async (teraboxUrl) => {
    // Ini adalah simulasi - dalam implementasi nyata, ini akan memanggil API backend
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (teraboxUrl.includes('terabox.com') || teraboxUrl.includes('1024tera.com')) {
          resolve({
            title: 'Sample Video.mp4',
            size: '245.7 MB',
            downloadUrl: 'https://example.com/direct-download-link',
            thumbnail: 'https://via.placeholder.com/300x200?text=Video+Thumbnail'
          });
        } else {
          reject(new Error('Invalid Terabox URL'));
        }
      }, 2000);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please enter a valid Terabox URL');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await fetchDownloadLink(url);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to get download link');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (result?.downloadUrl) {
      window.open(result.downloadUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
      
      {/* Animated Background Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6 shadow-2xl">
            <Download className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Terabox Downloader
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Get direct download links from Terabox sharing URLs instantly
          </p>
        </div>

        {/* Main Form */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
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
                    className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !url.trim()}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-8 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-300 shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  'Get Download Link'
                )}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-6 bg-red-500/20 border border-red-500/30 rounded-xl p-4 flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-300">{error}</p>
              </div>
            )}

            {/* Result */}
            {result && (
              <div className="mt-8 bg-green-500/10 border border-green-500/20 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Download Ready!</h3>
                <div className="flex items-start space-x-4">
                  <img 
                    src={result.thumbnail} 
                    alt="Thumbnail" 
                    className="w-24 h-24 rounded-lg object-cover bg-gray-700"
                  />
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-white mb-2">{result.title}</h4>
                    <p className="text-gray-300 mb-4">Size: {result.size}</p>
                    <button
                      onClick={handleDownload}
                      className="inline-flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Now</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-12 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4">How to use:</h3>
            <ol className="text-gray-300 space-y-2">
              <li>1. Copy the Terabox sharing link</li>
              <li>2. Paste it in the input field above</li>
              <li>3. Click "Get Download Link" button</li>
              <li>4. Wait for processing (usually takes 10-30 seconds)</li>
              <li>5. Click "Download Now" to start downloading</li>
            </ol>
            
            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-yellow-300 text-sm">
                <strong>Note:</strong> This is a demo interface. In a real implementation, you would need to set up proper backend API endpoints and handle authentication with Terabox cookies.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeraboxDownloader;