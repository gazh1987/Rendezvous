from authemail.models import EmailUserManager, EmailAbstractUser
from django.contrib.gis.db import models
import datetime as dt
from datetime import datetime

class RendezvousUsers(EmailAbstractUser):
    def get_short_name(self):
        pass

    def get_full_name(self):
        pass

    last_known_position = models.PointField(null=True, blank=True)
    objects = EmailUserManager()


"""
REFERENCE: https://www.packtpub.com/books/content/building-friend-networks-django-10
"""
class Friends(models.Model):
    from_friend = models.ForeignKey(RendezvousUsers, related_name="friend_set")
    to_friend = models.ForeignKey(RendezvousUsers, related_name="to_friend_set")
    from_friend_email = models.EmailField(default="default@email.com", null=True)
    to_friend_email = models.EmailField("defaut@email.com", null=True)
    tracking_enabled = models.BooleanField(default=False)    
    lookupField = models.CharField(max_length=255, default="default_field")
    	
    def __unicode__(self):
        return u'%s, %s' % (self.from_friend.email, self.to_friend.email)

    class Meta:
        unique_together=(('to_friend', 'from_friend'), )


class Notifications(models.Model):
    from_friend = models.ForeignKey(RendezvousUsers, related_name="notif_from_friend_set")
    to_friend = models.ForeignKey(RendezvousUsers, related_name="notif_to_friend_set")
    from_friend_email = models.EmailField(default="default@email.com", null=True)
    to_friend_email = models.EmailField("defaut@email.com", null=True)
    from_friend_name = models.CharField(max_length=255)
    message = models.CharField(max_length=255) 
    timestamp = models.DateTimeField(auto_now_add=True)
    accepted = models.BooleanField(default=False)
    type = models.CharField(max_length=10, default="request")

