# Generated by Django 4.2.6 on 2023-11-08 14:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('todolist', '0005_alter_todolist_participants'),
    ]

    operations = [
        migrations.AddField(
            model_name='todolist',
            name='last_modified',
            field=models.DateTimeField(auto_now=True),
        ),
    ]
