from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.contrib.auth.models import User

from .forms import RegisterUserForm

HOME = 'home'
LOGIN = 'login-user'

def __check_user_and_register(request):
    try:
        user = User.objects.get(username=request.POST.get('username').lower())
        if user != None:
            messages.warning(request, "Username already in use.")
            return
    except User.DoesNotExist:
        pass
        
    register_form = RegisterUserForm(request.POST)
    if register_form.is_valid():
        user = register_form.save(commit=False)
        user.username = user.username.lower()
        user.save()
        login(request, user)
        return redirect(HOME)
    else:
        messages.warning(request, "Password must be at least 8 characters long and contain numbers and letters. ")
        return


def register_user(request):

    if request.user.is_authenticated:
        return redirect(HOME)

    register_form = RegisterUserForm()

    if request.method == 'POST':
        __check_user_and_register(request)

    context = {'form': register_form}
    return render(request, 'base/register_form.html', context) 


def __check_creds_and_login(request):
    username = request.POST.get('username').lower()
    password = request.POST.get('password')

    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        messages.warning(request, 'This user does not exist.')
        return
        
    user = authenticate(request, username=username, password=password)
    if user is not None:
        del password
        login(request, user)
        return redirect(HOME)
    else:
        messages.warning(request, 'Wrong password!')
        return

def login_user(request):

    if request.user.is_authenticated:
        return redirect(HOME)

    if request.method == 'POST':
        __check_creds_and_login(request)

    return render(request, 'base/login_form.html', {})

@login_required(login_url=LOGIN)
def logout_user(request):
    logout(request)
    return redirect(HOME)

#@login_required(login_url=LOGIN)
def home_view(request):
    return render(request, 'base/home.html') 

# Give username via the url
#@login_required(login_url=LOGIN)
def profile_user(request):
    return render(request, 'base/user_profile.html')