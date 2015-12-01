from restApi.models import RendezvousUsers
from restApi.serializers import UserSerializer
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


#Api Root
@api_view(('GET',))
def api_root(request, format=None):
    return Response({
        'users': reverse('users-list', request=request, format=format)
})