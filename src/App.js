import React, { useState } from 'react';
// Import separate component files
import AItest from './AItest'; 
import GoogleMapsSearch from './map';
import Weather from './Weather'; 
import Stock from './Stock'; // 1. 新增 Import

// Import icons from react-icons
// 2. 新增 FaChartLine
import { FaRobot, FaMapMarkerAlt, FaCloudSun, FaChartLine } from 'react-icons/fa'; 

export default function App() {
  const [activeView, setActiveView] = useState('AI');

  // Render the currently selected component
  const renderView = () => {
    switch (activeView) {
      case 'AI':
        return <AItest />;
      case 'Map':
        return <GoogleMapsSearch />;
      case 'Weather':
        return <Weather />;
      case 'Stock': // 3. 新增切換邏輯
        return <Stock />;
      default:
        return <p style={{textAlign: 'center', color: '#666', padding: 40}}>請選擇一個頁面</p>;
    }
  };

  return (
    <div style={styles.mainContainer}>
      
      {/* 注入 Hover 動畫樣式 */}
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

      {/* 按鈕選單容器 */}
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

          {/* 4. 新增 Stock 按鈕 */}
          <button
            onClick={() => setActiveView('Stock')}
            style={styles.button}
            className={`nav-btn ${activeView === 'Stock' ? 'active' : ''}`}
          >
            <FaChartLine style={{ fontSize: '1.2rem' }} />
            <span>Stock</span>
          </button>

        </div>
      </div>

      {/* 內容顯示區 */}
      <div style={styles.contentArea}>
        {renderView()}
      </div>
    </div>
  );
}

// --- 統一的 CSS 樣式 (不需要修改，直接沿用) ---
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
    gap: '8px', // 因為按鈕變多了，間距稍微縮小一點點
    padding: '8px',
    background: 'rgba(255, 255, 255, 0.25)', 
    backdropFilter: 'blur(10px)',
    borderRadius: '50px', 
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    flexWrap: 'wrap', // 如果手機螢幕太小，允許按鈕換行
    justifyContent: 'center',
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '10px 20px', // 稍微調整大小以容納第4個按鈕
    borderRadius: '40px',
    border: 'none',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    color: '#444', 
    background: 'transparent', 
    outline: 'none',
    whiteSpace: 'nowrap', // 防止文字斷行
  },
  contentArea: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
  }
};