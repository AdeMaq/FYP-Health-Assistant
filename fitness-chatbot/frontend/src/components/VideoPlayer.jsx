import React, { useState } from 'react';
import { Play, ThumbsUp, Eye, Clock, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const VideoPlayer = ({ video }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const formatDuration = (duration) => {
    // Convert ISO 8601 duration to readable format
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    const hours = (match[1] || '').replace('H', '');
    const minutes = (match[2] || '').replace('M', '');
    const seconds = (match[3] || '').replace('S', '');
    
    if (hours) {
      return `${hours}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.padStart(2, '0')}`;
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="video-card bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm"
    >
      {/* Thumbnail with Play Button */}
      <div className="relative">
        <img
          src={video.thumbnail_url}
          alt={video.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
          {isPlaying ? (
            <div className="w-16 h-16 rounded-full bg-red-500 bg-opacity-90 flex items-center justify-center">
              <div className="w-6 h-6 bg-white"></div>
            </div>
          ) : (
            <button
              onClick={() => setIsPlaying(true)}
              className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-colors group"
            >
              <Play className="w-8 h-8 text-white ml-1 group-hover:scale-110 transition-transform" />
            </button>
          )}
        </div>
        {video.duration && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
            <Clock className="w-3 h-3 inline mr-1" />
            {formatDuration(video.duration)}
          </div>
        )}
      </div>

      {/* Video Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
          {video.title}
        </h3>
        
        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
          <span className="font-medium">{video.channel_title}</span>
          <span>{formatDate(video.published_at)}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          {video.view_count && (
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{formatNumber(video.view_count)} views</span>
            </div>
          )}
          {video.like_count && (
            <div className="flex items-center gap-1">
              <ThumbsUp className="w-4 h-4" />
              <span>{formatNumber(video.like_count)}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-red-600 hover:bg-red-700 text-white text-center py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Watch on YouTube
          </a>
          {isPlaying && (
            <div className="w-32">
              <iframe
                src={`${video.embed_url}?autoplay=1`}
                title={video.title}
                className="w-full h-full rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default VideoPlayer;