from authemail.models import EmailUserManager, EmailAbstractUser
from django.contrib.gis.db import models


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

    def __unicode__(self):
        return u'%s, %s' % (self.from_friend.email, self.to_friend.email)

    class Meta:
        unique_together=(('to_friend', 'from_friend'), )


