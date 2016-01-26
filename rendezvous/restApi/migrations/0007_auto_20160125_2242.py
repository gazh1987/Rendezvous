# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('restApi', '0006_auto_20160125_2241'),
    ]

    operations = [
        migrations.RenameField(
            model_name='phonenumbers',
            old_name='email_id',
            new_name='email',
        ),
    ]
