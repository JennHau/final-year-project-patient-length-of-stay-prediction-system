from django.http import JsonResponse
import joblib
import numpy as np
import pandas as pd
import json
from django.views.decorators.csrf import csrf_exempt
from .models import Facility, Patient
from django.db.models import Max
from django.utils import timezone
from django.shortcuts import get_object_or_404

# Load XGBoost model
model = joblib.load('saved_models/xgboost_opt_model.pkl')
onehot_encoder = joblib.load('saved_models/onehot_encoder.pkl')
robust_scaler = joblib.load('saved_models/robust_scaler.pkl')

@csrf_exempt
def predict(request):
    if request.method == 'POST':
        # Parse the JSON request body
        data = json.loads(request.body)

        eid = data.get('patientId')
        
        # Extract facility name from the request data
        facility_name = data.get('facility')
        # Fetch the Facility object by name
        facility = get_object_or_404(Facility, name=facility_name)
        # Extract facility id
        facid = facility.facid

        # Extract features from the request data
        gender = data.get('gender')
        if gender == 'Male':
                gender = 'M'
        elif gender == 'Female':
            gender = 'F'
        rcount = data.get('rcount')  # Assume rcount is a float or convertible to float
        secondarydiagnosisnonicd9 = int(data.get('secondarydiagnosisnonicd9'))
        
        # Binary features (ensure these are integers)
        dialysisrenalendstage = int(data.get('dialysisrenalendstage'))
        asthma = int(data.get('asthma'))
        irondef = int(data.get('irondef'))
        pneum = int(data.get('pneum'))
        substancedependence = int(data.get('substancedependence'))
        psychologicaldisordermajor = int(data.get('psychologicaldisordermajor'))
        depress = int(data.get('depress'))
        psychother = int(data.get('psychother'))
        fibrosisandother = int(data.get('fibrosisandother'))
        malnutrition = int(data.get('malnutrition'))
        hemo = int(data.get('hemo'))
        
        # Numerical features (convert to float)
        hemoglobin = float(data.get('hemoglobin'))
        leukocytes = float(data.get('leukocytes'))
        sodium = float(data.get('sodium'))
        glucose = float(data.get('glucose'))
        bloodureanitro = float(data.get('bloodureanitro'))
        creatinine = float(data.get('creatinine'))
        bmi = float(data.get('bmi'))
        pulse = float(data.get('pulse'))
        respiration = float(data.get('respiration'))
        
        # Create DataFrame for categorical columns
        categorical_data = pd.DataFrame({
            'gender': [gender],
            'rcount': [str(rcount)],  # Convert to string for one-hot encoding
            'secondarydiagnosisnonicd9': [secondarydiagnosisnonicd9]
        })
        
        # Encode categorical data
        encoded_features = onehot_encoder.transform(categorical_data)
        encoded_df = pd.DataFrame(encoded_features, columns=onehot_encoder.get_feature_names_out())
        
        # Create DataFrame for numerical columns
        numeric_data = pd.DataFrame({
            'hemoglobin': [hemoglobin],
            'sodium': [sodium],
            'glucose': [glucose],
            'creatinine': [creatinine],
            'bmi': [bmi],
            'pulse': [pulse],
            'leukocytes': [leukocytes],
            'bloodureanitro': [bloodureanitro]
        })
        
        # Scale and log-transform numeric data
        scaled_numeric_data = robust_scaler.transform(numeric_data[['hemoglobin', 'sodium', 'glucose', 'creatinine', 'bmi', 'pulse']])
        log_transformed_data = np.log(numeric_data[['leukocytes', 'bloodureanitro']] + 1e-9)
        
        scaled_numeric_df = pd.DataFrame(scaled_numeric_data, columns=['hemoglobin', 'sodium', 'glucose', 'creatinine', 'bmi', 'pulse'])
        log_transformed_df = pd.DataFrame(log_transformed_data, columns=['leukocytes', 'bloodureanitro'])
        
        # Create DataFrame for binary features
        binary_data = pd.DataFrame({
            'dialysisrenalendstage': [dialysisrenalendstage],
            'asthma': [asthma],
            'irondef': [irondef],
            'pneum': [pneum],
            'substancedependence': [substancedependence],
            'psychologicaldisordermajor': [psychologicaldisordermajor],
            'depress': [depress],
            'psychother': [psychother],
            'malnutrition': [malnutrition],
            'hemo': [hemo]
        })
        
        # Combine all data
        combined_df = pd.concat([binary_data, encoded_df, scaled_numeric_df, log_transformed_df], axis=1)
        
        # Define the column order (make sure this matches with the model's expected input order)
        desired_column_order = [
            'dialysisrenalendstage', 'asthma', 'irondef', 'pneum', 'substancedependence',
            'psychologicaldisordermajor', 'depress', 'psychother', 'malnutrition', 'hemo',
            'hemoglobin', 'leukocytes', 'sodium', 'glucose', 'bloodureanitro', 'creatinine', 
            'bmi', 'pulse', 'rcount_1', 'rcount_2', 'rcount_3', 'rcount_4', 'rcount_5+'
        ]
        
        combined_df = combined_df[desired_column_order]  # Ensure correct column order

        # Convert to NumPy array
        combined_array = combined_df.to_numpy()
        
        # Predict
        prediction = model.predict(combined_array)

        # Convert predictions to the nearest integer
        prediction = np.round(prediction).astype(int).tolist()


        # Save the data to the database
        prediction_data = Patient(
            eid=eid,
            vdate = timezone.now().date(),
            rcount=rcount,
            gender=gender,
            dialysisrenalendstage=dialysisrenalendstage,
            asthma=asthma,
            irondef=irondef,
            pneum=pneum,
            substancedependence=substancedependence,
            psychologicaldisordermajor=psychologicaldisordermajor,
            depress=depress,
            psychother=psychother,
            fibrosisandother=fibrosisandother,
            malnutrition=malnutrition,
            hemo=hemo,
            hemoglobin=hemoglobin,
            leukocytes=leukocytes,
            sodium=sodium,
            glucose=glucose,
            bloodureanitro=bloodureanitro,
            creatinine=creatinine,
            bmi=bmi,
            pulse=pulse,
            respiration=respiration,
            secondarydiagnosisnonicd9=secondarydiagnosisnonicd9,
            discharged=None,
            facid=facid,
            lengthofstay=None,
            pred_lengthofstay=prediction[0]  # Save the first prediction result
        )
        prediction_data.save()

        # Return predictions as JSON response
        return JsonResponse({'prediction': prediction})

    return JsonResponse({'error': 'Invalid request method.'}, status=400)


