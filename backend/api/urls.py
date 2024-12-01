from django.urls import path
from .views import create_tag, get_tag


urlpatterns = [
    path('create_tag/', create_tag),
    path('get_tag/', get_tag),   
]