import { Model, ModuleImport, isModule, isModuleImport } from "../../../../../language/generated/ast.js";
import { createPath, base_ident, capitalizeString } from "../../../../util/generator-utils.js";
import path from 'path'
import fs from 'fs'
import { Generated, expandToStringWithNL, toString } from "langium/generate";

const ident = base_ident

export function generate(app: Model, target_folder: string) : void {

    const solution_name = app.configuration?.name?.toLowerCase() ?? "core"

    const BASE_PATH = createPath(target_folder, "backend/")

    fs.writeFileSync(path.join(BASE_PATH, ".env"), toString(createEnv(solution_name)))
    fs.writeFileSync(path.join(BASE_PATH, "manage.py"), createManage(solution_name))
    fs.writeFileSync(
        path.join(BASE_PATH, "requirements.txt"),
        toString(createRequirements(app.abstractElements.filter(isModuleImport)))
    )
    fs.writeFileSync(path.join(createPath(BASE_PATH, "logs"), ".gitkeep"), "")
    fs.writeFileSync(path.join(createPath(BASE_PATH, "static"), "__init__.py"), "")

    // Git Stuff
    fs.writeFileSync(path.join(BASE_PATH, ".gitignore"), toString(generateGitignore()))
    fs.writeFileSync(path.join(BASE_PATH, ".gitlab-ci.yml"), toString(generateCI()))
    fs.writeFileSync(path.join(BASE_PATH, "sonar-project.properties"), toString(generateSonarProperties()))

    // Docker Stuff
    fs.writeFileSync(path.join(BASE_PATH, ".dockerignore"), generateDockerignore())
    fs.writeFileSync(path.join(BASE_PATH, "Dockerfile"), generateDockerfile(solution_name))

    const CORE_PATH = createPath(BASE_PATH, solution_name)
    fs.writeFileSync(path.join(CORE_PATH, "__init__.py"), "")
    fs.writeFileSync(path.join(CORE_PATH, "asgi.py"), createASGI(solution_name))
    fs.writeFileSync(path.join(CORE_PATH, "urls.py"), createURL(solution_name, app.configuration?.description ?? "", app))
    fs.writeFileSync(path.join(CORE_PATH, "wsgi.py"), createWSGI(solution_name))
    fs.writeFileSync(path.join(createPath(CORE_PATH, "media"), "__init__.py"), "")
    fs.writeFileSync(path.join(createPath(CORE_PATH, "staticfiles"), "__init__.py"), "")

    // Django Settings
    const SETTING_PATH = createPath(CORE_PATH, "settings")
    fs.writeFileSync(path.join(SETTING_PATH, "__init__.py"), "")
    fs.writeFileSync(path.join(SETTING_PATH, "base.py"), createBaseSetting(app, solution_name))
    fs.writeFileSync(path.join(SETTING_PATH, "test.py"), createTestSetting())
    fs.writeFileSync(path.join(SETTING_PATH, "local.py"), createLocalSetting())
    fs.writeFileSync(path.join(SETTING_PATH, "production.py"), createProductionSetting())



}

function createEnv(softwareName: string) : Generated{
    return expandToStringWithNL`
        
        ALLOWED_HOSTS=*
        
        USE_SQLITE=True
        
        DB_ENGINE_LOCAL=django.db.backends.sqlite3
        DB_HOST_LOCAL=''
        DB_NAME_LOCAL='sqlite3.db'
        DB_USER_LOCAL=
        DB_PASSWORD_LOCAL=
        DB_PORT_LOCAL=
        
        
        DB_ENGINE_TEST=django.db.backends.sqlite3
        DB_HOST_TEST=''
        DB_NAME_TEST='sqlite3.db'
        DB_PASSWORD_TEST=''
        DB_PORT_TEST=''
        DB_USER_TEST=''
        
        DB_ENGINE_PRODUCTION=django.db.backends.postgres
        DB_HOST_PRODUCTION=
        DB_NAME_PRODUCTION=
        DB_PASSWORD_PRODUCTION=
        DB_PORT_PRODUCTION=
        DB_USER_PRODUCTION= 
        
        DEBUG=True
        SECRET_KEY=3izb^ryglj(bvrjb2_y1fZvcnbky#358_l6-nn#i8fkug4mmz!
        
        DEFAULT_FROM_EMAIL=xxxxxxx@xxxx.com
        EMAIL_HOST=xxxx
        EMAIL_HOST_PASSWORD=xxxx
        EMAIL_HOST_USER=xxxx
        EMAIL_PORT=587
        EMAIL_USE_TLS=True        
        HASHIDS_SALT=hA8(scA@!fg3*sc&xaGh&6%-l<._&xCf,
        
        DJANGO_SETTINGS_MODULE = ${softwareName.toLowerCase()}.settings.local
        
        URL_VALIDATION=
        URL= `   
}

