from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.contrib.auth.models import User

from .forms import RegisterUserForm

HOME = 'home'
LOGIN = 'login-user'

def register_user(request):

    if request.user.is_authenticated:
        return redirect(HOME)

    register_form = RegisterUserForm()

    if request.method == 'POST':
        register_form = RegisterUserForm(request.POST)
        if register_form.is_valid():
            user = register_form.save(commit=False)
            user.username = user.username.lower()
            user.save()
            login(request, user)
            return redirect(HOME)
        else:
            messages.warning(request, "Couldn't create account :(")

    context = {'form': register_form}
    return render(request, 'base/register_form.html', context) 

def login_user(request):

    if request.user.is_authenticated:
        return redirect(HOME)

    if request.method == 'POST':
        username = request.POST.get('username').lower()
        password = request.POST.get('password')

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            messages.warning(request, 'This username does not exist.')
        
        user = authenticate(request, username=username, password=password)
        if user is not None:
            del password
            login(request, user)
            return redirect(HOME)
        else:
            messages.error(request, 'Wrong password!')

    return render(request, 'base/login_form.html', {})

@login_required(login_url=LOGIN)
def logout_user(request):
    logout(request)
    return redirect(HOME)

@login_required(login_url=LOGIN)
def home_view(request):
    return render(request, 'base/home.html') 

# Give username via the url
#@login_required(login_url=LOGIN)
def profile_user(request):
    return render(request, 'base/user_profile.html')