import React, { useState } from 'react';
// Import separate component files
import AItest from './AItest'; 
import GoogleMapsSearch from './map'; 

// Import icons from react-icons
import { FaRobot, FaMapMarkerAlt } from 'react-icons/fa';

export default function App() {
  // Use React State to track which component to display
  // 'AI' for AItest, 'Map' for GoogleMapsSearch
  const [activeView, setActiveView] = useState('AI');

  // Render the currently selected component
  const renderView = () => {
    switch (activeView) {
      case 'AI':
        return <AItest />;
      case 'Map':
        return <GoogleMapsSearch />;
      default:
        return <p className="text-center text-gray-500 p-8">請選擇一個頁面</p>;
    }
  };

  // Function to get button styles based on active state
  const getButtonClass = (viewName) => 
    `flex items-center justify-center space-x-2 px-8 py-4 rounded-xl font-bold text-lg 
    transition-all duration-300 ease-in-out transform hover:scale-[1.03]
    ${activeView === viewName 
       ? 'bg-white/80 text-gray-900 shadow-lg' 
       : 'bg-white/50 text-gray-700 hover:bg-white/70'
     }`;

  return (
    <div>


      {/* Button container */}
      <div className="flex justify-center items-center w-full mb-12">
        <div className="flex space-x-4 p-2 bg-white/30 rounded-full shadow-inner">
          <button
            onClick={() => setActiveView('AI')}
            className={getButtonClass('AI')}
          >
            <FaRobot className="text-xl" />
            <span>Switch to Gemini Chat</span>
          </button>
          <button
            onClick={() => setActiveView('Map')}
            className={getButtonClass('Map')}
          >
            <FaMapMarkerAlt className="text-xl" />
            <span>Switch to map search</span>
          </button>
        </div>
      </div>

      {/* Content display area */}
      <div className="max-w-3xl mx-auto p-0 bg-white rounded-2xl shadow-2xl flex items-center justify-center">
        {renderView()}
      </div>
    </div>
  );
}