from django.urls import path
from .views import create_tag, get_tag


urlpatterns = [
    path('create/', create_tag),
    path('get/', get_tag),   
]