from rest_framework import serializers
from restApi.models import RendezvousUsers
from authemail.serializers import UserSerializer

class UserSerializer(UserSerializer,serializers.HyperlinkedModelSerializer):
    url = serializers.HyperlinkedIdentityField(view_name='users-detail')

    class Meta:
        model = RendezvousUsers
        fields = ('id', 'url', 'email', 'first_name', 'last_name', 'last_known_position')

