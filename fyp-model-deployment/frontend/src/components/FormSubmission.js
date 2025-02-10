import React, { useState, useRef, useEffect } from 'react';
import { Form, Button, Alert, Container, Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './FormSubmission.css';
import { useNavigate } from 'react-router-dom';

function FormSubmission() {
  // State variables for categorical, binary, and numerical columns
  const [patientId, setPatientId] = useState(""); 
  const [facility, setFacility] = useState(""); // For selected value
  const [facilities, setFacilities] = useState([]); // For dropdown options
  const [gender, setGender] = useState('');
  const [rcount, setRcount] = useState('');
  const [secondarydiagnosisnonicd9, setSecondarydiagnosisnonicd9] = useState('');
  const [dialysisrenalendstage, setDialysisrenalendstage] = useState(false);
  const [asthma, setAsthma] = useState(false);
  const [irondef, setIrondef] = useState(false);
  const [pneum, setPneum] = useState(false);
  const [substancedependence, setSubstancedependence] = useState(false);
  const [psychologicaldisordermajor, setPsychologicaldisordermajor] = useState(false);
  const [depress, setDepress] = useState(false);
  const [psychother, setPsychother] = useState(false);
  const [fibrosisandother, setFibrosisandother] = useState(false);
  const [malnutrition, setMalnutrition] = useState(false);
  const [hemo, setHemo] = useState(false);
  const [hemoglobin, setHemoglobin] = useState('');
  const [leukocytes, setLeukocytes] = useState('');
  const [sodium, setSodium] = useState('');
  const [glucose, setGlucose] = useState('');
  const [bloodureanitro, setBloodureanitro] = useState('');
  const [creatinine, setCreatinine] = useState('');
  const [bmi, setBmi] = useState('');
  const [pulse, setPulse] = useState('');
  const [respiration, setRespiration] = useState('');
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayMessage, setOverlayMessage] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [error] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    facility: '',
    gender: '',
    rcount: '',
    secondarydiagnosisnonicd9: '',
    hemoglobin: '',
    leukocytes: '',
    sodium: '',
    glucose: '',
    bloodureanitro: '',
    creatinine: '',
    bmi: '',
    pulse: '',
    respiration: '',
  });

  const navigate = useNavigate();

  // Refs for scrolling
  const facilityRef = useRef(null);
  const genderRef = useRef(null);
  const rcountRef = useRef(null);
  const secondarydiagnosisnonicd9Ref = useRef(null);
  const hemoglobinRef = useRef(null);
  const leukocytesRef = useRef(null);
  const sodiumRef = useRef(null);
  const glucoseRef = useRef(null);
  const bloodureanitroRef = useRef(null);
  const creatinineRef = useRef(null);
  const bmiRef = useRef(null);
  const pulseRef = useRef(null);
  const respirationRef = useRef(null);

  // Validation function
  const validateInputs = () => {
    const errors = {
      facility: '',
      gender: '',
      rcount: '',
      secondarydiagnosisnonicd9: '',
      hemoglobin: '',
      leukocytes: '',
      sodium: '',
      glucose: '',
      bloodureanitro: '',
      creatinine: '',
      bmi: '',
      pulse: '',
      respiration: '',
    };

    if (!facility) errors.facility = 'Please select a facility';
    if (!gender) errors.gender = 'Please select a gender';
    if (!rcount) errors.rcount = 'Please select a readmission count';
    if (!secondarydiagnosisnonicd9) errors.secondarydiagnosisnonicd9 = 'Please enter secondary diagnosis';
    if (!hemoglobin) errors.hemoglobin = 'Please enter hemoglobin';
    if (!leukocytes) errors.leukocytes = 'Please enter leukocytes';
    if (!sodium) errors.sodium = 'Please enter sodium';
    if (!glucose) errors.glucose = 'Please enter glucose';
    if (!bloodureanitro) errors.bloodureanitro = 'Please enter blood urea nitrogen';
    if (!creatinine) errors.creatinine = 'Please enter creatinine';
    if (!bmi) errors.bmi = 'Please enter BMI';
    if (!pulse) errors.pulse = 'Please enter pulse';
    if (!respiration) errors.respiration = 'Please enter respiration';

    // Validate numeric values
    if (Number(hemoglobin) < 0) errors.hemoglobin = 'Numeric values must not be negative';
    if (Number(leukocytes) < 0) errors.leukocytes = 'Numeric values must not be negative';
    if (Number(sodium) < 0) errors.sodium = 'Numeric values must not be negative';
    if (Number(glucose) < 0) errors.glucose = 'Numeric values must not be negative';
    if (Number(bloodureanitro) < 0) errors.bloodureanitro = 'Numeric values must not be negative';
    if (Number(creatinine) < 0) errors.creatinine = 'Numeric values must not be negative';
    if (Number(bmi) < 0) errors.bmi = 'Numeric values must not be negative';
    if (Number(pulse) < 0) errors.pulse = 'Numeric values must not be negative';
    if (Number(respiration) < 0) errors.respiration = 'Numeric values must not be negative';

    setFieldErrors(errors);

    // Return true if there are errors, false otherwise
    return Object.values(errors).some(error => error);
  };

  const handleKeyPress = (e) => {
    if (e.key === '-') {
      e.preventDefault();
    }
  };

  // Handle submit event
  const handleSubmit = async (e) => {
    e.preventDefault();
    const hasErrors = validateInputs();
    if (hasErrors) {
      // Scroll to the first error field
      for (const [field, error] of Object.entries(fieldErrors)) {
        if (error) {
          const ref = {
            facility: facilityRef,
            gender: genderRef,
            rcount: rcountRef,
            secondarydiagnosisnonicd9: secondarydiagnosisnonicd9Ref,
            hemoglobin: hemoglobinRef,
            leukocytes: leukocytesRef,
            sodium: sodiumRef,
            glucose: glucoseRef,
            bloodureanitro: bloodureanitroRef,
            creatinine: creatinineRef,
            bmi: bmiRef,
            pulse: pulseRef,
            respiration: respirationRef,
          }[field];
          if (ref.current) {
            ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            break;
          }
        }
      }
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/ml_model/predict/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          { patientId,
            facility,
            gender, 
            rcount, 
            secondarydiagnosisnonicd9, 
            dialysisrenalendstage, 
            asthma, 
            irondef, 
            pneum, 
            substancedependence, 
            psychologicaldisordermajor, 
            depress, 
            psychother, 
            fibrosisandother, 
            malnutrition, 
            hemo, 
            hemoglobin, 
            leukocytes, 
            sodium, 
            glucose, 
            bloodureanitro, 
            creatinine, 
            bmi, 
            pulse, 
            respiration })
      });

      const data = await response.json();
      setPrediction(data.prediction[0]); // Handle prediction
      setOverlayMessage('Admission form is submitted.'); // Set overlay message
      setShowOverlay(true); // Show overlay

    } catch (err) {
      setFieldErrors({ ...fieldErrors, general: err.message });
    }
  };

  const handleOverlayClose = () => setShowOverlay(false);
  const handleDoneClick = () => navigate('/checkout');

  useEffect(() => {
    // Fetch the max patient ID + 1
    fetch('http://127.0.0.1:8000/ml_model/api/patient/max-id')
      .then((response) => response.json())
      .then((data) => setPatientId(data.maxId))
      .catch((error) => console.error('Error fetching Patient ID:', error));
  }, []);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/ml_model/api/facilities')
      .then((response) => response.json())
      .then((data) => setFacilities(data))
      .catch((error) => console.error('Error fetching facilities:', error));
  }, []);

  return (
    <Container className="admission-container">
      <h2>Patient Admission Form</h2>
      {fieldErrors.general && <Alert variant="danger" className="mt-3">{fieldErrors.general}</Alert>}
      <Form onSubmit={handleSubmit}>

          <Form.Group className="mb-3" controlId="patientId">
            <Form.Label>Patient ID</Form.Label>
            <Form.Control
              type="text"
              value={patientId}
              readOnly
              className="patient-id"
            />
          </Form.Group>
          
          {/* Facility Dropdown */}
          <Form.Group className="mb-3" controlId="facility">
            <Form.Label>Facility</Form.Label>
            <Form.Control
              as="select"
              ref={facilityRef}
              value={facility} // This should be the selected value
              onChange={(e) => setFacility(e.target.value)}
            >
              <option value="">Select Facility</option>
              {facilities.map((facility) => (
                <option key={facility.id} value={facility.id}>
                  {facility.name}
                </option>
              ))}
            </Form.Control>
            {fieldErrors.facility && <Form.Text className="text-danger">{fieldErrors.facility}</Form.Text>}
          </Form.Group>


          {/* Categorical Inputs */}
          <Form.Group className="mb-3" controlId="gender">
            <Form.Label>Gender</Form.Label>
            <Form.Control
              as="select"
              ref={genderRef}
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </Form.Control>
            {fieldErrors.gender && <Form.Text className="text-danger">{fieldErrors.gender}</Form.Text>}
          </Form.Group>

          <Form.Group className="mb-3" controlId="rcount">
            <Form.Label>Readmission Count</Form.Label>
            <Form.Control
              as="select"
              ref={rcountRef}
              value={rcount}
              onChange={(e) => setRcount(e.target.value)}
            >
              <option value="">Select Readmission Count</option>
              <option value="0">0</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5+">5+</option>
            </Form.Control>
            {fieldErrors.rcount && <Form.Text className="text-danger">{fieldErrors.rcount}</Form.Text>}
          </Form.Group>

          <Form.Group className="mb-3" controlId="secondarydiagnosisnonicd9">
            <Form.Label>Secondary Diagnosis (Non-ICD9)</Form.Label>
            <Form.Control
              as="select"
              ref={secondarydiagnosisnonicd9Ref}
              value={secondarydiagnosisnonicd9}
              onChange={(e) => setSecondarydiagnosisnonicd9(e.target.value)}
            >
              <option value="">Select Secondary Diagnosis (Non-ICD9)</option>
              <option value="0">0</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7">7</option>
              <option value="8">8</option>
              <option value="9">9</option>
              <option value="10">10</option>
            </Form.Control>
            {fieldErrors.secondarydiagnosisnonicd9 && <Form.Text className="text-danger">{fieldErrors.secondarydiagnosisnonicd9}</Form.Text>}
          </Form.Group>

          {/* Binary Inputs */}
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="Dialysis Renal End Stage"
              checked={dialysisrenalendstage}
              onChange={(e) => setDialysisrenalendstage(e.target.checked)}
            />
            <Form.Check
              type="checkbox"
              label="Asthma"
              checked={asthma}
              onChange={(e) => setAsthma(e.target.checked)}
            />
            <Form.Check
              type="checkbox"
              label="Iron Deficiency"
              checked={irondef}
              onChange={(e) => setIrondef(e.target.checked)}
            />
            <Form.Check
              type="checkbox"
              label="Pneumonia"
              checked={pneum}
              onChange={(e) => setPneum(e.target.checked)}
            />
            <Form.Check
              type="checkbox"
              label="Substance Dependence"
              checked={substancedependence}
              onChange={(e) => setSubstancedependence(e.target.checked)}
            />
            <Form.Check
              type="checkbox"
              label="Psychological Disorder (Major)"
              checked={psychologicaldisordermajor}
              onChange={(e) => setPsychologicaldisordermajor(e.target.checked)}
            />
            <Form.Check
              type="checkbox"
              label="Depression"
              checked={depress}
              onChange={(e) => setDepress(e.target.checked)}
            />
            <Form.Check
              type="checkbox"
              label="Psychotherapy"
              checked={psychother}
              onChange={(e) => setPsychother(e.target.checked)}
            />
            <Form.Check
              type="checkbox"
              label="Fibrosis and Other"
              checked={fibrosisandother}
              onChange={(e) => setFibrosisandother(e.target.checked)}
            />
            <Form.Check
              type="checkbox"
              label="Malnutrition"
              checked={malnutrition}
              onChange={(e) => setMalnutrition(e.target.checked)}
            />
            <Form.Check
              type="checkbox"
              label="Blood Disorder"
              checked={hemo}
              onChange={(e) => setHemo(e.target.checked)}
            />
          </Form.Group>

          {/* Numerical Inputs */}
          <Form.Group className="mb-3" controlId="hemoglobin">
            <Form.Label>Hemoglobin</Form.Label>
            <Form.Control
              type="number"
              ref={hemoglobinRef}
              placeholder="Enter Hemoglobin"
              value={hemoglobin}
              onChange={(e) => setHemoglobin(e.target.value)}
              min="0"
              step="any"
              onKeyPress={handleKeyPress}
            />
            {fieldErrors.hemoglobin && <Form.Text className="text-danger">{fieldErrors.hemoglobin}</Form.Text>}
          </Form.Group>

          <Form.Group className="mb-3" controlId="leukocytes">
            <Form.Label>Leukocytes</Form.Label>
            <Form.Control
              type="number"
              ref={leukocytesRef}
              placeholder="Enter Leukocytes"
              value={leukocytes}
              onChange={(e) => setLeukocytes(e.target.value)}
              min="0"
              step="any"
              onKeyPress={handleKeyPress}
            />
            {fieldErrors.leukocytes && <Form.Text className="text-danger">{fieldErrors.leukocytes}</Form.Text>}
          </Form.Group>

          <Form.Group className="mb-3" controlId="sodium">
            <Form.Label>Sodium</Form.Label>
            <Form.Control
              type="number"
              ref={sodiumRef}
              placeholder="Enter Sodium"
              value={sodium}
              onChange={(e) => setSodium(e.target.value)}
              min="0"
              step="any"
              onKeyPress={handleKeyPress}
            />
            {fieldErrors.sodium && <Form.Text className="text-danger">{fieldErrors.sodium}</Form.Text>}
          </Form.Group>

          <Form.Group className="mb-3" controlId="glucose">
            <Form.Label>Glucose</Form.Label>
            <Form.Control
              type="number"
              ref={glucoseRef}
              placeholder="Enter Glucose"
              value={glucose}
              onChange={(e) => setGlucose(e.target.value)}
              min="0"
              step="any"
              onKeyPress={handleKeyPress}
            />
            {fieldErrors.glucose && <Form.Text className="text-danger">{fieldErrors.glucose}</Form.Text>}
          </Form.Group>

          <Form.Group className="mb-3" controlId="bloodureanitro">
            <Form.Label>Blood Urea Nitrogen</Form.Label>
            <Form.Control
              type="number"
              ref={bloodureanitroRef}
              placeholder="Enter Blood Urea Nitrogen"
              value={bloodureanitro}
              onChange={(e) => setBloodureanitro(e.target.value)}
              min="0"
              step="any"
              onKeyPress={handleKeyPress}
            />
            {fieldErrors.bloodureanitro && <Form.Text className="text-danger">{fieldErrors.bloodureanitro}</Form.Text>}
          </Form.Group>

          <Form.Group className="mb-3" controlId="creatinine">
            <Form.Label>Creatinine</Form.Label>
            <Form.Control
              type="number"
              ref={creatinineRef}
              placeholder="Enter Creatinine"
              value={creatinine}
              onChange={(e) => setCreatinine(e.target.value)}
              min="0"
              step="any"
              onKeyPress={handleKeyPress}
            />
            {fieldErrors.creatinine && <Form.Text className="text-danger">{fieldErrors.creatinine}</Form.Text>}
          </Form.Group>

          <Form.Group className="mb-3" controlId="bmi">
            <Form.Label>BMI</Form.Label>
            <Form.Control
              type="number"
              ref={bmiRef}
              placeholder="Enter BMI"
              value={bmi}
              onChange={(e) => setBmi(e.target.value)}
              min="0"
              step="any"
              onKeyPress={handleKeyPress}
            />
            {fieldErrors.bmi && <Form.Text className="text-danger">{fieldErrors.bmi}</Form.Text>}
          </Form.Group>

          <Form.Group className="mb-3" controlId="pulse">
            <Form.Label>Pulse</Form.Label>
            <Form.Control
              type="number"
              ref={pulseRef}
              placeholder="Enter Pulse"
              value={pulse}
              onChange={(e) => setPulse(e.target.value)}
              min="0"
              step="any"
              onKeyPress={handleKeyPress}
            />
            {fieldErrors.pulse && <Form.Text className="text-danger">{fieldErrors.pulse}</Form.Text>}
          </Form.Group>

          <Form.Group className="mb-3" controlId="respiration">
            <Form.Label>Respiration</Form.Label>
            <Form.Control
              type="number"
              ref={respirationRef}
              placeholder="Enter Respiration"
              value={respiration}
              onChange={(e) => setRespiration(e.target.value)}
              min="0"
              step="any"
              onKeyPress={handleKeyPress}
            />
            {fieldErrors.respiration && <Form.Text className="text-danger">{fieldErrors.respiration}</Form.Text>}
          </Form.Group>

          <Button variant="primary" type="submit" className="submit-button">
            Predict
          </Button>

          {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
        </Form>

        {prediction && (
        <Modal show={showOverlay} onHide={handleOverlayClose} centered className="bg-light">
        <Modal.Header className="bg-primary text-white">
          <Modal.Title>
            <i className="bi bi-check-circle"></i> Prediction Result
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="card p-3 mb-3">
            <p>{overlayMessage}</p>
            <p>Predicted Length of Stay: <strong>{prediction}</strong></p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={handleDoneClick} className="btn-primary">
            Done
          </Button>
        </Modal.Footer>
      </Modal>
      )}
    </Container>
  );
}

export default FormSubmission;
