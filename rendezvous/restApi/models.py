from authemail.models import EmailUserManager, EmailAbstractUser
from django.contrib.gis.db import models

class RendezvousUsers(EmailAbstractUser):
    phone_number = models.CharField(null=True, blank=True, max_length=25)
    last_known_position = models.PointField(null=True, blank=True)
    objects = EmailUserManager()


