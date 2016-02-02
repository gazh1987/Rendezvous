from authemail.models import EmailUserManager, EmailAbstractUser
from django.contrib.gis.db import models


class RendezvousUsers(EmailAbstractUser):
    def get_short_name(self):
        pass

    def get_full_name(self):
        pass

    last_known_position = models.PointField(null=True, blank=True)
    objects = EmailUserManager()


# A look-up table to easily map phone numbers to email accounts
class PhoneNumbers(models.Model):
    phone_number = models.CharField(max_length=25, primary_key=True)
    email = models.CharField(max_length=100)
