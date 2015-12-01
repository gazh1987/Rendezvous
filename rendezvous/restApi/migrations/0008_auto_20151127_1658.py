# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.contrib.gis.db.models.fields


class Migration(migrations.Migration):

    dependencies = [
        ('restApi', '0007_auto_20151127_1644'),
    ]

    operations = [
        migrations.AlterField(
            model_name='rendezvoususers',
            name='last_known_position',
            field=django.contrib.gis.db.models.fields.PointField(srid=4326, null=True),
        ),
    ]
