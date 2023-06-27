import React, { useState, useEffect } from 'react';
import { GoogleMap, HeatmapLayer, LoadScript } from '@react-google-maps/api';
import mapStyles from './map/mapStyles';
import './App.css';


const containerStyle = {
  width: '100%',
  height: '600px' 
};

const center = {
  lat: -27.361936,
  lng: -55.920911
};

const gridSize = 0.01;

const App = () => {
  const [heatmapData, setHeatmapData] = useState([]);
  const [storedCounts, setStoredCounts] = useState([]);
  const [comments, setComments] = useState([]);
  const [mapCenter, setMapCenter] = useState(center);

  useEffect(() => {
    localStorage.setItem('heatmapData', JSON.stringify(storedCounts));
  }, [storedCounts]);

  const handleMapClick = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    storeLatLng(lat, lng);
    increaseHeatmapCount(lat, lng);
    updateHeatmap();
    openCommentPopup(lat, lng);
  };

  const storeLatLng = (lat, lng) => {
    const point = { lat, lng, weight: 1 };
    setHeatmapData(prevData => [...prevData, point]);
  };

  const increaseHeatmapCount = (lat, lng) => {
    const gridKey = `${Math.floor(lat / gridSize)},${Math.floor(lng / gridSize)}`;

    const counts = JSON.parse(localStorage.getItem('heatmapData')) || [];
    const existingPointIndex = counts.findIndex(point => point.gridKey === gridKey);

    if (existingPointIndex !== -1) {
      counts[existingPointIndex].weight++;
    } else {
      counts.push({ gridKey, weight: 1 });
    }

    localStorage.setItem('heatmapData', JSON.stringify(counts));
    setStoredCounts(counts);
  };

  const updateHeatmap = () => {
    setHeatmapData(prevData => [...prevData]);
  };

  const getHeatmapData = () => {
    const heatmapDataLocal = heatmapData.map(({ lat, lng }) => {
      const gridKey = `${Math.floor(lat / gridSize)},${Math.floor(lng / gridSize)}`;
      const counts = JSON.parse(localStorage.getItem('heatmapData')) || [];
      const point = counts.find(point => point.gridKey === gridKey);
      const weight = point ? point.weight : 0;
      return {
        location: new window.google.maps.LatLng(lat, lng),
        weight
      };
    });
    return heatmapDataLocal;
  };

  const openCommentPopup = (lat, lng) => {
    const comment = window.prompt('Enter a comment:');
    if (comment) {
      const newComment = { lat, lng, comment };
      setComments(prevComments => [...prevComments, newComment]);
    }
  };

  const centerMap = (lat, lng) => {
    setMapCenter({ lat, lng });
  };

  return (
    <LoadScript googleMapsApiKey="API_KEY" libraries={['visualization']}>
      <div className="container">
        <div className="map-container">
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={mapCenter}
            zoom={12}
            options={{
              styles: mapStyles 
            }}
            onClick={handleMapClick}
          >
            <HeatmapLayer
              data={getHeatmapData()}
              options={{
                radius: 30,
                gradient: [
                  'rgba(0, 255, 0, 0)',
                  'rgba(255, 255, 0, 0.5)',
                  'rgba(255, 0, 0, 1)'
                ],
                maxIntensity: Math.max(...storedCounts.map(point => point.weight))
              }}
            />
          </GoogleMap>
        </div>
        <div className="comment-list">
          <h2>Comments</h2>
          <ul>
            {comments.map((comment, index) => (
              <li
                key={index}
                onClick={() => centerMap(comment.lat, comment.lng)}
                className="comment-item"
              >
                {comment.comment}
                <button
                  className="go-to-button"
                  onClick={(event) => {
                    event.stopPropagation();
                    centerMap(comment.lat, comment.lng);
                  }}
                >
                  Go to
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </LoadScript>
  );
  
  
  };

export default App;
