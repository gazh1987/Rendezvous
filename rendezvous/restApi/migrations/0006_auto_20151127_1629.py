# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.contrib.gis.db.models.fields


class Migration(migrations.Migration):

    dependencies = [
        ('restApi', '0005_auto_20151127_1621'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='rendezvoususers',
            name='lat',
        ),
        migrations.RemoveField(
            model_name='rendezvoususers',
            name='lon',
        ),
        migrations.AddField(
            model_name='rendezvoususers',
            name='last_known_position',
            field=django.contrib.gis.db.models.fields.PointField(srid=4326, null=True),
            preserve_default=True,
        ),
    ]
