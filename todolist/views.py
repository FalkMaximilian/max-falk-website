from django.shortcuts import render, redirect
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.auth.decorators import login_required
from django.core.exceptions import ObjectDoesNotExist
from django.db.utils import IntegrityError

from rest_framework.decorators import api_view, authentication_classes
from rest_framework.response import Response
from rest_framework.authentication import SessionAuthentication

from datetime import datetime

from .serializers import TaskSerializer, TodoListSerializer
from .models import *

HOME = 'Todolist:todo-home'
LOGIN = 'Base:login-user'

# Create your views here.
@login_required(login_url=LOGIN)
def todo_home(request):
    context = {}

    lists = List.objects.filter(owner=request.user)
    if lists.count() != 0:
        pk = lists.first().pk
        return render(request, 'todolist/todo_home.html', {})

    default_list = List(owner=request.user, title=(str(request.user.username).capitalize() + 's list'))
    default_list.save()
    
    default_task = Task(title="Add your own tasks!", list=default_list, description="Press the blue button to create a new task. You can also set an optional description!")
    default_task.save()

    return render(request, 'todolist/todo_home.html', {})


@api_view(['GET'])
def api_tasks(request):
    tasks = Task.objects.filter(list__owner = request.user)
    serializer = TaskSerializer(tasks, many = True)
    return Response(serializer.data)

@api_view(['GET'])
def api_list_list(request):
    lists = List.objects.filter(owner=request.user).order_by('-last_modified')
    serializer = TodoListSerializer(lists, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def api_task_list(request, listpk):
    tasks = Task.objects.filter(list = listpk)
    serializer = TaskSerializer(tasks, many = True)
    return Response(serializer.data)

@api_view(['GET'])
def api_task_detail(request, taskpk):
    task = Task.objects.get(pk=taskpk)
    serializer = TaskSerializer(task, many=False)
    return Response(serializer.data)

@api_view(['POST'])
def api_task_create(request):
    try:
        todo_list = List.objects.get(pk=request.data['list'])
    except List.DoesNotExist:
        return Response('Tasks can only be added to exisiting lists!', status=400)
    
    if todo_list.owner != request.user:
        return Response('You can only add tasks to your own shopping lists', status=403)
    
    new_task = Task(list=todo_list, title=request.data['title'], description=request.data['description'], status=request.data['status'])
    try:
        new_task.save()
    except IntegrityError:
        return Response('Could not create task!', status=400)
    
    todo_list.save()
    serializer = TaskSerializer(new_task)
    return Response(serializer.data)

@api_view(['POST'])
def api_task_update(request, taskpk):
    task = Task.objects.get(pk=taskpk)
    serializer = TaskSerializer(instance=task, data=request.data)

    if serializer.is_valid():
        serializer.save()

    return Response(serializer.data)


@api_view(['DELETE'])
def api_task_delete(request, taskpk):
    task = Task.objects.get(pk=taskpk)
    task.delete()

    return Response("Task successfully deleted!")

@api_view(['PUT'])
def api_task_toggle_status(request, taskpk):

    try:
        task = Task.objects.get(pk=taskpk)
    except Task.DoesNotExist:
        return Response("Task with such id does not exists!", status=400)
    
    # Same error as above on purpose. Do not leak that another user may own a task with this id
    if (task.list.owner != request.user):
        return Response("Task with such id does not exists!", status=404)
    
    task.status = not task.status
    task.save()
    task.list.save()

    serializer = TaskSerializer(task)
    return Response(serializer.data)

@api_view(['POST'])
def api_list_create(request):

    new_list = List(owner=request.user, title=request.data['title'])
    try:
        new_list.save()
    except IntegrityError:
        return Response('Could not create entry!', status=400)
    
    serializer = TodoListSerializer(new_list)
    return Response(serializer.data)


@api_view(['DELETE'])
def api_list_delete(request, listpk):
    list_to_del = List.objects.get(pk=listpk)
    list_to_del.delete()

    return Response('list successfully deleted!')
