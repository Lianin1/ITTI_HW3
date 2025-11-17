import React, { useState, useEffect } from 'react';
import { FaSearch, FaHistory, FaTable, FaExclamationTriangle } from 'react-icons/fa';

export default function Stock() {
  const [searchTerm, setSearchTerm] = useState('2330'); // 預設台積電
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 取得當前年月 (格式 YYYYMM01) 
  // 證交所 API 只要日期是該月的任何一天，就會回傳整個月資料
  const getCurrentDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    return `${year}${month}01`;
  };

  const fetchStockHistory = () => {
    if (!searchTerm) return;
    
    setLoading(true);
    setError('');
    setStockData(null);

    const date = getCurrentDateString();
    // 這是你提供的 API URL
    const TARGET_URL = `https://www.twse.com.tw/exchangeReport/STOCK_DAY?response=json&date=${date}&stockNo=${searchTerm}`;
    
    // 加上 Proxy 繞過 CORS
    const PROXY_URL = `https://api.allorigins.win/raw?url=${encodeURIComponent(TARGET_URL)}`;

    fetch(PROXY_URL)
      .then(res => {
        if (!res.ok) throw new Error('Network error');
        return res.json();
      })
      .then(data => {
        if (data.stat !== 'OK') {
          throw new Error(data.stat || "查無資料，請確認股票代號");
        }
        setStockData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch Error:", err);
        setError("無法取得資料 (CORS 限制或代號錯誤)，請稍後再試。");
        setLoading(false);
      });
  };

  // 初始載入
  useEffect(() => {
    fetchStockHistory();
  }, []);

  // 處理按下 Enter 搜尋
  const handleSubmit = (e) => {
    e.preventDefault();
    fetchStockHistory();
  };

  return (
    <div style={styles.container}>
      <div style={styles.card} className="fade-in">
        
        <div style={styles.header}>
          <FaHistory style={{color: '#8b5cf6', marginRight: 10}} />
          Stock Daily History
        </div>

        <div style={styles.intro}>
          Enter a stock code (e.g., 2330, 0050) to view this month's trading history.
          <span style={{fontSize: '0.85rem', color: '#ef4444', marginTop: 5, display: 'block'}}>
            * Note: Only supports <strong>TWSE Listed (上市)</strong> stocks. OTC (上櫃) stocks are not included.
          </span>
        </div>

        {/* 搜尋框 */}
        <form onSubmit={handleSubmit} style={styles.composer}>
          <div style={{position: 'relative', width: '100%'}}>
            <FaSearch style={{position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', color: '#888'}} />
            <input
              placeholder="Stock Code (e.g. 2330)"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={styles.textInput}
            />
          </div>
          <button type="submit" style={styles.searchBtn} disabled={loading}>
            {loading ? '...' : 'Search'}
          </button>
        </form>

        {/* 錯誤訊息 */}
        {error && (
          <div style={styles.errorBox}>
            <FaExclamationTriangle /> {error}
          </div>
        )}

        {/* 結果顯示區 */}
        <div style={styles.resultsSection}>
          
          {loading && (
             <div style={styles.loadingIndicator}>
               <div style={styles.spinner}></div>
               <p>Fetching {searchTerm} data...</p>
             </div>
          )}

          {!loading && stockData && (
            <div>
              <h3 style={styles.stockTitle}>{stockData.title}</h3>
              
              {/* 響應式表格容器 */}
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      {/* 欄位：日期, 成交股數, 成交金額, 開盤, 最高, 最低, 收盤, 漲跌價差, 成交筆數 */}
                      <th>Date</th>
                      <th>Volume</th>
                      <th>Open</th>
                      <th>High</th>
                      <th>Low</th>
                      <th>Close</th>
                      <th>Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* 證交所回傳的資料在 data.data 陣列中 */}
                    {stockData.data.map((day, index) => (
                      <tr key={index}>
                        <td style={{fontWeight: 'bold'}}>{day[0]}</td> {/* 日期 */}
                        <td style={{fontSize: '0.85rem'}}>{(parseInt(day[1].replace(/,/g, '')) / 1000).toFixed(0)}k</td> {/* 成交量(張) */}
                        <td>{day[3]}</td> {/* 開盤 */}
                        <td style={{color: '#ef4444'}}>{day[4]}</td> {/* 最高 */}
                        <td style={{color: '#10b981'}}>{day[5]}</td> {/* 最低 */}
                        <td style={{fontWeight: 'bold'}}>{day[6]}</td> {/* 收盤 */}
                        <td style={{
                          color: day[7].includes('+') ? '#ef4444' : day[7].includes('-') ? '#10b981' : '#333',
                          fontWeight: 'bold'
                        }}>
                          {day[7]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={styles.footerNote}>* Volume unit: K (1000 shares)</div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// --- 樣式表 ---
const styles = {
  container: {
    display: 'grid',
    placeItems: 'center',
    padding: 24,
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #383333ff 0%, #f9fafb 100%)',
    fontFamily: 'Inter, sans-serif',
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
    padding: '20px 24px',
    fontWeight: 800,
    fontSize: 24,
    borderBottom: '1px solid rgba(255, 255, 255, 0.4)',
    background: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    color: '#363b47',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  intro: {
    padding: '15px 24px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    fontSize: 15,
    color: '#555',
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
    padding: '12px 20px 12px 45px',
    borderRadius: 25,
    border: '1px solid rgba(0, 0, 0, 0.1)',
    fontSize: 16,
    background: 'rgba(255, 255, 255, 0.5)',
    color: '#333',
    width: '100%',
    boxSizing: 'border-box',
    outline: 'none',
  },
  searchBtn: {
    padding: '12px 24px',
    borderRadius: 25,
    border: 'none',
    background: '#363b47',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 600,
  },
  errorBox: {
    margin: '0 24px 20px',
    padding: '15px',
    backgroundColor: 'rgba(254, 226, 226, 0.8)',
    color: '#b91c1c',
    borderRadius: 12,
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  resultsSection: {
    padding: 24,
    minHeight: 200,
  },
  loadingIndicator: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px 0',
    color: '#555',
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
  stockTitle: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#1f2937',
    fontSize: '1.2rem',
  },
  tableContainer: {
    overflowX: 'auto', // 讓手機板可以左右滑動
    borderRadius: 12,
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    background: 'rgba(255,255,255,0.6)',
    minWidth: '600px', // 確保表格不會擠在一起
  },
  footerNote: {
    textAlign: 'right',
    fontSize: '0.8rem',
    color: '#666',
    marginTop: 10,
    fontStyle: 'italic',
  }
};

// 注入全局 Table 樣式 (比較難用 inline style 寫的部分)
const styleSheet = document.createElement("style");
styleSheet.innerText = `
@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin 1s linear infinite; }
.fade-in { animation: fadeIn 0.5s ease-in; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

/* 表格樣式優化 */
th {
  background: #363b47;
  color: white;
  padding: 12px;
  text-align: center;
  font-weight: 500;
  font-size: 0.9rem;
}
td {
  padding: 12px;
  text-align: center;
  border-bottom: 1px solid rgba(0,0,0,0.05);
  font-size: 0.95rem;
  color: #333;
}
tr:last-child td {
  border-bottom: none;
}
tr:hover {
  background-color: rgba(255,255,255,0.9);
}
`;
document.head.appendChild(styleSheet);