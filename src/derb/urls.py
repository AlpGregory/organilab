from django.urls import path

from .views import form_list, preview_form
from .views import EditView
from .views.EditView import UpdateForm


app_name = 'derb'

urlpatterns = [
    path('FormList/<int:org_pk>', form_list.FormList.as_view(), name='form_list'),
    path('FormList/delete/<pk>/<int:org_pk>', form_list.DeleteForm.as_view(), name='delete_form'),
    path('FormList/create/<int:org_pk>', form_list.CreateForm, name='create_form'),
    path('FormList/preview/<int:form_id>/<int:org_pk>', preview_form.previewForm, name='preview_form'),
    path('editView/<int:org_pk>', EditView.as_view(), name='edit_view'),
    path('editView/<int:form_id>/<int:org_pk>', EditView.as_view(), name='edit_view'),
    path('editView/update/', UpdateForm, name='update_form'),
]
