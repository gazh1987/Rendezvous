from rest_framework import serializers
from restApi.models import RendezvousUsers, Friends, Notifications
from authemail.serializers import UserSerializer


class UserSerializer(UserSerializer,serializers.HyperlinkedModelSerializer):
    class Meta:
        model = RendezvousUsers
        fields = ('id', 'email', 'first_name', 'last_name', 'last_known_position')


class FriendsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Friends

class NotificationsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notifications