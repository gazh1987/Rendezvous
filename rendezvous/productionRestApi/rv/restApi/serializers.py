from rest_framework import serializers
from restApi.models import RendezvousUsers, PhoneNumbers
from authemail.serializers import UserSerializer

class UserSerializer(UserSerializer,serializers.HyperlinkedModelSerializer):
#    url = serializers.HyperlinkedIdentityField(view_name='users-detail')

    class Meta:
        model = RendezvousUsers
        fields = ('email', 'first_name', 'last_name', 'last_known_position')

class PhoneNumbersSerializer(serializers.HyperlinkedModelSerializer):
#    url = serializers.HyperlinkedIdentityField(view_name='phoneNumbers-detail')

    class Meta:
        model = PhoneNumbers
        fields = ('phone_number', 'email')
