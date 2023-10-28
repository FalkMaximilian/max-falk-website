from django.shortcuts import render
from django.http import HttpResponse

# Create your views here.
def todo_home(request):
    return render(request, 'todolist/todo_home.html')
