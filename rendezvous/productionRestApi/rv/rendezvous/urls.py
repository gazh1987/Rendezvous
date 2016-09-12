from django.conf.urls import include, url
from django.contrib import admin

urlpatterns = [
    #Path to administration page
    url(r'^admin/', include(admin.site.urls)),

    url(r'^', include('authemail.urls')),


    url(r'^rendezvous/', include('restApi.urls'))
]