function createRequirements(imports: ModuleImport[]) : Generated {
    // ${imports.map(i => `--extra-index-url ${i.link}`).join('\n')}
    return expandToStringWithNL`
        asgiref==3.6.0
        autopep8==1.5.7
        beautifulsoup4==4.11.1
        behave==1.2.6
        behave-django==1.4.0
        certifi==2021.10.8
        cffi==1.15.0
        charset-normalizer==2.0.7
        coreapi==2.3.3
        coreschema==0.0.4
        cryptography==35.0.0
        Deprecated==1.2.13
        dj-database-url==0.5.0
        Django==4.1.5
        django-cpf-cnpj==1.0.0
        django-easy-audit==1.3.3
        django-filter==21.1
        django-oauth-toolkit==1.5.0
        django-polymorphic==3.1.0
        djangorestframework==3.12.4
        drf-yasg==1.20.0
        gunicorn==20.1.0
        idna==3.3
        inflection==0.5.1
        itypes==1.2.0
        Jinja2==3.0.3
        jwcrypto==1.0
        Markdown==3.3.4
        MarkupSafe==2.0.1
        oauthlib==3.1.1
        packaging==21.2
        parse==1.19.0
        parse-type==0.5.2
        psycopg2==2.9.2
        pycodestyle==2.7.0
        pycparser==2.21
        pyparsing==2.4.7
        python-decouple==3.5
        pytz==2021.3
        requests==2.26.0
        rest-condition==1.0.3
        ruamel.yaml==0.17.17
        ruamel.yaml.clib==0.2.6
        six==1.16.0
        soupsieve==2.3.2.post1
        sqlparse==0.4.3
        toml==0.10.2
        Unipath==1.1
        uritemplate==4.1.1
        urllib3==1.26.7
        whitenoise==5.3.0
        wrapt==1.13.3

        # Imported from the grammar
        ${imports.map(i => i.name).join('\n')}
    `
}

function createManage(softwareName: string) : string {
    const lines = [
        `#!/usr/bin/env python`,
        `"""Django's command-line utility for administrative tasks."""`,
        `import os`,
        `import sys`,
        ``,
        `def main():`,
        `${ident}os.environ.setdefault('DJANGO_SETTINGS_MODULE', '${softwareName.toLowerCase()}.settings.local')`,
        `${ident}try:`,
        `${ident}${ident}from django.core.management import execute_from_command_line`,
        `${ident}except ImportError as exc:`,
        `${ident}${ident}raise ImportError(`,
        `${ident}${ident}${ident}"Couldn't import Django. Are you sure it's installed and"`,
        `${ident}${ident}${ident}"available on your PYTHONPATH environment variable? Did you"`,
        `${ident}${ident}${ident}"forget to activate a virtual environment?"`,
        `${ident}${ident}) from exc`,
        `${ident}execute_from_command_line(sys.argv)`,
        ``,
        `if __name__ == '__main__':`,
        `${ident}main()`,
        ``,
    ]

    return lines.join('\n')
}

function createTestSetting() : string {
    const lines = [
        `from .base import *`,
        `from decouple import config`,
        `import dj_database_url`,
        ``,
        `DEBUG = True`,
        ``,
        `SECRET_KEY = config('SECRET_KEY')`,
        ``,
        ``,
        `# Database`,
        `# https://docs.djangoproject.com/en/3.0/ref/settings/#databases`,
        ``,
        `DATABASES = {`,
        `${ident}'default': {`,
        `${ident}${ident}'ENGINE': config('DB_ENGINE_TEST'),`,
        `${ident}${ident}'NAME': config('DB_NAME_TEST'),`,
        `${ident}${ident}'USER': config('DB_USER_TEST'),`,
        `${ident}${ident}'PASSWORD': config('DB_PASSWORD_TEST'),`,
        `${ident}${ident}'HOST': config('DB_HOST_TEST'),`,
        `${ident}${ident}'PORT': config('DB_PORT_TEST'),`,
        `${ident}}`,
        `}`,
        ``
    ]

    return lines.join('\n')
}

function createProductionSetting() : string {
    const lines = [
        `from .base import *`,
        `from decouple import config`,
        `import dj_database_url`,
        ``,
        `DEBUG = False`,
        ``,
        `SECRET_KEY = config('SECRET_KEY')`,
        ``,
        `DATABASES = {`,
        `${ident}'default': {`,
        `${ident}${ident}'ENGINE': config('DB_ENGINE_PRODUCTION'),`,
        `${ident}${ident}'NAME': config('DB_NAME_PRODUCTION'),`,
        `${ident}${ident}'USER': config('DB_USER_PRODUCTION'),`,
        `${ident}${ident}'PASSWORD': config('DB_PASSWORD_PRODUCTION'),`,
        `${ident}${ident}'HOST': config('DB_HOST_PRODUCTION'),`,
        `${ident}${ident}'PORT': config('DB_PORT_PRODUCTION'),`,
        `${ident}}`,
        `}`,
    ]

    return lines.join('\n')
}

