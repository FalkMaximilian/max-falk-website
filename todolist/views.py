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
        context['lists'] = lists
        pk = lists.first().pk
        return HttpResponseRedirect('{}/'.format(pk))

    default_list = List(owner=request.user, title=(str(request.user.username).capitalize() + 's list'))
    default_list.save()
    
    default_task = Task(title="Add your own tasks!", list=default_list, description="Press the blue button to create a new task. You can also set an optional description!")
    default_task.save()

    return HttpResponseRedirect('{}/'.format(default_list.pk))

@login_required(login_url=LOGIN)
def todo_delete_task(request, listpk, taskpk):

    try:
        task_to_delete = Task.objects.get(pk=taskpk)
    except Task.DoesNotExist:
        return redirect(HOME)
    
    if task_to_delete.list.owner == request.user:
        task_to_delete.delete()
        
    return HttpResponseRedirect('/todo/{}/'.format(listpk))

@login_required(login_url=LOGIN)
def todo_togglestatus_task(request, listpk, taskpk):

    try:
        task = Task.objects.get(pk=taskpk)
    except Task.DoesNotExist:
        return redirect(HOME)
    
    if task.list.owner == request.user:
        task.status = not task.status
        task.save()

    return HttpResponseRedirect('/todo/{}/'.format(listpk))

@login_required(login_url=LOGIN)
def todo_newlist(request):
    if request.method == 'POST':
        title = request.POST.get('list-name')
        if title.isspace():
            return redirect(HOME)

        todo_list = List(owner=request.user, title=title)
        todo_list.save()

        return HttpResponseRedirect('/todo/{}/'.format(todo_list.pk))
    return redirect(HOME)

@login_required(login_url=LOGIN)
def todo_delete_list(request, listpk):
    try:
        list_to_delete = List.objects.get(pk=listpk)
    except List.DoesNotExist:
        return redirect(HOME)
        
    if list_to_delete.owner == request.user:
        list_to_delete.delete()

    return redirect(HOME)

@login_required(login_url=LOGIN)
def todo_list_view(request, listpk):
    context = {'activepk': listpk}

    lists = List.objects.filter(owner=request.user)
    if lists.count() == 0:
        return redirect('Base:home')
    
    context['lists'] = lists
    try:
        selected_list = List.objects.get(pk=listpk)
    except List.DoesNotExist:
        # Replace with 404
        return redirect('Base:home')
    
    if selected_list.owner != request.user:
        return redirect(HOME)

    context['selected_list'] = selected_list
    context['tasks'] = selected_list.task_set.all()
    
    return render(request, 'todolist/todo_home.html', context)

@login_required(login_url=LOGIN)
def todo_newtask(request, listpk):

    if request.method == 'POST':
        task_name = request.POST.get('task-name')
        task_desc = request.POST.get('task-description')
        if task_name.isspace():
            return redirect(HOME)

        try:            
            task_list = List.objects.get(pk=listpk)
        except List.DoesNotExist:
            return redirect(HOME)
        
        new_task = Task(title=task_name, list=task_list, description=task_desc)
        new_task.save()

        return HttpResponseRedirect('/todo/{}/'.format(listpk))
    
    return redirect(HOME)



@api_view(['GET'])
def api_tasks(request):
    tasks = Task.objects.filter(list__owner = request.user)
    serializer = TaskSerializer(tasks, many = True)
    return Response(serializer.data)

@api_view(['GET'])
def api_list_list(request):
    lists = List.objects.filter(owner=request.user).order_by('-last_modified')
    serializer = TodoListSerializer(lists, many = True)
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
    todo_list = List.objects.get(pk=request.data['list'])
    if not todo_list:
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