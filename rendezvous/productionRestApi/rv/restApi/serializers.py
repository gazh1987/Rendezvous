from rest_framework import serializers
from restApi.models import RendezvousUsers, PhoneNumbers, Friends
from authemail.serializers import UserSerializer


class UserSerializer(UserSerializer,serializers.HyperlinkedModelSerializer):
    class Meta:
        model = RendezvousUsers
        fields = ('id', 'email', 'first_name', 'last_name', 'last_known_position')


class PhoneNumbersSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = PhoneNumbers
        fields = ('phone_number', 'email')


class FriendsSerializer(serializers.ModelSerializer):
    from_friend = serializers.EmailField()
    to_friend = serializers.EmailField()

    class Meta:
        model = Friends
       #fields = ('from_friend', 'to_friend')