function createLocalSetting() : string {
    const lines = [
        `from .base import *`,
        `from decouple import config`,
        ``,
        `DEBUG = config('DEBUG', default=True, cast=bool)`,
        `SECRET_KEY = config(`,
        `${ident}"DJANGO_SECRET_KEY",`,
        `${ident}default="django-insecure-&we(0t(&@t(90rx$19tr3dms-3_4ngz6*6d=9=5ghz=ov#%^4^",`,
        `)`,
        ``,
        `if config("USE_SQLITE", default=True, cast=bool):`,
        `${ident}DATABASES = {`,
        `${ident}${ident}"default": {`,
        `${ident}${ident}${ident}"ENGINE": "django.db.backends.sqlite3",`,
        `${ident}${ident}${ident}"NAME": BASE_DIR / "db.sqlite3",`,
        `${ident}${ident}}`,
        `${ident}}`,
        `else:`,
        `${ident}DATABASES = {`,
        `${ident}${ident}"default": {`,
        `${ident}${ident}${ident}"ENGINE": config("DB_ENGINE_LOCAL", ""),`,
        `${ident}${ident}${ident}"NAME": config("DB_NAME_LOCAL", ""),`,
        `${ident}${ident}${ident}"USER": config("DB_USER_LOCAL", ""),`,
        `${ident}${ident}${ident}"PASSWORD": config("DB_PASSWORD_LOCAL", ""),`,
        `${ident}${ident}${ident}"HOST": config("DB_HOST_LOCAL", ""),`,
        `${ident}${ident}${ident}"PORT": config("DB_PORT_LOCAL", ""),`,
        `${ident}${ident}},`,
        `${ident}}`,
        ``
    ]

    return lines.join('\n')
}

