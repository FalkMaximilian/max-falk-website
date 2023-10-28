from django.shortcuts import render
from django.http import HttpResponse

# Create your views here.
def todo_home(request):
    return HttpResponse('<h1>Nice ein Bausparvertrag!</h1>')
