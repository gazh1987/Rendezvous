# -*- coding: utf-8 -*-
# Generated by Django 1.9 on 2016-03-02 18:59
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('restApi', '0006_notifications_accepted'),
    ]

    operations = [
        migrations.AddField(
            model_name='notifications',
            name='type',
            field=models.CharField(default='request', max_length=10),
        ),
    ]
