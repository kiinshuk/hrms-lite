from rest_framework import serializers
from .models import Employee, Attendance


class EmployeeSerializer(serializers.ModelSerializer):
    total_present_days = serializers.SerializerMethodField()

    class Meta:
        model = Employee
        fields = ['id', 'employee_id', 'full_name', 'email', 'department', 'created_at', 'total_present_days']
        read_only_fields = ['id', 'created_at']

    def get_total_present_days(self, obj):
        return obj.attendance_records.filter(status='Present').count()

    def validate_employee_id(self, value):
        if not value.strip():
            raise serializers.ValidationError("Employee ID cannot be blank.")
        instance = self.instance
        qs = Employee.objects.filter(employee_id=value)
        if instance:
            qs = qs.exclude(pk=instance.pk)
        if qs.exists():
            raise serializers.ValidationError("An employee with this Employee ID already exists.")
        return value

    def validate_email(self, value):
        instance = self.instance
        qs = Employee.objects.filter(email=value)
        if instance:
            qs = qs.exclude(pk=instance.pk)
        if qs.exists():
            raise serializers.ValidationError("An employee with this email already exists.")
        return value

    def validate_full_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Full name cannot be blank.")
        return value

    def validate_department(self, value):
        if not value.strip():
            raise serializers.ValidationError("Department cannot be blank.")
        return value


class AttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_id_code = serializers.CharField(source='employee.employee_id', read_only=True)
    department = serializers.CharField(source='employee.department', read_only=True)

    class Meta:
        model = Attendance
        fields = ['id', 'employee', 'employee_name', 'employee_id_code', 'department', 'date', 'status', 'marked_at']
        read_only_fields = ['id', 'marked_at']

    def validate_status(self, value):
        if value not in ['Present', 'Absent']:
            raise serializers.ValidationError("Status must be 'Present' or 'Absent'.")
        return value

    def validate(self, data):
        employee = data.get('employee')
        date = data.get('date')
        instance = self.instance

        if employee and date:
            qs = Attendance.objects.filter(employee=employee, date=date)
            if instance:
                qs = qs.exclude(pk=instance.pk)
            if qs.exists():
                raise serializers.ValidationError(
                    {"non_field_errors": f"Attendance for {employee.full_name} on {date} has already been marked."}
                )
        return data
