from restApi.models import RendezvousUsers, PhoneNumbers
from restApi.serializers import UserSerializer, PhoneNumbersSerializer
from restApi.permissions import IsOwnerOrReadOnly

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