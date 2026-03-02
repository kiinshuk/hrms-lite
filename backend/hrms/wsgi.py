"""
WSGI config for HRMS Lite project.
"""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hrms.settings')


def run_startup_tasks():
    """Run migrations and create default admin user on startup."""
    try:
        from django.core.management import call_command
        call_command('migrate', verbosity=1)
        print("✅ Migrations applied.")
    except Exception as e:
        print(f"⚠️ Migration error: {e}")

    try:
        from django.contrib.auth import get_user_model
        User = get_user_model()
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@hrms.com', 'Admin@1234')
            print("✅ Admin user created.")
        else:
            print("ℹ️ Admin user already exists.")
    except Exception as e:
        print(f"⚠️ Admin user error: {e}")


run_startup_tasks()

application = get_wsgi_application()
