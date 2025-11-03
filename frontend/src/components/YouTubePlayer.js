import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { getYouTubeEmbedUrl } from '../utils/youtube';
import { Play } from 'lucide-react';

const YouTubePlayer = ({ url, title = "Video Lekcija" }) => {
  const embedUrl = getYouTubeEmbedUrl(url);
  
  if (!embedUrl) return null;
  
  return (
    <Card className="border-4 border-red-300 bg-red-50 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-red-100 to-pink-100">
        <CardTitle className="flex items-center gap-2 text-2xl font-black text-gray-800">
          <Play className="w-6 h-6 text-red-600" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            className="absolute top-0 left-0 w-full h-full rounded-xl"
            src={embedUrl}
            title={title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
        <p className="mt-4 text-center text-sm text-gray-600 font-medium">
          🎓 Pogledaj ovaj video da naučiš više o temi!
        </p>
      </CardContent>
    </Card>
  );
};

export default YouTubePlayer;
