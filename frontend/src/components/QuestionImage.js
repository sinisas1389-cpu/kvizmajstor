import React from 'react';

const QuestionImage = ({ imageUrl, alt = "Pitanje slika" }) => {
  if (!imageUrl) return null;

  return (
    <div className="mb-6 rounded-xl overflow-hidden border-4 border-purple-200 bg-gray-50">
      <img 
        src={imageUrl} 
        alt={alt}
        className="w-full max-h-96 object-contain"
        onError={(e) => {
          e.target.parentElement.innerHTML = `
            <div class="p-8 text-center">
              <p class="text-red-500 font-bold text-lg">❌ Slika nije mogla biti učitana</p>
              <p class="text-gray-500 text-sm mt-2">URL: ${imageUrl}</p>
            </div>
          `;
        }}
      />
    </div>
  );
};

export default QuestionImage;
