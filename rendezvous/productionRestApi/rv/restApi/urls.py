from django.conf.urls import url, include
from rest_framework.urlpatterns import format_suffix_patterns
from restApi import views
from push_notifications.api.rest_framework import GCMDeviceAuthorizedViewSet

urlpatterns = format_suffix_patterns([
    
    #Api root
    url(r'^$', views.api_root),

    url(r'^users/$',
        views.UserList.as_view(),
        name='users-list'),

    url(r'^users/(?P<email>.+)/$',
        views.UsersDetail.as_view(),
        name='users-detail'),

    url(r'^friends/$',
        views.AddFriendship.as_view(),
        name='add-friendship'),
    
    url(r'^friends/([\w].+)/$',
        views.FriendsList.as_view(),
        name='friends_list'),

    url(r'^friendTrackingList/([\w].+)/$',
        views.FriendTrackingList.as_view(),
        name='friend_tracking_list'),

    url(r'^userTrackingList/([\w].+)/$',
        views.UserTrackingList.as_view(),
        name='user_tracking_list'),

    url(r'^friendTracking/([\w].+)/([\w].+)/$',
        views.FriendTracking.as_view(),
        name='friend_tracking'),

    url(r'^updateFriendTracking/(?P<lookupField>.+)/$',
        views.UpdateFriendTracking.as_view(),
        name='update_friend_tracking'),
		
    url(r'^device/GCM/?$', 
	GCMDeviceAuthorizedViewSet.as_view({'post': 'create'}), 
	name='create_gcm_device'),

    url(r'^notifications/$',
        views.AddNotifications.as_view(),
        name='add-notification'),

    url(r'^notifications/([\w].+)/$',
        views.NotificationsList.as_view(),
        name='notifications_list'),

    url(r'^notifications_update_delete/(?P<timestamp>.+)/$',
        views.NotificationsUpdateDelete.as_view(),
        name='notifications_update_delete'),

    url(r'^add_event/$',
        views.AddEvent.as_view(),
        name='add-event'),

    url(r'^delete_event/(?P<lookup_field>.+)/$',
        views.DeleteEvent.as_view(),
        name='delete-event'),

    url(r'^get_user_events/([\w].+)/$',
        views.GetUserEvents.as_view(),
        name='get-user-event'),

    url(r'^add_event_details/$',
        views.AddEventDetails.as_view(),
        name='get-event_details'),

    url(r'^get_event_details_by_id/(?P<id>.+)/$',
        views.GetEventById.as_view(),
        name='get-event-by-id'),

    url(r'^delete_event_details/(?P<lookup_field>.+)/$',
        views.DeleteEventDetails.as_view(),
        name='delete-event-details'),
])