function createBaseSetting(app: Model, solution_name: string) : string {
    const lines = [
        `"""`,
        `Django settings`,
        ``,
        `Based on the one generated by 'django-admin startproject' using Django 3.0.7. and Django 3.2.15.`,
        ``,
        `For more information on this file, see`,
        `https://docs.djangoproject.com/en/3.0/topics/settings/`,
        ``,
        `For the full list of settings and their values, see`,
        `https://docs.djangoproject.com/en/3.0/ref/settings/`,
        `"""`,
        ``,
        `import os`,
        ``,
        `from decouple import config`,
        `from pathlib import Path`,
        ``,
        `from django.contrib.messages import constants as messages`,
        ``,
        `import mimetypes`,
        ``,
        ``,
        `# Build paths inside the project like this: BASE_DIR / 'subdir'.`,
        `BASE_DIR = Path(__file__).resolve().parent.parent.parent`,
        ``,
        `# Quick-start development settings - unsuitable for production`,
        `# See https://docs.djangoproject.com/en/3.0/howto/deployment/checklist/`,
        ``,
        `# SECURITY WARNING: don't run with debug turned on in production!`,
        `DEBUG = True`,
        ``,
        `# load production server from .env`,
        `ALLOWED_HOSTS = ['localhost', '127.0.0.1']`,
        ``,
        `DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"`,
        ``,
        `# Application definition`,
        ``,
        `INSTALLED_APPS = [`,
        `# Django Apps`,
        `${ident}'django.contrib.admin',`,
        `${ident}'django.contrib.auth',`,
        `${ident}'django.contrib.contenttypes',`,
        `${ident}'django.contrib.sessions',`,
        `${ident}'django.contrib.messages',`,
        `${ident}'django.contrib.staticfiles',`,
        `${ident}'django.contrib.admindocs',`,
        `# 3rd-party Apps`,
        `${ident}'django_cpf_cnpj',`,
        `${ident}'easyaudit',`,
        `${ident}'polymorphic',`,
        `${ident}'rest_framework', `,
        `${ident}'rest_framework.authtoken',`,
        `${ident}'oauth2_provider',`,
        `${ident}'drf_yasg',`,
        `${ident}'behave_django',`,
        `# External Apps`,
        ...app.abstractElements.filter(isModuleImport).map(m =>
            `${ident}'${m.name}',`
        ),
        `# Local Apps`,
        ...app.abstractElements.filter(isModule).map(m =>
            `${ident}'apps.${m.name.toLowerCase()}',`
        ),
        `]`,
        ``,
        `MIDDLEWARE = [`,
        `${ident}'django.middleware.security.SecurityMiddleware',`,
        `${ident}'whitenoise.middleware.WhiteNoiseMiddleware',`,
        `${ident}'django.contrib.sessions.middleware.SessionMiddleware',`,
        `${ident}'django.middleware.common.CommonMiddleware',`,
        `${ident}'django.middleware.csrf.CsrfViewMiddleware',`,
        `${ident}'django.contrib.auth.middleware.AuthenticationMiddleware',`,
        `${ident}'django.contrib.messages.middleware.MessageMiddleware',`,
        `${ident}'django.middleware.clickjacking.XFrameOptionsMiddleware',`,
        `${ident}'easyaudit.middleware.easyaudit.EasyAuditMiddleware',`,
        `]`,
        ``,
        `ROOT_URLCONF = '${solution_name}.urls'`,
        ``,
        `CRISPY_TEMPLATE_PACK = 'bootstrap4'`,
        ``,
        `TEMPLATES = [`,
        `${ident}{`,
        `${ident}${ident}'BACKEND': 'django.template.backends.django.DjangoTemplates',`,
        `${ident}${ident}'DIRS': [os.path.join('templates')],`,
        `${ident}${ident}'APP_DIRS': True,`,
        `${ident}${ident}'OPTIONS': {`,
        `${ident}${ident}${ident}'context_processors': [`,
        `${ident}${ident}${ident}${ident}'django.template.context_processors.debug',`,
        `${ident}${ident}${ident}${ident}'django.template.context_processors.request',`,
        `${ident}${ident}${ident}${ident}'django.contrib.auth.context_processors.auth',`,
        `${ident}${ident}${ident}${ident}'django.contrib.messages.context_processors.messages',`,
        `${ident}${ident}${ident}],`,
        `${ident}${ident}},`,
        `${ident}},`,
        `]`,
        ``,
        `WSGI_APPLICATION = '${solution_name}.wsgi.application'`,
        ``,
        `# Password validation`,
        `# https://docs.djangoproject.com/en/3.0/ref/settings/#auth-password-validators`,
        ``,
        `AUTH_PASSWORD_VALIDATORS = [`,
        `${ident}{ 'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator', },`,
        `${ident}{ 'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', },`,
        `${ident}{ 'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator', },`,
        `${ident}{ 'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator', },`,
        `]`,
        ``,
        `LANGUAGE_CODE = 'pt-br'`,
        ``,
        `TIME_ZONE = 'America/Sao_Paulo'`,
        ``,
        `USE_I18N = True`,
        ``,
        `USE_L10N = True`,
        ``,
        `USE_TZ = True`,
        ``,
        `STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')`,
        ``,
        `STATIC_URL = '/static/'`,
        ``,
        `STATICFILES_DIRS = (os.path.join('static'), )`,
        ``,
        `DATE_INPUT_FORMATS = ['%d/%m/%Y']`,
        ``,
        `LOGIN_URL = "/accounts/login/"`,
        ``,
        `LOGIN_REDIRECT_URL = '/'`,
        ``,
        `LOGOUT_REDIRECT_URL = '/accounts/login'`,
        ``,
        `STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'`,
        ``,
        `MESSAGE_LEVEL = 10`,
        ``,
        `MESSAGE_TAGS = {`,
        `${ident}messages.DEBUG: 'alert-info',`,
        `${ident}messages.INFO: 'alert-info',`,
        `${ident}messages.SUCCESS: 'alert-success',`,
        `${ident}messages.WARNING: 'alert-warning',`,
        `${ident}messages.ERROR: 'alert-danger',`,
        `}`,
        ``,
        `ERRORS_MESSAGES = {`,
        `${ident}"unique":"Erro! Chave unica não pode se repetir"`,
        `}`,
        ``,
        `MEDIA_URL = '/media/'`,
        ``,
        `MEDIA_ROOT = os.path.join(BASE_DIR, 'media')`,
        ``,
        `REST_FRAMEWORK = {`,
        `${ident}'DATETIME_FORMAT': '%d/%m/%Y',`,
        `${ident}'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.LimitOffsetPagination',`,
        `${ident}'DEFAULT_FILTER_BACKENDS': ['django_filters.rest_framework.DjangoFilterBackend'],`,
        `${ident}'PAGE_SIZE': 10,`,
        `${ident}'DEFAULT_SCHEMA_CLASS': 'rest_framework.schemas.coreapi.AutoSchema',`,
        `${ident}'DEFAULT_AUTHENTICATION_CLASSES': ('oauth2_provider.contrib.rest_framework.OAuth2Authentication',),`,
        `${ident}'DEFAULT_PARSER_CLASSES': [`,
        `${ident}${ident}'rest_framework.parsers.JSONParser',`,
        `${ident}]`,
        `}`,
        ``,
        `OAUTH2_PROVIDER = {`,
        `${ident}'SCOPES': {'read': 'Read scope', 'write': 'Write scope', 'groups': 'Access to your groups'},`,
        `${ident}'ACCESS_TOKEN_EXPIRE_SECONDS': 36000,`,
        `}`,
        ``,
        `EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'`,
        ``,
        `if DEBUG:`,
        `${ident}EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'`,
        ``,
        ``,
        `EMAIL_HOST = config('EMAIL_HOST')`,
        `EMAIL_PORT = config('EMAIL_PORT')`,
        `EMAIL_HOST_USER = config('EMAIL_HOST_USER')`,
        `EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD')`,
        `EMAIL_USE_TLS = config('EMAIL_USE_TLS')`,
        `DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL')`,
        ``,
        `URL_VALIDATION_SUCCESS = 'password_reset'`,
        `URL_VALIDATION_ERRO = 'validation_erro'`,
        ``,
        `URL = config('URL')`,
        `URL_VALIDATION = config('URL_VALIDATION')`,
        ``,
        `HASHIDS_SALT = config('HASHIDS_SALT')`,
        ``,
        ``,
        `LOGGING = {`,
        `${ident}"version": 1,`,
        `${ident}"disable_existing_loggers": False,`,
        `${ident}"root": {"level": "INFO", "handlers": ["file"]},`,
        `${ident}"handlers": {`,
        `${ident}${ident}"file": {`,
        `${ident}${ident}${ident}"level": "INFO",`,
        `${ident}${ident}${ident}"class": "logging.FileHandler",`,
        `${ident}${ident}${ident}"filename": "./logs/django.log",`,
        `${ident}${ident}${ident}"formatter": "app",`,
        `${ident}${ident}},`,
        `${ident}},`,
        `${ident}"loggers": {`,
        `${ident}${ident}"django": {`,
        `${ident}${ident}${ident}"handlers": ["file"],`,
        `${ident}${ident}${ident}"level": "INFO",`,
        `${ident}${ident}${ident}"propagate": True`,
        `${ident}${ident}},`,
        `${ident}},`,
        `${ident}"formatters": {`,
        `${ident}${ident}"app": {`,
        `${ident}${ident}${ident}"format": (`,
        `${ident}${ident}${ident}${ident}u"%(asctime)s [%(levelname)-8s] "`,
        `${ident}${ident}${ident}${ident}"(%(module)s.%(funcName)s) %(message)s"`,
        `${ident}${ident}${ident}),`,
        `${ident}${ident}${ident}"datefmt": "%Y-%m-%d %H:%M:%S",`,
        `${ident}${ident}},`,
        `${ident}},`,
        `}`,
    ]

    return lines.join('\n')
}

