from authemail.models import EmailUserManager, EmailAbstractUser
from django.contrib.gis.db import models

class RendezvousUsers(EmailAbstractUser):
    #Todo: Bug on pointfield attribute, see this ticket: https://code.djangoproject.com/ticket/23731#comment:6
    last_known_position = models.PointField(null=True)
    objects = EmailUserManager()


