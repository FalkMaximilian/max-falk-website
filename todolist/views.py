from django.shortcuts import render, redirect
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.auth.decorators import login_required
from django.core.exceptions import ObjectDoesNotExist

from .models import *

HOME = 'Todolist:todo-home'
LOGIN = 'Base:login-user'

# Create your views here.
@login_required(login_url=LOGIN)
def todo_home(request):
    context = {}

    lists = TodoList.objects.filter(owner=request.user)
    if lists.count() != 0:
        context['lists'] = lists
        pk = lists.first().pk
        return HttpResponseRedirect('{}/'.format(pk))

    default_list = TodoList(owner=request.user, title=(str(request.user.username).capitalize() + 's list'))
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

        todo_list = TodoList(owner=request.user, title=title)
        todo_list.save()

        return HttpResponseRedirect('/todo/{}/'.format(todo_list.pk))
    return redirect(HOME)

@login_required(login_url=LOGIN)
def todo_delete_list(request, listpk):
    try:
        list_to_delete = TodoList.objects.get(pk=listpk)
    except TodoList.DoesNotExist:
        return redirect(HOME)
        
    if list_to_delete.owner == request.user:
        list_to_delete.delete()

    return redirect(HOME)

@login_required(login_url=LOGIN)
def todo_list_view(request, listpk):
    context = {'activepk': listpk}

    lists = TodoList.objects.filter(owner=request.user)
    if lists.count() == 0:
        return redirect('Base:home')
    
    context['lists'] = lists
    try:
        selected_list = TodoList.objects.get(pk=listpk)
    except TodoList.DoesNotExist:
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
            task_list = TodoList.objects.get(pk=listpk)
        except TodoList.DoesNotExist:
            return redirect(HOME)
        
        new_task = Task(title=task_name, list=task_list, description=task_desc)
        new_task.save()

        return HttpResponseRedirect('/todo/{}/'.format(listpk))
    
    return redirect(HOME)