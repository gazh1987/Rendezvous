# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('restApi', '0008_auto_20160125_2253'),
    ]

    operations = [
        migrations.AlterField(
            model_name='phonenumbers',
            name='email',
            field=models.CharField(max_length=100),
        ),
    ]
