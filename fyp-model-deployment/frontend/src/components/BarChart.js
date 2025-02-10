import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import './BarChart.css';

const BarChart = ({ selectedHospital }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch facility and patient data from the API
  const fetchFacilityAndPatientData = async () => {
    try {
      // Fetch facilities data (capacity)
      const facilitiesResponse = await fetch('http://127.0.0.1:8000/ml_model/api/facilities');
      const facilities = await facilitiesResponse.json();

      // Fetch patients data (occupied spaces)
      const patientsResponse = await fetch('http://127.0.0.1:8000/ml_model/api/patients');
      const patients = await patientsResponse.json();

      // Process data to calculate available and occupied spaces
      const data = facilities.map(facility => {
        // Count ongoing patients for this facility
        const occupiedCount = patients.filter(patient => 
          patient.facid === facility.facid &&
          (!patient.discharged || new Date(patient.discharged) > new Date())
        ).length;

        return {
          hospital: facility.name,
          available: facility.capacity, // Available spaces
          occupied: occupiedCount, // Occupied spaces
          capacity: facility.capacity // Total capacity for coloring logic
        };
      });

      setChartData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchFacilityAndPatientData();
  }, []);

  if (loading) {
    return (
      <div className="bar-chart-container mt-4">
        <div>Loading...</div>
      </div>
    );
  }

  // Filter the data based on selected hospital
  const filteredData = selectedHospital
    ? chartData.filter(item => item.hospital === selectedHospital)
    : chartData;

  // Prepare the chart data
  const plotData = [
    {
      x: filteredData.map(item => item.hospital),
      y: filteredData.map(item => item.available),
      type: 'bar',
      name: 'Capacity',
      marker: { color: '#0066CC' }, // Dark blue color for available space
      opacity: 0.8,
    },
    {
      x: filteredData.map(item => item.hospital),
      y: filteredData.map(item => item.occupied),
      type: 'bar',
      name: 'Occupied',
      marker: {
        color: filteredData.map(item =>
          item.occupied >= item.capacity ? '#FF4500' : '#FFD700' // Red if over capacity, yellow otherwise
        )
      },
      opacity: 0.8,
    },
  ];

  return (
    <div className="bar-chart-container mt-4">
      <Plot
        data={plotData}
        layout={{
          title: {
            text: selectedHospital ? `Current Space Utilisation for ${selectedHospital}:<br>Capacity vs. Occupied Beds` : 'Current Space Utilisation for All Hospitals:<br>Capacity vs. Occupied Beds',
            font: {
              size: 18, // Font size
              color: '#024b72', // Font color
              weight: 'bold',
            }
          },
          barmode: 'group',
          xaxis: { 
            title: {
              text: selectedHospital ? `${selectedHospital}` : 'Hospital',
              font: {
                color: '#00679e',
                weight:'bold'
              },
              standoff: 20,
            },
            showticklabels: !selectedHospital,
            tickangle: selectedHospital ? 0 : -30, // Set angle based on selection
            tickfont: {
              size: selectedHospital ? 0 : 10, // Set font size based on selection
            },
            automargin: true,
          }, // Rotate x-axis labels if needed
          yaxis: { 
            title: {
              text: 'Count',
              font: {
                color: '#00679e',
                weight:'bold'
              }
            } 
          },
          paper_bgcolor: '#FFFFFF', // White background
          plot_bgcolor: '#FFFFFF', // White background
          font: {
            color: '#000000' // Black text for readability
          }
        }}
        config={{
          displayModeBar: false, // Hide the mode bar
        }}
        className="bar-chart"
      />
    </div>
  );
};

export default BarChart;
