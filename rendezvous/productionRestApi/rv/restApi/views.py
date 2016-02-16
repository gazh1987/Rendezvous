import os
from restApi.models import RendezvousUsers, PhoneNumbers, Friends
from restApi.serializers import UserSerializer, PhoneNumbersSerializer, FriendsSerializer
from restApi.permissions import IsOwnerOrReadOnly

from rest_framework import mixins
from rest_framework import generics
from rest_framework import permissions
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.reverse import reverse


class UserList(generics.ListCreateAPIView):
    queryset = RendezvousUsers.objects.all()
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly,)


class UsersDetail(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a user instance
    """
    queryset = RendezvousUsers.objects.all()
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly, )
    lookup_field = ('email')


class AddFriendship(mixins.ListModelMixin,
                    mixins.CreateModelMixin,
                    generics.GenericAPIView):
    """
    Add and list friendships
    """
    queryset = Friends.objects.all()
    serializer_class = FriendsSerializer

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        print(request.data)
        request.data["from_friend"] = RendezvousUsers.objects.filter(email=request.data["from_friend"]).values_list('pk')
        request.data["to_friend"] = RendezvousUsers.objects.filter(email=request.data["to_friend"]).values_list('pk')
        print(request.data)
        return self.create(request, *args, **kwargs)


class FriendsList(generics.ListCreateAPIView):
    """
    Get individual users friendships
    """
    serializer_class = FriendsSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly,)

    #This function gets the primary key of the email passed in the url
    def get_queryset(self):
        pkey = RendezvousUsers.objects.filter(email=self.args[0]).values_list('pk')
        return Friends.objects.filter(from_friend=pkey)


class PhoneNumberList(generics.ListCreateAPIView):
    queryset = PhoneNumbers.objects.all()
    serializer_class = PhoneNumbersSerializer
    permission_classes = (permissions.AllowAny,)


class PhoneNumberDetail(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a phoneNumber instance
    """
    queryset = PhoneNumbers.objects.all()
    serializer_class = PhoneNumbersSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly, )
    lookup_field = ('phone_number')


#Api Root
@api_view(('GET',))
def api_root(request, format=None):
    return Response({
        'users': reverse('users-list', request=request, format=format),
        'phone_numbers': reverse('phoneNumbers-list', kwargs={}, request=request, format=format)
})
