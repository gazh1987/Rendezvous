# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('restApi', '0004_phonenumbers'),
    ]

    operations = [
        migrations.AlterField(
            model_name='phonenumbers',
            name='email',
            field=models.OneToOneField(default='', to=settings.AUTH_USER_MODEL),
        ),
    ]
