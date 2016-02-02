from django.conf.urls import include, url
from django.contrib import admin

urlpatterns = [
    #Path to administration page
    url(r'^admin/', include(admin.site.urls)),

    url(r'^', include('authemail.urls')),

    #Path to api root
    #Superuser
    #Email: gary.healy2@student.dit TODO:create an admin email
    #password: admin
    url(r'^rendezvous/', include('restApi.urls'))
]