function createURL(softwareName: string, description: string, app: Model) : string {
    const lines = [
        `from django.contrib import admin`,
        `from django.urls import path, include`,
        ``,
        `from django.conf import settings`,
        `from django.conf.urls.static import static`,
        `from rest_framework import permissions`,
        `from drf_yasg.views import get_schema_view`,
        `from drf_yasg import openapi `,
        ``,
        `schema_view = get_schema_view(`,
        `${ident}openapi.Info(`,
        `${ident}${ident}title="${capitalizeString(softwareName)}",`,
        `${ident}${ident}default_version='v1',`,
        `${ident}${ident}description="${description}",`,
        `${ident}),`,
        `${ident}public=True,`,
        `${ident}permission_classes=[permissions.AllowAny],`,
        `)`,
        ``,
        `urlpatterns = [`,
        `${ident}path('admin/doc/', include('django.contrib.admindocs.urls')),`,
        `${ident}path('admin/', admin.site.urls),`,
        `${ident}path('o/', include('oauth2_provider.urls', namespace='oauth2_provider')), `,
        `${ident}path('', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),`,
        `${ident}path('accounts/', include('django.contrib.auth.urls')),`,
        ...app.abstractElements.filter(isModule).map(m =>
            `${ident}path('', include('apps.${m.name.toLowerCase()}.api_urls')),`,
        ),
        `${ident}*static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)`,
        `]`,
        ``,
        `if settings.DEBUG:`,
        `${ident}urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)`,
        ``,
    ]

    return lines.join('\n')
}

