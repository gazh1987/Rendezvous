from rest_framework import serializers
from restApi.models import RendezvousUsers, Friends, Notifications, Events, EventDetails
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

class EventsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Events

class EventDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventDetails