import React, { useState, useEffect, useCallback } from 'react';
import Plot from 'react-plotly.js';
import './PredictedLineChart.css'

const PredictedAdmissionsLineChart = ({ selectedHospital }) => {
  const [predictedData, setPredictedData] = useState([]);
  const [loading, setLoading] = useState(true);

  const processPredictedData = useCallback((data) => {
    const dailyCounts = {};
    const now = new Date(); // Get the current date

    data.forEach(patient => {
      if (selectedHospital === '' || patient.hospital === selectedHospital) {
        let admissionDate;

        if (typeof patient.vdate === 'string') {
          admissionDate = new Date(patient.vdate);
        } else if (patient.vdate instanceof Date) {
          admissionDate = patient.vdate;
        } else {
          console.error('Unexpected vdate format:', patient.vdate);
          return; // Skip this record if vdate is not a recognized format
        }

        const endDate = new Date(admissionDate.getTime() + patient.pred_lengthofstay * 24 * 60 * 60 * 1000);
        let date = new Date(admissionDate);

        while (date <= endDate) {
          // Only include future dates
          if (date >= now) {
            const day = date.toISOString().split('T')[0];
            dailyCounts[day] = (dailyCounts[day] || 0) + 1;
          }
          date.setDate(date.getDate() + 1);
        }
      }
    });

    const sortedDays = Object.keys(dailyCounts).sort();
    return sortedDays.map(day => ({ day, count: dailyCounts[day] }));
  }, [selectedHospital]);

  const fetchData = useCallback(async () => {
    setLoading(true); // Start loading state
    try {
      // Fetch patients and facilities data simultaneously
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
        hospital: facilityMap[patient.facid] || 'Unknown' // Assign hospital name or 'Unknown' if not found
      }));

      // Filter ongoing patients (discharged = null) and process data
      const ongoingPatients = processedPatients.filter(patient => !patient.discharged);
      const processedData = processPredictedData(ongoingPatients);

      setPredictedData(processedData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false); // End loading state
    }
  }, [processPredictedData]);

  useEffect(() => {
    fetchData(); // Fetch data whenever selectedHospital changes
  }, [fetchData, selectedHospital]);

  if (loading) {
    return (
      <div className="predicted-line-chart-container mt-5">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className='predicted-line-chart-container mt-5'>
      <Plot
        data={[{
          x: predictedData.map(item => item.day),
          y: predictedData.map(item => item.count),
          type: 'scatter',
          mode: 'lines+markers',
          marker: { color: '#FF6600' }, // Line color
          line: { color: '#FF6600', dash: 'dot' } // Dotted line
        }]}

        layout={{
          title: {
            text: selectedHospital ? `Predicted Admissions of<br>${selectedHospital}` : 'Predicted Admissions of<br>All Hospitals',
            font: {
              size: 18,
              color: '#024b72',
              weight: 'bold',
            },
          },
          xaxis: {
            title: {
              text: 'Date',
              font: {
                color: '#00679e', // Font color for the axis title
                size: 14,         // Font size for the axis title
                weight: 'bold', 
              },
              standoff: 20, // Distance between the axis and the title
            },
            tickangle: -45,
            tickformat: '%Y-%m-%d', // Format x-axis ticks as YYYY-MM-DD
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
          },
          paper_bgcolor: '#FFFFFF',
          plot_bgcolor: '#FFFFFF',
          font: {
            color: '#000000',
          },
          width: 750,  // Set chart width here
          height: 450, // Set chart height here

          margin: {
            t: 60,
            b: 120,  // Adjust bottom margin to give more space to the x-axis
          },
        }}
        config={{
          displayModeBar: false, // Hide mode bar
        }}
        className='predicted-line-chart'
      />
    </div>
  );
};

export default PredictedAdmissionsLineChart;