function createWSGI(softwareName: string) : string {
    const lines = [
        `"""`,
        `WSGI config for gs project.`,
        ``,
        `It exposes the WSGI callable as a module-level variable named \`\`application\`\`.`,
        ``,
        `For more information on this file, see`,
        `https://docs.djangoproject.com/en/3.0/howto/deployment/wsgi/`,
        `"""`,
        ``,
        `import os`,
        ``,
        `from django.core.wsgi import get_wsgi_application`,
        ``,
        `os.environ.setdefault('DJANGO_SETTINGS_MODULE', '${softwareName.toLowerCase()}.settings.local')`,
        ``,
        `application = get_wsgi_application()`,
        ``,
    ]

    return lines.join('\n')
}

function createASGI(softwareName: string) : string {
    const lines = [
        `"""`,
        `ASGI config for gs project.`,
        ``,
        `It exposes the ASGI callable as a module-level variable named \`\`application\`\`.`,
        ``,
        `For more information on this file, see`,
        `https://docs.djangoproject.com/en/3.0/howto/deployment/asgi/`,
        `"""`,
        ``,
        `import os`,
        ``,
        `from django.core.asgi import get_asgi_application`,
        ``,
        `os.environ.setdefault('DJANGO_SETTINGS_MODULE', '.${softwareName.toLowerCase()}.settings.base')`,
        ``,
        `application = get_asgi_application()`,
        ``,
    ]

    return lines.join('\n')
}

function generateGitignore() : Generated {
    return expandToStringWithNL`
        # Byte-compiled / optimized / DLL files
        __pycache__/
        *.py[cod]
        *$py.class
        
        staticfiles/
        
        .tool-versions
        
        # C extensions
        *.so
        
        
        # Distribution / packaging
        .Python
        build/
        develop-eggs/
        dist/
        downloads/
        eggs/
        .eggs/
        lib/
        lib64/
        parts/
        sdist/
        var/
        wheels/
        share/python-wheels/
        *.egg-info/
        .installed.cfg
        *.egg
        MANIFEST
        
        # PyInstaller
        #  Usually these files are written by a python script from a template
        #  before PyInstaller builds the exe, so as to inject date/other infos into it.
        *.manifest
        *.spec
        
        # Installer logs
        pip-log.txt
        pip-delete-this-directory.txt
        
        # Unit test / coverage reports
        htmlcov/
        .tox/
        .nox/
        .coverage
        .coverage.*
        .cache
        nosetests.xml
        coverage.xml
        *.cover
        *.py,cover
        .hypothesis/
        .pytest_cache/
        cover/
        
        # Translations
        *.mo
        *.pot
        
        # Django stuff:
        *.log
        local_settings.py
        db.sqlite3
        db.sqlite3-journal
        media/
        
        # Flask stuff:
        instance/
        .webassets-cache
        
        # Scrapy stuff:
        .scrapy
        
        # Sphinx documentation
        docs/_build/
        
        # PyBuilder
        .pybuilder/
        target/
        
        # Jupyter Notebook
        .ipynb_checkpoints
        
        # IPython
        profile_default/
        ipython_config.py
        
        # pyenv
        #   For a library or package, you might want to ignore these files since the code is
        #   intended to run in multiple environments; otherwise, check them in:
        # .python-version
        
        # pipenv
        #   According to pypa/pipenv#598, it is recommended to include Pipfile.lock in version control.
        #   However, in case of collaboration, if having platform-specific dependencies or dependencies
        #   having no cross-platform support, pipenv may install dependencies that don't work, or not
        #   install all needed dependencies.
        #Pipfile.lock
        
        # poetry
        #   Similar to Pipfile.lock, it is generally recommended to include poetry.lock in version control.
        #   This is especially recommended for binary packages to ensure reproducibility, and is more
        #   commonly ignored for libraries.
        #   https://python-poetry.org/docs/basic-usage/#commit-your-poetrylock-file-to-version-control
        #poetry.lock
        
        # pdm
        #   Similar to Pipfile.lock, it is generally recommended to include pdm.lock in version control.
        #pdm.lock
        #   pdm stores project-wide configurations in .pdm.toml, but it is recommended to not include it
        #   in version control.
        #   https://pdm.fming.dev/#use-with-ide
        .pdm.toml
        
        # PEP 582; used by e.g. github.com/David-OConnor/pyflow and github.com/pdm-project/pdm
        __pypackages__/
        
        # Celery stuff
        celerybeat-schedule
        celerybeat.pid
        
        # SageMath parsed files
        *.sage.py
        
        # Environments
        .env
        .venv
        env/
        venv/
        ENV/
        env.bak/
        venv.bak/
        
        # Spyder project settings
        .spyderproject
        .spyproject
        
        # Rope project settings
        .ropeproject
        
        # mkdocs documentation
        /site
        
        # mypy
        .mypy_cache/
        .dmypy.json
        dmypy.json
        
        # Pyre type checker
        .pyre/
        
        # pytype static type analyzer
        .pytype/
        
        # Cython debug symbols
        cython_debug/
        
        # PyCharm
        #  JetBrains specific template is maintained in a separate JetBrains.gitignore that can
        #  be found at https://github.com/github/gitignore/blob/main/Global/JetBrains.gitignore
        #  and can be added to the global gitignore or merged into this file.  For a more nuclear
        #  option (not recommended) you can uncomment the following to ignore the entire idea folder.
        #.idea/
        
        # IDE files
        .vscode/
        
        # Migrations
        **/migrations/*
        !**/migrations/__init__.py
    `
}

