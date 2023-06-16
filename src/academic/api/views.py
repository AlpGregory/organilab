from django.template.loader import render_to_string
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, status
from rest_framework.authentication import SessionAuthentication, BaseAuthentication
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.generics import get_object_or_404
from rest_framework.pagination import LimitOffsetPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from academic.api import serializers
from academic.api.forms import CommentProcedureStepForm
from academic.models import CommentProcedureStep, ProcedureStep, MyProcedure
from auth_and_perms.organization_utils import user_is_allowed_on_organization, \
    organization_can_change_laboratory
from laboratory.models import OrganizationStructure, Laboratory
from organilab import settings
from sga.models import ReviewSubstance
from .serializers import ProcedureStepCommentSerializer, \
    ProcedureStepCommentDatatableSerializer, \
    ProcedureStepCommentFilterSet


class ProcedureStepCommentTableView(viewsets.ModelViewSet):
    permission_classes = (IsAuthenticated,)
    authentication_classes = (SessionAuthentication,)
    serializer_class = ProcedureStepCommentDatatableSerializer
    queryset = CommentProcedureStep.objects.all()
    pagination_class = LimitOffsetPagination
    filter_backends = (DjangoFilterBackend, SearchFilter, OrderingFilter)
    search_fields = ['comment', 'creator__username',
                     'creator_at', ]  # for the global search
    filterset_class = ProcedureStepCommentFilterSet
    ordering_fields = ['creator_at', ]
    ordering = ('-creator_at',)  # default order

    def get_queryset(self):
        queryset = super().get_queryset()
        procedure_step = self.request.GET.get('procedure_step', None)
        my_procedure = self.request.GET.get('my_procedure', None)
        if procedure_step:
            queryset = queryset.filter(procedure_step=procedure_step,
                                       my_procedure=my_procedure)
        else:
            queryset = queryset.filter(my_procedure=my_procedure)
        return queryset

    def list(self, request, *args, **kwargs):
        recordsTotal = self.get_queryset().count()
        queryset = self.filter_queryset(self.get_queryset())
        data = self.paginate_queryset(queryset)
        response = {'data': data, 'recordsTotal': recordsTotal,
                    'recordsFiltered': queryset.count(),
                    'draw': self.request.GET.get('draw', 1)}
        return Response(self.get_serializer(response).data)


class ProcedureStepCommentAPI(viewsets.ModelViewSet):
    authentication_classes = [SessionAuthentication, BaseAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = CommentProcedureStep.objects.all()
    serializer_class = ProcedureStepCommentSerializer
    permissions_by_endpoint = {
        "add_comment": ["academic.view_procedure", "academic.view_procedurestep",
                        "academic.add_commentprocedurestep"],
        "list_comments": ["academic.view_procedure", "academic.view_procedurestep",
                          "academic.view_commentprocedurestep"],
        "update_comment": ["academic.view_procedure", "academic.view_procedurestep",
                           "academic.change_commentprocedurestep"],
        "delete_comment": ["academic.view_procedure", "academic.view_procedurestep",
                           "academic.delete_commentprocedurestep"]
    }

    def _check_permission_on_laboratory(self, request, org_pk, lab_pk, method_name):
        if request.user.has_perms(self.permissions_by_endpoint[method_name]):
            self.organization = get_object_or_404(
                OrganizationStructure.objects.using(settings.READONLY_DATABASE),
                pk=org_pk)
            self.laboratory = get_object_or_404(
                Laboratory.objects.using(settings.READONLY_DATABASE), pk=lab_pk)
            user_is_allowed_on_organization(request.user, self.organization)
            organization_can_change_laboratory(self.laboratory, self.organization,
                                               raise_exec=True)
        else:
            raise PermissionDenied()

    @action(detail=False, methods=['post'])
    def add_comment(self, request, org_pk, lab_pk):
        self._check_permission_on_laboratory(request, org_pk, lab_pk, 'add_comment')
        serializer = ProcedureStepCommentSerializer(data=request.data)
        if serializer.is_valid():
            procedure_step = get_object_or_404(ProcedureStep,
                                               pk=request.data['procedure_step'])
            my_procedure = get_object_or_404(MyProcedure,
                                             pk=request.data['my_procedure'])

            CommentProcedureStep.objects.create(
                creator=request.user,
                comment=serializer.data['comment'],
                procedure_step=procedure_step,
                my_procedure=my_procedure
            )

            comments = self.get_queryset().filter(
                procedure_step=procedure_step).order_by('pk')
            template = render_to_string('academic/comment.html',
                                        {'comments': comments, 'user': request.user},
                                        request)
            return Response({'data': template}, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def list_comments(self, request, org_pk, lab_pk):
        self._check_permission_on_laboratory(request, org_pk, lab_pk, 'list_comments')
        queryset = self.get_queryset()
        comments = queryset.none()

        if request.method == "GET":
            form = CommentProcedureStepForm(request.GET)

            if form.is_valid():
                comments = queryset.filter(
                    procedure_step__pk=form.cleaned_data['procedure_step']).order_by(
                    'pk')

        template = render_to_string('academic/comment.html',
                                    {'comments': comments, 'user': request.user},
                                    request)
        return Response({'data': template})

    @action(detail=True, methods=['put'])
    def update_comment(self, request, org_pk, lab_pk, pk=None):
        self._check_permission_on_laboratory(request, org_pk, lab_pk, 'update_comment')
        comment = None

        if pk:
            serializer = ProcedureStepCommentSerializer(data=request.data)
            if serializer.is_valid():
                comment = get_object_or_404(CommentProcedureStep, pk=pk)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            if comment:
                comment.comment = request.data['comment']
                comment.save()
                template = render_to_string('academic/comment.html',
                                            {'comments': self.get_queryset().filter(
                                                procedure_step=comment.procedure_step).order_by(
                                                'pk'),
                                             'user': request.user}, request)

                return Response({'data': template}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['delete'])
    def delete_comment(self, request, org_pk, lab_pk, pk=None):
        self._check_permission_on_laboratory(request, org_pk, lab_pk, 'delete_comment')
        if pk:
            comment = get_object_or_404(
                CommentProcedureStep.objects.using(settings.READONLY_DATABASE), pk=pk)
            procedure_step = comment.procedure_step
            comment.delete()
            template = render_to_string('academic/comment.html',
                                        {'comments': self.get_queryset().filter(
                                            procedure_step=procedure_step).order_by(
                                            'pk'), 'user': request.user}, request)

            return Response({'data': template}, status=status.HTTP_200_OK)

        return Response(status=status.HTTP_400_BAD_REQUEST)


