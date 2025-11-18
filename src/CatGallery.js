import React, { useState, useEffect } from 'react';
import { FaCat, FaSyncAlt, FaHeart, FaGlobeAmericas, FaPaw } from 'react-icons/fa';

export default function CatGallery() {
  const [catData, setCatData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 使用你提供的 API Key 和參數
  const API_KEY = "live_fkuboqjGlWMbO3lz5uVkcIL8AvYVq6jCslRhtiwlV6CKAOqHjBiH273KGUIwY2WF";
  const API_URL = "https://api.thecatapi.com/v1/images/search?size=med&mime_types=jpg&format=json&has_breeds=true&order=RANDOM&page=0&limit=1";

  const fetchCat = () => {
    setLoading(true);
    
    const headers = new Headers({
      "Content-Type": "application/json",
      "x-api-key": API_KEY
    });

    fetch(API_URL, { headers: headers })
      .then(response => response.json())
      .then(result => {
        if (result && result.length > 0) {
          setCatData(result[0]);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCat();
  }, []);

  const breed = (catData && catData.breeds && catData.breeds.length > 0) ? catData.breeds[0] : null;

  return (
    <div style={styles.container}>
      <div style={styles.card} className="fade-in">
        
        {/* Header */}
        <div style={styles.header}>
          <FaCat style={{color: '#f472b6', marginRight: 10, fontSize: '1.5rem'}} />
          Daily Cat Dose
        </div>

        {/* Refresh Button */}
        <div style={{textAlign: 'center', marginBottom: 20}}>
          <button onClick={fetchCat} style={styles.refreshBtn} disabled={loading}>
            <FaSyncAlt className={loading ? "spin" : ""} /> {loading ? 'Fetching...' : 'Next Cat'}
          </button>
        </div>

        {/* Content */}
        <div style={styles.contentArea}>
          {loading && (
            <div style={styles.loadingPlaceholder}>
               <div style={styles.spinner}></div>
               <p>Looking for a cute cat...</p>
            </div>
          )}

          {!loading && catData && (
            <div className="fade-in">
              <div style={styles.imageContainer}>
                <img src={catData.url} alt="Random Cat" style={styles.image} />
              </div>

              {breed ? (
                <div style={styles.infoCard}>
                  <h3 style={styles.breedTitle}>{breed.name}</h3>
                  <div style={styles.tagContainer}>
                    <span style={styles.tag}><FaGlobeAmericas /> {breed.origin}</span>
                    <span style={styles.tag}><FaHeart /> {breed.life_span} yrs</span>
                  </div>
                  <p style={styles.description}>{breed.description}</p>
                  <div style={styles.temperamentBox}>
                    <FaPaw style={{color: '#f472b6', marginRight: 5}} />
                    {breed.temperament}
                  </div>
                </div>
              ) : (
                <div style={styles.infoCard}>
                  <h3 style={styles.breedTitle}>Mystery Cat</h3>
                  <p style={styles.description}>A beautiful cat of unknown origin. Just enjoy the cuteness!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
        .fade-in { animation: fadeIn 0.5s ease-in; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

// Styles
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
    width: 'min(600px, 95%)',
    background: 'rgba(255, 255, 255, 0.65)',
    borderRadius: 24,
    overflow: 'hidden',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    paddingBottom: 20,
  },
  header: {
    padding: '20px 24px',
    fontWeight: 800,
    fontSize: 24,
    background: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
    color: '#363b47',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  refreshBtn: {
    padding: '10px 24px',
    borderRadius: 30,
    border: 'none',
    background: '#363b47',
    color: '#fff',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    fontWeight: 600,
    fontSize: '1rem',
    transition: 'all 0.2s',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
  },
  contentArea: { padding: '0 20px' },
  loadingPlaceholder: { height: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#666' },
  spinner: { border: '4px solid rgba(0, 0, 0, 0.1)', borderTop: '4px solid #f472b6', borderRadius: '50%', width: 40, height: 40, marginBottom: 15, animation: 'spin 1s linear infinite' },
  imageContainer: { width: '100%', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', marginBottom: 20, backgroundColor: '#eee', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 },
  image: { width: '100%', height: 'auto', display: 'block', objectFit: 'cover' },
  infoCard: { background: 'rgba(255,255,255,0.7)', borderRadius: 16, padding: 20 },
  breedTitle: { margin: '0 0 10px 0', fontSize: '1.5rem', color: '#333' },
  tagContainer: { display: 'flex', gap: 10, marginBottom: 15, flexWrap: 'wrap' },
  tag: { background: '#fff', padding: '4px 10px', borderRadius: 8, fontSize: '0.85rem', color: '#555', display: 'flex', alignItems: 'center', gap: 5, border: '1px solid rgba(0,0,0,0.05)' },
  description: { fontSize: '0.95rem', lineHeight: 1.6, color: '#444', marginBottom: 15 },
  temperamentBox: { fontSize: '0.9rem', color: '#555', background: 'rgba(244, 114, 182, 0.1)', padding: 10, borderRadius: 8 }
};