function generateCI() : Generated {
    return expandToStringWithNL`
        variables:
            PIP_CACHE_DIR: "$CI_PROJECT_DIR/.cache/pip"
            SONAR_USER_HOME: "\${CI_PROJECT_DIR}/.sonar" # Defines the location of the analysis task cache
            GIT_DEPTH: "0" # Tells git to fetch all the branches of the project, required by the analysis task
            IMAGE_REGISTRY_NAME: $CI_REGISTRY_IMAGE
            IMAGE_TAG: $CI_COMMIT_REF_SLUG
            # Tell 'docker:dind' to enable TLS (recommended)
            # and generate certificates in the specified directory.
            DOCKER_TLS_CERTDIR: "/certs"

        cache:
            paths:
                - .cache/pip
        stages:
            - lint-test
            - sonarcloud-check
            - bump
            - build
            - deploy
            - notification

        lint-test:
            image: python:3.10-alpine
            stage: lint-test
            cache:
                paths:
                    - .cache/pip

            before_script:
                - python -V
                - python -m venv venv
                - source venv/bin/activate
                - pip install flake8 pytest
            script:
                - echo "====== Running lint ======"
                - flake8
                - echo "====== Running tests ======"
                - pytest
            only:
                - dev
                - main

        sonarcloud-check:
            image:
                name: sonarsource/sonar-scanner-cli:latest
                entrypoint: [""]
            stage: sonarcloud-check
            cache:
                key: "\${CI_JOB_NAME}"
                paths:
                    - .sonar/cache
            script:
                - sonar-scanner -X
            only:
                - merge_requests
                - main
                - dev

        bump:
            image: python:3.10-slim
            stage: bump
            cache:
                paths:
                    - version
            before_script:
                - "which ssh-agent || ( apt-get update -qy && apt-get install openssh-client git -qqy )"
                - eval \`ssh-agent -s\`
                - echo "\${GITLAB_SSH_PRIVATE_KEY}" | tr -d '\\r' | ssh-add - > /dev/null
                - mkdir -p ~/.ssh
                - chmod 700 ~/.ssh
                - echo "$GITLAB_SSH_PRIVATE_KEY" >> ~/.ssh/id_rsa.pub
                - '[[ -f /.dockerenv ]] && echo -e "Host *\\n\\tStrictHostKeyChecking no\\n\\n" > ~/.ssh/config'
                - pip install -U commitizen
            script:
                - git remote set-url origin $CI_PROJECT_PATH
                - git config --global user.email "\${USERNAME}" && git config --global user.name "\${GITLAB_USERNAME}"
                - 'exists=\`git show-ref refs/heads/main\` && if [ -n "$exists" ]; then git branch -D main; fi'
                - git checkout -b main
                - echo "====== Bumping version ======"
                - cz bump --yes
                - git push origin main:$CI_COMMIT_REF_NAME
                - TAG=$(head -n 1 VERSION)
                - echo $TAG > version
                - git push origin $TAG
            only:
                - main

        build_dev:
            image: docker/compose:1.29.2
            stage: build
            services:
                - docker:dind
            before_script:
                - export TAG=dev
                - touch .env-onboarding
                - echo "===========Building stage Homol image $IMAGE_REGISTRY_NAME:$TAG==========="
                - docker-compose -f homol.yml build
            script:
                - docker login registry.gitlab.com --username=$USERNAME --password=$PASSWORD
                - docker push $IMAGE_REGISTRY_NAME:$TAG
            only:
                - dev

        deploy_dev:
            image: ubuntu:latest
            stage: deploy
            artifacts:
                paths:
                    - dist/*.whl
            before_script:
                - apt-get update -qq
                - "which ssh-agent || ( apt-get install -qq openssh-client )"
                - eval $(ssh-agent -s)
                - echo "$SSH_PRIVATE_KEY_DEV" | tr -d '\\r' | ssh-add -
                - mkdir -p ~/.ssh
                - chmod 700 ~/.ssh
                - export TAG=dev
            script:
                # - scp -o StrictHostKeyChecking=no homol.yml $MACHINE_HOST_DEV:~/
                - scp -o StrictHostKeyChecking=no conf.d/local.conf $MACHINE_HOST_DEV:~/conf.d/
                - ssh -o StrictHostKeyChecking=no $MACHINE_HOST_DEV "sudo docker login
                registry.gitlab.com --username=$USERNAME --password=$PASSWORD &&
                sudo docker pull $IMAGE_REGISTRY_NAME:$TAG &&
                export IMAGE_REGISTRY_NAME=$IMAGE_REGISTRY_NAME &&
                export TAG=$TAG && docker-compose -f homol.yml stop &&
                sudo docker container prune -f && docker-compose -f homol.yml up -d"
            only:
                - dev

        build_prod:
            image: docker/compose:1.29.2
            stage: build
            services:
                - docker:dind
            cache:
                paths:
                    - version
            before_script:
                - export TAG=$(cat version)
                - touch .env
                - echo "===========Building stage Prod image $IMAGE_REGISTRY_NAME:$TAG==========="
                - docker-compose -f prod.yml build
            script:
                - docker login registry.gitlab.com --username=$USERNAME --password=$PASSWORD
                - docker push $IMAGE_REGISTRY_NAME:$TAG
            only:
                - main

        deploy_main:
            image: ubuntu:latest
            stage: deploy
            artifacts:
                paths:
                    - dist/*.whl
            cache:
                paths:
                    - version
            before_script:
                - apt-get update -qq
                - "which ssh-agent || ( apt-get install -qq openssh-client )"
                - eval $(ssh-agent -s)
                - echo "$SSH_PRIVATE_KEY_PROD" | tr -d '\\r' | ssh-add -
                - mkdir -p ~/.ssh
                - chmod 700 ~/.ssh
                - export TAG=$(cat version)
            script:
                - scp -o StrictHostKeyChecking=no prod.yml $MACHINE_HOST_PROD:~/
                - scp -o StrictHostKeyChecking=no conf.d/local.conf $MACHINE_HOST_PROD:~/conf.d/
                - ssh -o StrictHostKeyChecking=no $MACHINE_HOST_PROD "sudo docker login
                registry.gitlab.com --username=$USERNAME --password=$PASSWORD &&
                sudo docker pull $IMAGE_REGISTRY_NAME:$TAG &&
                export IMAGE_REGISTRY_NAME=$IMAGE_REGISTRY_NAME &&
                export TAG=$TAG && docker-compose -f prod.yml stop &&
                sudo docker container prune -f && docker-compose -f prod.yml up -d"
            only:
                - main
    `
}

