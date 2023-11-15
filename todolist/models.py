from django.db import models
from django.contrib.auth.models import User
from django.db.utils import IntegrityError

class List(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='todolist_owner')
    participants = models.ManyToManyField(User, related_name='todolist_participants')
    title = models.CharField(max_length=50, null=False)
    last_modified = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "todo list"
        verbose_name_plural = verbose_name + "s"
        unique_together = ['owner', 'title']

    def __str__(self):
        return str(self.owner) + "'s list " + str(self.title)


class Task(models.Model):
    list = models.ForeignKey(List, on_delete=models.CASCADE)
    title = models.CharField(max_length=50)
    description = models.TextField(null=True)
    status = models.BooleanField(default=False)

    class Meta:
        verbose_name = "task"
        verbose_name_plural = verbose_name + 's'
    
    def __str__(self):
        return str(self.title) + ' is a task from ' + str(self.list)
    