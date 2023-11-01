from django.urls import path

from .views import *

app_name = 'Base'

urlpatterns = [
    path('', home_view, name='home'),
    path('register/', register_user, name='register-user'),
    path('login/', login_user, name='login-user'),
    path('logout/', logout_user, name='logout-user'),
    path('profile/', profile_user, name='profile-user'),
]
