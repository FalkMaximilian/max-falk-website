from rest_framework import serializers
from .models import List, Task
from rest_framework.fields import CurrentUserDefault

class TaskSerializer(serializers.ModelSerializer):

    class Meta:
        model = Task
        fields = '__all__'
    
class TodoListSerializer(serializers.ModelSerializer):

    class Meta:
        model = List
        fields = '__all__'