# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('restApi', '0007_auto_20160125_2242'),
    ]

    operations = [
        migrations.AlterField(
            model_name='phonenumbers',
            name='email',
            field=models.ForeignKey(to=settings.AUTH_USER_MODEL, default=''),
        ),
    ]
