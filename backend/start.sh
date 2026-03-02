#!/usr/bin/env bash
set -o errexit

# Run migrations at startup (database is available at runtime)
python manage.py migrate

# Create/reset admin superuser
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
username = 'admin'
password = 'Admin@1234'
email = 'admin@hrms.com'
if not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username, email, password)
    print('Superuser created.')
else:
    u = User.objects.get(username=username)
    u.set_password(password)
    u.is_staff = True
    u.is_superuser = True
    u.is_active = True
    u.save()
    print('Superuser updated.')
"

# Start gunicorn
exec gunicorn hrms.wsgi --bind 0.0.0.0:${PORT:-8000} --workers 2
