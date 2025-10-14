import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown'; // 引入 ReactMarkdown 函式庫

// --- 🎯 切換至 Gemini API 設定 ---
// 使用 Google Search Grounding
const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/';
const DEFAULT_MODEL = 'gemini-2.5-flash-preview-05-20';

export default function GoogleMapsSearch() {
  // 將金鑰名稱從 serpApiKey 改為 geminiApiKey
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [query, setQuery] = useState('Taipei Xinyi District cafe');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // 結果現在是 LLM 返回的 Markdown 文本
  const [llmResult, setLlmResult] = useState(''); 
  const [rememberKey, setRememberKey] = useState(true);

  const resultsRef = useRef(null);
  
  // 🚀 修正: 新的簡潔功能介紹 Markdown 文本
  const introMarkdown = "Enter any **location** or **point of interest keywords** you'd like to know about \n \n Gemini will help you organize a clear list of places.";

  // 1. 載入 Gemini API Key
  useEffect(() => {
    // 更改 localStorage key 以符合新的 API
    const saved = localStorage.getItem('gemini_api_key'); 
    if (saved) setGeminiApiKey(saved);
  }, []);

  // 2. 自動捲動到結果區域
  useEffect(() => {
    if (!loading && llmResult && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [loading, llmResult]);

  // 3. 處理 LLM 搜尋邏輯
  async function searchMaps() {
    const queryText = query.trim();
    if (!queryText || loading) return;

    if (!geminiApiKey) {
      setError('Please enter your Gemini API Key.');
      return;
    }
    
    // 設定錯誤並清除前次結果
    setError('');
    setLoading(true);
    setLlmResult('');

    try {
      const apiUrl = `${GEMINI_API_BASE_URL}${DEFAULT_MODEL}:generateContent?key=${geminiApiKey}`;

      // 設置 System Instruction，引導模型像 Google Maps 搜尋器一樣運作
      const systemPrompt = "You are a professional location search assistant. Please use the Google search tool to find a list of relevant Google Maps locations, addresses, ratings, and a brief description based on the user's query, and return the results in a clear Markdown list format.";
      
      const payload = {
          contents: [{ parts: [{ text: queryText }] }],
          // 啟用 Google 搜尋工具，實現資料即時性
          tools: [{ "google_search": {} }], 
          systemInstruction: {
              parts: [{ text: systemPrompt }]
          },
      };

      // 實現指數退避邏輯 (Exponential Backoff)
      const maxRetries = 3;
      let response;
      
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (response.ok) break;

        // 重試邏輯
        if (attempt < maxRetries - 1 && (response.status === 429 || response.status >= 500)) {
          const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          const errorBody = await response.json().catch(() => ({}));
          const errorDetail = errorBody?.error?.message || `HTTP Error! Status code: ${response.status}`;
          throw new Error(`API request failed: ${errorDetail}`);
        }
      }

      if (!response || !response.ok) {
        throw new Error("API request failed. Please check if the model name or API Key is correct.");
      }

      const result = await response.json();
      
      // 解析 LLM 返回的文本
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text || 'The model returned no content.';
      
      setLlmResult(text);

    } catch (err) {
      console.error("Gemini Fetch Error:", err); 
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card} className="fade-in">
        {/* 標題變更為 LLM 驅動 */}
        <div style={styles.header}>✨ Location Information Search</div>

        {/* 🚀 修正: 系統功能介紹區塊 - 使用新的口吻和 Markdown 渲染 */}
        <div style={styles.intro}>
            <ReactMarkdown>{introMarkdown}</ReactMarkdown>
        </div>
        {/* --- 介紹區塊結束 --- */}


        {/* 控制項與 API Key */}
        {/* 修正: styles.controls 已經修改為單欄佈局，並移除了搜尋設定區塊 */}
        <div style={styles.controls}>
          {/* API Key 輸入 - 現在需要的是 Gemini Key */}
          <div style={styles.controlGroup}>
            <label style={styles.label}>
              <span>Gemini API Key</span>
              <input
                type="password"
                value={geminiApiKey}
                onChange={(e) => {
                  const v = e.target.value;
                  setGeminiApiKey(v);
                  // 更改 localStorage key
                  if (rememberKey) localStorage.setItem('gemini_api_key', v); 
                }}
                placeholder="Paste your Gemini API Key"
                style={styles.input}
              />
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, fontSize: 12 }}>
                <input type="checkbox" checked={rememberKey} onChange={(e) => {
                  setRememberKey(e.target.checked);
                  if (!e.target.checked) localStorage.removeItem('gemini_api_key');
                  else if (geminiApiKey) localStorage.setItem('gemini_api_key', geminiApiKey);
                }} />
                <span>Remember my Key (stored locally)</span>
              </label>
            </label>
          </div>
          
          {/* 舊的「搜尋設定」區塊已移除 */}

        </div>
        
        {/* 提示輸入與按鈕 */}
        <form
          onSubmit={e => { e.preventDefault(); searchMaps(); }}
          style={styles.composer}
        >
          <input
            placeholder="Enter the location or business you want to search for (e.g., Taipei National Palace Museum)"
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={styles.textInput}
            disabled={loading}
          />
          <button type="submit" disabled={loading || !query.trim() || !geminiApiKey} style={styles.sendBtn}>
            {loading ? 'AI Searching...' : 'Start AI Search'}
          </button>
        </form>
        
        {/* 錯誤訊息 */}
        {error && (
          <div style={styles.error}>⚠ Error: {error}</div>
        )}

        {/* 搜尋結果顯示區 - 現在顯示 LLM 結果文本 */}
        <div ref={resultsRef} style={styles.resultsSection}>
          <h3 style={styles.resultsHeader}>
            {llmResult ? 'AI Search Results & Summary' : 'Search results will be displayed here'}
          </h3>
          
          {loading && (
              <div style={styles.loadingIndicator}>
                <style>
                  {`
                      @keyframes spin {
                          from { transform: rotate(0deg); }
                          to { transform: rotate(360deg); }
                      }
                  `}
                </style>
                <div style={styles.spinner}></div>
                <p>AI is analyzing Google search results, please wait...</p>
              </div>
          )}
          
          {/* 💥 修正: 新增 CSS 注入，用於控制 Markdown 輸出元素的間隔與分隔線 */}
          <style>
            {`
              /* 確保 ReactMarkdown 輸出元素之間有足夠的間隔 */
              .markdown-list-output > * {
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 1px dashed rgba(0, 0, 0, 0.1);
              }
              /* 清除最後一個元素的底線和間距，保持清爽 */
              .markdown-list-output > *:last-child {
                border-bottom: none;
                padding-bottom: 0;
                margin-bottom: 0;
              }
              /* 清除清單項目本身的底線 */
              .markdown-list-output li {
                border-bottom: none !important;
                padding-bottom: 0 !important;
                margin-bottom: 5px !important;
              }
              /* 讓清單本身沒有額外間距 */
              .markdown-list-output ul, .markdown-list-output ol {
                margin-top: 5px;
              }
            `}
          </style>

          {/* 💥 修正: 在結果容器上添加用於 CSS 注入的 class 名稱 */}
          <div style={styles.llmResultContainer} className="markdown-list-output">
            {llmResult && <ReactMarkdown>{llmResult}</ReactMarkdown>}
          </div>
        </div>
      </div>
    </div>
  );
}

