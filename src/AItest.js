import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';


// 移除 TypeScript 類型定義，依賴 JavaScript 的隱式類型。
// Simple chat types matching Google Gen AI SDK
// export type Part = { text: string };
// export type ChatMsg = { role: 'user' | 'model'; parts: Part[] };

export default function AItest({
  defaultModel = 'gemini-2.5-flash',
  // HW2 修改：變更預設的 starter 訊息，從中文改為英文
  starter = 'Hi! Could you pealse suggest me some tourist spots in Tokyo',
}) {
  const [model, setModel] = useState(defaultModel);
  // 移除 ChatMsg[] 類型註釋
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [rememberKey, setRememberKey] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const listRef = useRef(null);
  
  // Base URL for the Gemini API
  const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/';

  // Load key from localStorage (for demo only — never ship an exposed key in production)
  useEffect(() => {
    const saved = localStorage.getItem('gemini_api_key');
    if (saved) setApiKey(saved);
  }, []);

  // Warm welcome + starter
  useEffect(() => {
    // HW2 修改：變更預設歡迎訊息，從中文改為英文
    setHistory([{ role: 'model', parts: [{ text: "👋 I'm Gemini, Feel free to ask everthing" }] }]);
    if (starter) setInput(starter);
  }, [starter]);

  // auto-scroll to bottom
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [history, loading]);

  // 移除 useMemo 依賴 GoogleGenAI SDK，改為直接使用 apiKey
  // const ai = useMemo(() => { ... }, [apiKey]);

  async function sendMessage(message) {
    const content = (message ?? input).trim();
    if (!content || loading) return;

    if (!apiKey) {
      // HW2 修改：變更錯誤訊息，從中文改為英文
      setError('Please enter the available Gemini API Key');
      return;
    }

    setError('');
    setLoading(true);

    const newHistory = [...history, { role: 'user', parts: [{ text: content }] }];
    setHistory(newHistory);
    setInput('');

    try {
      // 構建 API 呼叫 URL
      const modelId = model || defaultModel; // 確保有模型名稱
      const apiUrl = `${GEMINI_API_BASE_URL}${modelId}:generateContent?key=${apiKey}`;

      const payload = {
        contents: newHistory,
      };
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.json();
        // 嘗試從 API 響應中獲取錯誤訊息
        const errorDetail = errorBody?.error?.message || `HTTP error! Status: ${response.status}`;
        throw new Error(errorDetail);
      }

      const result = await response.json();
      
      const reply = result.candidates?.[0]?.content?.parts?.[0]?.text || '[No content]';
      setHistory(h => [...h, { role: 'model', parts: [{ text: reply }] }]);
    } catch (err) {
      // Explicitly check for message property on error object
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }


  return (
    // 新增 styles.container 作為全螢幕背景和居中用的容器
    <div style={styles.container}>
      {/* styles.card 現在只包含卡片的玻璃擬態外觀屬性 */}
      <div style={styles.card} className="fade-in">
        {/* // HW2 修改：變更標題文字 */}
        <div style={styles.header}>Gemini Chat</div>

        {/* Controls */}
        <div style={styles.controls}>
          <label style={styles.label}>
            <span>Model</span>
            <input
              value={model}
              onChange={e => setModel(e.target.value)}
              // HW2 修改：變更輸入框的 placeholder 文字
              placeholder="e.g. gemini-2.5-flash、gemini-2.5-pro"
              style={styles.input}
            />
            {/* // HW2 修改：變更底部的說明文字，從中文改為英文 */}
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
              Please enter the model name regrading the latest official list
            </div>
          </label>

          <label style={styles.label}>
            <span>Gemini API Key</span>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => {
                const v = e.target.value;
                setApiKey(v);
                if (rememberKey) localStorage.setItem('gemini_api_key', v);
              }}
              // HW2 修改：變更輸入框的 placeholder 文字
              placeholder="Paste your API Key (only storage in local) "
              style={styles.input}
            />
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, fontSize: 12 }}>
              <input type="checkbox" checked={rememberKey} onChange={(e) => {
                setRememberKey(e.target.checked);
                if (!e.target.checked) localStorage.removeItem('gemini_api_key');
                else if (apiKey) localStorage.setItem('gemini_api_key', apiKey);
              }} />
              {/* // HW2 修改：變更「記住在本機」的文字為英文 */}
              <span>Remember me</span>
            </label>
            {/* // HW2 刪除：移除了一段關於 demo 用法的中文說明文字 */}
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
            </div>
          </label>
        </div>

        {/* Messages */}
        <div ref={listRef} style={styles.messages}>
          {history.map((m, idx) => (
            <div key={idx} style={{ ...styles.msg, ...(m.role === 'user' ? styles.user : styles.assistant) }}>
              <div style={styles.msgRole}>{m.role === 'user' ? 'you' : 'Gemini'}</div>
              <div style={styles.msgBody}>
                {/* HW2 使用 Markdown 套件呈現回傳文字 */}
                <ReactMarkdown>{m.parts.map(p => p.text).join('\n')}</ReactMarkdown>
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ ...styles.msg, ...styles.assistant }}>
              <div style={styles.msgRole}>Gemini</div>
              {/* HW2 修改：將「思考中...」的文字改為英文 */}
              <div style={styles.msgBody}>Thinking…</div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div style={styles.error}>⚠ {error}</div>
        )}

        {/* Composer */}
        <form
          onSubmit={e => { e.preventDefault(); sendMessage(); }}
          style={styles.composer}
        >
          <input
            // HW2 修改：變更輸入框的 placeholder 文字
            placeholder="Enter your message and press Enter "
            value={input}
            onChange={e => setInput(e.target.value)}
            style={styles.textInput}
          />
          <button type="submit" disabled={loading || !input.trim() || !apiKey} style={styles.sendBtn}>
            {/* // HW2 修改：變更送出按鈕的文字 */}
            Enter
          </button>
        </form>

        {/* Quick examples */}
          {/* HW2 新增：在 div 上增加 padding 屬性 */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8, padding: '0 20px 20px' }}>
          {/* // HW2 修改：變更範例按鈕的文字 */}
          {["How's the weather in Tokyo Today", "How many budget sould I prepare for one week trip in Tokyo "].map((q) => (
            <button key={q} type="button" style={styles.suggestion} onClick={() => sendMessage(q)}>{q}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// HW2 修改：更新了整個 styles 物件的內容，包括顏色、圓角、陰影、字體等，液態玻璃效果
const styles = {
  // NEW: 專門用於全螢幕佈局和背景漸層的容器
  container: {
    display: 'grid',
    placeItems: 'center',
    padding: 24,
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #383333ff 0%, #f9fafb 100%)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    color: '#333',
  },
  // 原本的 card 樣式現在只包含玻璃擬態的外觀屬性
  card: {
    width: 'min(900px, 95%)',
    background: 'rgba(255, 255, 255, 0.5)', // Card 自己的半透明背景
    borderRadius: 24,
    overflow: 'hidden',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(200px)',
    WebkitBackdropFilter: 'blur(200px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  header: {
    padding: '16px 24px',
    fontWeight: 600,
    fontSize: 20,
    borderBottom: '1px solid rgba(255, 255, 255, 0.4)',
    background: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
  controls: {
    display: 'grid',
    gap: 20,
    gridTemplateColumns: '1fr 1fr',
    padding: 24,
    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
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
  },
  messages: {
    padding: 24,
    display: 'grid',
    gap: 16,
    maxHeight: 450,
    overflowY: 'auto',
  },
  msg: {
    borderRadius: 20,
    padding: '14px 20px',
    border: 'none',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  },
  user: {
    background: '#e9eff4',
    marginLeft: 'auto',
    maxWidth: '80%',
  },
  assistant: {
    background: 'rgba(255, 255, 255, 0.9)',
    marginRight: 'auto',
    maxWidth: '80%',
    backdropFilter: 'blur(5px)',
    WebkitBackdropFilter: 'blur(5px)',
    border: '1px solid rgba(255, 255, 255, 0.6)',
  },
  msgRole: {
    fontSize: 12,
    fontWeight: 600,
    opacity: 0.6,
    marginBottom: 4,
    color: '#555',
  },
  msgBody: {
    fontSize: 15,
    lineHeight: 1.6,
    color: '#333',
  },
  error: {
    color: '#ef4444',
    padding: '10px 24px',
    fontWeight: 500,
    backgroundColor: 'rgba(255, 235, 238, 0.7)',
    borderTop: '1px solid rgba(255, 204, 204, 0.5)',
  },
  composer: {
    padding: 24,
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: 12,
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
    background: '#363b47ff',
    color: '#fff',
    fontSize: 16,
    cursor: 'pointer',
    fontWeight: 600,
  },
  suggestion: {
    padding: '10px 18px',
    borderRadius: 20,
    border: '1px solid rgba(0, 0, 0, 0.1)',
    background: 'rgba(255, 255, 255, 0.7)',
    cursor: 'pointer',
    fontSize: 13,
    color: '#444',
  },
};
