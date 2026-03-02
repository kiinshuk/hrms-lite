from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Employee, Attendance
from .serializers import EmployeeSerializer, AttendanceSerializer


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    http_method_names = ['get', 'post', 'delete', 'head', 'options']

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        name = instance.full_name
        self.perform_destroy(instance)
        return Response(
            {"message": f"Employee '{name}' deleted successfully."},
            status=status.HTTP_200_OK
        )


class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.select_related('employee').all()
    serializer_class = AttendanceSerializer
    http_method_names = ['get', 'post', 'delete', 'head', 'options']

    def get_queryset(self):
        queryset = super().get_queryset()
        employee_id = self.request.query_params.get('employee_id')
        date = self.request.query_params.get('date')
        if employee_id:
            queryset = queryset.filter(employee__id=employee_id)
        if date:
            queryset = queryset.filter(date=date)
        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def dashboard_stats(request):
    today = timezone.now().date()
    total_employees = Employee.objects.count()
    total_present_today = Attendance.objects.filter(date=today, status='Present').count()
    total_absent_today = Attendance.objects.filter(date=today, status='Absent').count()
    departments_count = Employee.objects.values('department').distinct().count()

    recent_attendance = Attendance.objects.select_related('employee').order_by('-date', '-marked_at')[:10]
    recent_data = AttendanceSerializer(recent_attendance, many=True).data

    return Response({
        'total_employees': total_employees,
        'total_present_today': total_present_today,
        'total_absent_today': total_absent_today,
        'departments_count': departments_count,
        'today': str(today),
        'recent_attendance': recent_data,
    })