def get_facilities(request):
    # Fetch all facilities from the database
    facilities = Facility.objects.all().values()
    # Convert queryset to a list and return it as JSON
    return JsonResponse(list(facilities), safe=False)

def get_patients(request):
    # Fetch all patients from the database
    patients = Patient.objects.all().values()
    # Convert queryset to a list and return it as JSON
    return JsonResponse(list(patients), safe=False)

def get_max_patient_id(request):
    # Fetch the maximum patient ID and return maxId + 1
    max_id = Patient.objects.aggregate(Max('eid'))['eid__max']
    if max_id is None:
        max_id = 0  # In case there are no patients yet
    return JsonResponse({'maxId': max_id + 1})

def checkout_patients(request):
    if request.method == 'GET':
        # Fetch patients without a discharged date
        patients = Patient.objects.filter(discharged__isnull=True)

        # Prepare a list to store patient data along with facility names
        patient_list = []
        
        # Create a mapping from facid to facility name for quick lookup
        facility_map = dict(Facility.objects.values_list('facid', 'name'))
        
        for patient in patients:
            # Get the facility name using the facid
            facility_name = facility_map.get(patient.facid)

            # Append patient data along with facility name
            patient_list.append({
                'eid': patient.eid,
                'facility': facility_name,  # Use facility name instead of ID
                'vdate': patient.vdate,
                'pred_lengthofstay': patient.pred_lengthofstay
            })

        return JsonResponse({'patients': patient_list})

@csrf_exempt
def discharge_patient(request, patient_id):
    if request.method == 'POST':
        # Fetch the patient record
        patient = Patient.objects.get(eid=patient_id)
        
        # Calculate the length of stay
        admission_date = patient.vdate
        current_date = timezone.now().date()
        length_of_stay = (current_date - admission_date).days
        
        # Set the discharge date and length of stay
        patient.discharged = current_date
        patient.lengthofstay = length_of_stay 
        
        # Save the updated patient record
        patient.save()
        return JsonResponse({'status': 'success', 'length_of_stay': length_of_stay})
    
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)