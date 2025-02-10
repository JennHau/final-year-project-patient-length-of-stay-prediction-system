import React, { useState, useEffect, useCallback } from 'react';
import Plot from 'react-plotly.js';
import './GenderDonutChart.css'

const GenderDistributionDonutChart = ({ selectedHospital }) => {
  const [genderData, setGenderData] = useState({ male: 0, female: 0 });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true); // Set loading to true when fetching data
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

      // Process the data to count ongoing patients by gender
      let maleCount = 0;
      let femaleCount = 0;

      patients.forEach(patient => {
        if (patient.discharged === null) { // Ongoing patient
          const hospital = facilityMap[patient.facid] || 'Unknown';
          if (!selectedHospital || hospital === selectedHospital) {
            if (patient.gender === 'M') maleCount++;
            if (patient.gender === 'F') femaleCount++;
          }
        }
      });

      setGenderData({ male: maleCount, female: femaleCount });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false); // Ensure loading is set to false after fetch completes
    }
  }, [selectedHospital]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="donut-chart-container mt-4">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="donut-chart-container mt-4">
      <Plot
        data={[
          {
            labels: ['Male', 'Female'],
            values: [genderData.male, genderData.female],
            type: 'pie',
            hole: 0.4, // Donut chart (0.4 = 40% hole in the middle)
            marker: {
              colors: ['#0066CC', '#FF99CC'], // Male = blue, Female = pink
            },
            opacity: 0.9,
          },
        ]}
        layout={{
          title: {
            text: selectedHospital
              ? `Current Gender Distribution<br>in ${selectedHospital}`
              : 'Current Gender Distribution<br>Across All Hospitals',
            font: {
              size: 18,
              color: '#024b72',
              weight: 'bold',
            },
            xref: 'paper',
            yref: 'paper',
            x: 0.5,
            y: 1.15, // Adjust vertical position to ensure title is above the chart
            xanchor: 'center',
            yanchor: 'top',
          },
          showlegend: true,
          paper_bgcolor: '#FFFFFF',
          plot_bgcolor: '#FFFFFF',
          annotations: [
            {
              font: {
                size: 15,
                color: '#00679e',
                weight:'bold',
              },
              showarrow: false,
              text: 'Gender',
              x: 0.5,
              y: 0.5,
            },
          ],
          width: 550,  // Set chart width here
          height: 400, // Set chart height here
          margin: {
            t: 120, // Increase top margin to add space between the title and the chart
            b: 30, // Bottom margin
            l: 50, // Left margin
            r: 50, // Right margin
          },
        }}
        config={{
          displayModeBar: false, // Hide the mode bar
        }}
        className="donut-chart"
      />


    </div>
  );
};

export default GenderDistributionDonutChart;
