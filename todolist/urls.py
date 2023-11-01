from django.urls import path
from .views import *

app_name = 'Todolist'

urlpatterns = [
    path('', todo_home, name='todo-home'),
    path('new-list/', todo_newlist, name='todo-newlist'),
    path('delete-list/<int:listpk>/', todo_delete_list, name='todo-deletelist'),
    path('<int:listpk>/delete-task/<str:taskpk>/', todo_delete_task, name='todo-delete-task'),
    path('<int:listpk>/toggle-status/<int:taskpk>/', todo_togglestatus_task, name='todo-togglestatus-task'),
    path('<int:listpk>/newtask/', todo_newtask, name='todo-newtask'),
    path('<int:listpk>/', todo_list_view, name='todo-list-view'),
]
