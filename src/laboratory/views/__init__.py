from django.shortcuts import render
from django_ajax.decorators import ajax
from django.contrib.auth.decorators import login_required
from django.utils.translation import gettext_lazy as _
from django.template.loader import render_to_string
import json





@login_required
def lab_index(request, org_pk, lab_pk):
    return render(request, 'laboratory/index.html',
                  {'laboratory': int(lab_pk),
                   'org_pk':org_pk})

# def is_laboratory_admin(user):
#     return bool(user.groups.filter(name='laboratory_admin'))
#
# def is_laboratory_student(user):
#     return bool(user.groups.filter(name='laboratory_student'))
#
# def is_laboratory_teacher(user):
#     return bool(user.groups.filter(name='laboratory_teacher'))
