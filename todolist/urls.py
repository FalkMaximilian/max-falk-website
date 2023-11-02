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
    path('api/tasks/', api_tasks, name='api-tasks'),
    path('api/list-list/', api_list_list, name='api-list-list'),
    path('api/list-create/', api_list_create, name='api-list-create'),
    path('api/list-delete/<int:listpk>/', api_list_delete, name='api-list-delete'),
    path('api/task-create/', api_task_create, name='api-task-create'),
    path('api/task-delete/<int:taskpk>/', api_task_delete, name='api-task-delete'),
    path('api/task-list/<int:listpk>/', api_task_list, name='api-task-list'),
    path('api/task-update/<int:taskpk>/', api_task_update, name='api-task-update'),
    path('api/task-detail/<int:taskpk>/', api_task_detail, name='api-task-detail'),
]
