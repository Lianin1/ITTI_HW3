import React, { useState, useEffect } from 'react';
import { FaCloudSun, FaUmbrella, FaTemperatureHigh, FaSearch, FaMapMarkerAlt } from 'react-icons/fa';

export default function Weather() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [city, setCity] = useState('臺北市'); // 預設城市

  const API_KEY = "CWA-B3FDDE6D-6202-4D43-8B3E-75471EFE51BE";

  // 初始載入
  useEffect(() => {
    fetchWeather(city);
  }, []);

  const fetchWeather = (locationName) => {
    setLoading(true);
    setError('');
    setWeatherData(null);

    const URL = `https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=${API_KEY}&locationName=${locationName}&format=JSON`;

    fetch(URL)
      .then(res => res.json())
      .then(data => {
        if (!data.records || !data.records.location || data.records.location.length === 0) {
          throw new Error("查無此縣市資料，請輸入完整的縣市名稱（如：臺北市、新竹縣）");
        }

        const location = data.records.location[0];
        const elements = location.weatherElement;
        
        const timePeriods = elements[0].time.map((t, index) => {
          return {
            startTime: t.startTime,
            endTime: t.endTime,
            wx: elements.find(e => e.elementName === 'Wx').time[index].parameter.parameterName,
            pop: elements.find(e => e.elementName === 'PoP').time[index].parameter.parameterName,
            minT: elements.find(e => e.elementName === 'MinT').time[index].parameter.parameterName,
            maxT: elements.find(e => e.elementName === 'MaxT').time[index].parameter.parameterName,
            ci: elements.find(e => e.elementName === 'CI').time[index].parameter.parameterName
          };
        });

        setWeatherData({
          city: location.locationName,
          periods: timePeriods
        });
        setLoading(false);
      })
      .catch(err => {
        console.error("API Error:", err);
        setError(err.message || "無法取得天氣資料");
        setLoading(false);
      });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (city.trim()) {
      fetchWeather(city.trim());
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card} className="fade-in">
        {/* 標題 */}
        <div style={styles.header}>☁️ Taiwan Weather Forecast</div>

        {/* 介紹區塊 */}
        <div style={styles.intro}>
          Enter a <strong>city name</strong> (e.g., 臺北市, 高雄市) to get the 36-hour forecast.
        </div>

        {/* 搜尋輸入區 */}
        <form onSubmit={handleSearch} style={styles.composer}>
          <div style={{position: 'relative', width: '100%'}}>
            <FaMapMarkerAlt style={{position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', color: '#888'}} />
            <input
              placeholder="Enter City Name (e.g. 臺北市)"
              value={city}
              onChange={e => setCity(e.target.value)}
              style={styles.textInput}
              disabled={loading}
            />
          </div>
          <button type="submit" disabled={loading || !city.trim()} style={styles.sendBtn}>
            {loading ? 'Loading...' : <><FaSearch /> Search</>}
          </button>
        </form>

        {/* 錯誤訊息 */}
        {error && (
          <div style={styles.error}>⚠ Error: {error}</div>
        )}

        {/* 結果顯示區 */}
        <div style={styles.resultsSection}>
          <h3 style={styles.resultsHeader}>
             {weatherData ? `${weatherData.city} 36-Hour Forecast` : 'Weather status'}
          </h3>

          {loading && (
            <div style={styles.loadingIndicator}>
               <div style={styles.spinner}></div>
               <p>Fetching weather data from CWA...</p>
            </div>
          )}

          {!loading && weatherData && (
            <div style={styles.gridContainer}>
              {weatherData.periods.map((period, idx) => (
                <div key={idx} style={styles.weatherCard}>
                  {/* 時間標籤 */}
                  <div style={styles.timeBadge}>
                    {period.startTime.split(' ')[0]} <br/>
                    <span style={{fontSize: '0.9em', opacity: 0.9}}>
                      {period.startTime.split(' ')[1].slice(0,5)} - {period.endTime.split(' ')[1].slice(0,5)}
                    </span>
                  </div>

                  {/* 天氣圖示與描述 */}
                  <div style={styles.mainWeather}>
                    <FaCloudSun style={{fontSize: '2.5rem', color: '#363b47', marginBottom: 10}} />
                    <div style={{fontWeight: 'bold', fontSize: '1.1rem', color: '#363b47'}}>{period.wx}</div>
                    <div style={{fontSize: '0.85rem', color: '#666', marginTop: 5}}>{period.ci}</div>
                  </div>

                  <div style={styles.divider}></div>

                  {/* 詳細數據 */}
                  <div style={styles.statsRow}>
                    <div style={styles.statItem}>
                      <FaTemperatureHigh style={{color: '#ef4444'}} />
                      <span>{period.minT}° - {period.maxT}°C</span>
                    </div>
                    <div style={styles.statItem}>
                      <FaUmbrella style={{color: '#3b82f6'}} />
                      <span>PoP: {period.pop}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- 樣式表 (與你的 map.js 完全一致，並新增了天氣卡片專用的樣式) ---
const styles = {
  container: {
    display: 'grid',
    placeItems: 'center',
    padding: 24,
    minHeight: '100vh',
    // 背景維持一致
    background: 'linear-gradient(135deg, #383333ff 0%, #f9fafb 100%)', 
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    color: '#333',
  },
  card: {
    width: 'min(1000px, 95%)',
    background: 'rgba(255, 255, 255, 0.5)', 
    borderRadius: 24,
    overflow: 'hidden',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  header: {
    padding: '16px 24px',
    fontWeight: 700,
    fontSize: 22,
    borderBottom: '1px solid rgba(255, 255, 255, 0.4)',
    background: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    color: '#363b47',
  },
  intro: {
    padding: '20px 24px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
    fontSize: 16, 
    lineHeight: 1.8, 
    color: '#444',
    textAlign: 'center',
  },
  composer: {
    padding: 24,
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: 12,
    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
  },
  textInput: {
    padding: '12px 20px 12px 45px', // 留空間給 icon
    borderRadius: 25,
    border: '1px solid rgba(0, 0, 0, 0.1)',
    fontSize: 16,
    background: 'rgba(255, 255, 255, 0.5)',
    color: '#333',
    width: '100%',
    boxSizing: 'border-box',
  },
  sendBtn: {
    padding: '12px 24px',
    borderRadius: 25,
    border: 'none',
    background: '#363b47',
    color: '#fff',
    fontSize: 16,
    cursor: 'pointer',
    fontWeight: 600,
    transition: 'background 0.3s, transform 0.1s',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  error: {
    color: '#ef4444',
    padding: '10px 24px',
    fontWeight: 500,
    backgroundColor: 'rgba(255, 235, 238, 0.7)',
    borderTop: '1px solid rgba(255, 204, 204, 0.5)',
  },
  resultsSection: {
    padding: 24,
    minHeight: 200,
  },
  resultsHeader: {
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 20,
    color: '#555',
    borderBottom: '1px dashed rgba(0, 0, 0, 0.1)',
    paddingBottom: 10,
  },
  loadingIndicator: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 0',
    color: '#555',
    fontWeight: 500,
  },
  spinner: {
    border: '4px solid rgba(0, 0, 0, 0.1)',
    borderTop: '4px solid #363b47',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    marginBottom: 10,
    animation: 'spin 1s linear infinite',
  },
  // --- Weather Card 專屬樣式 ---
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', // RWD 自動排版
    gap: 20,
  },
  weatherCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 18,
    padding: '20px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    border: '1px solid rgba(255,255,255,0.5)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    transition: 'transform 0.2s',
  },
  timeBadge: {
    background: '#363b47',
    color: 'white',
    padding: '6px 16px',
    borderRadius: 20,
    fontSize: '0.9rem',
    fontWeight: 600,
    textAlign: 'center',
    marginBottom: 15,
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  },
  mainWeather: {
    textAlign: 'center',
    marginBottom: 15,
  },
  divider: {
    width: '80%',
    height: 1,
    background: 'rgba(0,0,0,0.05)',
    margin: '10px 0',
  },
  statsRow: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    gap: 8,
  },
  statItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(255,255,255,0.5)',
    padding: '8px 12px',
    borderRadius: 10,
    fontSize: '0.95rem',
    fontWeight: 500,
    color: '#444',
  }
};

// 加入 Spinner 動畫
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = `
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.fade-in {
  animation: fadeIn 0.5s ease-in;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
`;
document.head.appendChild(styleSheet);