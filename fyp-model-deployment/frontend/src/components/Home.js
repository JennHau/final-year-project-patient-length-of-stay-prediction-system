import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Image, Form, Pagination } from 'react-bootstrap';
import banner from '../images/HomePage Banner.jpg';
import './Home.css';

const Home = () => {
  const [facilities, setFacilities] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [postcode, setPostcode] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Get today's date and the date 15 days from now
  const today = new Date();
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 15);

  const formattedMaxDate = maxDate.toISOString().split('T')[0];

  useEffect(() => {
    // Fetch facility data
    fetch('http://127.0.0.1:8000/ml_model/api/facilities') 
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => setFacilities(data))
      .catch(error => console.error('Error fetching facilities:', error));

    // Fetch patient data
    fetch('http://127.0.0.1:8000/ml_model/api/patients') 
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => setPatients(data))
      .catch(error => console.error('Error fetching patients:', error));
  }, []);

  // Function to calculate occupancy rate based on the selected date
  const calculateOccupancyRate = (facilityId, capacity) => {
    const selectedDateObj = new Date(selectedDate);

    // Filter patients based on the facility ID, discharge status, and selected date
    const facilityPatients = patients.filter(patient => 
      patient.facid === facilityId &&
      patient.discharged === null // Check if the patient has not been discharged
    );

    // Calculate the number of ongoing patients based on the selected date
    const ongoingPatients = facilityPatients.filter(patient => {
      const admissionDate = new Date(patient.vdate); // Convert admission date to a Date object
      const lengthOfStayDays = parseInt(patient.pred_lengthofstay, 10); // Assuming lengthOfstay is in days
      const predictedDischargeDate = new Date(admissionDate);
      predictedDischargeDate.setDate(admissionDate.getDate() + lengthOfStayDays); // Add lengthOfstay days

      return selectedDateObj >= admissionDate && selectedDateObj <= predictedDischargeDate;
    }).length;

    // Calculate the occupancy rate as a percentage
    const occupancyRate = (ongoingPatients / capacity) * 100;
    return Math.min(occupancyRate, 100).toFixed(2); // Ensure the rate doesn't exceed 100%
  };

  // Function to determine the class based on the occupancy rate
  const getOccupancyClass = (occupancyRate) => {
    if (occupancyRate < 50) return 'occupancy-low';
    if (occupancyRate < 80) return 'occupancy-medium';
    return 'occupancy-high';
  };

  // Function to calculate distance between postcodes
  const calculatePostcodeDifference = (facilityPostcode) => {
    return Math.abs(facilityPostcode - postcode);
  };

  // Sort facilities based on the entered postcode
  const sortedFacilities = [...facilities].sort((a, b) => {
    if (postcode === '') return 0; // If no postcode entered, don't sort
    return calculatePostcodeDifference(a.postcode) - calculatePostcodeDifference(b.postcode);
  });

  // Pagination logic
  const totalItems = sortedFacilities.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Determine the current page's data
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = sortedFacilities.slice(startIndex, endIndex);

  const handlePostcodeChange = (e) => {
    const value = e.target.value;
    // Allow only 5-digit numbers
    if (/^\d{0,5}$/.test(value)) {
      setPostcode(value);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <Container fluid>
      {/* Image Banner */}
      <Row>
        <div className="image-container">
          <Image src={banner} alt="Banner" className="banner-image" />
          <div className="text-overlay">
            <h1>Welcome to the Malaysia Hospital Occupancy Rate Prediction System</h1>
            <p>
              Our system allows users to find their nearest medical facilities with available occupancy, ensuring timely access to care.
            </p>
          </div>
        </div>
      </Row>

      {/* Information Table */}
      <Row className="home-container">
        <Col>
          <h2 className="text-center heading-margin">Hospital Occupancy Rate</h2>

          {/* Date and Postcode Selection */}
          <Row>
            <Col md={2} className="mb-3">
              <Form.Group controlId="formDate">
                <Form.Label>Select Date</Form.Label>
                <Form.Control
                  type="date"
                  value={selectedDate}
                  min={today.toISOString().split('T')[0]} // Disallow past dates
                  max={formattedMaxDate} // Disallow dates more than 15 days from today
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={2} className="mb-3">
              <Form.Group controlId="formPostcode">
                <Form.Label>Enter Your Postcode</Form.Label>
                <Form.Control
                  type="text"
                  value={postcode}
                  onChange={handlePostcodeChange}
                  placeholder="Enter postcode"
                  maxLength={5} // Limit to 5 characters
                />
              </Form.Group>
            </Col>
          </Row>

          <Table striped bordered hover responsive className='home-table'>
            <thead className="table-header">
              <tr>
                <th className="center-column">#</th>
                <th>Facility Name</th>
                <th className="center-column">Postcode</th>
                <th>Address</th>
                <th className="center-column">Occupancy Rate</th>
                <th className="center-column">Contact Number</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((facility, index) => {
                const occupancyRate = calculateOccupancyRate(facility.facid, facility.capacity);
                return (
                  <tr key={facility.facid}>
                    <td className="center-column">{startIndex + index + 1}</td>
                    <td>{facility.name}</td>
                    <td className="center-column">{facility.postcode}</td>
                    <td>{facility.address}</td>
                    <td className="center-column">
                      <span className={getOccupancyClass(occupancyRate)}>
                        {occupancyRate}%
                      </span>
                    </td>
                    <td className="center-column">{facility.contactNo}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>

          {/* Pagination Controls */}
          <Pagination className="home-pagination-container">
            {Array.from({ length: totalPages }, (_, i) => (
              <Pagination.Item 
                key={i + 1} 
                active={i + 1 === currentPage}
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </Pagination.Item>
            ))}
          </Pagination>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
