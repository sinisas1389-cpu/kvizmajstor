// Helper funkcije za rad sa YouTube linkovima

export const extractYouTubeId = (url) => {
  if (!url) return null;
  
  // Različiti YouTube URL formati
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/  // Samo ID
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
};

export const getYouTubeEmbedUrl = (url) => {
  const videoId = extractYouTubeId(url);
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
};

export const isValidYouTubeUrl = (url) => {
  return extractYouTubeId(url) !== null;
};
