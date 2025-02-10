import React, { useState, useEffect, useCallback } from 'react';
import Plot from 'react-plotly.js';
import './HistoricalLineChart.css'; // Custom CSS for styling

const OccupancyLineChart = ({ selectedHospital }) => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState('3 months');
  const [loading, setLoading] = useState(true);

  const processDataByFilter = useCallback((data, timeFrame) => {
    const now = new Date();
    const startDate = getStartDate(timeFrame);
    
    const monthlyCounts = {};
    
    data.forEach(patient => {
      if (selectedHospital === '' || patient.hospital === selectedHospital) { // Filter by hospital if specified
        const endDate = patient.discharged ? new Date(patient.discharged) : new Date(patient.admissionDate.getTime() + patient.lengthOfStay * 24 * 60 * 60 * 1000);
        if (endDate >= startDate && patient.admissionDate <= now) {
          const yearMonth = `${patient.admissionDate.getFullYear()}-${String(patient.admissionDate.getMonth() + 1).padStart(2, '0')}`;
          monthlyCounts[yearMonth] = (monthlyCounts[yearMonth] || 0) + 1;
        }
      }
    });
    
    const sortedMonths = Object.keys(monthlyCounts).sort();
    return sortedMonths.map(month => ({ month, count: monthlyCounts[month] }));
  }, [selectedHospital]);

  const getStartDate = (timeFrame) => {
    const now = new Date();
    switch (timeFrame) {
      case '3 months':
        return new Date(now.setMonth(now.getMonth() - 3));
      case '6 months':
        return new Date(now.setMonth(now.getMonth() - 6));
      case '1 year':
        return new Date(now.setFullYear(now.getFullYear() - 1));
      default:
        return new Date(now.setMonth(now.getMonth() - 3));
    }
  };

  const fetchData = useCallback(async () => {
    try {
      const [patientsResponse, hospitalsResponse] = await Promise.all([
        fetch('http://127.0.0.1:8000/ml_model/api/patients'),
        fetch('http://127.0.0.1:8000/ml_model/api/facilities'),
      ]);
      const patients = await patientsResponse.json();
      const facilities = await hospitalsResponse.json();

      // Create a mapping from facid to hospital name
      const facilityMap = facilities.reduce((map, facility) => {
        map[facility.facid] = facility.name;
        return map;
      }, {});

      // Map facid to hospital name in patients data
      const processedPatients = patients.map(patient => ({
        ...patient,
        hospital: facilityMap[patient.facid] || 'Unknown'
      }));

      // Process patients data
      const processedData = processPatientsData(processedPatients);
      setData(processedData);
      setFilteredData(processDataByFilter(processedData, selectedTimeFrame));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  }, [processDataByFilter, selectedTimeFrame]);

  const processPatientsData = (patients) => {
    const processed = patients.map(patient => {
      const admissionDate = new Date(patient.vdate);
      const dischargeDate = patient.discharged ? new Date(patient.discharged) : null;
      const lengthOfStay = patient.pred_lengthofstay || 0;
      return {
        admissionDate,
        dischargeDate,
        lengthOfStay,
        ongoing: !patient.discharged,
        facid: patient.facid, // Add facid for filtering
        hospital: patient.hospital // Add hospital name for reference
      };
    });
    return processed;
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!loading) {
      setFilteredData(processDataByFilter(data, selectedTimeFrame)); // Update filtered data based on time frame
    }
  }, [data, selectedTimeFrame, loading, processDataByFilter]);

  if (loading) {
    return (
      <div className="historical-line-chart-container mt-5">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className='historical-line-chart-container mt-5'>
      <div className="historical-line-chart-time-frame-selector">
        <label htmlFor="timeframe-select" className='time-frame-label'>Time Frame:</label>
        <select
          id="timeframe-select"
          onChange={e => setSelectedTimeFrame(e.target.value)}
          value={selectedTimeFrame}
        >
          <option value="3 months">Last 3 Months</option>
          <option value="6 months">Last 6 Months</option>
          <option value="1 year">Last 1 Year</option>
        </select>
      </div>
      <Plot
        data={[{
          x: filteredData.map(item => item.month),
          y: filteredData.map(item => item.count),
          type: 'scatter',
          mode: 'lines+markers',
          marker: { color: '#0066CC' }, // Line color
          line: { color: '#0066CC' } // Line color
        }]}
        layout={{
          title: {
            text: selectedHospital ? `Patient Admissions Over Time<br> of ${selectedHospital}` : 'Patient Admissions Over Time<br>of All Hospitals',
            font: {
              size: 18,
              color: '#024b72',
              weight: 'bold',
            },
          },
          xaxis: {
            title: {
              text: 'Month', // Define the axis title text here
              font: {
                color: '#00679e', // Font color for the axis title
                size: 14,         // Font size for the axis title
                weight: 'bold', 
              },  
              standoff: 20, // Distance between the axis and the title
            },
            tickangle: -45,
            tickformat: '%Y-%m', // Format x-axis ticks as YYYY-MM
          },
          yaxis: {
            title: {
              text: 'Number of Patients',
              font: {
                color: '#00679e', // Font color for the axis title
                size: 14,         // Font size for the axis title
                weight: 'bold', 
              },  
            },
            rangemode: 'tozero', // Ensures that the range starts from 0
            range: [0, Math.max(...filteredData.map(item => item.count)) * 1.2], // Adds padding above the highest value
          },
          paper_bgcolor: '#FFFFFF',
          plot_bgcolor: '#FFFFFF',
          font: {
            color: '#000000',
          }
        }}
        config={{
          displayModeBar: false, // Hide mode bar
        }}
        className="historical-line-chart"
      />
    </div>
  );
  
};

export default OccupancyLineChart;