from django.urls import path
from .views import predict, get_facilities, get_max_patient_id, checkout_patients, discharge_patient, get_patients

urlpatterns = [
    path('predict/', predict),
    path('api/facilities/', get_facilities, name='get_facilities'),
    path('api/patient/max-id/', get_max_patient_id, name='get_max_patient_id'),
    path('api/checkout-patients/', checkout_patients, name='checkout_patients'),
    path('api/discharge-patient/<int:patient_id>/', discharge_patient, name='discharge_patient'),
    path('api/patients/', get_patients, name='get_patients'),
]