function generateSonarProperties() : Generated {
    return expandToStringWithNL`
        # Put your project key and organization here
        sonar.projectKey=
        sonar.organization=
        sonar.qualitygate.wait=true

        # This is the name and version displayed in the SonarCloud UI.
        sonar.projectName=
        sonar.python.version=3.10
        #sonar.projectVersion=1.0

        # Path is relative to the sonar-project.properties file. Replace "\" by "/" on Windows.
        # sonar.sources=.

        # Encoding of the source code. Default is default system encoding
        # sonar.sourceEncoding=UTF-8
    `
}

function generateDockerignore() : string {
    const lines = [
        `.gitignore`,
        `.envExample`,
        `.gitlab-ci.yml`,
        `.pre-commit-config.yaml`,
        `sonar-project.properties`,
        ``,
        `pyproject.toml`,
        `poetry.lock`,
        `pytest.ini`,
        `setup.cfg`,
        `venv`,
        `.venv`,
        `db.sqlite3`,
        `**/__pycache__`,
        `**/migrations/*`,
        `!**/migrations/__init__.py`,
        ``,
        `publish.sh`,
        `dist_command.sh`,
        ``
    ]

    return lines.join('\n')
}

function generateDockerfile(softwareName: string) : string {
    const lines = [
        `FROM python:3.10-slim-bullseye as python`,
        ``,
        `ENV DJANGO_SETTINGS_MODULE ${softwareName}.settings.local`,
        `ENV PIP_DISABLE_PIP_VERSION_CHECK 1`,
        `ENV DEBUG true`,
        ``,
        `WORKDIR /app`,
        ``,
        `COPY requirements.txt .`,
        ``,
        `# Install dependencies`,
        `RUN apt-get update && apt-get install build-essential gcc python3-dev musl-dev libpq-dev python3-dev libpq-dev libffi-dev -y`,
        `RUN pip install -r requirements.txt`,
        ``,
        `COPY . .`,
        ``,
        `RUN python manage.py collectstatic --noinput`,
        ``,
        `CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--reload", "--timeout=8000", "--workers=2", "${softwareName}.wsgi:application"]`,
        ``
    ]

    return lines.join('\n')
}

