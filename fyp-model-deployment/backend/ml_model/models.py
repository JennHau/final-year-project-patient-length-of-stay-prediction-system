from django.db import models

class Facility(models.Model):
    facid = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    postcode = models.IntegerField()
    address = models.CharField(max_length=255)
    contactNo = models.CharField(max_length=12)
    capacity = models.IntegerField()

    class Meta:
        db_table = 'facilities'  # PostreSQL table name 

    def __str__(self):
        return self.name
    
class Patient(models.Model):
    eid = models.IntegerField(primary_key=True)
    vdate = models.DateField(null=True, blank=True)
    rcount = models.TextField(null=True, blank=True)
    gender = models.CharField(max_length=10, null=True, blank=True)
    dialysisrenalendstage = models.IntegerField(null=True, blank=True)
    asthma = models.IntegerField(null=True, blank=True)
    irondef = models.IntegerField(null=True, blank=True)
    pneum = models.IntegerField(null=True, blank=True)
    substancedependence = models.IntegerField(null=True, blank=True)
    psychologicaldisordermajor = models.IntegerField(null=True, blank=True)
    depress = models.IntegerField(null=True, blank=True)
    psychother = models.IntegerField(null=True, blank=True)
    fibrosisandother = models.IntegerField(null=True, blank=True)
    malnutrition = models.IntegerField(null=True, blank=True)
    hemo = models.IntegerField(null=True, blank=True)
    hemoglobin = models.FloatField(null=True, blank=True)
    leukocytes = models.FloatField(null=True, blank=True)
    sodium = models.FloatField(null=True, blank=True)
    glucose = models.FloatField(null=True, blank=True)
    bloodureanitro = models.FloatField(null=True, blank=True)
    creatinine = models.FloatField(null=True, blank=True)
    bmi = models.FloatField(null=True, blank=True)
    pulse = models.FloatField(null=True, blank=True)
    respiration = models.FloatField(null=True, blank=True)
    secondarydiagnosisnonicd9 = models.IntegerField(null=True, blank=True)
    discharged = models.DateField(null=True, blank=True)
    facid = models.CharField(max_length=10, null=True, blank=True)
    lengthofstay = models.IntegerField(null=True, blank=True)
    pred_lengthofstay = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = 'patients'  # PostreSQL table name 


    def __str__(self):
        return f'Patient {self.id}'
    


