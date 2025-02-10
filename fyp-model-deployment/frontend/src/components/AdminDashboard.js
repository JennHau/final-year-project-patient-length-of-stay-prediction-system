import React, { useState, useEffect } from 'react';
import BarChart from './BarChart';
import OccupancyLineChart from './HistoricalLineChart';
import PredictedAdmissionsLineChart from './PredictedLineChart'
import GenderDistributionDonutChart from './GenderDonutChart';
import LengthOfStayHistogram from './LosHistogram';
import './AdminDashboard.css';

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState('');

  // Fetch data from the API
  const fetchFacilityData = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/ml_model/api/facilities');
      const facilitiesData = await response.json();
      
      // Process facilities data
      const processedData = facilitiesData.map(facility => ({
        hospital: facility.name,
        available: facility.capacity,
        occupied: 0, // Initialize as 0, update with patient data if needed
      }));
      
      setData(processedData);
    } catch (error) {
      console.error('Error fetching facilities data:', error);
    }
  };

  useEffect(() => {
    fetchFacilityData();
  }, []);

  return (
    <div className='dashboard-container mt-5'>
      <h2 className="dashboard-title">Real-Time Dashboard</h2>
      <div className="select-container">
        <label htmlFor="hospital-select" className="select-label">Select a Hospital:</label>
        <select 
          onChange={e => setSelectedHospital(e.target.value)} 
          value={selectedHospital}
          className="select-field"
        >
          <option value="">Select a Hospital (Show All)</option>
          {data.map((item, index) => (
            <option key={index} value={item.hospital}>
              {item.hospital}
            </option>
          ))}
        </select>
      </div>
      <div className='charts-container-1'>
        <BarChart selectedHospital={selectedHospital} />
        <GenderDistributionDonutChart selectedHospital={selectedHospital} />
      </div>
      
      <div className='charts-container-2'>
        <OccupancyLineChart selectedHospital={selectedHospital} />
        <PredictedAdmissionsLineChart selectedHospital={selectedHospital} /> 
      </div>

      <div style={{ marginTop: '50px' }}>
        <LengthOfStayHistogram selectedHospital={selectedHospital} />
      </div>
      
      
    </div>
  );
};

export default Dashboard;
