# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('restApi', '0003_remove_rendezvoususers_phone_number'),
    ]

    operations = [
        migrations.CreateModel(
            name='PhoneNumbers',
            fields=[
                ('phone_number', models.CharField(max_length=25, primary_key=True, serialize=False)),
                ('email', models.ForeignKey(default='', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
