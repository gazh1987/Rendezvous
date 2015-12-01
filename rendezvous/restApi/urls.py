from django.conf.urls import url, include
from rest_framework.urlpatterns import format_suffix_patterns
from restApi import views

# API endpoints
urlpatterns = format_suffix_patterns([
    #Api root
    url(r'^$', views.api_root),

    #/users/
    url(r'^users/$',
        views.UserList.as_view(),
        name='users-list'),

    #/users/pk/
    url(r'^users/(?P<pk>[0-9]+)/$',
        views.UsersDetail.as_view(),
        name='users-detail'),

    #POST /login/
    #GET /users/me
    #POST /signup/
    #PATCH /rendezvous/users/[pk]/
])
