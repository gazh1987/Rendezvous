# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('restApi', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='friends',
            name='from_friend_email',
            field=models.EmailField(max_length=254, default='default@email.com', null=True),
        ),
        migrations.AddField(
            model_name='friends',
            name='to_friend_email',
            field=models.EmailField(verbose_name='defaut@email.com', max_length=254, null=True),
        ),
    ]
