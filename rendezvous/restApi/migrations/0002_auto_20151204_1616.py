# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('restApi', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='rendezvoususers',
            name='phone_number',
            field=models.CharField(max_length=25, blank=True, null=True),
        ),
    ]
