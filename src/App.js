import React, { useState } from 'react';

// 1. 引入元件 (全部都在同一層資料夾，所以用 ./)
import AItest from './AItest'; 
import GoogleMapsSearch from './map';
import Weather from './Weather'; 
import CatGallery from './CatGallery'; // 引入剛剛建立的貓咪元件

// 2. 引入圖示 (改用 FaCat)
import { FaRobot, FaMapMarkerAlt, FaCloudSun, FaCat } from 'react-icons/fa'; 

export default function App() {
  const [activeView, setActiveView] = useState('AI');

  const renderView = () => {
    switch (activeView) {
      case 'AI':
        return <AItest />;
      case 'Map':
        return <GoogleMapsSearch />;
      case 'Weather':
        return <Weather />;
      case 'Cat': // 3. 切換邏輯改為 Cat
        return <CatGallery />;
      default:
        return <p style={{textAlign: 'center', color: '#666', padding: 40}}>請選擇一個頁面</p>;
    }
  };

  return (
    <div style={styles.mainContainer}>
      
      {/* CSS 樣式注入 */}
      <style>
        {`
          .nav-btn {
            transition: all 0.3s ease;
            opacity: 0.7;
            transform: scale(1);
          }
          .nav-btn:hover {
            opacity: 1;
            background-color: rgba(255, 255, 255, 0.6) !important;
            transform: translateY(-2px);
          }
          .nav-btn.active {
            opacity: 1;
            background-color: #fff !important;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            transform: scale(1.05);
            color: #333 !important;
          }
        `}
      </style>

      {/* 選單 */}
      <div style={styles.menuWrapper}>
        <div style={styles.menuBar}>
          
          <button
            onClick={() => setActiveView('AI')}
            style={styles.button}
            className={`nav-btn ${activeView === 'AI' ? 'active' : ''}`}
          >
            <FaRobot style={{ fontSize: '1.2rem' }} />
            <span>Gemini</span>
          </button>
          
          <button
            onClick={() => setActiveView('Map')}
            style={styles.button}
            className={`nav-btn ${activeView === 'Map' ? 'active' : ''}`}
          >
            <FaMapMarkerAlt style={{ fontSize: '1.2rem' }} />
            <span>Map</span>
          </button>

          <button
            onClick={() => setActiveView('Weather')}
            style={styles.button}
            className={`nav-btn ${activeView === 'Weather' ? 'active' : ''}`}
          >
            <FaCloudSun style={{ fontSize: '1.3rem' }} />
            <span>Weather</span>
          </button>

          {/* 4. 按鈕改為 Cat */}
          <button
            onClick={() => setActiveView('Cat')}
            style={styles.button}
            className={`nav-btn ${activeView === 'Cat' ? 'active' : ''}`}
          >
            <FaCat style={{ fontSize: '1.2rem' }} />
            <span>Cat</span>
          </button>

        </div>
      </div>

      {/* 內容區 */}
      <div style={styles.contentArea}>
        {renderView()}
      </div>
    </div>
  );
}

// --- Styles (保持不變) ---
const styles = {
  mainContainer: {
    width: '100%',
    minHeight: '100vh', 
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #383333ff 0%, #f9fafb 100%)', 
    fontFamily: 'Inter, sans-serif',
  },
  menuWrapper: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    paddingTop: '40px',
    paddingBottom: '20px',
    marginBottom: '10px',
  },
  menuBar: {
    display: 'flex',
    gap: '8px',
    padding: '8px',
    background: 'rgba(255, 255, 255, 0.25)', 
    backdropFilter: 'blur(10px)',
    borderRadius: '50px', 
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '10px 20px',
    borderRadius: '40px',
    border: 'none',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    color: '#444', 
    background: 'transparent', 
    outline: 'none',
    whiteSpace: 'nowrap',
  },
  contentArea: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
  }
};