// 沿用並調整的樣式
const styles = {
  container: {
    display: 'grid',
    placeItems: 'center',
    padding: 24,
    minHeight: '100vh',
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
  // 修正後的: 系統功能介紹區塊的樣式 (降低不透明度，與主卡片融合)
  intro: {
    padding: '20px 24px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // 💥 修正: 降低不透明度 (從 0.7 降至 0.2)
    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
    fontSize: 16, 
    lineHeight: 1.8, 
    color: '#444',
    textAlign: 'center', // 💥 新增: 設置文字置中
    // 確保 ReactMarkdown 渲染的內容不會因為 P 標籤而產生過多的外邊距
    '& > p': {
      margin: 0,
    }
  },
  controls: {
    display: 'grid',
    gap: 30,
    // 修正: 改為單欄佈局 (1fr)，讓 API Key 輸入區佔滿寬度
    gridTemplateColumns: '1fr', 
    padding: 24,
    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
  },
  controlGroup: {
    display: 'grid',
    gap: 20,
  },
  settingInfo: { // 此樣式已不再使用，但保留以防萬一
    padding: '12px 18px',
    borderRadius: 14,
    border: '1px dashed rgba(0, 0, 0, 0.1)',
    fontSize: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    fontWeight: 500,
  },
  label: {
    display: 'grid',
    gap: 8,
    fontSize: 14,
    fontWeight: 500,
  },
  input: {
    padding: '12px 18px',
    borderRadius: 14,
    border: '1px solid rgba(0, 0, 0, 0.1)',
    fontSize: 15,
    background: 'rgba(255, 255, 255, 0.8)',
    color: '#333',
    appearance: 'none', 
  },
  composer: {
    padding: 24,
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: 12,
    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
  },
  textInput: {
    padding: '12px 20px',
    borderRadius: 25,
    border: '1px solid rgba(0, 0, 0, 0.1)',
    fontSize: 16,
    background: 'rgba(255, 255, 255, 0.5)',
    color: '#333',
  },
  sendBtn: {
    padding: '12px 20px',
    borderRadius: 25,
    border: 'none',
    background: '#363b47',
    color: '#fff',
    fontSize: 16,
    cursor: 'pointer',
    fontWeight: 600,
    transition: 'background 0.3s, transform 0.1s',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
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
  llmResultContainer: {
    // 樣式調整以更好地呈現 LLM 輸出的 Markdown 文本
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 14,
    minHeight: 150,
    fontSize: 15,
    lineHeight: 1.8,
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
    animation: 'spin 1s linear infinite',
    marginBottom: 10,
  },
};