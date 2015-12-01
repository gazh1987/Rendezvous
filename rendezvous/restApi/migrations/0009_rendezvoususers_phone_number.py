# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('restApi', '0008_auto_20151127_1658'),
    ]

    operations = [
        migrations.AddField(
            model_name='rendezvoususers',
            name='phone_number',
            field=models.IntegerField(null=True),
            preserve_default=True,
        ),
    ]
