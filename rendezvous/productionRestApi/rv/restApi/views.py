import os
from restApi.models import RendezvousUsers, Friends, Notifications
from restApi.serializers import UserSerializer, FriendsSerializer, NotificationsSerializer
from restApi.permissions import IsOwnerOrReadOnly

from rest_framework import mixins
from rest_framework import generics
from rest_framework import permissions
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.reverse import reverse

from push_notifications.models import GCMDevice


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


class FriendTrackingList(generics.ListCreateAPIView):
    """
    Returns all friends that are tracking a user
    """
    serializer_class = FriendsSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly, )
        
    def get_queryset(self):
        userpkey = RendezvousUsers.objects.filter(email=self.args[0]).values_list('pk')
        return Friends.objects.filter(to_friend=userpkey).filter(tracking_enabled=True)


class FriendTracking(generics.ListCreateAPIView):
    """
    Returns the friendship between User and friend to check if tracking is enabled
    """
    serializer_class = FriendsSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly, )
        
    def get_queryset(self):
        userpkey = RendezvousUsers.objects.filter(email=self.args[0]).values_list('pk')
        friendpkey = RendezvousUsers.objects.filter(email=self.args[1]).values_list('pk')
        return Friends.objects.filter(from_friend=userpkey).filter(to_friend=friendpkey)


class UpdateFriendTracking(generics.RetrieveUpdateDestroyAPIView):
    """
    Updates the tracking_enabled field
    """
    serializer_class = FriendsSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly, )
    lookup_field = ('lookupField')

    def get_queryset(self):      
        return Friends.objects.all()
      

class AddNotifications(mixins.ListModelMixin,
                      mixins.CreateModelMixin,
                      generics.GenericAPIView):
    """
    Add and list all notifications. When Adding new notifications, a Push message is sent to to_Friend
    """
    queryset = Notifications.objects.all()
    serializer_class = NotificationsSerializer

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        print(request.data)
        
        #Comment out these two lines of code when testing API from Browsable API
        request.data["from_friend"] = RendezvousUsers.objects.filter(email=request.data["from_friend"]).values_list('pk')
        request.data["to_friend"] = RendezvousUsers.objects.filter(email=request.data["to_friend"]).values_list('pk')
        
        print(request.data)
	
        #Send push notification
        user = RendezvousUsers.objects.filter(id=request.data["to_friend"])
        devices = GCMDevice.objects.filter(user=user)
        devices.send_message(request.data["message"]);        

        return self.create(request, *args, **kwargs)
	

class NotificationsList(generics.ListCreateAPIView):
    """
    Get individual users Notifications
    """
    serializer_class = NotificationsSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly,)

    #This function gets the primary key of the email passed in the url
    def get_queryset(self):
        pkey = RendezvousUsers.objects.filter(email=self.args[0]).values_list('pk')
        return Notifications.objects.filter(to_friend=pkey)


class NotificationsUpdateDelete(generics.RetrieveUpdateDestroyAPIView):
    """
    Updates the tracking_enabled field
    """
    serializer_class = NotificationsSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly, )
    lookup_field = ('timestamp')

    def get_queryset(self):      
        return Notifications.objects.all()


#Api Root
@api_view(('GET',))
def api_root(request, format=None):
    return Response({
        'users': reverse('users-list', request=request, format=format),
	'friendships': reverse('add-friendship', request=request, format=format),
  	'notifications': reverse('add-notification', request=request, format=format),
})
