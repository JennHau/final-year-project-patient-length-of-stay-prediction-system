import React, { useState, useEffect, useCallback } from 'react';
import Plot from 'react-plotly.js';
import './LosHistogram.css';

const LengthOfStayHistogram = ({ selectedHospital }) => {
  const [losData, setLosData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFrame, setTimeFrame] = useState('Last 3 months'); // Default time frame

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch patients data
      const patientsResponse = await fetch('http://127.0.0.1:8000/ml_model/api/patients');
      const patients = await patientsResponse.json();

      // Fetch facilities data to map facility names (if needed)
      const facilitiesResponse = await fetch('http://127.0.0.1:8000/ml_model/api/facilities');
      const facilities = await facilitiesResponse.json();

      // Create a mapping from facid to hospital name
      const facilityMap = facilities.reduce((map, facility) => {
        map[facility.facid] = facility.name;
        return map;
      }, {});

      // Get the current date
      const now = new Date();

      // Filter patients by selected hospital and time frame
      const filteredPatients = patients.filter(patient => {
        if (patient.discharged !== null) { // Only completed stays
          const hospital = facilityMap[patient.facid] || 'Unknown';

          // Check hospital filter
          if (selectedHospital && hospital !== selectedHospital) {
            return false;
          }

          // Check time frame filter
          const admissionDate = new Date(patient.vdate);
          const daysSinceAdmission = (now - admissionDate) / (1000 * 60 * 60 * 24); // Convert ms to days

          if (timeFrame === 'Last 3 Months' && daysSinceAdmission > 90) return false;
          if (timeFrame === 'Last 6 Months' && daysSinceAdmission > 180) return false;
          if (timeFrame === 'Last 1 Year' && daysSinceAdmission > 365) return false;

          return true;
        }
        return false;
      });

      // Extract length of stay from filtered patients
      const lengthOfStay = filteredPatients.map(patient => patient.lengthofstay);

      setLosData(lengthOfStay);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedHospital, timeFrame]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTimeFrameChange = (event) => {
    setTimeFrame(event.target.value);
  };

  if (loading) {
    return (
      <div className="histogram-container mt-4">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="histogram-container mt-4">
      <div className="histogram-time-frame-selector">
        <label htmlFor="timeFrame" className='time-frame-label'>Time Frame:</label>
        <select id="timeFrame" value={timeFrame} onChange={handleTimeFrameChange}>
          <option value="Last 3 Months">Last 3 Months</option>
          <option value="Last 6 Months">Last 6 Months</option>
          <option value="Last 1 Year">Last 1 Year</option>
        </select>
      </div>

      <Plot
        data={[
          {
            x: losData,
            type: 'histogram',
            marker: {
              color: '#0066CC', // Color for bars
              line: {
                color: '#e0e0e0', // Light grey color for the border
                width: 0.1, // Width of the border lines
              },
              opacity: 0.8,
            },
            autobinx: true,
            xbins: {
              start: Math.min(...losData) - 1,
              end: Math.max(...losData) + 1,
              size: 5, // Adjust bin size for better clarity
            },
          },
        ]}
        layout={{
          title: {
            text: selectedHospital
              ? `Length of Stay Distribution in ${selectedHospital}`
              : 'Length of Stay Distribution Across All Hospitals',
            font: {
              size: 18,
              color: '#024b72',
              weight: 'bold',
            },
          },
          xaxis: {
            title: {
              text: 'Length of Stay (Days)',
              font: {
                color: '#00679e',
                weight:'bold'
              },
            },
            automargin: true,
            tickangle: -45,
            tickfont: {
              size: 12,
            },
          },
          yaxis: {
            title: {
              text: 'Count',
              font: {
                color: '#00679e',
                weight:'bold'
              },
            },
            tickfont: {
              size: 12,
            },
          },
          width: 1300,  // Set chart width here
          height: 500, // Set chart height here
          margin: {
            t:130,
          }
        }}
        config={{
          displayModeBar: false, // Hide the mode bar
        }}
        className="histogram-chart"
      />
    </div>
  );
};

export default LengthOfStayHistogram;
