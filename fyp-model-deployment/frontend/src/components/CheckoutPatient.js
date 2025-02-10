import React, { useState, useEffect } from 'react';
import { Button, Table, Form, Alert, Modal, Pagination } from 'react-bootstrap';
import './CheckoutPatient.css';

const CheckoutPatient = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [noRecords, setNoRecords] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false); // Modal state
  const [selectedPatient, setSelectedPatient] = useState(null); // Store the patient to discharge
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(5);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = () => {
    fetch('http://127.0.0.1:8000/ml_model/api/checkout-patients/')
      .then(response => response.json())
      .then(data => {
        setPatients(data.patients);
        setFilteredPatients(data.patients);
        setNoRecords(data.patients.length === 0);
      })
      .catch(error => {
        console.error('Error fetching patients:', error);
      });
  };

  const handleDischarge = (patientId) => {
    fetch(`http://127.0.0.1:8000/ml_model/api/discharge-patient/${patientId}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          fetchPatients(); // Refresh the table after discharge
        } else {
          console.error('Failed to discharge patient');
        }
        handleCloseConfirm(); // Close the modal after discharge
      })
      .catch(error => {
        console.error('Error discharging patient:', error);
        handleCloseConfirm(); // Close the modal even if there's an error
      });
  };

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
  
    const filtered = patients.filter(patient =>
      (patient.eid && patient.eid.toString().toLowerCase().includes(query)) ||
      (patient.facility && patient.facility.toLowerCase().includes(query)) ||
      (patient.vdate && patient.vdate.toLowerCase().includes(query)) ||
      (patient.pred_lengthofstay && patient.pred_lengthofstay.toString().toLowerCase().includes(query))
    );
  
    setFilteredPatients(filtered);
    setNoRecords(filtered.length === 0);
    setCurrentPage(1); // Reset to the first page when searching
  };

  const handleShowConfirm = (patient) => {
    setSelectedPatient(patient);
    setShowConfirm(true); // Show confirmation modal
  };

  const handleCloseConfirm = () => {
    setSelectedPatient(null);
    setShowConfirm(false); // Close confirmation modal
  };

  const confirmDischarge = () => {
    if (selectedPatient) {
      handleDischarge(selectedPatient.eid); // Proceed with discharge after confirmation
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredPatients.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const currentPatients = filteredPatients.slice(startIndex, startIndex + recordsPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Function to generate pagination numbers
  const getPaginationItems = () => {
    const pageNumbers = [];

    const startPage = Math.max(1, currentPage - 2); // Start from two pages before the current
    const endPage = Math.min(totalPages, currentPage + 2); // End two pages after the current

    // Add the first page if it's not already in the range
    if (startPage > 1) {
      pageNumbers.push(1);
      if (startPage > 2) {
        pageNumbers.push('...');
      }
    }

    // Add page numbers around the current page
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    // Add the last page if it's not already in the range
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageNumbers.push('...');
      }
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  return (
    <div className="checkout-container mt-5">
      <h2 className="mb-4">Checkout Patients</h2>
      <Form className="mb-4">
        <Form.Group controlId="search">
          <Form.Control
            type="text"
            placeholder="Search all fields..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </Form.Group>
      </Form>
      {noRecords && <Alert variant="info">No records available.</Alert>}
      <Table striped bordered hover responsive className="table-wrapper">
        <thead className="table-header">
          <tr>
            <th className="column-id">ID</th>
            <th className="column-facility">Facility</th>
            <th className="column-date">Admission Date</th>
            <th className="column-lengthofstay">Predicted Length of Stay</th>
            <th className="column-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentPatients.map(patient => (
            <tr key={patient.id}>
              <td>{patient.eid}</td>
              <td>{patient.facility}</td>
              <td>{new Date(patient.vdate).toLocaleDateString()}</td>
              <td>{patient.pred_lengthofstay}</td>
              <td>
                <Button
                  variant="outline-danger"
                  onClick={() => handleShowConfirm(patient)} // Show confirmation modal
                  className="discharge-button"
                >
                  Discharge
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Pagination Controls */}
      <div className="checkout-pagination-container">
        <Pagination>
          <Pagination.Prev 
            onClick={() => handlePageChange(currentPage - 1)} 
            disabled={currentPage === 1} 
          />

          {getPaginationItems().map((page, index) => (
            <Pagination.Item
              key={index}
              active={page === currentPage}
              onClick={() => page !== '...' && handlePageChange(page)}
            >
              {page}
            </Pagination.Item>
          ))}

          <Pagination.Next 
            onClick={() => handlePageChange(currentPage + 1)} 
            disabled={currentPage === totalPages} 
          />
        </Pagination>
      </div>

      {/* Confirmation Modal */}
      <Modal show={showConfirm} onHide={handleCloseConfirm}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Discharge</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to discharge{' '}
          {selectedPatient ? `Patient ID: ${selectedPatient.eid}` : ''}?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseConfirm}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDischarge}>
            Discharge
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
};

export default CheckoutPatient;
