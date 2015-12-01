# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('restApi', '0004_auto_20151127_1611'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='rendezvoususers',
            name='last_known_position',
        ),
        migrations.AddField(
            model_name='rendezvoususers',
            name='lat',
            field=models.FloatField(null=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='rendezvoususers',
            name='lon',
            field=models.FloatField(null=True),
            preserve_default=True,
        ),
    ]
