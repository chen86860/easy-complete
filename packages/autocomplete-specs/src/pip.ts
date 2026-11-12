const listPackages: Fig.Generator = {
  script: ["pip", "list"],
  postProcess: function (out) {
    const lines = out.split("\n");
    const packages = [];
    for (let i = 2; i < lines.length; i++) {
      packages.push({
        name: lines[i],
        icon: "🐍",
      });
    }
    return packages;
  },
};

// Accessible through ES imports - e.g. import { packageList } from "./pip"
export const packageList: Array<Fig.Suggestion> = [
  {
    name: "urllib3",
    icon: "📦",
  },
  {
    name: "six",
    icon: "📦",
  },
  {
    name: "botocore",
    icon: "📦",
  },
  {
    name: "requests",
    icon: "📦",
  },
  {
    name: "python-dateutil",
    icon: "📦",
  },
  {
    name: "setuptools",
    icon: "📦",
  },
  {
    name: "certifi",
    icon: "📦",
  },
  {
    name: "idna",
    icon: "📦",
  },
  {
    name: "s3transfer",
    icon: "📦",
  },
  {
    name: "chardet",
    icon: "📦",
  },
  {
    name: "pyyaml",
    icon: "📦",
  },
  {
    name: "pip",
    icon: "📦",
  },
  {
    name: "docutils",
    icon: "📦",
  },
  {
    name: "jmespath",
    icon: "📦",
  },
  {
    name: "rsa",
    icon: "📦",
  },
  {
    name: "pyasn1",
    icon: "📦",
  },
  {
    name: "boto3",
    icon: "📦",
  },
  {
    name: "numpy",
    icon: "📦",
  },
  {
    name: "wheel",
    icon: "📦",
  },
  {
    name: "pytz",
    icon: "📦",
  },
  {
    name: "awscli",
    icon: "📦",
  },
  {
    name: "colorama",
    icon: "📦",
  },
  {
    name: "cffi",
    icon: "📦",
  },
  {
    name: "markupsafe",
    icon: "📦",
  },
  {
    name: "protobuf",
    icon: "📦",
  },
  {
    name: "quick-mail",
    icon: "📦",
  },
  {
    name: "jinja2",
    icon: "📦",
  },
  {
    name: "attrs",
    icon: "📦",
  },
  {
    name: "cryptography",
    icon: "📦",
  },
  {
    name: "importlib-metadata",
    icon: "📦",
  },
  {
    name: "pycparser",
    icon: "📦",
  },
  {
    name: "zipp",
    icon: "📦",
  },
  {
    name: "click",
    icon: "📦",
  },
  {
    name: "requests-oauthlib",
    icon: "📦",
  },
  {
    name: "oauthlib",
    icon: "📦",
  },
  {
    name: "pandas",
    icon: "📦",
  },
  {
    name: "pyparsing",
    icon: "📦",
  },
  {
    name: "pyasn1-modules",
    icon: "📦",
  },
  {
    name: "futures",
    icon: "📦",
  },
  {
    name: "future",
    icon: "📦",
  },
  {
    name: "google-auth",
    icon: "📦",
  },
  {
    name: "cachetools",
    icon: "📦",
  },
  {
    name: "packaging",
    icon: "📦",
  },
  {
    name: "decorator",
    icon: "📦",
  },
  {
    name: "scipy",
    icon: "📦",
  },
  {
    name: "werkzeug",
    icon: "📦",
  },
  {
    name: "simplejson",
    icon: "📦",
  },
  {
    name: "google-api-core",
    icon: "📦",
  },
  {
    name: "jsonschema",
    icon: "📦",
  },
  {
    name: "pygments",
    icon: "📦",
  },
  {
    name: "pyrsistent",
    icon: "📦",
  },
  {
    name: "pillow",
    icon: "📦",
  },
  {
    name: "pyjwt",
    icon: "📦",
  },
  {
    name: "wcwidth",
    icon: "📦",
  },
  {
    name: "py",
    icon: "📦",
  },
  {
    name: "pytest",
    icon: "📦",
  },
  {
    name: "googleapis-common-protos",
    icon: "📦",
  },
  {
    name: "psutil",
    icon: "📦",
  },
  {
    name: "google-cloud-core",
    icon: "📦",
  },
  {
    name: "grpcio",
    icon: "📦",
  },
  {
    name: "google-resumable-media",
    icon: "📦",
  },
  {
    name: "lxml",
    icon: "📦",
  },
  {
    name: "pluggy",
    icon: "📦",
  },
  {
    name: "isodate",
    icon: "📦",
  },
  {
    name: "google-cloud-storage",
    icon: "📦",
  },
  {
    name: "wrapt",
    icon: "📦",
  },
  {
    name: "more-itertools",
    icon: "📦",
  },
  {
    name: "flask",
    icon: "📦",
  },
  {
    name: "google-api-python-client",
    icon: "📦",
  },
  {
    name: "scikit-learn",
    icon: "📦",
  },
  {
    name: "sqlalchemy",
    icon: "📦",
  },
  {
    name: "websocket-client",
    icon: "📦",
  },
  {
    name: "joblib",
    icon: "📦",
  },
  {
    name: "coverage",
    icon: "📦",
  },
  {
    name: "itsdangerous",
    icon: "📦",
  },
  {
    name: "pyopenssl",
    icon: "📦",
  },
  {
    name: "msrest",
    icon: "📦",
  },
  {
    name: "uritemplate",
    icon: "📦",
  },
  {
    name: "entrypoints",
    icon: "📦",
  },
  {
    name: "appdirs",
    icon: "📦",
  },
  {
    name: "pexpect",
    icon: "📦",
  },
  {
    name: "tornado",
    icon: "📦",
  },
  {
    name: "defusedxml",
    icon: "📦",
  },
  {
    name: "tqdm",
    icon: "📦",
  },
  {
    name: "ptyprocess",
    icon: "📦",
  },
  {
    name: "prompt-toolkit",
    icon: "📦",
  },
  {
    name: "redis",
    icon: "📦",
  },
  {
    name: "azure-storage-blob",
    icon: "📦",
  },
  {
    name: "prometheus-client",
    icon: "📦",
  },
  {
    name: "virtualenv",
    icon: "📦",
  },
  {
    name: "httplib2",
    icon: "📦",
  },
  {
    name: "ipython",
    icon: "📦",
  },
  {
    name: "bleach",
    icon: "📦",
  },
  {
    name: "matplotlib",
    icon: "📦",
  },
  {
    name: "webencodings",
    icon: "📦",
  },
  {
    name: "toml",
    icon: "📦",
  },
  {
    name: "enum34",
    icon: "📦",
  },
  {
    name: "google-auth-httplib2",
    icon: "📦",
  },
  {
    name: "typing-extensions",
    icon: "📦",
  },
  {
    name: "tensorflow",
    icon: "📦",
  },
  {
    name: "traitlets",
    icon: "📦",
  },
  {
    name: "configparser",
    icon: "📦",
  },
  {
    name: "multidict",
    icon: "📦",
  },
  {
    name: "ipython-genutils",
    icon: "📦",
  },
  {
    name: "openai",
    icon: "📦",
  },
  {
    name: "mccabe",
    icon: "📦",
  },
  {
    name: "absl-py",
    icon: "📦",
  },
  {
    name: "beautifulsoup4",
    icon: "📦",
  },
  {
    name: "pickleshare",
    icon: "📦",
  },
  {
    name: "bcrypt",
    icon: "📦",
  },
  {
    name: "docker",
    icon: "📦",
  },
  {
    name: "tabulate",
    icon: "📦",
  },
  {
    name: "filelock",
    icon: "📦",
  },
  {
    name: "google-cloud-bigquery",
    icon: "📦",
  },
  {
    name: "yarl",
    icon: "📦",
  },
  {
    name: "azure-common",
    icon: "📦",
  },
  {
    name: "google-auth-oauthlib",
    icon: "📦",
  },
  {
    name: "ipaddress",
    icon: "📦",
  },
  {
    name: "boto",
    icon: "📦",
  },
  {
    name: "pyzmq",
    icon: "📦",
  },
  {
    name: "pynacl",
    icon: "📦",
  },
  {
    name: "pycodestyle",
    icon: "📦",
  },
  {
    name: "paramiko",
    icon: "📦",
  },
  {
    name: "tensorboard",
    icon: "📦",
  },
  {
    name: "mock",
    icon: "📦",
  },
  {
    name: "psycopg2-binary",
    icon: "📦",
  },
  {
    name: "aiohttp",
    icon: "📦",
  },
  {
    name: "kiwisolver",
    icon: "📦",
  },
  {
    name: "regex",
    icon: "📦",
  },
  {
    name: "gunicorn",
    icon: "📦",
  },
  {
    name: "typed-ast",
    icon: "📦",
  },
  {
    name: "soupsieve",
    icon: "📦",
  },
  {
    name: "nbformat",
    icon: "📦",
  },
  {
    name: "tensorflow-estimator",
    icon: "📦",
  },
  {
    name: "jupyter-core",
    icon: "📦",
  },
  {
    name: "async-timeout",
    icon: "📦",
  },
  {
    name: "cycler",
    icon: "📦",
  },
  {
    name: "azure-core",
    icon: "📦",
  },
  {
    name: "mistune",
    icon: "📦",
  },
  {
    name: "nbconvert",
    icon: "📦",
  },
  {
    name: "jupyter-client",
    icon: "📦",
  },
  {
    name: "pbr",
    icon: "📦",
  },
  {
    name: "typing",
    icon: "📦",
  },
  {
    name: "ipykernel",
    icon: "📦",
  },
  {
    name: "markdown",
    icon: "📦",
  },
  {
    name: "babel",
    icon: "📦",
  },
  {
    name: "testpath",
    icon: "📦",
  },
  {
    name: "pandocfilters",
    icon: "📦",
  },
  {
    name: "notebook",
    icon: "📦",
  },
  {
    name: "pyarrow",
    icon: "📦",
  },
  {
    name: "argparse",
    icon: "📦",
  },
  {
    name: "distlib",
    icon: "📦",
  },
  {
    name: "gitpython",
    icon: "📦",
  },
  {
    name: "dnspython",
    icon: "📦",
  },
  {
    name: "terminado",
    icon: "📦",
  },
  {
    name: "send2trash",
    icon: "📦",
  },
  {
    name: "jedi",
    icon: "📦",
  },
  {
    name: "pyflakes",
    icon: "📦",
  },
  {
    name: "parso",
    icon: "📦",
  },
  {
    name: "lazy-object-proxy",
    icon: "📦",
  },
  {
    name: "isort",
    icon: "📦",
  },
  {
    name: "asn1crypto",
    icon: "📦",
  },
  {
    name: "ujson",
    icon: "📦",
  },
  {
    name: "widgetsnbextension",
    icon: "📦",
  },
  {
    name: "ipywidgets",
    icon: "📦",
  },
  {
    name: "sqlparse",
    icon: "📦",
  },
  {
    name: "termcolor",
    icon: "📦",
  },
  {
    name: "flake8",
    icon: "📦",
  },
  {
    name: "backcall",
    icon: "📦",
  },
  {
    name: "cython",
    icon: "📦",
  },
  {
    name: "h5py",
    icon: "📦",
  },
  {
    name: "py4j",
    icon: "📦",
  },
  {
    name: "tzlocal",
    icon: "📦",
  },
  {
    name: "contextlib2",
    icon: "📦",
  },
  {
    name: "tensorflow-metadata",
    icon: "📦",
  },
  {
    name: "requests-toolbelt",
    icon: "📦",
  },
  {
    name: "oauth2client",
    icon: "📦",
  },
  {
    name: "pymongo",
    icon: "📦",
  },
  {
    name: "adal",
    icon: "📦",
  },
  {
    name: "psycopg2",
    icon: "📦",
  },
  {
    name: "smart-open",
    icon: "📦",
  },
  {
    name: "jupyter-console",
    icon: "📦",
  },
  {
    name: "qtconsole",
    icon: "📦",
  },
  {
    name: "jupyter",
    icon: "📦",
  },
  {
    name: "msgpack",
    icon: "📦",
  },
  {
    name: "pathlib2",
    icon: "📦",
  },
  {
    name: "retrying",
    icon: "📦",
  },
  {
    name: "importlib-resources",
    icon: "📦",
  },
  {
    name: "dill",
    icon: "📦",
  },
  {
    name: "networkx",
    icon: "📦",
  },
  {
    name: "azure-devops",
    icon: "📦",
  },
  {
    name: "smmap",
    icon: "📦",
  },
  {
    name: "tensorflow-serving-api",
    icon: "📦",
  },
  {
    name: "tensorflow-transform",
    icon: "📦",
  },
  {
    name: "sortedcontainers",
    icon: "📦",
  },
  {
    name: "fsspec",
    icon: "📦",
  },
  {
    name: "cloudpickle",
    icon: "📦",
  },
  {
    name: "pyspark",
    icon: "📦",
  },
  {
    name: "gast",
    icon: "📦",
  },
  {
    name: "google-cloud-logging",
    icon: "📦",
  },
  {
    name: "websockets",
    icon: "📦",
  },
  {
    name: "xlrd",
    icon: "📦",
  },
  {
    name: "pytest-cov",
    icon: "📦",
  },
  {
    name: "azure-storage-common",
    icon: "📦",
  },
  {
    name: "gensim",
    icon: "📦",
  },
  {
    name: "mako",
    icon: "📦",
  },
  {
    name: "atomicwrites",
    icon: "📦",
  },
  {
    name: "qtpy",
    icon: "📦",
  },
  {
    name: "alembic",
    icon: "📦",
  },
  {
    name: "astroid",
    icon: "📦",
  },
  {
    name: "keras-preprocessing",
    icon: "📦",
  },
  {
    name: "docopt",
    icon: "📦",
  },
  {
    name: "gitdb",
    icon: "📦",
  },
  {
    name: "pymysql",
    icon: "📦",
  },
  {
    name: "distro",
    icon: "📦",
  },
  {
    name: "zope-interface",
    icon: "📦",
  },
  {
    name: "tfx-bsl",
    icon: "📦",
  },
  {
    name: "pylint",
    icon: "📦",
  },
  {
    name: "pandas-gbq",
    icon: "📦",
  },
  {
    name: "django",
    icon: "📦",
  },
  {
    name: "datadog",
    icon: "📦",
  },
  {
    name: "pydata-google-auth",
    icon: "📦",
  },
  {
    name: "ordereddict",
    icon: "📦",
  },
  {
    name: "msrestazure",
    icon: "📦",
  },
  {
    name: "pycryptodomex",
    icon: "📦",
  },
  {
    name: "pathspec",
    icon: "📦",
  },
  {
    name: "scandir",
    icon: "📦",
  },
  {
    name: "xmltodict",
    icon: "📦",
  },
  {
    name: "python-editor",
    icon: "📦",
  },
  {
    name: "tensorflow-data-validation",
    icon: "📦",
  },
  {
    name: "funcsigs",
    icon: "📦",
  },
  {
    name: "slackclient",
    icon: "📦",
  },
  {
    name: "tensorflow-model-analysis",
    icon: "📦",
  },
  {
    name: "gcsfs",
    icon: "📦",
  },
  {
    name: "ruamel-yaml",
    icon: "📦",
  },
  {
    name: "nltk",
    icon: "📦",
  },
  {
    name: "google-pasta",
    icon: "📦",
  },
  {
    name: "mypy-extensions",
    icon: "📦",
  },
  {
    name: "pycryptodome",
    icon: "📦",
  },
  {
    name: "s3fs",
    icon: "📦",
  },
  {
    name: "cached-property",
    icon: "📦",
  },
  {
    name: "pytest-runner",
    icon: "📦",
  },
  {
    name: "elasticsearch",
    icon: "📦",
  },
  {
    name: "keras-applications",
    icon: "📦",
  },
  {
    name: "ansible",
    icon: "📦",
  },
  {
    name: "azure-nspkg",
    icon: "📦",
  },
  {
    name: "jsonpickle",
    icon: "📦",
  },
  {
    name: "marshmallow",
    icon: "📦",
  },
  {
    name: "google-crc32c",
    icon: "📦",
  },
  {
    name: "rfc3986",
    icon: "📦",
  },
  {
    name: "pycrypto",
    icon: "📦",
  },
  {
    name: "astor",
    icon: "📦",
  },
  {
    name: "ruamel-yaml-clib",
    icon: "📦",
  },
  {
    name: "xlsxwriter",
    icon: "📦",
  },
  {
    name: "singledispatch",
    icon: "📦",
  },
  {
    name: "setuptools-scm",
    icon: "📦",
  },
  {
    name: "backports-functools-lru-cache",
    icon: "📦",
  },
  {
    name: "applicationinsights",
    icon: "📦",
  },
  {
    name: "mypy",
    icon: "📦",
  },
  {
    name: "greenlet",
    icon: "📦",
  },
  {
    name: "simplegeneric",
    icon: "📦",
  },
  {
    name: "h11",
    icon: "📦",
  },
  {
    name: "openpyxl",
    icon: "📦",
  },
  {
    name: "pyodbc",
    icon: "📦",
  },
  {
    name: "text-unidecode",
    icon: "📦",
  },
  {
    name: "jdcal",
    icon: "📦",
  },
  {
    name: "oscrypto",
    icon: "📦",
  },
  {
    name: "bs4",
    icon: "📦",
  },
  {
    name: "et-xmlfile",
    icon: "📦",
  },
  {
    name: "argon2-cffi",
    icon: "📦",
  },
  {
    name: "backports-shutil-get-terminal-size",
    icon: "📦",
  },
  {
    name: "monotonic",
    icon: "📦",
  },
  {
    name: "databricks-cli",
    icon: "📦",
  },
  {
    name: "backports-abc",
    icon: "📦",
  },
  {
    name: "selenium",
    icon: "📦",
  },
  {
    name: "xgboost",
    icon: "📦",
  },
  {
    name: "sentry-sdk",
    icon: "📦",
  },
  {
    name: "snowflake-connector-python",
    icon: "📦",
  },
  {
    name: "plotly",
    icon: "📦",
  },
  {
    name: "uvloop",
    icon: "📦",
  },
  {
    name: "opt-einsum",
    icon: "📦",
  },
  {
    name: "snowballstemmer",
    icon: "📦",
  },
  {
    name: "ply",
    icon: "📦",
  },
  {
    name: "nose",
    icon: "📦",
  },
  {
    name: "gevent",
    icon: "📦",
  },
  {
    name: "aiofiles",
    icon: "📦",
  },
  {
    name: "black",
    icon: "📦",
  },
  {
    name: "tenacity",
    icon: "📦",
  },
  {
    name: "azure-mgmt-resource",
    icon: "📦",
  },
  {
    name: "async-generator",
    icon: "📦",
  },
  {
    name: "argcomplete",
    icon: "📦",
  },
  {
    name: "httptools",
    icon: "📦",
  },
  {
    name: "python-dotenv",
    icon: "📦",
  },
  {
    name: "opencv-python",
    icon: "📦",
  },
  {
    name: "mozlog",
    icon: "📦",
  },
  {
    name: "sniffio",
    icon: "📦",
  },
  {
    name: "html5lib",
    icon: "📦",
  },
  {
    name: "grpc-google-iam-v1",
    icon: "📦",
  },
  {
    name: "mozrunner",
    icon: "📦",
  },
  {
    name: "toolz",
    icon: "📦",
  },
  {
    name: "lockfile",
    icon: "📦",
  },
  {
    name: "iniconfig",
    icon: "📦",
  },
  {
    name: "unidecode",
    icon: "📦",
  },
  {
    name: "sphinx",
    icon: "📦",
  },
  {
    name: "kubernetes",
    icon: "📦",
  },
  {
    name: "kombu",
    icon: "📦",
  },
  {
    name: "secretstorage",
    icon: "📦",
  },
  {
    name: "httpx",
    icon: "📦",
  },
  {
    name: "netaddr",
    icon: "📦",
  },
  {
    name: "amqp",
    icon: "📦",
  },
  {
    name: "thrift",
    icon: "📦",
  },
  {
    name: "sklearn",
    icon: "📦",
  },
  {
    name: "ijson",
    icon: "📦",
  },
  {
    name: "threadpoolctl",
    icon: "📦",
  },
  {
    name: "celery",
    icon: "📦",
  },
  {
    name: "jeepney",
    icon: "📦",
  },
  {
    name: "discord-py",
    icon: "📦",
  },
  {
    name: "keras",
    icon: "📦",
  },
  {
    name: "functools32",
    icon: "📦",
  },
  {
    name: "shapely",
    icon: "📦",
  },
  {
    name: "nest-asyncio",
    icon: "📦",
  },
  {
    name: "statsmodels",
    icon: "📦",
  },
  {
    name: "geopy",
    icon: "📦",
  },
  {
    name: "lightgbm",
    icon: "📦",
  },
  {
    name: "virtualenv-clone",
    icon: "📦",
  },
  {
    name: "djangorestframework",
    icon: "📦",
  },
  {
    name: "azure-mgmt-storage",
    icon: "📦",
  },
  {
    name: "mysqlclient",
    icon: "📦",
  },
  {
    name: "aioopenssl",
    icon: "📦",
  },
  {
    name: "aiosasl",
    icon: "📦",
  },
  {
    name: "graphviz",
    icon: "📦",
  },
  {
    name: "sortedcollections",
    icon: "📦",
  },
  {
    name: "ecdsa",
    icon: "📦",
  },
  {
    name: "hpack",
    icon: "📦",
  },
  {
    name: "aioconsole",
    icon: "📦",
  },
  {
    name: "h2",
    icon: "📦",
  },
  {
    name: "hyperframe",
    icon: "📦",
  },
  {
    name: "portalocker",
    icon: "📦",
  },
  {
    name: "google-cloud-pubsub",
    icon: "📦",
  },
  {
    name: "nbclient",
    icon: "📦",
  },
  {
    name: "billiard",
    icon: "📦",
  },
  {
    name: "pysftp",
    icon: "📦",
  },
  {
    name: "keyring",
    icon: "📦",
  },
  {
    name: "arrow",
    icon: "📦",
  },
  {
    name: "aioxmpp",
    icon: "📦",
  },
  {
    name: "python-jose",
    icon: "📦",
  },
  {
    name: "gitdb2",
    icon: "📦",
  },
  {
    name: "sanic",
    icon: "📦",
  },
  {
    name: "querystring-parser",
    icon: "📦",
  },
  {
    name: "mlflow",
    icon: "📦",
  },
  {
    name: "imagesize",
    icon: "📦",
  },
  {
    name: "alabaster",
    icon: "📦",
  },
  {
    name: "jupyterlab-pygments",
    icon: "📦",
  },
  {
    name: "pipenv",
    icon: "📦",
  },
  {
    name: "tox",
    icon: "📦",
  },
  {
    name: "pytest-mock",
    icon: "📦",
  },
  {
    name: "fortnitepy",
    icon: "📦",
  },
  {
    name: "vine",
    icon: "📦",
  },
  {
    name: "apache-beam",
    icon: "📦",
  },
  {
    name: "fuzzywuzzy",
    icon: "📦",
  },
  {
    name: "pkginfo",
    icon: "📦",
  },
  {
    name: "inflection",
    icon: "📦",
  },
  {
    name: "unicodecsv",
    icon: "📦",
  },
  {
    name: "imageio",
    icon: "📦",
  },
  {
    name: "flask-cors",
    icon: "📦",
  },
  {
    name: "prometheus-flask-exporter",
    icon: "📦",
  },
  {
    name: "hstspreload",
    icon: "📦",
  },
  {
    name: "pytest-forked",
    icon: "📦",
  },
  {
    name: "faker",
    icon: "📦",
  },
  {
    name: "execnet",
    icon: "📦",
  },
  {
    name: "flask-sqlalchemy",
    icon: "📦",
  },
  {
    name: "humanfriendly",
    icon: "📦",
  },
  {
    name: "apipkg",
    icon: "📦",
  },
  {
    name: "pytest-xdist",
    icon: "📦",
  },
  {
    name: "watchdog",
    icon: "📦",
  },
  {
    name: "twisted",
    icon: "📦",
  },
  {
    name: "ua-parser",
    icon: "📦",
  },
  {
    name: "seaborn",
    icon: "📦",
  },
  {
    name: "fasteners",
    icon: "📦",
  },
  {
    name: "dataclasses",
    icon: "📦",
  },
  {
    name: "iso8601",
    icon: "📦",
  },
  {
    name: "azure-mgmt-containerregistry",
    icon: "📦",
  },
  {
    name: "subprocess32",
    icon: "📦",
  },
  {
    name: "azure-mgmt-keyvault",
    icon: "📦",
  },
  {
    name: "pywavelets",
    icon: "📦",
  },
  {
    name: "colorlog",
    icon: "📦",
  },
  {
    name: "patsy",
    icon: "📦",
  },
  {
    name: "jsonpointer",
    icon: "📦",
  },
  {
    name: "gorilla",
    icon: "📦",
  },
  {
    name: "pendulum",
    icon: "📦",
  },
  {
    name: "stevedore",
    icon: "📦",
  },
  {
    name: "ndg-httpsclient",
    icon: "📦",
  },
  {
    name: "asgiref",
    icon: "📦",
  },
  {
    name: "readme-renderer",
    icon: "📦",
  },
  {
    name: "kafka-python",
    icon: "📦",
  },
  {
    name: "incremental",
    icon: "📦",
  },
  {
    name: "deprecated",
    icon: "📦",
  },
  {
    name: "tensorboard-plugin-wit",
    icon: "📦",
  },
  {
    name: "responses",
    icon: "📦",
  },
  {
    name: "pyhamcrest",
    icon: "📦",
  },
  {
    name: "fastavro",
    icon: "📦",
  },
  {
    name: "aniso8601",
    icon: "📦",
  },
  {
    name: "msal",
    icon: "📦",
  },
  {
    name: "hvac",
    icon: "📦",
  },
  {
    name: "texttable",
    icon: "📦",
  },
  {
    name: "pytzdata",
    icon: "📦",
  },
  {
    name: "retry",
    icon: "📦",
  },
  {
    name: "ezfnsetup",
    icon: "📦",
  },
  {
    name: "backports-weakref",
    icon: "📦",
  },
  {
    name: "python-http-client",
    icon: "📦",
  },
  {
    name: "dask",
    icon: "📦",
  },
  {
    name: "cachecontrol",
    icon: "📦",
  },
  {
    name: "blessings",
    icon: "📦",
  },
  {
    name: "smmap2",
    icon: "📦",
  },
  {
    name: "mysql-connector-python",
    icon: "📦",
  },
  {
    name: "azure-datalake-store",
    icon: "📦",
  },
  {
    name: "docker-pycreds",
    icon: "📦",
  },
  {
    name: "astunparse",
    icon: "📦",
  },
  {
    name: "azure-keyvault",
    icon: "📦",
  },
  {
    name: "bottle",
    icon: "📦",
  },
  {
    name: "azure-storage-queue",
    icon: "📦",
  },
  {
    name: "scikit-image",
    icon: "📦",
  },
  {
    name: "sendgrid",
    icon: "📦",
  },
  {
    name: "pygsheets",
    icon: "📦",
  },
  {
    name: "mozdevice",
    icon: "📦",
  },
  {
    name: "sphinxcontrib-serializinghtml",
    icon: "📦",
  },
  {
    name: "discord",
    icon: "📦",
  },
  {
    name: "python-levenshtein",
    icon: "📦",
  },
  {
    name: "jsonpatch",
    icon: "📦",
  },
  {
    name: "blinker",
    icon: "📦",
  },
  {
    name: "mozinfo",
    icon: "📦",
  },
  {
    name: "mozprocess",
    icon: "📦",
  },
  {
    name: "azure-mgmt-authorization",
    icon: "📦",
  },
  {
    name: "google-cloud-datastore",
    icon: "📦",
  },
  {
    name: "backports-ssl-match-hostname",
    icon: "📦",
  },
  {
    name: "llvmlite",
    icon: "📦",
  },
  {
    name: "python-magic",
    icon: "📦",
  },
  {
    name: "azure-graphrbac",
    icon: "📦",
  },
  {
    name: "proto-plus",
    icon: "📦",
  },
  {
    name: "requests-file",
    icon: "📦",
  },
  {
    name: "avro-python3",
    icon: "📦",
  },
  {
    name: "torch",
    icon: "📦",
  },
  {
    name: "statsd",
    icon: "📦",
  },
  {
    name: "msal-extensions",
    icon: "📦",
  },
  {
    name: "service-identity",
    icon: "📦",
  },
  {
    name: "mozprofile",
    icon: "📦",
  },
  {
    name: "python-daemon",
    icon: "📦",
  },
  {
    name: "sphinxcontrib-htmlhelp",
    icon: "📦",
  },
  {
    name: "numba",
    icon: "📦",
  },
  {
    name: "sphinxcontrib-applehelp",
    icon: "📦",
  },
  {
    name: "idna-ssl",
    icon: "📦",
  },
  {
    name: "sphinxcontrib-devhelp",
    icon: "📦",
  },
  {
    name: "sphinxcontrib-qthelp",
    icon: "📦",
  },
  {
    name: "tldextract",
    icon: "📦",
  },
  {
    name: "azure-mgmt-nspkg",
    icon: "📦",
  },
  {
    name: "maxminddb",
    icon: "📦",
  },
  {
    name: "cssselect",
    icon: "📦",
  },
  {
    name: "freezegun",
    icon: "📦",
  },
  {
    name: "hyperlink",
    icon: "📦",
  },
  {
    name: "prettytable",
    icon: "📦",
  },
  {
    name: "automat",
    icon: "📦",
  },
  {
    name: "constantly",
    icon: "📦",
  },
  {
    name: "sphinxcontrib-jsmath",
    icon: "📦",
  },
  {
    name: "deepdiff",
    icon: "📦",
  },
  {
    name: "pathtools",
    icon: "📦",
  },
  {
    name: "s3cmd",
    icon: "📦",
  },
  {
    name: "pydot",
    icon: "📦",
  },
  {
    name: "python-json-logger",
    icon: "📦",
  },
  {
    name: "azure-mgmt-compute",
    icon: "📦",
  },
  {
    name: "wtforms",
    icon: "📦",
  },
  {
    name: "croniter",
    icon: "📦",
  },
  {
    name: "mozfile",
    icon: "📦",
  },
  {
    name: "azure-cosmosdb-table",
    icon: "📦",
  },
  {
    name: "hdfs",
    icon: "📦",
  },
  {
    name: "mozterm",
    icon: "📦",
  },
  {
    name: "raven",
    icon: "📦",
  },
  {
    name: "configobj",
    icon: "📦",
  },
  {
    name: "geoip2",
    icon: "📦",
  },
  {
    name: "google-cloud",
    icon: "📦",
  },
  {
    name: "nodeenv",
    icon: "📦",
  },
  {
    name: "identify",
    icon: "📦",
  },
  {
    name: "azure-cosmosdb-nspkg",
    icon: "📦",
  },
  {
    name: "jsondiff",
    icon: "📦",
  },
  {
    name: "pyproj",
    icon: "📦",
  },
  {
    name: "azure-identity",
    icon: "📦",
  },
  {
    name: "typing-inspect",
    icon: "📦",
  },
  {
    name: "python-slugify",
    icon: "📦",
  },
  {
    name: "django-cors-headers",
    icon: "📦",
  },
  {
    name: "pre-commit",
    icon: "📦",
  },
  {
    name: "backoff",
    icon: "📦",
  },
  {
    name: "azure-mgmt-network",
    icon: "📦",
  },
  {
    name: "tblib",
    icon: "📦",
  },
  {
    name: "cfgv",
    icon: "📦",
  },
  {
    name: "pycurl",
    icon: "📦",
  },
  {
    name: "pyhive",
    icon: "📦",
  },
  {
    name: "dockerpty",
    icon: "📦",
  },
  {
    name: "pypandoc",
    icon: "📦",
  },
  {
    name: "autopep8",
    icon: "📦",
  },
  {
    name: "crcmod",
    icon: "📦",
  },
  {
    name: "docker-compose",
    icon: "📦",
  },
  {
    name: "pathlib",
    icon: "📦",
  },
  {
    name: "google-cloud-bigtable",
    icon: "📦",
  },
  {
    name: "hiredis",
    icon: "📦",
  },
  {
    name: "holidays",
    icon: "📦",
  },
  {
    name: "gspread",
    icon: "📦",
  },
  {
    name: "grpcio-tools",
    icon: "📦",
  },
  {
    name: "azure-mgmt-datalake-nspkg",
    icon: "📦",
  },
  {
    name: "azure-mgmt-sql",
    icon: "📦",
  },
  {
    name: "voluptuous",
    icon: "📦",
  },
  {
    name: "azure-batch",
    icon: "📦",
  },
  {
    name: "django-filter",
    icon: "📦",
  },
  {
    name: "aws-xray-sdk",
    icon: "📦",
  },
  {
    name: "netifaces",
    icon: "📦",
  },
  {
    name: "pymssql",
    icon: "📦",
  },
  {
    name: "semantic-version",
    icon: "📦",
  },
  {
    name: "pysocks",
    icon: "📦",
  },
  {
    name: "promise",
    icon: "📦",
  },
  {
    name: "geographiclib",
    icon: "📦",
  },
  {
    name: "elasticsearch-dsl",
    icon: "📦",
  },
  {
    name: "pydantic",
    icon: "📦",
  },
  {
    name: "scp",
    icon: "📦",
  },
  {
    name: "django-extensions",
    icon: "📦",
  },
  {
    name: "zope-event",
    icon: "📦",
  },
  {
    name: "flask-wtf",
    icon: "📦",
  },
  {
    name: "pika",
    icon: "📦",
  },
  {
    name: "google-apitools",
    icon: "📦",
  },
  {
    name: "munch",
    icon: "📦",
  },
  {
    name: "azure-mgmt-rdbms",
    icon: "📦",
  },
  {
    name: "ordered-set",
    icon: "📦",
  },
  {
    name: "sphinx-rtd-theme",
    icon: "📦",
  },
  {
    name: "azure-servicebus",
    icon: "📦",
  },
  {
    name: "uwsgi",
    icon: "📦",
  },
  {
    name: "pywin32",
    icon: "📦",
  },
  {
    name: "user-agents",
    icon: "📦",
  },
  {
    name: "pytest-timeout",
    icon: "📦",
  },
  {
    name: "zope-deprecation",
    icon: "📦",
  },
  {
    name: "aws-sam-translator",
    icon: "📦",
  },
  {
    name: "simple-salesforce",
    icon: "📦",
  },
  {
    name: "pyaml",
    icon: "📦",
  },
  {
    name: "webrtcvad-wheels",
    icon: "📦",
  },
  {
    name: "sqlalchemy-utils",
    icon: "📦",
  },
  {
    name: "pyserial",
    icon: "📦",
  },
  {
    name: "aiobotocore",
    icon: "📦",
  },
  {
    name: "azure-mgmt-batch",
    icon: "📦",
  },
  {
    name: "azure-mgmt-cosmosdb",
    icon: "📦",
  },
  {
    name: "youtube-dl",
    icon: "📦",
  },
  {
    name: "lunardate",
    icon: "📦",
  },
  {
    name: "lz4",
    icon: "📦",
  },
  {
    name: "jpype1",
    icon: "📦",
  },
  {
    name: "azure-mgmt-datalake-store",
    icon: "📦",
  },
  {
    name: "sh",
    icon: "📦",
  },
  {
    name: "bz2file",
    icon: "📦",
  },
  {
    name: "humanize",
    icon: "📦",
  },
  {
    name: "tomlkit",
    icon: "📦",
  },
  {
    name: "influxdb",
    icon: "📦",
  },
  {
    name: "requests-aws4auth",
    icon: "📦",
  },
  {
    name: "cerberus",
    icon: "📦",
  },
  {
    name: "passlib",
    icon: "📦",
  },
  {
    name: "spacy",
    icon: "📦",
  },
  {
    name: "python3-openid",
    icon: "📦",
  },
  {
    name: "azure-mgmt-cdn",
    icon: "📦",
  },
  {
    name: "ephem",
    icon: "📦",
  },
  {
    name: "azure-mgmt-monitor",
    icon: "📦",
  },
  {
    name: "azure-mgmt-web",
    icon: "📦",
  },
  {
    name: "google-cloud-spanner",
    icon: "📦",
  },
  {
    name: "pycountry",
    icon: "📦",
  },
  {
    name: "yamllint",
    icon: "📦",
  },
  {
    name: "flask-login",
    icon: "📦",
  },
  {
    name: "azure-storage",
    icon: "📦",
  },
  {
    name: "thinc",
    icon: "📦",
  },
  {
    name: "httpcore",
    icon: "📦",
  },
  {
    name: "pygithub",
    icon: "📦",
  },
  {
    name: "bokeh",
    icon: "📦",
  },
  {
    name: "invoke",
    icon: "📦",
  },
  {
    name: "cfn-lint",
    icon: "📦",
  },
  {
    name: "moto",
    icon: "📦",
  },
  {
    name: "datetime",
    icon: "📦",
  },
  {
    name: "azure-mgmt-containerservice",
    icon: "📦",
  },
  {
    name: "awscli-cwlogs",
    icon: "📦",
  },
  {
    name: "emoji",
    icon: "📦",
  },
  {
    name: "twine",
    icon: "📦",
  },
  {
    name: "preshed",
    icon: "📦",
  },
  {
    name: "ipdb",
    icon: "📦",
  },
  {
    name: "azure-mgmt-datalake-analytics",
    icon: "📦",
  },
  {
    name: "sentencepiece",
    icon: "📦",
  },
  {
    name: "avro",
    icon: "📦",
  },
  {
    name: "pyperclip",
    icon: "📦",
  },
  {
    name: "murmurhash",
    icon: "📦",
  },
  {
    name: "mmh3",
    icon: "📦",
  },
  {
    name: "shellingham",
    icon: "📦",
  },
  {
    name: "multiprocess",
    icon: "📦",
  },
  {
    name: "requests-mock",
    icon: "📦",
  },
  {
    name: "aliyun-python-sdk-core",
    icon: "📦",
  },
  {
    name: "google-gax",
    icon: "📦",
  },
  {
    name: "cymem",
    icon: "📦",
  },
  {
    name: "azure-mgmt-devtestlabs",
    icon: "📦",
  },
  {
    name: "jira",
    icon: "📦",
  },
  {
    name: "webob",
    icon: "📦",
  },
  {
    name: "ddtrace",
    icon: "📦",
  },
  {
    name: "factory-boy",
    icon: "📦",
  },
  {
    name: "inflect",
    icon: "📦",
  },
  {
    name: "azure-mgmt-iothub",
    icon: "📦",
  },
  {
    name: "plac",
    icon: "📦",
  },
  {
    name: "codecov",
    icon: "📦",
  },
  {
    name: "marshmallow-enum",
    icon: "📦",
  },
  {
    name: "python-gflags",
    icon: "📦",
  },
  {
    name: "setproctitle",
    icon: "📦",
  },
  {
    name: "configargparse",
    icon: "📦",
  },
  {
    name: "django-storages",
    icon: "📦",
  },
  {
    name: "uamqp",
    icon: "📦",
  },
  {
    name: "phonenumbers",
    icon: "📦",
  },
  {
    name: "python-pam",
    icon: "📦",
  },
  {
    name: "blis",
    icon: "📦",
  },
  {
    name: "zeep",
    icon: "📦",
  },
  {
    name: "redis-py-cluster",
    icon: "📦",
  },
  {
    name: "azure-cli-core",
    icon: "📦",
  },
  {
    name: "aliyun-python-sdk-ecs",
    icon: "📦",
  },
  {
    name: "google",
    icon: "📦",
  },
  {
    name: "azure-mgmt-redis",
    icon: "📦",
  },
  {
    name: "srsly",
    icon: "📦",
  },
  {
    name: "antlr4-python3-runtime",
    icon: "📦",
  },
  {
    name: "aliyunsdkcore",
    icon: "📦",
  },
  {
    name: "pip-tools",
    icon: "📦",
  },
  {
    name: "azure-mgmt-loganalytics",
    icon: "📦",
  },
  {
    name: "azure-mgmt-dns",
    icon: "📦",
  },
  {
    name: "coloredlogs",
    icon: "📦",
  },
  {
    name: "confluent-kafka",
    icon: "📦",
  },
  {
    name: "newrelic",
    icon: "📦",
  },
  {
    name: "pep8",
    icon: "📦",
  },
  {
    name: "natsort",
    icon: "📦",
  },
  {
    name: "junit-xml",
    icon: "📦",
  },
  {
    name: "cx-oracle",
    icon: "📦",
  },
  {
    name: "azure-mgmt-containerinstance",
    icon: "📦",
  },
  {
    name: "wasabi",
    icon: "📦",
  },
  {
    name: "flask-restful",
    icon: "📦",
  },
  {
    name: "azure-mgmt-cognitiveservices",
    icon: "📦",
  },
  {
    name: "argh",
    icon: "📦",
  },
  {
    name: "pycalverter",
    icon: "📦",
  },
  {
    name: "azure-mgmt-eventhub",
    icon: "📦",
  },
  {
    name: "azure-mgmt-trafficmanager",
    icon: "📦",
  },
  {
    name: "azure-mgmt-media",
    icon: "📦",
  },
  {
    name: "pyluach",
    icon: "📦",
  },
  {
    name: "pox",
    icon: "📦",
  },
  {
    name: "backports-tempfile",
    icon: "📦",
  },
  {
    name: "poetry",
    icon: "📦",
  },
  {
    name: "azure-storage-nspkg",
    icon: "📦",
  },
  {
    name: "aenum",
    icon: "📦",
  },
  {
    name: "sympy",
    icon: "📦",
  },
  {
    name: "koalas",
    icon: "📦",
  },
  {
    name: "distributed",
    icon: "📦",
  },
  {
    name: "pytest-django",
    icon: "📦",
  },
  {
    name: "convertdate",
    icon: "📦",
  },
  {
    name: "numexpr",
    icon: "📦",
  },
  {
    name: "pydocstyle",
    icon: "📦",
  },
  {
    name: "pathos",
    icon: "📦",
  },
  {
    name: "pystan",
    icon: "📦",
  },
  {
    name: "parameterized",
    icon: "📦",
  },
  {
    name: "fire",
    icon: "📦",
  },
  {
    name: "parsedatetime",
    icon: "📦",
  },
  {
    name: "semver",
    icon: "📦",
  },
  {
    name: "progressbar2",
    icon: "📦",
  },
  {
    name: "parse",
    icon: "📦",
  },
  {
    name: "ppft",
    icon: "📦",
  },
  {
    name: "azureml-core",
    icon: "📦",
  },
  {
    name: "msgpack-python",
    icon: "📦",
  },
  {
    name: "pytest-html",
    icon: "📦",
  },
  {
    name: "azure-mgmt-iotcentral",
    icon: "📦",
  },
  {
    name: "python-utils",
    icon: "📦",
  },
  {
    name: "pystache",
    icon: "📦",
  },
  {
    name: "cleo",
    icon: "📦",
  },
  {
    name: "azure-kusto-data",
    icon: "📦",
  },
  {
    name: "graphql-core",
    icon: "📦",
  },
  {
    name: "pyrfc3339",
    icon: "📦",
  },
  {
    name: "python-gnupg",
    icon: "📦",
  },
  {
    name: "google-cloud-firestore",
    icon: "📦",
  },
  {
    name: "dateparser",
    icon: "📦",
  },
  {
    name: "pastel",
    icon: "📦",
  },
  {
    name: "kazoo",
    icon: "📦",
  },
  {
    name: "pymeeus",
    icon: "📦",
  },
  {
    name: "marshmallow-sqlalchemy",
    icon: "📦",
  },
  {
    name: "azure-mgmt-recoveryservicesbackup",
    icon: "📦",
  },
  {
    name: "knack",
    icon: "📦",
  },
  {
    name: "azure-mgmt-applicationinsights",
    icon: "📦",
  },
  {
    name: "pylev",
    icon: "📦",
  },
  {
    name: "azure-mgmt-eventgrid",
    icon: "📦",
  },
  {
    name: "heapdict",
    icon: "📦",
  },
  {
    name: "azure-mgmt-marketplaceordering",
    icon: "📦",
  },
  {
    name: "azure-mgmt-servicebus",
    icon: "📦",
  },
  {
    name: "click-plugins",
    icon: "📦",
  },
  {
    name: "azure-mgmt-servicefabric",
    icon: "📦",
  },
  {
    name: "zict",
    icon: "📦",
  },
  {
    name: "azure-mgmt-reservations",
    icon: "📦",
  },
  {
    name: "azure-mgmt-search",
    icon: "📦",
  },
  {
    name: "itypes",
    icon: "📦",
  },
  {
    name: "cachy",
    icon: "📦",
  },
  {
    name: "libcst",
    icon: "📦",
  },
  {
    name: "clikit",
    icon: "📦",
  },
  {
    name: "coreapi",
    icon: "📦",
  },
  {
    name: "azure-mgmt-recoveryservices",
    icon: "📦",
  },
  {
    name: "coreschema",
    icon: "📦",
  },
  {
    name: "pytest-metadata",
    icon: "📦",
  },
  {
    name: "apispec",
    icon: "📦",
  },
  {
    name: "google-cloud-monitoring",
    icon: "📦",
  },
  {
    name: "azure-mgmt-iothubprovisioningservices",
    icon: "📦",
  },
  {
    name: "azure-cosmos",
    icon: "📦",
  },
  {
    name: "azure-mgmt-msi",
    icon: "📦",
  },
  {
    name: "waitress",
    icon: "📦",
  },
  {
    name: "shap",
    icon: "📦",
  },
  {
    name: "azure-mgmt-advisor",
    icon: "📦",
  },
  {
    name: "linecache2",
    icon: "📦",
  },
  {
    name: "jellyfish",
    icon: "📦",
  },
  {
    name: "python-consul",
    icon: "📦",
  },
  {
    name: "azure-mgmt-billing",
    icon: "📦",
  },
  {
    name: "azure-mgmt-datafactory",
    icon: "📦",
  },
  {
    name: "azure-mgmt-consumption",
    icon: "📦",
  },
  {
    name: "azure-mgmt-batchai",
    icon: "📦",
  },
  {
    name: "supervisor",
    icon: "📦",
  },
  {
    name: "azure-loganalytics",
    icon: "📦",
  },
  {
    name: "gym",
    icon: "📦",
  },
  {
    name: "xlwt",
    icon: "📦",
  },
  {
    name: "stripe",
    icon: "📦",
  },
  {
    name: "azure-mgmt-policyinsights",
    icon: "📦",
  },
  {
    name: "azure-mgmt-relay",
    icon: "📦",
  },
  {
    name: "grpcio-gcp",
    icon: "📦",
  },
  {
    name: "fabric",
    icon: "📦",
  },
  {
    name: "cattrs",
    icon: "📦",
  },
  {
    name: "expiringdict",
    icon: "📦",
  },
  {
    name: "azure-storage-file",
    icon: "📦",
  },
  {
    name: "apscheduler",
    icon: "📦",
  },
  {
    name: "deprecation",
    icon: "📦",
  },
  {
    name: "django-debug-toolbar",
    icon: "📦",
  },
  {
    name: "imbalanced-learn",
    icon: "📦",
  },
  {
    name: "pypdf2",
    icon: "📦",
  },
  {
    name: "unittest2",
    icon: "📦",
  },
  {
    name: "ldap3",
    icon: "📦",
  },
  {
    name: "cognite-sdk",
    icon: "📦",
  },
  {
    name: "watchtower",
    icon: "📦",
  },
  {
    name: "setuptools-git",
    icon: "📦",
  },
  {
    name: "azure-mgmt-signalr",
    icon: "📦",
  },
  {
    name: "w3lib",
    icon: "📦",
  },
  {
    name: "eventlet",
    icon: "📦",
  },
  {
    name: "torchvision",
    icon: "📦",
  },
  {
    name: "google-cloud-vision",
    icon: "📦",
  },
  {
    name: "sshpubkeys",
    icon: "📦",
  },
  {
    name: "cligj",
    icon: "📦",
  },
  {
    name: "azure-mgmt-managementgroups",
    icon: "📦",
  },
  {
    name: "flask-caching",
    icon: "📦",
  },
  {
    name: "addict",
    icon: "📦",
  },
  {
    name: "traceback2",
    icon: "📦",
  },
  {
    name: "pydocumentdb",
    icon: "📦",
  },
  {
    name: "flask-babel",
    icon: "📦",
  },
  {
    name: "reportlab",
    icon: "📦",
  },
  {
    name: "cognite-model-hosting",
    icon: "📦",
  },
  {
    name: "ratelimit",
    icon: "📦",
  },
  {
    name: "azure-mgmt-datamigration",
    icon: "📦",
  },
  {
    name: "sphinxcontrib-websupport",
    icon: "📦",
  },
  {
    name: "aioitertools",
    icon: "📦",
  },
  {
    name: "hypothesis",
    icon: "📦",
  },
  {
    name: "twilio",
    icon: "📦",
  },
  {
    name: "email-validator",
    icon: "📦",
  },
  {
    name: "pycairo",
    icon: "📦",
  },
  {
    name: "sasl",
    icon: "📦",
  },
  {
    name: "azure-mgmt-maps",
    icon: "📦",
  },
  {
    name: "validators",
    icon: "📦",
  },
  {
    name: "tensorflow-hub",
    icon: "📦",
  },
  {
    name: "findspark",
    icon: "📦",
  },
  {
    name: "fbprophet",
    icon: "📦",
  },
  {
    name: "opencensus-context",
    icon: "📦",
  },
  {
    name: "azure",
    icon: "📦",
  },
  {
    name: "pyxdg",
    icon: "📦",
  },
  {
    name: "strict-rfc3339",
    icon: "📦",
  },
  {
    name: "pypika",
    icon: "📦",
  },
  {
    name: "opentracing",
    icon: "📦",
  },
  {
    name: "pycares",
    icon: "📦",
  },
  {
    name: "dicttoxml",
    icon: "📦",
  },
  {
    name: "catalogue",
    icon: "📦",
  },
  {
    name: "flask-migrate",
    icon: "📦",
  },
  {
    name: "whitenoise",
    icon: "📦",
  },
  {
    name: "flask-admin",
    icon: "📦",
  },
  {
    name: "django-redis",
    icon: "📦",
  },
  {
    name: "ml-metadata",
    icon: "📦",
  },
  {
    name: "azure-servicemanagement-legacy",
    icon: "📦",
  },
  {
    name: "flask-jwt-extended",
    icon: "📦",
  },
  {
    name: "azure-servicefabric",
    icon: "📦",
  },
  {
    name: "brotli",
    icon: "📦",
  },
  {
    name: "pygobject",
    icon: "📦",
  },
  {
    name: "fiona",
    icon: "📦",
  },
  {
    name: "opencensus",
    icon: "📦",
  },
  {
    name: "commonmark",
    icon: "📦",
  },
  {
    name: "thrift-sasl",
    icon: "📦",
  },
  {
    name: "authlib",
    icon: "📦",
  },
  {
    name: "feedparser",
    icon: "📦",
  },
  {
    name: "yapf",
    icon: "📦",
  },
  {
    name: "rx",
    icon: "📦",
  },
  {
    name: "slacker",
    icon: "📦",
  },
  {
    name: "blobfile",
    icon: "📦",
  },
  {
    name: "azure-mgmt-logic",
    icon: "📦",
  },
  {
    name: "azure-mgmt",
    icon: "📦",
  },
  {
    name: "requests-futures",
    icon: "📦",
  },
  {
    name: "python-snappy",
    icon: "📦",
  },
  {
    name: "stringcase",
    icon: "📦",
  },
  {
    name: "structlog",
    icon: "📦",
  },
  {
    name: "python-mimeparse",
    icon: "📦",
  },
  {
    name: "tld",
    icon: "📦",
  },
  {
    name: "uptime",
    icon: "📦",
  },
  {
    name: "dotnetcore2",
    icon: "📦",
  },
  {
    name: "bandit",
    icon: "📦",
  },
  {
    name: "mysql-connector",
    icon: "📦",
  },
  {
    name: "pytest-rerunfailures",
    icon: "📦",
  },
  {
    name: "azure-mgmt-scheduler",
    icon: "📦",
  },
  {
    name: "flask-appbuilder",
    icon: "📦",
  },
  {
    name: "plumbum",
    icon: "📦",
  },
  {
    name: "azure-eventgrid",
    icon: "📦",
  },
  {
    name: "pytest-asyncio",
    icon: "📦",
  },
  {
    name: "tokenizers",
    icon: "📦",
  },
  {
    name: "python-jenkins",
    icon: "📦",
  },
  {
    name: "sacremoses",
    icon: "📦",
  },
  {
    name: "filemagic",
    icon: "📦",
  },
  {
    name: "jaydebeapi",
    icon: "📦",
  },
  {
    name: "google-cloud-language",
    icon: "📦",
  },
  {
    name: "binaryornot",
    icon: "📦",
  },
  {
    name: "intel-openmp",
    icon: "📦",
  },
  {
    name: "py-bcrypt",
    icon: "📦",
  },
  {
    name: "azure-mgmt-subscription",
    icon: "📦",
  },
  {
    name: "mkl",
    icon: "📦",
  },
  {
    name: "apache-airflow",
    icon: "📦",
  },
  {
    name: "mpmath",
    icon: "📦",
  },
  {
    name: "aspy-yaml",
    icon: "📦",
  },
  {
    name: "parsel",
    icon: "📦",
  },
  {
    name: "azure-kusto-ingest",
    icon: "📦",
  },
  {
    name: "azure-cli-telemetry",
    icon: "📦",
  },
  {
    name: "multi-key-dict",
    icon: "📦",
  },
  {
    name: "typeguard",
    icon: "📦",
  },
  {
    name: "pyglet",
    icon: "📦",
  },
  {
    name: "pkgconfig",
    icon: "📦",
  },
  {
    name: "google-cloud-videointelligence",
    icon: "📦",
  },
  {
    name: "python-crontab",
    icon: "📦",
  },
  {
    name: "bitarray",
    icon: "📦",
  },
  {
    name: "azure-mgmt-notificationhubs",
    icon: "📦",
  },
  {
    name: "wandb",
    icon: "📦",
  },
  {
    name: "azure-mgmt-managementpartner",
    icon: "📦",
  },
  {
    name: "geojson",
    icon: "📦",
  },
  {
    name: "geopandas",
    icon: "📦",
  },
  {
    name: "fakeredis",
    icon: "📦",
  },
  {
    name: "olefile",
    icon: "📦",
  },
  {
    name: "cliff",
    icon: "📦",
  },
  {
    name: "terminaltables",
    icon: "📦",
  },
  {
    name: "repoze-lru",
    icon: "📦",
  },
  {
    name: "cchardet",
    icon: "📦",
  },
  {
    name: "cookiecutter",
    icon: "📦",
  },
  {
    name: "bitstring",
    icon: "📦",
  },
  {
    name: "queuelib",
    icon: "📦",
  },
  {
    name: "pydispatcher",
    icon: "📦",
  },
  {
    name: "tftpy",
    icon: "📦",
  },
  {
    name: "tensorflow-gpu",
    icon: "📦",
  },
  {
    name: "tifffile",
    icon: "📦",
  },
  {
    name: "azure-mgmt-commerce",
    icon: "📦",
  },
  {
    name: "azure-mgmt-powerbiembedded",
    icon: "📦",
  },
  {
    name: "pg8000",
    icon: "📦",
  },
  {
    name: "azure-mgmt-hanaonazure",
    icon: "📦",
  },
  {
    name: "azure-mgmt-machinelearningcompute",
    icon: "📦",
  },
  {
    name: "cmd2",
    icon: "📦",
  },
  {
    name: "mongoengine",
    icon: "📦",
  },
  {
    name: "azure-cli-nspkg",
    icon: "📦",
  },
  {
    name: "transformers",
    icon: "📦",
  },
  {
    name: "scikit-optimize",
    icon: "📦",
  },
  {
    name: "scrapy",
    icon: "📦",
  },
  {
    name: "dj-database-url",
    icon: "📦",
  },
  {
    name: "qrcode",
    icon: "📦",
  },
  {
    name: "poyo",
    icon: "📦",
  },
  {
    name: "azureml-dataprep",
    icon: "📦",
  },
  {
    name: "jsmin",
    icon: "📦",
  },
  {
    name: "jinja2-time",
    icon: "📦",
  },
  {
    name: "google-cloud-kms",
    icon: "📦",
  },
  {
    name: "flask-swagger",
    icon: "📦",
  },
  {
    name: "azureml-dataprep-native",
    icon: "📦",
  },
  {
    name: "pyfarmhash",
    icon: "📦",
  },
  {
    name: "html2text",
    icon: "📦",
  },
  {
    name: "partd",
    icon: "📦",
  },
  {
    name: "google-cloud-bigquery-storage",
    icon: "📦",
  },
  {
    name: "korean-lunar-calendar",
    icon: "📦",
  },
  {
    name: "prison",
    icon: "📦",
  },
  {
    name: "python-memcached",
    icon: "📦",
  },
  {
    name: "aiodns",
    icon: "📦",
  },
  {
    name: "tablib",
    icon: "📦",
  },
  {
    name: "uvicorn",
    icon: "📦",
  },
  {
    name: "tinycss2",
    icon: "📦",
  },
  {
    name: "unittest-xml-reporting",
    icon: "📦",
  },
  {
    name: "azure-eventhub",
    icon: "📦",
  },
  {
    name: "azure-mgmt-core",
    icon: "📦",
  },
  {
    name: "intervaltree",
    icon: "📦",
  },
  {
    name: "hyperopt",
    icon: "📦",
  },
  {
    name: "josepy",
    icon: "📦",
  },
  {
    name: "ntlm-auth",
    icon: "📦",
  },
  {
    name: "flaky",
    icon: "📦",
  },
  {
    name: "flask-openid",
    icon: "📦",
  },
  {
    name: "flower",
    icon: "📦",
  },
  {
    name: "locket",
    icon: "📦",
  },
  {
    name: "debtcollector",
    icon: "📦",
  },
  {
    name: "oslo-i18n",
    icon: "📦",
  },
  {
    name: "qds-sdk",
    icon: "📦",
  },
  {
    name: "tensorflow-datasets",
    icon: "📦",
  },
  {
    name: "azure-mgmt-devspaces",
    icon: "📦",
  },
  {
    name: "acme",
    icon: "📦",
  },
  {
    name: "boltons",
    icon: "📦",
  },
  {
    name: "anyjson",
    icon: "📦",
  },
  {
    name: "zope-component",
    icon: "📦",
  },
  {
    name: "pyelftools",
    icon: "📦",
  },
  {
    name: "altair",
    icon: "📦",
  },
  {
    name: "testfixtures",
    icon: "📦",
  },
  {
    name: "azure-applicationinsights",
    icon: "📦",
  },
  {
    name: "starlette",
    icon: "📦",
  },
  {
    name: "django-appconf",
    icon: "📦",
  },
  {
    name: "jupyterlab",
    icon: "📦",
  },
  {
    name: "multipledispatch",
    icon: "📦",
  },
  {
    name: "pypiwin32",
    icon: "📦",
  },
  {
    name: "azure-keyvault-secrets",
    icon: "📦",
  },
  {
    name: "recommonmark",
    icon: "📦",
  },
  {
    name: "vcrpy",
    icon: "📦",
  },
  {
    name: "azure-cli",
    icon: "📦",
  },
  {
    name: "flask-bcrypt",
    icon: "📦",
  },
  {
    name: "json-merge-patch",
    icon: "📦",
  },
  {
    name: "webtest",
    icon: "📦",
  },
  {
    name: "suds-jurko",
    icon: "📦",
  },
  {
    name: "zope-proxy",
    icon: "📦",
  },
  {
    name: "zope-hookable",
    icon: "📦",
  },
  {
    name: "flake8-polyfill",
    icon: "📦",
  },
  {
    name: "cairocffi",
    icon: "📦",
  },
  {
    name: "pylint-plugin-utils",
    icon: "📦",
  },
  {
    name: "immutables",
    icon: "📦",
  },
  {
    name: "jaraco-functools",
    icon: "📦",
  },
  {
    name: "drf-yasg",
    icon: "📦",
  },
  {
    name: "patch",
    icon: "📦",
  },
  {
    name: "requests-ntlm",
    icon: "📦",
  },
  {
    name: "langid",
    icon: "📦",
  },
  {
    name: "dogpile-cache",
    icon: "📦",
  },
  {
    name: "gapic-google-cloud-logging-v2",
    icon: "📦",
  },
  {
    name: "oslo-config",
    icon: "📦",
  },
  {
    name: "sshtunnel",
    icon: "📦",
  },
  {
    name: "proto-google-cloud-logging-v2",
    icon: "📦",
  },
  {
    name: "h2o",
    icon: "📦",
  },
  {
    name: "cssselect2",
    icon: "📦",
  },
  {
    name: "parse-type",
    icon: "📦",
  },
  {
    name: "paho-mqtt",
    icon: "📦",
  },
  {
    name: "zope-deferredimport",
    icon: "📦",
  },
  {
    name: "pynamodb",
    icon: "📦",
  },
  {
    name: "tables",
    icon: "📦",
  },
  {
    name: "fusepy",
    icon: "📦",
  },
  {
    name: "pytesseract",
    icon: "📦",
  },
  {
    name: "crayons",
    icon: "📦",
  },
  {
    name: "cairosvg",
    icon: "📦",
  },
  {
    name: "cfn-flip",
    icon: "📦",
  },
  {
    name: "frozendict",
    icon: "📦",
  },
  {
    name: "python-box",
    icon: "📦",
  },
  {
    name: "atlassian-jwt-auth",
    icon: "📦",
  },
  {
    name: "json5",
    icon: "📦",
  },
  {
    name: "easyprocess",
    icon: "📦",
  },
  {
    name: "pybind11",
    icon: "📦",
  },
  {
    name: "oslo-utils",
    icon: "📦",
  },
  {
    name: "cassandra-driver",
    icon: "📦",
  },
  {
    name: "graphene",
    icon: "📦",
  },
  {
    name: "schema",
    icon: "📦",
  },
  {
    name: "fastparquet",
    icon: "📦",
  },
  {
    name: "graphql-relay",
    icon: "📦",
  },
  {
    name: "certbot",
    icon: "📦",
  },
  {
    name: "google-cloud-error-reporting",
    icon: "📦",
  },
  {
    name: "ciso8601",
    icon: "📦",
  },
  {
    name: "clickclick",
    icon: "📦",
  },
  {
    name: "pyotp",
    icon: "📦",
  },
  {
    name: "python-crfsuite",
    icon: "📦",
  },
  {
    name: "bashlex",
    icon: "📦",
  },
  {
    name: "databricks-api",
    icon: "📦",
  },
  {
    name: "presto-python-client",
    icon: "📦",
  },
  {
    name: "falcon",
    icon: "📦",
  },
  {
    name: "appnope",
    icon: "📦",
  },
  {
    name: "oslo-serialization",
    icon: "📦",
  },
  {
    name: "basictracer",
    icon: "📦",
  },
  {
    name: "jupyterlab-server",
    icon: "📦",
  },
  {
    name: "google-cloud-dlp",
    icon: "📦",
  },
  {
    name: "livereload",
    icon: "📦",
  },
  {
    name: "python-ldap",
    icon: "📦",
  },
  {
    name: "haversine",
    icon: "📦",
  },
  {
    name: "contextvars",
    icon: "📦",
  },
  {
    name: "curlify",
    icon: "📦",
  },
  {
    name: "cheroot",
    icon: "📦",
  },
  {
    name: "python-augeas",
    icon: "📦",
  },
  {
    name: "tdigest",
    icon: "📦",
  },
  {
    name: "proto-google-cloud-datastore-v1",
    icon: "📦",
  },
  {
    name: "google-cloud-secret-manager",
    icon: "📦",
  },
  {
    name: "django-model-utils",
    icon: "📦",
  },
  {
    name: "robotframework",
    icon: "📦",
  },
  {
    name: "accumulation-tree",
    icon: "📦",
  },
  {
    name: "mysql-python",
    icon: "📦",
  },
  {
    name: "pyudorandom",
    icon: "📦",
  },
  {
    name: "testtools",
    icon: "📦",
  },
  {
    name: "flask-restplus",
    icon: "📦",
  },
  {
    name: "flatbuffers",
    icon: "📦",
  },
  {
    name: "sqlalchemy-redshift",
    icon: "📦",
  },
  {
    name: "asyncio",
    icon: "📦",
  },
  {
    name: "letsencrypt",
    icon: "📦",
  },
  {
    name: "certbot-apache",
    icon: "📦",
  },
  {
    name: "whichcraft",
    icon: "📦",
  },
  {
    name: "pylint-django",
    icon: "📦",
  },
  {
    name: "extras",
    icon: "📦",
  },
  {
    name: "pygame",
    icon: "📦",
  },
  {
    name: "python-swiftclient",
    icon: "📦",
  },
  {
    name: "fastapi",
    icon: "📦",
  },
  {
    name: "scramp",
    icon: "📦",
  },
  {
    name: "phoenixdb",
    icon: "📦",
  },
  {
    name: "coveralls",
    icon: "📦",
  },
  {
    name: "openapi-spec-validator",
    icon: "📦",
  },
  {
    name: "ftfy",
    icon: "📦",
  },
  {
    name: "cherrypy",
    icon: "📦",
  },
  {
    name: "django-environ",
    icon: "📦",
  },
  {
    name: "cmake",
    icon: "📦",
  },
  {
    name: "venusian",
    icon: "📦",
  },
  {
    name: "shortuuid",
    icon: "📦",
  },
  {
    name: "pep8-naming",
    icon: "📦",
  },
  {
    name: "catboost",
    icon: "📦",
  },
  {
    name: "pulp",
    icon: "📦",
  },
  {
    name: "dpath",
    icon: "📦",
  },
  {
    name: "fixtures",
    icon: "📦",
  },
  {
    name: "geomet",
    icon: "📦",
  },
  {
    name: "loguru",
    icon: "📦",
  },
  {
    name: "yq",
    icon: "📦",
  },
  {
    name: "aioredis",
    icon: "📦",
  },
  {
    name: "keystoneauth1",
    icon: "📦",
  },
  {
    name: "altgraph",
    icon: "📦",
  },
  {
    name: "validate-email",
    icon: "📦",
  },
  {
    name: "certbot-nginx",
    icon: "📦",
  },
  {
    name: "cmdstanpy",
    icon: "📦",
  },
  {
    name: "cytoolz",
    icon: "📦",
  },
  {
    name: "descartes",
    icon: "📦",
  },
  {
    name: "catkin-pkg",
    icon: "📦",
  },
  {
    name: "zc-lockfile",
    icon: "📦",
  },
  {
    name: "tempora",
    icon: "📦",
  },
  {
    name: "exifread",
    icon: "📦",
  },
  {
    name: "pyathena",
    icon: "📦",
  },
  {
    name: "toposort",
    icon: "📦",
  },
  {
    name: "django-rest-framework",
    icon: "📦",
  },
  {
    name: "azureml-telemetry",
    icon: "📦",
  },
  {
    name: "pyinstaller",
    icon: "📦",
  },
  {
    name: "dictdiffer",
    icon: "📦",
  },
  {
    name: "flask-compress",
    icon: "📦",
  },
  {
    name: "tweepy",
    icon: "📦",
  },
  {
    name: "azure-mgmt-hdinsight",
    icon: "📦",
  },
  {
    name: "s2sphere",
    icon: "📦",
  },
  {
    name: "python-gitlab",
    icon: "📦",
  },
  {
    name: "flask-script",
    icon: "📦",
  },
  {
    name: "django-crispy-forms",
    icon: "📦",
  },
  {
    name: "utm",
    icon: "📦",
  },
  {
    name: "genson",
    icon: "📦",
  },
  {
    name: "django-timezone-field",
    icon: "📦",
  },
  {
    name: "mleap",
    icon: "📦",
  },
  {
    name: "databricks-pypi1",
    icon: "📦",
  },
  {
    name: "py-cpuinfo",
    icon: "📦",
  },
  {
    name: "fysom",
    icon: "📦",
  },
  {
    name: "googlemaps",
    icon: "📦",
  },
  {
    name: "lunarcalendar",
    icon: "📦",
  },
  {
    name: "portend",
    icon: "📦",
  },
  {
    name: "instana",
    icon: "📦",
  },
  {
    name: "behave",
    icon: "📦",
  },
  {
    name: "jsonfield",
    icon: "📦",
  },
  {
    name: "langdetect",
    icon: "📦",
  },
  {
    name: "objectpath",
    icon: "📦",
  },
  {
    name: "pdfminer-six",
    icon: "📦",
  },
  {
    name: "autowrapt",
    icon: "📦",
  },
  {
    name: "pyee",
    icon: "📦",
  },
  {
    name: "boxsdk",
    icon: "📦",
  },
  {
    name: "sqlalchemy-jsonfield",
    icon: "📦",
  },
  {
    name: "cookies",
    icon: "📦",
  },
  {
    name: "tfx",
    icon: "📦",
  },
  {
    name: "python-docx",
    icon: "📦",
  },
  {
    name: "statistics",
    icon: "📦",
  },
  {
    name: "imageio-ffmpeg",
    icon: "📦",
  },
  {
    name: "azureml-pipeline-core",
    icon: "📦",
  },
  {
    name: "starkbank-ecdsa",
    icon: "📦",
  },
  {
    name: "compound-word-splitter",
    icon: "📦",
  },
  {
    name: "cmudict",
    icon: "📦",
  },
  {
    name: "pronouncing",
    icon: "📦",
  },
  {
    name: "openstacksdk",
    icon: "📦",
  },
  {
    name: "os-service-types",
    icon: "📦",
  },
  {
    name: "azure-storage-file-datalake",
    icon: "📦",
  },
  {
    name: "googleads",
    icon: "📦",
  },
  {
    name: "cvxopt",
    icon: "📦",
  },
  {
    name: "pyphen",
    icon: "📦",
  },
  {
    name: "pytest-instafail",
    icon: "📦",
  },
  {
    name: "ruamel-ordereddict",
    icon: "📦",
  },
  {
    name: "jsonpath-rw",
    icon: "📦",
  },
  {
    name: "pygam",
    icon: "📦",
  },
  {
    name: "pyqt5",
    icon: "📦",
  },
  {
    name: "beautifulsoup",
    icon: "📦",
  },
  {
    name: "functions-framework",
    icon: "📦",
  },
  {
    name: "colour",
    icon: "📦",
  },
  {
    name: "rospkg",
    icon: "📦",
  },
  {
    name: "azureml-train-core",
    icon: "📦",
  },
  {
    name: "tensorboardx",
    icon: "📦",
  },
  {
    name: "rq",
    icon: "📦",
  },
  {
    name: "snowflake-sqlalchemy",
    icon: "📦",
  },
  {
    name: "azureml-train-restclients-hyperdrive",
    icon: "📦",
  },
  {
    name: "collections-extended",
    icon: "📦",
  },
  {
    name: "opencensus-ext-azure",
    icon: "📦",
  },
  {
    name: "python-keystoneclient",
    icon: "📦",
  },
  {
    name: "google-cloud-translate",
    icon: "📦",
  },
  {
    name: "enum-compat",
    icon: "📦",
  },
  {
    name: "theano",
    icon: "📦",
  },
  {
    name: "ansible-base",
    icon: "📦",
  },
  {
    name: "scapy",
    icon: "📦",
  },
  {
    name: "azure-mgmt-netapp",
    icon: "📦",
  },
  {
    name: "schedule",
    icon: "📦",
  },
  {
    name: "luigi",
    icon: "📦",
  },
  {
    name: "lark-parser",
    icon: "📦",
  },
  {
    name: "safety",
    icon: "📦",
  },
  {
    name: "diff-match-patch",
    icon: "📦",
  },
  {
    name: "webargs",
    icon: "📦",
  },
  {
    name: "resampy",
    icon: "📦",
  },
  {
    name: "pyinotify",
    icon: "📦",
  },
  {
    name: "flake8-docstrings",
    icon: "📦",
  },
  {
    name: "cssutils",
    icon: "📦",
  },
  {
    name: "tensorflow-addons",
    icon: "📦",
  },
  {
    name: "azureml-pipeline-steps",
    icon: "📦",
  },
  {
    name: "paste",
    icon: "📦",
  },
  {
    name: "dparse",
    icon: "📦",
  },
  {
    name: "probableparsing",
    icon: "📦",
  },
  {
    name: "cloudant",
    icon: "📦",
  },
  {
    name: "docker-py",
    icon: "📦",
  },
  {
    name: "troposphere",
    icon: "📦",
  },
  {
    name: "soundfile",
    icon: "📦",
  },
  {
    name: "geohash",
    icon: "📦",
  },
  {
    name: "backports-csv",
    icon: "📦",
  },
  {
    name: "jsonlines",
    icon: "📦",
  },
  {
    name: "django-celery-beat",
    icon: "📦",
  },
  {
    name: "azureml-pipeline",
    icon: "📦",
  },
  {
    name: "rjsmin",
    icon: "📦",
  },
  {
    name: "watson-machine-learning-client",
    icon: "📦",
  },
  {
    name: "datashape",
    icon: "📦",
  },
  {
    name: "funcy",
    icon: "📦",
  },
  {
    name: "demjson",
    icon: "📦",
  },
  {
    name: "pint",
    icon: "📦",
  },
  {
    name: "pmdarima",
    icon: "📦",
  },
  {
    name: "google-cloud-speech",
    icon: "📦",
  },
  {
    name: "mozversion",
    icon: "📦",
  },
  {
    name: "urltools",
    icon: "📦",
  },
  {
    name: "tribool",
    icon: "📦",
  },
  {
    name: "azureml-train",
    icon: "📦",
  },
  {
    name: "rfc3987",
    icon: "📦",
  },
  {
    name: "mpi4py",
    icon: "📦",
  },
  {
    name: "xmlsec",
    icon: "📦",
  },
  {
    name: "ansible-lint",
    icon: "📦",
  },
  {
    name: "azureml-sdk",
    icon: "📦",
  },
  {
    name: "usaddress",
    icon: "📦",
  },
  {
    name: "social-auth-core",
    icon: "📦",
  },
  {
    name: "autobahn",
    icon: "📦",
  },
  {
    name: "couchdb",
    icon: "📦",
  },
  {
    name: "orderedmultidict",
    icon: "📦",
  },
  {
    name: "bidict",
    icon: "📦",
  },
  {
    name: "oyaml",
    icon: "📦",
  },
  {
    name: "pyvirtualdisplay",
    icon: "📦",
  },
  {
    name: "workalendar",
    icon: "📦",
  },
  {
    name: "flake8-bugbear",
    icon: "📦",
  },
  {
    name: "opencv-contrib-python",
    icon: "📦",
  },
  {
    name: "aws-requests-auth",
    icon: "📦",
  },
  {
    name: "pillow-simd",
    icon: "📦",
  },
  {
    name: "azure-multiapi-storage",
    icon: "📦",
  },
  {
    name: "clickhouse-driver",
    icon: "📦",
  },
  {
    name: "dataclasses-json",
    icon: "📦",
  },
  {
    name: "wget",
    icon: "📦",
  },
  {
    name: "weasyprint",
    icon: "📦",
  },
  {
    name: "neptune-client",
    icon: "📦",
  },
  {
    name: "pastedeploy",
    icon: "📦",
  },
  {
    name: "firebase-admin",
    icon: "📦",
  },
  {
    name: "shellescape",
    icon: "📦",
  },
  {
    name: "brotlipy",
    icon: "📦",
  },
  {
    name: "eli5",
    icon: "📦",
  },
  {
    name: "htmlmin",
    icon: "📦",
  },
  {
    name: "orjson",
    icon: "📦",
  },
  {
    name: "pytest-sugar",
    icon: "📦",
  },
  {
    name: "stackprinter",
    icon: "📦",
  },
  {
    name: "sgp4",
    icon: "📦",
  },
  {
    name: "python-geohash",
    icon: "📦",
  },
  {
    name: "social-auth-app-django",
    icon: "📦",
  },
  {
    name: "azureml-automl-core",
    icon: "📦",
  },
  {
    name: "colorlover",
    icon: "📦",
  },
  {
    name: "dominate",
    icon: "📦",
  },
  {
    name: "mkdocs",
    icon: "📦",
  },
  {
    name: "librosa",
    icon: "📦",
  },
  {
    name: "azureml-train-automl-client",
    icon: "📦",
  },
  {
    name: "timezonefinder",
    icon: "📦",
  },
  {
    name: "flake8-quotes",
    icon: "📦",
  },
  {
    name: "pyformance",
    icon: "📦",
  },
  {
    name: "gapic-google-cloud-datastore-v1",
    icon: "📦",
  },
  {
    name: "glob2",
    icon: "📦",
  },
  {
    name: "txaio",
    icon: "📦",
  },
  {
    name: "aioprometheus",
    icon: "📦",
  },
  {
    name: "azureml-model-management-sdk",
    icon: "📦",
  },
  {
    name: "ws4py",
    icon: "📦",
  },
  {
    name: "jplephem",
    icon: "📦",
  },
  {
    name: "django-ipware",
    icon: "📦",
  },
  {
    name: "spotinst-agent",
    icon: "📦",
  },
  {
    name: "pyvmomi",
    icon: "📦",
  },
  {
    name: "django-import-export",
    icon: "📦",
  },
  {
    name: "flask-marshmallow",
    icon: "📦",
  },
  {
    name: "ray",
    icon: "📦",
  },
  {
    name: "onnxruntime",
    icon: "📦",
  },
  {
    name: "pyppeteer",
    icon: "📦",
  },
  {
    name: "jsonpath-ng",
    icon: "📦",
  },
  {
    name: "oslo-log",
    icon: "📦",
  },
  {
    name: "odfpy",
    icon: "📦",
  },
  {
    name: "django-js-asset",
    icon: "📦",
  },
  {
    name: "webcolors",
    icon: "📦",
  },
  {
    name: "peewee",
    icon: "📦",
  },
  {
    name: "connexion",
    icon: "📦",
  },
  {
    name: "python-novaclient",
    icon: "📦",
  },
  {
    name: "requestsexceptions",
    icon: "📦",
  },
  {
    name: "mathematics-dataset",
    icon: "📦",
  },
  {
    name: "pytest-env",
    icon: "📦",
  },
  {
    name: "skyfield",
    icon: "📦",
  },
  {
    name: "analytics-python",
    icon: "📦",
  },
  {
    name: "schematics",
    icon: "📦",
  },
  {
    name: "memoized-property",
    icon: "📦",
  },
  {
    name: "googletrans",
    icon: "📦",
  },
  {
    name: "django-rest-swagger",
    icon: "📦",
  },
  {
    name: "polyline",
    icon: "📦",
  },
  {
    name: "graphframes",
    icon: "📦",
  },
  {
    name: "nvidia-ml-py3",
    icon: "📦",
  },
  {
    name: "pyvcf",
    icon: "📦",
  },
  {
    name: "onnx",
    icon: "📦",
  },
  {
    name: "serpent",
    icon: "📦",
  },
  {
    name: "pyathenajdbc",
    icon: "📦",
  },
  {
    name: "flake8-import-order",
    icon: "📦",
  },
  {
    name: "oslo-context",
    icon: "📦",
  },
  {
    name: "autograd",
    icon: "📦",
  },
  {
    name: "pytimeparse",
    icon: "📦",
  },
  {
    name: "django-phonenumber-field",
    icon: "📦",
  },
  {
    name: "opencv-python-headless",
    icon: "📦",
  },
  {
    name: "skyfield-data",
    icon: "📦",
  },
  {
    name: "audioread",
    icon: "📦",
  },
  {
    name: "blessed",
    icon: "📦",
  },
  {
    name: "facebook-business",
    icon: "📦",
  },
  {
    name: "pep517",
    icon: "📦",
  },
  {
    name: "python-socketio",
    icon: "📦",
  },
  {
    name: "branca",
    icon: "📦",
  },
  {
    name: "pyqt5-sip",
    icon: "📦",
  },
  {
    name: "python-engineio",
    icon: "📦",
  },
  {
    name: "timeout-decorator",
    icon: "📦",
  },
  {
    name: "phonenumberslite",
    icon: "📦",
  },
  {
    name: "osc-lib",
    icon: "📦",
  },
  {
    name: "openapi-codec",
    icon: "📦",
  },
  {
    name: "pydash",
    icon: "📦",
  },
  {
    name: "djangorestframework-jwt",
    icon: "📦",
  },
  {
    name: "pyro4",
    icon: "📦",
  },
  {
    name: "fake-useragent",
    icon: "📦",
  },
  {
    name: "requests-kerberos",
    icon: "📦",
  },
  {
    name: "cachelib",
    icon: "📦",
  },
  {
    name: "tb-nightly",
    icon: "📦",
  },
  {
    name: "scikit-build",
    icon: "📦",
  },
  {
    name: "virtualenvwrapper",
    icon: "📦",
  },
  {
    name: "flask-socketio",
    icon: "📦",
  },
  {
    name: "pdfkit",
    icon: "📦",
  },
  {
    name: "pefile",
    icon: "📦",
  },
  {
    name: "sseclient-py",
    icon: "📦",
  },
  {
    name: "fonttools",
    icon: "📦",
  },
  {
    name: "orderedset",
    icon: "📦",
  },
  {
    name: "platformio",
    icon: "📦",
  },
  {
    name: "elastic-apm",
    icon: "📦",
  },
  {
    name: "kafka",
    icon: "📦",
  },
  {
    name: "dash-renderer",
    icon: "📦",
  },
  {
    name: "python3-saml",
    icon: "📦",
  },
  {
    name: "google-cloud-trace",
    icon: "📦",
  },
  {
    name: "folium",
    icon: "📦",
  },
  {
    name: "naked",
    icon: "📦",
  },
  {
    name: "aws-encryption-sdk",
    icon: "📦",
  },
  {
    name: "urwid",
    icon: "📦",
  },
  {
    name: "xarray",
    icon: "📦",
  },
  {
    name: "asynctest",
    icon: "📦",
  },
  {
    name: "jwcrypto",
    icon: "📦",
  },
  {
    name: "credstash",
    icon: "📦",
  },
  {
    name: "pykerberos",
    icon: "📦",
  },
  {
    name: "textblob",
    icon: "📦",
  },
  {
    name: "ninja",
    icon: "📦",
  },
  {
    name: "dash",
    icon: "📦",
  },
  {
    name: "mutagen",
    icon: "📦",
  },
  {
    name: "pywinrm",
    icon: "📦",
  },
  {
    name: "dash-core-components",
    icon: "📦",
  },
  {
    name: "django-allauth",
    icon: "📦",
  },
  {
    name: "mysql-connector-python-rf",
    icon: "📦",
  },
  {
    name: "django-mptt",
    icon: "📦",
  },
  {
    name: "google-cloud-dataflow",
    icon: "📦",
  },
  {
    name: "pyfiglet",
    icon: "📦",
  },
  {
    name: "cerberus-python-client",
    icon: "📦",
  },
  {
    name: "dropbox",
    icon: "📦",
  },
  {
    name: "wordcloud",
    icon: "📦",
  },
  {
    name: "sentinels",
    icon: "📦",
  },
  {
    name: "editdistance",
    icon: "📦",
  },
  {
    name: "googledatastore",
    icon: "📦",
  },
  {
    name: "tensorflow-tensorboard",
    icon: "📦",
  },
  {
    name: "dash-html-components",
    icon: "📦",
  },
  {
    name: "swagger-spec-validator",
    icon: "📦",
  },
  {
    name: "thriftpy2",
    icon: "📦",
  },
  {
    name: "nvidia-ml-py",
    icon: "📦",
  },
  {
    name: "facebook-sdk",
    icon: "📦",
  },
  {
    name: "bumpversion",
    icon: "📦",
  },
  {
    name: "azure-keyvault-keys",
    icon: "📦",
  },
  {
    name: "python-cinderclient",
    icon: "📦",
  },
  {
    name: "base58",
    icon: "📦",
  },
  {
    name: "initools",
    icon: "📦",
  },
  {
    name: "pytest-remotedata",
    icon: "📦",
  },
  {
    name: "imblearn",
    icon: "📦",
  },
  {
    name: "url-normalize",
    icon: "📦",
  },
  {
    name: "pywin32-ctypes",
    icon: "📦",
  },
  {
    name: "spark-sklearn",
    icon: "📦",
  },
  {
    name: "scrapy-splash",
    icon: "📦",
  },
  {
    name: "django-countries",
    icon: "📦",
  },
  {
    name: "asyncpg",
    icon: "📦",
  },
  {
    name: "cftime",
    icon: "📦",
  },
  {
    name: "ipaddr",
    icon: "📦",
  },
  {
    name: "imagehash",
    icon: "📦",
  },
  {
    name: "django-nose",
    icon: "📦",
  },
  {
    name: "marionette-driver",
    icon: "📦",
  },
  {
    name: "python-subunit",
    icon: "📦",
  },
  {
    name: "netcdf4",
    icon: "📦",
  },
  {
    name: "django-webpack-loader",
    icon: "📦",
  },
  {
    name: "mongomock",
    icon: "📦",
  },
  {
    name: "protobuf3-to-dict",
    icon: "📦",
  },
  {
    name: "appium-python-client",
    icon: "📦",
  },
  {
    name: "py-spy",
    icon: "📦",
  },
  {
    name: "gql",
    icon: "📦",
  },
  {
    name: "rtree",
    icon: "📦",
  },
  {
    name: "flask-testing",
    icon: "📦",
  },
  {
    name: "attrdict",
    icon: "📦",
  },
  {
    name: "mercantile",
    icon: "📦",
  },
  {
    name: "signalfx",
    icon: "📦",
  },
  {
    name: "astropy",
    icon: "📦",
  },
  {
    name: "xxhash",
    icon: "📦",
  },
  {
    name: "pyquery",
    icon: "📦",
  },
  {
    name: "clickhouse-cityhash",
    icon: "📦",
  },
  {
    name: "flake8-comprehensions",
    icon: "📦",
  },
  {
    name: "gcloud",
    icon: "📦",
  },
  {
    name: "nox",
    icon: "📦",
  },
  {
    name: "crypto",
    icon: "📦",
  },
  {
    name: "httpretty",
    icon: "📦",
  },
  {
    name: "launcher",
    icon: "📦",
  },
  {
    name: "databricks-pypi2",
    icon: "📦",
  },
  {
    name: "cement",
    icon: "📦",
  },
  {
    name: "azure-mgmt-sqlvirtualmachine",
    icon: "📦",
  },
  {
    name: "django-celery-results",
    icon: "📦",
  },
  {
    name: "json-log-formatter",
    icon: "📦",
  },
  {
    name: "azure-mgmt-deploymentmanager",
    icon: "📦",
  },
  {
    name: "astral",
    icon: "📦",
  },
  {
    name: "azureml-designer-serving",
    icon: "📦",
  },
  {
    name: "diskcache",
    icon: "📦",
  },
  {
    name: "pdfminer",
    icon: "📦",
  },
  {
    name: "azure-mgmt-appconfiguration",
    icon: "📦",
  },
  {
    name: "fluent-logger",
    icon: "📦",
  },
  {
    name: "azure-mgmt-security",
    icon: "📦",
  },
  {
    name: "isoweek",
    icon: "📦",
  },
  {
    name: "rollbar",
    icon: "📦",
  },
  {
    name: "dash-table",
    icon: "📦",
  },
  {
    name: "update-checker",
    icon: "📦",
  },
  {
    name: "sagemaker",
    icon: "📦",
  },
  {
    name: "meld3",
    icon: "📦",
  },
  {
    name: "pykwalify",
    icon: "📦",
  },
  {
    name: "click-completion",
    icon: "📦",
  },
  {
    name: "djangorestframework-simplejwt",
    icon: "📦",
  },
  {
    name: "ddt",
    icon: "📦",
  },
  {
    name: "annoy",
    icon: "📦",
  },
  {
    name: "j2cli",
    icon: "📦",
  },
  {
    name: "hashids",
    icon: "📦",
  },
  {
    name: "weka-easypy",
    icon: "📦",
  },
  {
    name: "pysnmp",
    icon: "📦",
  },
  {
    name: "python-logstash",
    icon: "📦",
  },
  {
    name: "lru-dict",
    icon: "📦",
  },
  {
    name: "ratelim",
    icon: "📦",
  },
  {
    name: "libsass",
    icon: "📦",
  },
  {
    name: "path-py",
    icon: "📦",
  },
  {
    name: "rdflib",
    icon: "📦",
  },
  {
    name: "google-cloud-dns",
    icon: "📦",
  },
  {
    name: "geocoder",
    icon: "📦",
  },
  {
    name: "azure-mgmt-apimanagement",
    icon: "📦",
  },
  {
    name: "poetry-core",
    icon: "📦",
  },
  {
    name: "azure-mgmt-imagebuilder",
    icon: "📦",
  },
  {
    name: "tensorflow-probability",
    icon: "📦",
  },
  {
    name: "jupyterlab-widgets",
    icon: "📦",
  },
  {
    name: "rope",
    icon: "📦",
  },
  {
    name: "google-cloud-resource-manager",
    icon: "📦",
  },
  {
    name: "daphne",
    icon: "📦",
  },
  {
    name: "azure-mgmt-kusto",
    icon: "📦",
  },
  {
    name: "cufflinks",
    icon: "📦",
  },
  {
    name: "ezfntesting",
    icon: "📦",
  },
  {
    name: "jsonref",
    icon: "📦",
  },
  {
    name: "javaproperties",
    icon: "📦",
  },
  {
    name: "hacs-frontend",
    icon: "📦",
  },
  {
    name: "simpleeval",
    icon: "📦",
  },
  {
    name: "cbor2",
    icon: "📦",
  },
  {
    name: "vsts",
    icon: "📦",
  },
  {
    name: "furl",
    icon: "📦",
  },
  {
    name: "flask-mail",
    icon: "📦",
  },
  {
    name: "pyrogram",
    icon: "📦",
  },
  {
    name: "pyaes",
    icon: "📦",
  },
  {
    name: "django-compressor",
    icon: "📦",
  },
  {
    name: "pytoml",
    icon: "📦",
  },
  {
    name: "pysmi",
    icon: "📦",
  },
  {
    name: "pyautogui",
    icon: "📦",
  },
  {
    name: "ptvsd",
    icon: "📦",
  },
  {
    name: "moznetwork",
    icon: "📦",
  },
  {
    name: "channels",
    icon: "📦",
  },
  {
    name: "pymdown-extensions",
    icon: "📦",
  },
  {
    name: "js2xml",
    icon: "📦",
  },
  {
    name: "fastdtw",
    icon: "📦",
  },
  {
    name: "html5-parser",
    icon: "📦",
  },
  {
    name: "pyscreeze",
    icon: "📦",
  },
  {
    name: "txaws",
    icon: "📦",
  },
  {
    name: "azure-mgmt-privatedns",
    icon: "📦",
  },
  {
    name: "mechanize",
    icon: "📦",
  },
  {
    name: "checkdigit",
    icon: "📦",
  },
  {
    name: "azure-functions-devops-build",
    icon: "📦",
  },
  {
    name: "pysaml2",
    icon: "📦",
  },
  {
    name: "pyobjc-core",
    icon: "📦",
  },
  {
    name: "keras-tuner",
    icon: "📦",
  },
  {
    name: "num2words",
    icon: "📦",
  },
  {
    name: "vsts-cd-manager",
    icon: "📦",
  },
  {
    name: "pymsgbox",
    icon: "📦",
  },
  {
    name: "google-cloud-container",
    icon: "📦",
  },
  {
    name: "zstandard",
    icon: "📦",
  },
  {
    name: "mxnet",
    icon: "📦",
  },
  {
    name: "pyusb",
    icon: "📦",
  },
  {
    name: "locustio",
    icon: "📦",
  },
  {
    name: "python-telegram-bot",
    icon: "📦",
  },
  {
    name: "conan",
    icon: "📦",
  },
  {
    name: "smdebug-rulesconfig",
    icon: "📦",
  },
  {
    name: "django-oauth-toolkit",
    icon: "📦",
  },
  {
    name: "awsebcli",
    icon: "📦",
  },
  {
    name: "pywinpty",
    icon: "📦",
  },
  {
    name: "os-client-config",
    icon: "📦",
  },
  {
    name: "pytest-ordering",
    icon: "📦",
  },
  {
    name: "azure-mgmt-botservice",
    icon: "📦",
  },
  {
    name: "google-cloud-runtimeconfig",
    icon: "📦",
  },
  {
    name: "flask-httpauth",
    icon: "📦",
  },
  {
    name: "ansiwrap",
    icon: "📦",
  },
  {
    name: "python-decouple",
    icon: "📦",
  },
  {
    name: "dulwich",
    icon: "📦",
  },
  {
    name: "django-simple-history",
    icon: "📦",
  },
  {
    name: "pytweening",
    icon: "📦",
  },
  {
    name: "tableauserverclient",
    icon: "📦",
  },
  {
    name: "azureml-contrib-services",
    icon: "📦",
  },
  {
    name: "vertica-python",
    icon: "📦",
  },
  {
    name: "pluginbase",
    icon: "📦",
  },
  {
    name: "autoflake",
    icon: "📦",
  },
  {
    name: "args",
    icon: "📦",
  },
  {
    name: "azure-mgmt-managedservices",
    icon: "📦",
  },
  {
    name: "pygetwindow",
    icon: "📦",
  },
  {
    name: "premailer",
    icon: "📦",
  },
  {
    name: "tempita",
    icon: "📦",
  },
  {
    name: "pyshp",
    icon: "📦",
  },
  {
    name: "pytest-randomly",
    icon: "📦",
  },
  {
    name: "translationstring",
    icon: "📦",
  },
  {
    name: "clint",
    icon: "📦",
  },
  {
    name: "torchtext",
    icon: "📦",
  },
  {
    name: "tzwhere",
    icon: "📦",
  },
  {
    name: "pyhocon",
    icon: "📦",
  },
  {
    name: "python-stdnum",
    icon: "📦",
  },
  {
    name: "node-semver",
    icon: "📦",
  },
  {
    name: "pyrect",
    icon: "📦",
  },
  {
    name: "parsimonious",
    icon: "📦",
  },
  {
    name: "python-glanceclient",
    icon: "📦",
  },
  {
    name: "pypd",
    icon: "📦",
  },
  {
    name: "azure-mgmt-redhatopenshift",
    icon: "📦",
  },
  {
    name: "iso3166",
    icon: "📦",
  },
  {
    name: "stups-tokens",
    icon: "📦",
  },
  {
    name: "rcssmin",
    icon: "📦",
  },
  {
    name: "pylru",
    icon: "📦",
  },
  {
    name: "salesforce-bulk",
    icon: "📦",
  },
  {
    name: "pipdeptree",
    icon: "📦",
  },
  {
    name: "gprof2dot",
    icon: "📦",
  },
  {
    name: "collectd-nvidianvml",
    icon: "📦",
  },
  {
    name: "pvlib",
    icon: "📦",
  },
  {
    name: "google-compute-engine",
    icon: "📦",
  },
  {
    name: "textwrap3",
    icon: "📦",
  },
  {
    name: "visitor",
    icon: "📦",
  },
  {
    name: "pyspark-stubs",
    icon: "📦",
  },
  {
    name: "mkdocs-material",
    icon: "📦",
  },
  {
    name: "pytest-repeat",
    icon: "📦",
  },
  {
    name: "python-nvd3",
    icon: "📦",
  },
  {
    name: "allure-python-commons",
    icon: "📦",
  },
  {
    name: "empy",
    icon: "📦",
  },
  {
    name: "nose-timer",
    icon: "📦",
  },
  {
    name: "liac-arff",
    icon: "📦",
  },
  {
    name: "glfw",
    icon: "📦",
  },
  {
    name: "robotframework-seleniumlibrary",
    icon: "📦",
  },
  {
    name: "mouseinfo",
    icon: "📦",
  },
  {
    name: "mypy-protobuf",
    icon: "📦",
  },
  {
    name: "pymemcache",
    icon: "📦",
  },
  {
    name: "azure-keyvault-certificates",
    icon: "📦",
  },
  {
    name: "grequests",
    icon: "📦",
  },
  {
    name: "aiogithubapi",
    icon: "📦",
  },
  {
    name: "stups-zign",
    icon: "📦",
  },
  {
    name: "stups-cli-support",
    icon: "📦",
  },
  {
    name: "line-profiler",
    icon: "📦",
  },
  {
    name: "crashtest",
    icon: "📦",
  },
  {
    name: "tsfresh",
    icon: "📦",
  },
  {
    name: "m3u8",
    icon: "📦",
  },
  {
    name: "keyrings-alt",
    icon: "📦",
  },
  {
    name: "markdown2",
    icon: "📦",
  },
  {
    name: "rauth",
    icon: "📦",
  },
  {
    name: "port-for",
    icon: "📦",
  },
  {
    name: "ptable",
    icon: "📦",
  },
  {
    name: "thriftpy",
    icon: "📦",
  },
  {
    name: "great-expectations",
    icon: "📦",
  },
  {
    name: "minio",
    icon: "📦",
  },
  {
    name: "polib",
    icon: "📦",
  },
  {
    name: "model-mommy",
    icon: "📦",
  },
  {
    name: "azureml-dataprep-rslex",
    icon: "📦",
  },
  {
    name: "django-widget-tweaks",
    icon: "📦",
  },
  {
    name: "category-encoders",
    icon: "📦",
  },
  {
    name: "mrjob",
    icon: "📦",
  },
  {
    name: "rasterio",
    icon: "📦",
  },
  {
    name: "memory-profiler",
    icon: "📦",
  },
  {
    name: "papermill",
    icon: "📦",
  },
  {
    name: "sqlalchemy-migrate",
    icon: "📦",
  },
  {
    name: "filechunkio",
    icon: "📦",
  },
  {
    name: "pyhs2",
    icon: "📦",
  },
  {
    name: "pandas-profiling",
    icon: "📦",
  },
  {
    name: "pytest-flask",
    icon: "📦",
  },
  {
    name: "jsonnet",
    icon: "📦",
  },
  {
    name: "spark-nlp",
    icon: "📦",
  },
  {
    name: "python-neutronclient",
    icon: "📦",
  },
  {
    name: "auth",
    icon: "📦",
  },
  {
    name: "aws-sam-cli",
    icon: "📦",
  },
  {
    name: "flake8-builtins",
    icon: "📦",
  },
  {
    name: "benbotasync",
    icon: "📦",
  },
  {
    name: "oauth2",
    icon: "📦",
  },
  {
    name: "xlwings",
    icon: "📦",
  },
  {
    name: "lazy",
    icon: "📦",
  },
  {
    name: "bottleneck",
    icon: "📦",
  },
  {
    name: "tree-format",
    icon: "📦",
  },
  {
    name: "bson",
    icon: "📦",
  },
  {
    name: "affine",
    icon: "📦",
  },
  {
    name: "pyenchant",
    icon: "📦",
  },
  {
    name: "circleci",
    icon: "📦",
  },
  {
    name: "elementpath",
    icon: "📦",
  },
  {
    name: "gtts",
    icon: "📦",
  },
  {
    name: "aiohttp-cors",
    icon: "📦",
  },
  {
    name: "imutils",
    icon: "📦",
  },
  {
    name: "python-whois",
    icon: "📦",
  },
  {
    name: "json-logging-py",
    icon: "📦",
  },
  {
    name: "webapp2",
    icon: "📦",
  },
  {
    name: "jinja2-cli",
    icon: "📦",
  },
  {
    name: "django-localflavor",
    icon: "📦",
  },
  {
    name: "maturin",
    icon: "📦",
  },
  {
    name: "django-taggit",
    icon: "📦",
  },
  {
    name: "h3",
    icon: "📦",
  },
  {
    name: "azure-cli-command-modules-nspkg",
    icon: "📦",
  },
  {
    name: "django-polymorphic",
    icon: "📦",
  },
  {
    name: "geoalchemy2",
    icon: "📦",
  },
  {
    name: "pydotplus",
    icon: "📦",
  },
  {
    name: "pysqlite",
    icon: "📦",
  },
  {
    name: "flake8-commas",
    icon: "📦",
  },
  {
    name: "aws-lambda-builders",
    icon: "📦",
  },
  {
    name: "routes",
    icon: "📦",
  },
  {
    name: "icalendar",
    icon: "📦",
  },
  {
    name: "mss",
    icon: "📦",
  },
  {
    name: "awacs",
    icon: "📦",
  },
  {
    name: "nameparser",
    icon: "📦",
  },
  {
    name: "pattern",
    icon: "📦",
  },
  {
    name: "feather-format",
    icon: "📦",
  },
  {
    name: "django-formtools",
    icon: "📦",
  },
  {
    name: "warlock",
    icon: "📦",
  },
  {
    name: "confuse",
    icon: "📦",
  },
  {
    name: "prawcore",
    icon: "📦",
  },
  {
    name: "snuggs",
    icon: "📦",
  },
  {
    name: "filetype",
    icon: "📦",
  },
  {
    name: "google-cloud-ndb",
    icon: "📦",
  },
  {
    name: "jieba",
    icon: "📦",
  },
  {
    name: "graphene-django",
    icon: "📦",
  },
  {
    name: "anyconfig",
    icon: "📦",
  },
  {
    name: "spotipy",
    icon: "📦",
  },
  {
    name: "fortniteapiasync",
    icon: "📦",
  },
  {
    name: "flake8-print",
    icon: "📦",
  },
  {
    name: "slicer",
    icon: "📦",
  },
  {
    name: "rpyc",
    icon: "📦",
  },
  {
    name: "jenkinsapi",
    icon: "📦",
  },
  {
    name: "markuppy",
    icon: "📦",
  },
  {
    name: "django-mysql",
    icon: "📦",
  },
  {
    name: "radon",
    icon: "📦",
  },
  {
    name: "xlocal",
    icon: "📦",
  },
  {
    name: "bump2version",
    icon: "📦",
  },
  {
    name: "pyros-genmsg",
    icon: "📦",
  },
  {
    name: "protego",
    icon: "📦",
  },
  {
    name: "github3-py",
    icon: "📦",
  },
  {
    name: "lifetimes",
    icon: "📦",
  },
  {
    name: "flashtext",
    icon: "📦",
  },
  {
    name: "python-openstackclient",
    icon: "📦",
  },
  {
    name: "drf-nested-routers",
    icon: "📦",
  },
  {
    name: "pytest-benchmark",
    icon: "📦",
  },
  {
    name: "retry-decorator",
    icon: "📦",
  },
  {
    name: "patch-ng",
    icon: "📦",
  },
  {
    name: "swagger-ui-bundle",
    icon: "📦",
  },
  {
    name: "xmlschema",
    icon: "📦",
  },
  {
    name: "pyros-genpy",
    icon: "📦",
  },
  {
    name: "vatnumber",
    icon: "📦",
  },
  {
    name: "molecule",
    icon: "📦",
  },
  {
    name: "logbook",
    icon: "📦",
  },
  {
    name: "asyncio-nats-client",
    icon: "📦",
  },
  {
    name: "django-braces",
    icon: "📦",
  },
  {
    name: "wikipedia",
    icon: "📦",
  },
  {
    name: "tf-estimator-nightly",
    icon: "📦",
  },
  {
    name: "pyjarowinkler",
    icon: "📦",
  },
  {
    name: "fpdf",
    icon: "📦",
  },
  {
    name: "py3nvml",
    icon: "📦",
  },
  {
    name: "transitions",
    icon: "📦",
  },
  {
    name: "moviepy",
    icon: "📦",
  },
  {
    name: "jinja2-pluralize",
    icon: "📦",
  },
  {
    name: "recordtype",
    icon: "📦",
  },
  {
    name: "mixpanel",
    icon: "📦",
  },
  {
    name: "junitparser",
    icon: "📦",
  },
  {
    name: "django-rest-auth",
    icon: "📦",
  },
  {
    name: "public",
    icon: "📦",
  },
  {
    name: "wand",
    icon: "📦",
  },
  {
    name: "grpcio-health-checking",
    icon: "📦",
  },
  {
    name: "python-pptx",
    icon: "📦",
  },
  {
    name: "python-string-utils",
    icon: "📦",
  },
  {
    name: "edn-format",
    icon: "📦",
  },
  {
    name: "pdf2image",
    icon: "📦",
  },
  {
    name: "agate",
    icon: "📦",
  },
  {
    name: "leather",
    icon: "📦",
  },
  {
    name: "missingno",
    icon: "📦",
  },
  {
    name: "ffmpeg-python",
    icon: "📦",
  },
  {
    name: "flake8-isort",
    icon: "📦",
  },
  {
    name: "lime",
    icon: "📦",
  },
  {
    name: "snakebite",
    icon: "📦",
  },
  {
    name: "ipyparallel",
    icon: "📦",
  },
  {
    name: "braintree",
    icon: "📦",
  },
  {
    name: "hurry-filesize",
    icon: "📦",
  },
  {
    name: "nose2",
    icon: "📦",
  },
  {
    name: "pathlib-mate",
    icon: "📦",
  },
  {
    name: "openshift",
    icon: "📦",
  },
  {
    name: "pytest-flake8",
    icon: "📦",
  },
  {
    name: "jupyter-nbextensions-configurator",
    icon: "📦",
  },
  {
    name: "pandasql",
    icon: "📦",
  },
  {
    name: "python-rapidjson",
    icon: "📦",
  },
  {
    name: "datasketch",
    icon: "📦",
  },
  {
    name: "django-waffle",
    icon: "📦",
  },
  {
    name: "ansicolors",
    icon: "📦",
  },
  {
    name: "hyper",
    icon: "📦",
  },
  {
    name: "maxminddb-geolite2",
    icon: "📦",
  },
  {
    name: "google-cloud-profiler",
    icon: "📦",
  },
  {
    name: "fastprogress",
    icon: "📦",
  },
  {
    name: "azureml-defaults",
    icon: "📦",
  },
  {
    name: "mando",
    icon: "📦",
  },
  {
    name: "slackweb",
    icon: "📦",
  },
  {
    name: "databricks-connect",
    icon: "📦",
  },
  {
    name: "gevent-websocket",
    icon: "📦",
  },
  {
    name: "google-cloud-dataproc",
    icon: "📦",
  },
  {
    name: "gtts-token",
    icon: "📦",
  },
  {
    name: "jupyter-latex-envs",
    icon: "📦",
  },
  {
    name: "praw",
    icon: "📦",
  },
  {
    name: "flask-oauthlib",
    icon: "📦",
  },
  {
    name: "gcs-oauth2-boto-plugin",
    icon: "📦",
  },
  {
    name: "jaeger-client",
    icon: "📦",
  },
  {
    name: "luminol",
    icon: "📦",
  },
  {
    name: "progressbar",
    icon: "📦",
  },
  {
    name: "fancycompleter",
    icon: "📦",
  },
  {
    name: "oslo-concurrency",
    icon: "📦",
  },
  {
    name: "threadloop",
    icon: "📦",
  },
  {
    name: "google-cloud-bigquery-datatransfer",
    icon: "📦",
  },
  {
    name: "fabric3",
    icon: "📦",
  },
  {
    name: "recordclass",
    icon: "📦",
  },
  {
    name: "pyfakefs",
    icon: "📦",
  },
  {
    name: "testinfra",
    icon: "📦",
  },
  {
    name: "deepmerge",
    icon: "📦",
  },
  {
    name: "azureml-dataset-runtime",
    icon: "📦",
  },
  {
    name: "nose-exclude",
    icon: "📦",
  },
  {
    name: "stomp-py",
    icon: "📦",
  },
  {
    name: "solartime",
    icon: "📦",
  },
  {
    name: "pdfrw",
    icon: "📦",
  },
  {
    name: "uuid",
    icon: "📦",
  },
  {
    name: "django-reversion",
    icon: "📦",
  },
  {
    name: "pylint-flask",
    icon: "📦",
  },
  {
    name: "django-redis-cache",
    icon: "📦",
  },
  {
    name: "sklearn-pandas",
    icon: "📦",
  },
  {
    name: "ansible-tower-cli",
    icon: "📦",
  },
  {
    name: "readthedocs-sphinx-ext",
    icon: "📦",
  },
  {
    name: "jaraco-classes",
    icon: "📦",
  },
  {
    name: "chevron",
    icon: "📦",
  },
  {
    name: "pygresql",
    icon: "📦",
  },
  {
    name: "rich",
    icon: "📦",
  },
  {
    name: "msgpack-numpy",
    icon: "📦",
  },
  {
    name: "pyu2f",
    icon: "📦",
  },
  {
    name: "mlxtend",
    icon: "📦",
  },
  {
    name: "flex",
    icon: "📦",
  },
  {
    name: "ggplot",
    icon: "📦",
  },
  {
    name: "phik",
    icon: "📦",
  },
  {
    name: "pytest-pythonpath",
    icon: "📦",
  },
  {
    name: "records",
    icon: "📦",
  },
  {
    name: "lmdb",
    icon: "📦",
  },
  {
    name: "pyramid",
    icon: "📦",
  },
  {
    name: "macholib",
    icon: "📦",
  },
  {
    name: "vobject",
    icon: "📦",
  },
  {
    name: "python-gilt",
    icon: "📦",
  },
  {
    name: "python-openid",
    icon: "📦",
  },
  {
    name: "diff-cover",
    icon: "📦",
  },
  {
    name: "graphql-server-core",
    icon: "📦",
  },
  {
    name: "allure-pytest",
    icon: "📦",
  },
  {
    name: "pytest-watch",
    icon: "📦",
  },
  {
    name: "pudb",
    icon: "📦",
  },
  {
    name: "pamqp",
    icon: "📦",
  },
  {
    name: "trains",
    icon: "📦",
  },
  {
    name: "wmctrl",
    icon: "📦",
  },
  {
    name: "numpydoc",
    icon: "📦",
  },
  {
    name: "jaraco-text",
    icon: "📦",
  },
  {
    name: "milksnake",
    icon: "📦",
  },
  {
    name: "imgaug",
    icon: "📦",
  },
  {
    name: "serverlessrepo",
    icon: "📦",
  },
  {
    name: "jaraco-collections",
    icon: "📦",
  },
  {
    name: "google-reauth",
    icon: "📦",
  },
  {
    name: "django-ses",
    icon: "📦",
  },
  {
    name: "happybase",
    icon: "📦",
  },
  {
    name: "python-redis-lock",
    icon: "📦",
  },
  {
    name: "jupyter-contrib-core",
    icon: "📦",
  },
  {
    name: "pybase64",
    icon: "📦",
  },
  {
    name: "youtube-dl-server",
    icon: "📦",
  },
  {
    name: "pympler",
    icon: "📦",
  },
  {
    name: "jupyter-contrib-nbextensions",
    icon: "📦",
  },
  {
    name: "requests-unixsocket",
    icon: "📦",
  },
  {
    name: "django-picklefield",
    icon: "📦",
  },
  {
    name: "pdbpp",
    icon: "📦",
  },
  {
    name: "snapshottest",
    icon: "📦",
  },
  {
    name: "sphinxcontrib-httpdomain",
    icon: "📦",
  },
  {
    name: "environs",
    icon: "📦",
  },
  {
    name: "ipy",
    icon: "📦",
  },
  {
    name: "check-manifest",
    icon: "📦",
  },
  {
    name: "webdriver-manager",
    icon: "📦",
  },
  {
    name: "pylint-celery",
    icon: "📦",
  },
  {
    name: "django-treebeard",
    icon: "📦",
  },
  {
    name: "alog",
    icon: "📦",
  },
  {
    name: "currencyconverter",
    icon: "📦",
  },
  {
    name: "publicsuffix",
    icon: "📦",
  },
  {
    name: "pytest-variables",
    icon: "📦",
  },
  {
    name: "pydub",
    icon: "📦",
  },
  {
    name: "djangorestframework-camel-case",
    icon: "📦",
  },
  {
    name: "google-cloud-tasks",
    icon: "📦",
  },
  {
    name: "electrical-calendar",
    icon: "📦",
  },
  {
    name: "hupper",
    icon: "📦",
  },
  {
    name: "brewer2mpl",
    icon: "📦",
  },
  {
    name: "motor",
    icon: "📦",
  },
  {
    name: "ortools",
    icon: "📦",
  },
  {
    name: "overrides",
    icon: "📦",
  },
  {
    name: "tfrecord-lite",
    icon: "📦",
  },
  {
    name: "rq-scheduler",
    icon: "📦",
  },
  {
    name: "impyla",
    icon: "📦",
  },
  {
    name: "palettable",
    icon: "📦",
  },
  {
    name: "pypyodbc",
    icon: "📦",
  },
  {
    name: "dataclasses-serialization",
    icon: "📦",
  },
  {
    name: "wsaccel",
    icon: "📦",
  },
  {
    name: "django-otp",
    icon: "📦",
  },
  {
    name: "zmq",
    icon: "📦",
  },
  {
    name: "partybotpackage",
    icon: "📦",
  },
  {
    name: "jupyter-highlight-selected-word",
    icon: "📦",
  },
  {
    name: "lunr",
    icon: "📦",
  },
  {
    name: "selinux",
    icon: "📦",
  },
  {
    name: "django-axes",
    icon: "📦",
  },
  {
    name: "pyjwkest",
    icon: "📦",
  },
  {
    name: "python-multipart",
    icon: "📦",
  },
  {
    name: "xhtml2pdf",
    icon: "📦",
  },
  {
    name: "bugsnag",
    icon: "📦",
  },
  {
    name: "django-stubs",
    icon: "📦",
  },
  {
    name: "dodgy",
    icon: "📦",
  },
  {
    name: "delorean",
    icon: "📦",
  },
  {
    name: "librato-metrics",
    icon: "📦",
  },
  {
    name: "flasgger",
    icon: "📦",
  },
  {
    name: "asana",
    icon: "📦",
  },
  {
    name: "dm-tree",
    icon: "📦",
  },
  {
    name: "ec2-metadata",
    icon: "📦",
  },
  {
    name: "pyzipcode3",
    icon: "📦",
  },
  {
    name: "django-health-check",
    icon: "📦",
  },
  {
    name: "pyobjc",
    icon: "📦",
  },
  {
    name: "neotime",
    icon: "📦",
  },
  {
    name: "base64io",
    icon: "📦",
  },
  {
    name: "djangorestframework-csv",
    icon: "📦",
  },
  {
    name: "channels-redis",
    icon: "📦",
  },
  {
    name: "gspread-dataframe",
    icon: "📦",
  },
  {
    name: "gapic-google-cloud-error-reporting-v1beta1",
    icon: "📦",
  },
  {
    name: "dictionaries",
    icon: "📦",
  },
  {
    name: "proto-google-cloud-error-reporting-v1beta1",
    icon: "📦",
  },
  {
    name: "avro-gen",
    icon: "📦",
  },
  {
    name: "pygrok",
    icon: "📦",
  },
  {
    name: "pywinauto",
    icon: "📦",
  },
  {
    name: "timing-asgi",
    icon: "📦",
  },
  {
    name: "ur-rtde",
    icon: "📦",
  },
  {
    name: "javaobj-py3",
    icon: "📦",
  },
  {
    name: "httpagentparser",
    icon: "📦",
  },
  {
    name: "queueman",
    icon: "📦",
  },
  {
    name: "pyjks",
    icon: "📦",
  },
  {
    name: "aws-encryption-sdk-cli",
    icon: "📦",
  },
  {
    name: "google-oauth",
    icon: "📦",
  },
  {
    name: "boto3-type-annotations",
    icon: "📦",
  },
  {
    name: "pylibmc",
    icon: "📦",
  },
  {
    name: "amazon-dax-client",
    icon: "📦",
  },
  {
    name: "flatten-json",
    icon: "📦",
  },
  {
    name: "robotframework-requests",
    icon: "📦",
  },
  {
    name: "twofish",
    icon: "📦",
  },
  {
    name: "wsproto",
    icon: "📦",
  },
  {
    name: "ibm-cos-sdk",
    icon: "📦",
  },
  {
    name: "python-xlib",
    icon: "📦",
  },
  {
    name: "mpld3",
    icon: "📦",
  },
  {
    name: "pyreadline",
    icon: "📦",
  },
  {
    name: "xvfbwrapper",
    icon: "📦",
  },
  {
    name: "progress",
    icon: "📦",
  },
  {
    name: "django-anymail",
    icon: "📦",
  },
  {
    name: "chart-studio",
    icon: "📦",
  },
  {
    name: "h2o-pysparkling-2-4",
    icon: "📦",
  },
  {
    name: "flask-api",
    icon: "📦",
  },
  {
    name: "elasticsearch5",
    icon: "📦",
  },
  {
    name: "oauth",
    icon: "📦",
  },
  {
    name: "pex",
    icon: "📦",
  },
  {
    name: "pyahocorasick",
    icon: "📦",
  },
  {
    name: "eth-utils",
    icon: "📦",
  },
  {
    name: "civis",
    icon: "📦",
  },
  {
    name: "socksipy-branch",
    icon: "📦",
  },
  {
    name: "datadiff",
    icon: "📦",
  },
  {
    name: "transaction",
    icon: "📦",
  },
  {
    name: "pyspark-flame",
    icon: "📦",
  },
  {
    name: "gnupg",
    icon: "📦",
  },
  {
    name: "interval",
    icon: "📦",
  },
  {
    name: "pymsteams",
    icon: "📦",
  },
  {
    name: "pytest-base-url",
    icon: "📦",
  },
  {
    name: "beaker",
    icon: "📦",
  },
  {
    name: "proto-google-cloud-pubsub-v1",
    icon: "📦",
  },
  {
    name: "jinjasql",
    icon: "📦",
  },
  {
    name: "flake8-blind-except",
    icon: "📦",
  },
  {
    name: "pyrepl",
    icon: "📦",
  },
  {
    name: "pytest-shard",
    icon: "📦",
  },
  {
    name: "uritools",
    icon: "📦",
  },
  {
    name: "python-resize-image",
    icon: "📦",
  },
  {
    name: "ntplib",
    icon: "📦",
  },
  {
    name: "apns2",
    icon: "📦",
  },
  {
    name: "tox-travis",
    icon: "📦",
  },
  {
    name: "limits",
    icon: "📦",
  },
  {
    name: "threatconnect",
    icon: "📦",
  },
  {
    name: "django-guardian",
    icon: "📦",
  },
  {
    name: "integrationhelper",
    icon: "📦",
  },
  {
    name: "ts-flint",
    icon: "📦",
  },
  {
    name: "eth-typing",
    icon: "📦",
  },
  {
    name: "pytest-selenium",
    icon: "📦",
  },
  {
    name: "iptools",
    icon: "📦",
  },
  {
    name: "pypng",
    icon: "📦",
  },
  {
    name: "django-silk",
    icon: "📦",
  },
  {
    name: "m2crypto",
    icon: "📦",
  },
  {
    name: "dateutils",
    icon: "📦",
  },
  {
    name: "pandas-datareader",
    icon: "📦",
  },
  {
    name: "pymediainfo",
    icon: "📦",
  },
  {
    name: "scout-apm",
    icon: "📦",
  },
  {
    name: "enum",
    icon: "📦",
  },
  {
    name: "restructuredtext-lint",
    icon: "📦",
  },
  {
    name: "magicattr",
    icon: "📦",
  },
  {
    name: "json-rpc",
    icon: "📦",
  },
  {
    name: "sgmllib3k",
    icon: "📦",
  },
  {
    name: "tinydb",
    icon: "📦",
  },
  {
    name: "path",
    icon: "📦",
  },
  {
    name: "simpleitk",
    icon: "📦",
  },
  {
    name: "python3-xlib",
    icon: "📦",
  },
  {
    name: "fasttext",
    icon: "📦",
  },
  {
    name: "query-string",
    icon: "📦",
  },
  {
    name: "marisa-trie",
    icon: "📦",
  },
  {
    name: "nbsphinx",
    icon: "📦",
  },
  {
    name: "xmlrunner",
    icon: "📦",
  },
  {
    name: "optuna",
    icon: "📦",
  },
  {
    name: "prospector",
    icon: "📦",
  },
  {
    name: "django-ckeditor",
    icon: "📦",
  },
  {
    name: "logging",
    icon: "📦",
  },
  {
    name: "selenium-wire",
    icon: "📦",
  },
  {
    name: "auth0-python",
    icon: "📦",
  },
  {
    name: "pyfcm",
    icon: "📦",
  },
  {
    name: "yattag",
    icon: "📦",
  },
  {
    name: "requirements-detector",
    icon: "📦",
  },
  {
    name: "pprintpp",
    icon: "📦",
  },
  {
    name: "databricks-pypi-extras",
    icon: "📦",
  },
  {
    name: "vulture",
    icon: "📦",
  },
  {
    name: "aerospike",
    icon: "📦",
  },
  {
    name: "pamela",
    icon: "📦",
  },
  {
    name: "proglog",
    icon: "📦",
  },
  {
    name: "easydict",
    icon: "📦",
  },
  {
    name: "pytest-custom-exit-code",
    icon: "📦",
  },
  {
    name: "sphinx-autobuild",
    icon: "📦",
  },
  {
    name: "esptool",
    icon: "📦",
  },
  {
    name: "pytest-cache",
    icon: "📦",
  },
  {
    name: "pytest-dependency",
    icon: "📦",
  },
  {
    name: "elasticsearch-curator",
    icon: "📦",
  },
  {
    name: "visions",
    icon: "📦",
  },
  {
    name: "setoptconf",
    icon: "📦",
  },
  {
    name: "ibm-cos-sdk-core",
    icon: "📦",
  },
  {
    name: "ibm-cos-sdk-s3transfer",
    icon: "📦",
  },
  {
    name: "pyactiveresource",
    icon: "📦",
  },
  {
    name: "telethon",
    icon: "📦",
  },
  {
    name: "pytest-pylint",
    icon: "📦",
  },
  {
    name: "tangled-up-in-unicode",
    icon: "📦",
  },
  {
    name: "mecab-python3",
    icon: "📦",
  },
  {
    name: "psycogreen",
    icon: "📦",
  },
  {
    name: "aiocontextvars",
    icon: "📦",
  },
  {
    name: "click-help-colors",
    icon: "📦",
  },
  {
    name: "uszipcode",
    icon: "📦",
  },
  {
    name: "objgraph",
    icon: "📦",
  },
  {
    name: "gremlinpython",
    icon: "📦",
  },
  {
    name: "google-cloud-texttospeech",
    icon: "📦",
  },
  {
    name: "osqp",
    icon: "📦",
  },
  {
    name: "wasmer",
    icon: "📦",
  },
  {
    name: "shopifyapi",
    icon: "📦",
  },
  {
    name: "pytest-aiohttp",
    icon: "📦",
  },
  {
    name: "pysam",
    icon: "📦",
  },
  {
    name: "cmarkgfm",
    icon: "📦",
  },
  {
    name: "geventhttpclient-wheels",
    icon: "📦",
  },
  {
    name: "opencensus-ext-stackdriver",
    icon: "📦",
  },
  {
    name: "web3",
    icon: "📦",
  },
  {
    name: "gapic-google-cloud-pubsub-v1",
    icon: "📦",
  },
  {
    name: "cvxpy",
    icon: "📦",
  },
  {
    name: "distance",
    icon: "📦",
  },
  {
    name: "json-delta",
    icon: "📦",
  },
  {
    name: "dbutils",
    icon: "📦",
  },
  {
    name: "webassets",
    icon: "📦",
  },
  {
    name: "django-prometheus",
    icon: "📦",
  },
  {
    name: "fastcluster",
    icon: "📦",
  },
  {
    name: "splunk-sdk",
    icon: "📦",
  },
  {
    name: "flask-session",
    icon: "📦",
  },
  {
    name: "google-api-helper",
    icon: "📦",
  },
  {
    name: "newlinejson",
    icon: "📦",
  },
  {
    name: "eth-abi",
    icon: "📦",
  },
  {
    name: "colorclass",
    icon: "📦",
  },
  {
    name: "pycocotools",
    icon: "📦",
  },
  {
    name: "selectors2",
    icon: "📦",
  },
  {
    name: "elasticsearch6",
    icon: "📦",
  },
  {
    name: "pyscreenshot",
    icon: "📦",
  },
  {
    name: "stestr",
    icon: "📦",
  },
  {
    name: "httmock",
    icon: "📦",
  },
  {
    name: "oci",
    icon: "📦",
  },
  {
    name: "neobolt",
    icon: "📦",
  },
  {
    name: "lifelines",
    icon: "📦",
  },
  {
    name: "cov-core",
    icon: "📦",
  },
  {
    name: "verboselogs",
    icon: "📦",
  },
  {
    name: "plaster-pastedeploy",
    icon: "📦",
  },
  {
    name: "python-jwt",
    icon: "📦",
  },
  {
    name: "pyhcl",
    icon: "📦",
  },
  {
    name: "comtypes",
    icon: "📦",
  },
  {
    name: "request",
    icon: "📦",
  },
  {
    name: "flask-bootstrap",
    icon: "📦",
  },
  {
    name: "jws",
    icon: "📦",
  },
  {
    name: "biplist",
    icon: "📦",
  },
  {
    name: "rake-nltk",
    icon: "📦",
  },
  {
    name: "mizani",
    icon: "📦",
  },
  {
    name: "pyroute2",
    icon: "📦",
  },
  {
    name: "plaster",
    icon: "📦",
  },
  {
    name: "bingads",
    icon: "📦",
  },
  {
    name: "django-dirtyfields",
    icon: "📦",
  },
  {
    name: "flask-talisman",
    icon: "📦",
  },
  {
    name: "dynaconf",
    icon: "📦",
  },
  {
    name: "get",
    icon: "📦",
  },
  {
    name: "easy-thumbnails",
    icon: "📦",
  },
  {
    name: "requests-cache",
    icon: "📦",
  },
  {
    name: "post",
    icon: "📦",
  },
  {
    name: "django-grappelli",
    icon: "📦",
  },
  {
    name: "biopython",
    icon: "📦",
  },
  {
    name: "pyldap",
    icon: "📦",
  },
  {
    name: "parsley",
    icon: "📦",
  },
  {
    name: "flask-graphql",
    icon: "📦",
  },
  {
    name: "ecos",
    icon: "📦",
  },
  {
    name: "scs",
    icon: "📦",
  },
  {
    name: "crc16",
    icon: "📦",
  },
  {
    name: "utils",
    icon: "📦",
  },
  {
    name: "openapi-core",
    icon: "📦",
  },
  {
    name: "ofxparse",
    icon: "📦",
  },
  {
    name: "hjson",
    icon: "📦",
  },
  {
    name: "profilehooks",
    icon: "📦",
  },
  {
    name: "amply",
    icon: "📦",
  },
  {
    name: "rednose",
    icon: "📦",
  },
  {
    name: "django-user-agents",
    icon: "📦",
  },
  {
    name: "typish",
    icon: "📦",
  },
  {
    name: "nimbusml",
    icon: "📦",
  },
  {
    name: "httpie",
    icon: "📦",
  },
  {
    name: "graypy",
    icon: "📦",
  },
  {
    name: "getch",
    icon: "📦",
  },
  {
    name: "cmaes",
    icon: "📦",
  },
  {
    name: "placebo",
    icon: "📦",
  },
  {
    name: "plotnine",
    icon: "📦",
  },
  {
    name: "jupyterhub",
    icon: "📦",
  },
  {
    name: "logzio-python-handler",
    icon: "📦",
  },
  {
    name: "fs",
    icon: "📦",
  },
  {
    name: "pubnub",
    icon: "📦",
  },
  {
    name: "pywebpush",
    icon: "📦",
  },
  {
    name: "suds",
    icon: "📦",
  },
  {
    name: "robotframework-sshlibrary",
    icon: "📦",
  },
  {
    name: "jupyter-pip",
    icon: "📦",
  },
  {
    name: "sphinx-markdown-tables",
    icon: "📦",
  },
  {
    name: "anytree",
    icon: "📦",
  },
  {
    name: "marshmallow-oneofschema",
    icon: "📦",
  },
  {
    name: "coffeehouse",
    icon: "📦",
  },
  {
    name: "pygtrie",
    icon: "📦",
  },
  {
    name: "pygeocoder",
    icon: "📦",
  },
  {
    name: "umap-learn",
    icon: "📦",
  },
  {
    name: "sphinx-autodoc-typehints",
    icon: "📦",
  },
  {
    name: "urlobject",
    icon: "📦",
  },
  {
    name: "tlslite",
    icon: "📦",
  },
  {
    name: "pusher",
    icon: "📦",
  },
  {
    name: "slimit",
    icon: "📦",
  },
  {
    name: "brunel",
    icon: "📦",
  },
  {
    name: "hdbscan",
    icon: "📦",
  },
  {
    name: "zeroconf",
    icon: "📦",
  },
  {
    name: "django-celery",
    icon: "📦",
  },
  {
    name: "textdistance",
    icon: "📦",
  },
  {
    name: "td-client",
    icon: "📦",
  },
  {
    name: "infinity",
    icon: "📦",
  },
  {
    name: "pytest-random-order",
    icon: "📦",
  },
  {
    name: "cheetah3",
    icon: "📦",
  },
  {
    name: "pyside2",
    icon: "📦",
  },
  {
    name: "colorful",
    icon: "📦",
  },
  {
    name: "pipfile",
    icon: "📦",
  },
  {
    name: "shiboken2",
    icon: "📦",
  },
  {
    name: "requests-pkcs12",
    icon: "📦",
  },
  {
    name: "speechrecognition",
    icon: "📦",
  },
  {
    name: "shyaml",
    icon: "📦",
  },
  {
    name: "py-moneyed",
    icon: "📦",
  },
  {
    name: "pycli",
    icon: "📦",
  },
  {
    name: "streamlit",
    icon: "📦",
  },
  {
    name: "rethinkdb",
    icon: "📦",
  },
  {
    name: "click-log",
    icon: "📦",
  },
  {
    name: "pygal",
    icon: "📦",
  },
  {
    name: "implicit",
    icon: "📦",
  },
  {
    name: "pymc3",
    icon: "📦",
  },
  {
    name: "rpy2",
    icon: "📦",
  },
  {
    name: "pydrive",
    icon: "📦",
  },
  {
    name: "django-tables2",
    icon: "📦",
  },
  {
    name: "testing-common-database",
    icon: "📦",
  },
  {
    name: "ifaddr",
    icon: "📦",
  },
  {
    name: "intervals",
    icon: "📦",
  },
  {
    name: "sorl-thumbnail",
    icon: "📦",
  },
  {
    name: "termstyle",
    icon: "📦",
  },
  {
    name: "sphinxcontrib-bibtex",
    icon: "📦",
  },
  {
    name: "requests-html",
    icon: "📦",
  },
  {
    name: "awsiotpythonsdk",
    icon: "📦",
  },
  {
    name: "flask-restx",
    icon: "📦",
  },
  {
    name: "atari-py",
    icon: "📦",
  },
  {
    name: "sphinxcontrib-plantuml",
    icon: "📦",
  },
  {
    name: "prance",
    icon: "📦",
  },
  {
    name: "names",
    icon: "📦",
  },
  {
    name: "pem",
    icon: "📦",
  },
  {
    name: "django-admin-rangefilter",
    icon: "📦",
  },
  {
    name: "sphinxcontrib-spelling",
    icon: "📦",
  },
  {
    name: "collectd",
    icon: "📦",
  },
  {
    name: "django-jsonfield",
    icon: "📦",
  },
  {
    name: "yaspin",
    icon: "📦",
  },
  {
    name: "azure-functions",
    icon: "📦",
  },
  {
    name: "suds-py3",
    icon: "📦",
  },
  {
    name: "hmmlearn",
    icon: "📦",
  },
  {
    name: "envs",
    icon: "📦",
  },
  {
    name: "eth-hash",
    icon: "📦",
  },
  {
    name: "pandoc",
    icon: "📦",
  },
  {
    name: "flask-mysql",
    icon: "📦",
  },
  {
    name: "click-didyoumean",
    icon: "📦",
  },
  {
    name: "geventhttpclient",
    icon: "📦",
  },
  {
    name: "spotdl",
    icon: "📦",
  },
  {
    name: "dacite",
    icon: "📦",
  },
  {
    name: "peakutils",
    icon: "📦",
  },
  {
    name: "imapclient",
    icon: "📦",
  },
  {
    name: "rlp",
    icon: "📦",
  },
  {
    name: "word2number",
    icon: "📦",
  },
  {
    name: "django-fsm",
    icon: "📦",
  },
  {
    name: "django-classy-tags",
    icon: "📦",
  },
  {
    name: "install",
    icon: "📦",
  },
  {
    name: "tokenize-rt",
    icon: "📦",
  },
  {
    name: "superlance",
    icon: "📦",
  },
  {
    name: "apiclient",
    icon: "📦",
  },
  {
    name: "django-ratelimit",
    icon: "📦",
  },
  {
    name: "bravado-core",
    icon: "📦",
  },
  {
    name: "colored",
    icon: "📦",
  },
  {
    name: "ncclient",
    icon: "📦",
  },
  {
    name: "newrelic-telemetry-sdk",
    icon: "📦",
  },
  {
    name: "django-crontab",
    icon: "📦",
  },
  {
    name: "pythonwhois",
    icon: "📦",
  },
  {
    name: "flask-principal",
    icon: "📦",
  },
  {
    name: "lightfm",
    icon: "📦",
  },
  {
    name: "pytest-azurepipelines",
    icon: "📦",
  },
  {
    name: "dumbyaml",
    icon: "📦",
  },
  {
    name: "globre",
    icon: "📦",
  },
  {
    name: "testresources",
    icon: "📦",
  },
  {
    name: "lml",
    icon: "📦",
  },
  {
    name: "logutils",
    icon: "📦",
  },
  {
    name: "pytd",
    icon: "📦",
  },
  {
    name: "commentjson",
    icon: "📦",
  },
  {
    name: "tableauhyperapi",
    icon: "📦",
  },
  {
    name: "tensorflow-cpu",
    icon: "📦",
  },
  {
    name: "htcondor",
    icon: "📦",
  },
  {
    name: "kaggle",
    icon: "📦",
  },
  {
    name: "treelib",
    icon: "📦",
  },
  {
    name: "fastjsonschema",
    icon: "📦",
  },
  {
    name: "django-autocomplete-light",
    icon: "📦",
  },
  {
    name: "stopit",
    icon: "📦",
  },
  {
    name: "jsonpath-rw-ext",
    icon: "📦",
  },
  {
    name: "flask-apispec",
    icon: "📦",
  },
  {
    name: "xmljson",
    icon: "📦",
  },
  {
    name: "testscenarios",
    icon: "📦",
  },
  {
    name: "us",
    icon: "📦",
  },
  {
    name: "capstone",
    icon: "📦",
  },
  {
    name: "google-cloud-automl",
    icon: "📦",
  },
  {
    name: "reverse-geocoder",
    icon: "📦",
  },
  {
    name: "justwatch",
    icon: "📦",
  },
  {
    name: "onnxconverter-common",
    icon: "📦",
  },
  {
    name: "django-tastypie",
    icon: "📦",
  },
  {
    name: "more-properties",
    icon: "📦",
  },
  {
    name: "geohash2",
    icon: "📦",
  },
  {
    name: "entrypoint2",
    icon: "📦",
  },
  {
    name: "django-csp",
    icon: "📦",
  },
  {
    name: "httpbin",
    icon: "📦",
  },
  {
    name: "pyaudio",
    icon: "📦",
  },
  {
    name: "flask-basicauth",
    icon: "📦",
  },
  {
    name: "eth-keys",
    icon: "📦",
  },
  {
    name: "twitter-common-lang",
    icon: "📦",
  },
  {
    name: "facenet",
    icon: "📦",
  },
  {
    name: "kazurator",
    icon: "📦",
  },
  {
    name: "lottie",
    icon: "📦",
  },
  {
    name: "portpicker",
    icon: "📦",
  },
  {
    name: "pyexcel-io",
    icon: "📦",
  },
  {
    name: "horovod",
    icon: "📦",
  },
  {
    name: "jsii",
    icon: "📦",
  },
  {
    name: "asset",
    icon: "📦",
  },
  {
    name: "twitter-common-dirutil",
    icon: "📦",
  },
  {
    name: "python-geoip",
    icon: "📦",
  },
  {
    name: "django-bulk-update",
    icon: "📦",
  },
  {
    name: "deezloader",
    icon: "📦",
  },
  {
    name: "textfsm",
    icon: "📦",
  },
  {
    name: "opencensus-ext-logging",
    icon: "📦",
  },
  {
    name: "awswrangler",
    icon: "📦",
  },
  {
    name: "pytest-mypy",
    icon: "📦",
  },
  {
    name: "aws-cdk-core",
    icon: "📦",
  },
  {
    name: "latexcodec",
    icon: "📦",
  },
  {
    name: "databricks-pypi",
    icon: "📦",
  },
  {
    name: "p4python",
    icon: "📦",
  },
  {
    name: "arviz",
    icon: "📦",
  },
  {
    name: "django-heroku",
    icon: "📦",
  },
  {
    name: "aws-cdk-cx-api",
    icon: "📦",
  },
  {
    name: "trafaret",
    icon: "📦",
  },
  {
    name: "pygeohash",
    icon: "📦",
  },
  {
    name: "hacking",
    icon: "📦",
  },
  {
    name: "pybtex",
    icon: "📦",
  },
  {
    name: "futurist",
    icon: "📦",
  },
  {
    name: "grpc-google-logging-v2",
    icon: "📦",
  },
  {
    name: "google-images-search",
    icon: "📦",
  },
  {
    name: "createsend",
    icon: "📦",
  },
  {
    name: "pydevd",
    icon: "📦",
  },
  {
    name: "pyxlsb",
    icon: "📦",
  },
  {
    name: "twitter-common-log",
    icon: "📦",
  },
  {
    name: "pywatchman",
    icon: "📦",
  },
  {
    name: "twitter-common-options",
    icon: "📦",
  },
  {
    name: "spark-df-profiling",
    icon: "📦",
  },
  {
    name: "teamcity-messages",
    icon: "📦",
  },
  {
    name: "testing-postgresql",
    icon: "📦",
  },
  {
    name: "unicode-slugify",
    icon: "📦",
  },
  {
    name: "flock",
    icon: "📦",
  },
  {
    name: "dumb-init",
    icon: "📦",
  },
  {
    name: "tensorflow-text",
    icon: "📦",
  },
  {
    name: "grpc-google-pubsub-v1",
    icon: "📦",
  },
  {
    name: "patool",
    icon: "📦",
  },
  {
    name: "spotify-tensorflow",
    icon: "📦",
  },
  {
    name: "urlopen",
    icon: "📦",
  },
  {
    name: "pywebhdfs",
    icon: "📦",
  },
  {
    name: "json2parquet",
    icon: "📦",
  },
  {
    name: "flatten-dict",
    icon: "📦",
  },
  {
    name: "eth-account",
    icon: "📦",
  },
  {
    name: "django-haystack",
    icon: "📦",
  },
  {
    name: "aws-cdk-region-info",
    icon: "📦",
  },
  {
    name: "pooch",
    icon: "📦",
  },
  {
    name: "gax-google-logging-v2",
    icon: "📦",
  },
  {
    name: "requirements-parser",
    icon: "📦",
  },
  {
    name: "gspread-pandas",
    icon: "📦",
  },
  {
    name: "flask-assets",
    icon: "📦",
  },
  {
    name: "hexbytes",
    icon: "📦",
  },
  {
    name: "autograd-gamma",
    icon: "📦",
  },
  {
    name: "aws-cdk-aws-iam",
    icon: "📦",
  },
  {
    name: "ptpython",
    icon: "📦",
  },
  {
    name: "configspace",
    icon: "📦",
  },
  {
    name: "gax-google-pubsub-v1",
    icon: "📦",
  },
  {
    name: "robotframework-selenium2library",
    icon: "📦",
  },
  {
    name: "python-oauth2",
    icon: "📦",
  },
  {
    name: "publication",
    icon: "📦",
  },
  {
    name: "django-coverage-plugin",
    icon: "📦",
  },
  {
    name: "pysmb",
    icon: "📦",
  },
  {
    name: "first",
    icon: "📦",
  },
  {
    name: "yappi",
    icon: "📦",
  },
  {
    name: "google-ads",
    icon: "📦",
  },
  {
    name: "vadersentiment",
    icon: "📦",
  },
  {
    name: "grpcio-status",
    icon: "📦",
  },
  {
    name: "dohq-artifactory",
    icon: "📦",
  },
  {
    name: "pydicom",
    icon: "📦",
  },
  {
    name: "yfinance",
    icon: "📦",
  },
  {
    name: "circuitbreaker",
    icon: "📦",
  },
  {
    name: "aioresponses",
    icon: "📦",
  },
  {
    name: "drf-extensions",
    icon: "📦",
  },
  {
    name: "auditwheel",
    icon: "📦",
  },
  {
    name: "keras2onnx",
    icon: "📦",
  },
  {
    name: "zope-sqlalchemy",
    icon: "📦",
  },
  {
    name: "pyzabbix",
    icon: "📦",
  },
  {
    name: "eth-rlp",
    icon: "📦",
  },
  {
    name: "mkdocs-minify-plugin",
    icon: "📦",
  },
  {
    name: "pytube3",
    icon: "📦",
  },
  {
    name: "eth-keyfile",
    icon: "📦",
  },
  {
    name: "pytest-pep8",
    icon: "📦",
  },
  {
    name: "pyarabic",
    icon: "📦",
  },
  {
    name: "pybtex-docutils",
    icon: "📦",
  },
  {
    name: "m2r",
    icon: "📦",
  },
  {
    name: "eyed3",
    icon: "📦",
  },
  {
    name: "skl2onnx",
    icon: "📦",
  },
  {
    name: "wordsegment",
    icon: "📦",
  },
  {
    name: "heroku3",
    icon: "📦",
  },
  {
    name: "click-repl",
    icon: "📦",
  },
  {
    name: "oset",
    icon: "📦",
  },
  {
    name: "lazy-import",
    icon: "📦",
  },
  {
    name: "omegaconf",
    icon: "📦",
  },
  {
    name: "python-heatclient",
    icon: "📦",
  },
  {
    name: "pyod",
    icon: "📦",
  },
  {
    name: "python-twitter",
    icon: "📦",
  },
  {
    name: "rdflib-jsonld",
    icon: "📦",
  },
  {
    name: "interpret-core",
    icon: "📦",
  },
  {
    name: "readline",
    icon: "📦",
  },
  {
    name: "glom",
    icon: "📦",
  },
  {
    name: "html-telegraph-poster",
    icon: "📦",
  },
  {
    name: "img2pdf",
    icon: "📦",
  },
  {
    name: "jwt",
    icon: "📦",
  },
  {
    name: "log-symbols",
    icon: "📦",
  },
  {
    name: "nosexcover",
    icon: "📦",
  },
  {
    name: "quandl",
    icon: "📦",
  },
  {
    name: "nose-cov",
    icon: "📦",
  },
  {
    name: "aws-cdk-aws-kms",
    icon: "📦",
  },
  {
    name: "twitter",
    icon: "📦",
  },
  {
    name: "fake-factory",
    icon: "📦",
  },
  {
    name: "hmsclient",
    icon: "📦",
  },
  {
    name: "slacker-log-handler",
    icon: "📦",
  },
  {
    name: "bravado",
    icon: "📦",
  },
  {
    name: "flask-limiter",
    icon: "📦",
  },
  {
    name: "face",
    icon: "📦",
  },
  {
    name: "tinyrpc",
    icon: "📦",
  },
  {
    name: "namedlist",
    icon: "📦",
  },
  {
    name: "grpcio-reflection",
    icon: "📦",
  },
  {
    name: "wsgi-request-logger",
    icon: "📦",
  },
  {
    name: "aws-cdk-aws-cloudwatch",
    icon: "📦",
  },
  {
    name: "param",
    icon: "📦",
  },
  {
    name: "injector",
    icon: "📦",
  },
  {
    name: "yamlordereddictloader",
    icon: "📦",
  },
  {
    name: "meson",
    icon: "📦",
  },
  {
    name: "django-auth-ldap",
    icon: "📦",
  },
  {
    name: "aspy-refactor-imports",
    icon: "📦",
  },
  {
    name: "coremltools",
    icon: "📦",
  },
  {
    name: "googledrivedownloader",
    icon: "📦",
  },
  {
    name: "databricks",
    icon: "📦",
  },
  {
    name: "async-lru",
    icon: "📦",
  },
  {
    name: "django-bitfield",
    icon: "📦",
  },
  {
    name: "pyspark-dist-explore",
    icon: "📦",
  },
  {
    name: "av",
    icon: "📦",
  },
  {
    name: "tavern",
    icon: "📦",
  },
  {
    name: "vcsi",
    icon: "📦",
  },
  {
    name: "fastai",
    icon: "📦",
  },
  {
    name: "onnxmltools",
    icon: "📦",
  },
  {
    name: "nose-parameterized",
    icon: "📦",
  },
  {
    name: "aws-cdk-aws-ssm",
    icon: "📦",
  },
  {
    name: "mandrill",
    icon: "📦",
  },
  {
    name: "speaklater",
    icon: "📦",
  },
  {
    name: "halo",
    icon: "📦",
  },
  {
    name: "python-geoip-geolite2",
    icon: "📦",
  },
  {
    name: "coverage-badge",
    icon: "📦",
  },
  {
    name: "artifactory",
    icon: "📦",
  },
  {
    name: "spinners",
    icon: "📦",
  },
  {
    name: "yara-python",
    icon: "📦",
  },
  {
    name: "property-manager",
    icon: "📦",
  },
  {
    name: "scrypt",
    icon: "📦",
  },
  {
    name: "cpplint",
    icon: "📦",
  },
  {
    name: "plaid-python",
    icon: "📦",
  },
  {
    name: "aws-cdk-aws-events",
    icon: "📦",
  },
  {
    name: "evergreen-py",
    icon: "📦",
  },
  {
    name: "wincertstore",
    icon: "📦",
  },
  {
    name: "pytest-socket",
    icon: "📦",
  },
  {
    name: "config",
    icon: "📦",
  },
  {
    name: "comet-ml",
    icon: "📦",
  },
  {
    name: "lightstep",
    icon: "📦",
  },
  {
    name: "ngram",
    icon: "📦",
  },
  {
    name: "aws-cdk-aws-s3",
    icon: "📦",
  },
  {
    name: "drf-writable-nested",
    icon: "📦",
  },
  {
    name: "baselines",
    icon: "📦",
  },
  {
    name: "json2html",
    icon: "📦",
  },
  {
    name: "netmiko",
    icon: "📦",
  },
  {
    name: "django-bootstrap4",
    icon: "📦",
  },
  {
    name: "django-constance",
    icon: "📦",
  },
  {
    name: "ibmdbpy",
    icon: "📦",
  },
  {
    name: "konlpy",
    icon: "📦",
  },
  {
    name: "django-cacheops",
    icon: "📦",
  },
  {
    name: "itopy",
    icon: "📦",
  },
  {
    name: "peppercorn",
    icon: "📦",
  },
  {
    name: "cqlsh",
    icon: "📦",
  },
  {
    name: "vowpalwabbit",
    icon: "📦",
  },
  {
    name: "durationpy",
    icon: "📦",
  },
  {
    name: "persistent",
    icon: "📦",
  },
  {
    name: "scons",
    icon: "📦",
  },
  {
    name: "pytest-freezegun",
    icon: "📦",
  },
  {
    name: "deap",
    icon: "📦",
  },
  {
    name: "wurlitzer",
    icon: "📦",
  },
  {
    name: "concurrent-log-handler",
    icon: "📦",
  },
  {
    name: "python-redis",
    icon: "📦",
  },
  {
    name: "aws-cdk-aws-ec2",
    icon: "📦",
  },
  {
    name: "edgegrid-python",
    icon: "📦",
  },
  {
    name: "aws-cdk-aws-logs",
    icon: "📦",
  },
  {
    name: "pyinstaller-hooks-contrib",
    icon: "📦",
  },
  {
    name: "aws-cdk-assets",
    icon: "📦",
  },
  {
    name: "polling",
    icon: "📦",
  },
  {
    name: "flake8-logging-format",
    icon: "📦",
  },
  {
    name: "bayesian-optimization",
    icon: "📦",
  },
  {
    name: "dbt-core",
    icon: "📦",
  },
  {
    name: "dbfread",
    icon: "📦",
  },
  {
    name: "django-multiselectfield",
    icon: "📦",
  },
  {
    name: "pydruid",
    icon: "📦",
  },
  {
    name: "mkdocs-material-extensions",
    icon: "📦",
  },
  {
    name: "tensorflow-cloud",
    icon: "📦",
  },
  {
    name: "flake8-deprecated",
    icon: "📦",
  },
  {
    name: "kappa",
    icon: "📦",
  },
  {
    name: "aws-cdk-aws-s3-assets",
    icon: "📦",
  },
  {
    name: "aiopg",
    icon: "📦",
  },
  {
    name: "varint",
    icon: "📦",
  },
  {
    name: "flake8-debugger",
    icon: "📦",
  },
  {
    name: "aws-cdk-aws-sqs",
    icon: "📦",
  },
  {
    name: "seqeval",
    icon: "📦",
  },
  {
    name: "django-bootstrap3",
    icon: "📦",
  },
  {
    name: "minimal-snowplow-tracker",
    icon: "📦",
  },
  {
    name: "ipfshttpclient",
    icon: "📦",
  },
  {
    name: "aws-cdk-aws-lambda",
    icon: "📦",
  },
  {
    name: "oslo-db",
    icon: "📦",
  },
  {
    name: "logstash-formatter",
    icon: "📦",
  },
  {
    name: "wmi",
    icon: "📦",
  },
  {
    name: "pygeoip",
    icon: "📦",
  },
  {
    name: "asttokens",
    icon: "📦",
  },
  {
    name: "honcho",
    icon: "📦",
  },
  {
    name: "cron-descriptor",
    icon: "📦",
  },
  {
    name: "sqlalchemy-stubs",
    icon: "📦",
  },
  {
    name: "multiaddr",
    icon: "📦",
  },
  {
    name: "git-lint",
    icon: "📦",
  },
  {
    name: "btrees",
    icon: "📦",
  },
  {
    name: "predicthq",
    icon: "📦",
  },
  {
    name: "combo",
    icon: "📦",
  },
  {
    name: "apache-libcloud",
    icon: "📦",
  },
  {
    name: "intelhex",
    icon: "📦",
  },
  {
    name: "androguard",
    icon: "📦",
  },
  {
    name: "suod",
    icon: "📦",
  },
  {
    name: "memcnn",
    icon: "📦",
  },
  {
    name: "django-sekizai",
    icon: "📦",
  },
  {
    name: "neo4j",
    icon: "📦",
  },
  {
    name: "flake8-tidy-imports",
    icon: "📦",
  },
  {
    name: "pyudev",
    icon: "📦",
  },
  {
    name: "python-coveralls",
    icon: "📦",
  },
  {
    name: "transifex-client",
    icon: "📦",
  },
  {
    name: "hdfs3",
    icon: "📦",
  },
  {
    name: "pygerduty",
    icon: "📦",
  },
  {
    name: "pydeck",
    icon: "📦",
  },
  {
    name: "pyqrcode",
    icon: "📦",
  },
  {
    name: "gsutil",
    icon: "📦",
  },
  {
    name: "emoji-country-flag",
    icon: "📦",
  },
  {
    name: "pybrake",
    icon: "📦",
  },
  {
    name: "pytorch-pretrained-bert",
    icon: "📦",
  },
  {
    name: "bunch",
    icon: "📦",
  },
  {
    name: "graphite-web",
    icon: "📦",
  },
  {
    name: "shrub-py",
    icon: "📦",
  },
  {
    name: "sacrebleu",
    icon: "📦",
  },
  {
    name: "django-pipeline",
    icon: "📦",
  },
  {
    name: "whoosh",
    icon: "📦",
  },
  {
    name: "zappa",
    icon: "📦",
  },
  {
    name: "gpustat",
    icon: "📦",
  },
  {
    name: "django-modeltranslation",
    icon: "📦",
  },
  {
    name: "jsonmerge",
    icon: "📦",
  },
  {
    name: "pathvalidate",
    icon: "📦",
  },
  {
    name: "modernize",
    icon: "📦",
  },
  {
    name: "zenpy",
    icon: "📦",
  },
  {
    name: "logzero",
    icon: "📦",
  },
  {
    name: "mockito",
    icon: "📦",
  },
  {
    name: "codetiming",
    icon: "📦",
  },
  {
    name: "glitch-this",
    icon: "📦",
  },
  {
    name: "ccy",
    icon: "📦",
  },
  {
    name: "oslo-messaging",
    icon: "📦",
  },
  {
    name: "tf-nightly",
    icon: "📦",
  },
  {
    name: "pykmip",
    icon: "📦",
  },
  {
    name: "websocket",
    icon: "📦",
  },
  {
    name: "pip-api",
    icon: "📦",
  },
  {
    name: "debugpy",
    icon: "📦",
  },
  {
    name: "etcd3",
    icon: "📦",
  },
  {
    name: "uritemplate-py",
    icon: "📦",
  },
  {
    name: "aws-cdk-aws-sns",
    icon: "📦",
  },
  {
    name: "twitter-common-collections",
    icon: "📦",
  },
  {
    name: "vtk",
    icon: "📦",
  },
  {
    name: "django-compat",
    icon: "📦",
  },
  {
    name: "gspread-formatting",
    icon: "📦",
  },
  {
    name: "u-msgpack-python",
    icon: "📦",
  },
  {
    name: "oslo-policy",
    icon: "📦",
  },
  {
    name: "constructs",
    icon: "📦",
  },
  {
    name: "pytest-bdd",
    icon: "📦",
  },
  {
    name: "colander",
    icon: "📦",
  },
  {
    name: "testrepository",
    icon: "📦",
  },
  {
    name: "pastescript",
    icon: "📦",
  },
  {
    name: "sms-toolkit",
    icon: "📦",
  },
  {
    name: "itemadapter",
    icon: "📦",
  },
  {
    name: "asyncssh",
    icon: "📦",
  },
  {
    name: "html-testrunner",
    icon: "📦",
  },
  {
    name: "robotremoteserver",
    icon: "📦",
  },
  {
    name: "django-object-actions",
    icon: "📦",
  },
  {
    name: "dynamodb-json",
    icon: "📦",
  },
  {
    name: "graphyte",
    icon: "📦",
  },
  {
    name: "pynput",
    icon: "📦",
  },
  {
    name: "python-designateclient",
    icon: "📦",
  },
  {
    name: "dbt-postgres",
    icon: "📦",
  },
  {
    name: "comet-git-pure",
    icon: "📦",
  },
  {
    name: "python-jsonrpc-server",
    icon: "📦",
  },
  {
    name: "oslo-service",
    icon: "📦",
  },
  {
    name: "kneed",
    icon: "📦",
  },
  {
    name: "autosemver",
    icon: "📦",
  },
  {
    name: "future-fstrings",
    icon: "📦",
  },
  {
    name: "ovs",
    icon: "📦",
  },
  {
    name: "facebookads",
    icon: "📦",
  },
  {
    name: "model-bakery",
    icon: "📦",
  },
  {
    name: "sailthru-client",
    icon: "📦",
  },
  {
    name: "pytest-spark",
    icon: "📦",
  },
  {
    name: "poster",
    icon: "📦",
  },
  {
    name: "asteval",
    icon: "📦",
  },
  {
    name: "interpret-community",
    icon: "📦",
  },
  {
    name: "locust",
    icon: "📦",
  },
  {
    name: "pycron",
    icon: "📦",
  },
  {
    name: "marshmallow-dataclass",
    icon: "📦",
  },
  {
    name: "pygit2",
    icon: "📦",
  },
  {
    name: "assertpy",
    icon: "📦",
  },
  {
    name: "hologram",
    icon: "📦",
  },
  {
    name: "piexif",
    icon: "📦",
  },
  {
    name: "bindep",
    icon: "📦",
  },
  {
    name: "django-log-request-id",
    icon: "📦",
  },
  {
    name: "readchar",
    icon: "📦",
  },
  {
    name: "docx2txt",
    icon: "📦",
  },
  {
    name: "django-admin-sortable2",
    icon: "📦",
  },
  {
    name: "dbt-redshift",
    icon: "📦",
  },
  {
    name: "flask-pymongo",
    icon: "📦",
  },
  {
    name: "cursor",
    icon: "📦",
  },
  {
    name: "tornado-cors",
    icon: "📦",
  },
  {
    name: "google-cloud-iam",
    icon: "📦",
  },
  {
    name: "py2neo",
    icon: "📦",
  },
  {
    name: "concurrentloghandler",
    icon: "📦",
  },
  {
    name: "postal-address",
    icon: "📦",
  },
  {
    name: "ratelimiter",
    icon: "📦",
  },
  {
    name: "twython",
    icon: "📦",
  },
  {
    name: "oslo-middleware",
    icon: "📦",
  },
  {
    name: "flask-rq2",
    icon: "📦",
  },
  {
    name: "viivakoodi",
    icon: "📦",
  },
  {
    name: "sparqlwrapper",
    icon: "📦",
  },
  {
    name: "usps-api",
    icon: "📦",
  },
  {
    name: "aws-cdk-aws-route53",
    icon: "📦",
  },
  {
    name: "blist",
    icon: "📦",
  },
  {
    name: "mitmproxy",
    icon: "📦",
  },
  {
    name: "eradicate",
    icon: "📦",
  },
  {
    name: "dlib",
    icon: "📦",
  },
  {
    name: "aws-cdk-aws-cloudformation",
    icon: "📦",
  },
  {
    name: "pandas-usaddress",
    icon: "📦",
  },
  {
    name: "aws-cdk-aws-certificatemanager",
    icon: "📦",
  },
  {
    name: "antlr4-python2-runtime",
    icon: "📦",
  },
  {
    name: "image",
    icon: "📦",
  },
  {
    name: "ffmpeg",
    icon: "📦",
  },
  {
    name: "tracemoepy",
    icon: "📦",
  },
  {
    name: "reno",
    icon: "📦",
  },
  {
    name: "pytest-faulthandler",
    icon: "📦",
  },
  {
    name: "flask-debugtoolbar",
    icon: "📦",
  },
  {
    name: "logilab-common",
    icon: "📦",
  },
  {
    name: "binpacking",
    icon: "📦",
  },
  {
    name: "pyscaffold",
    icon: "📦",
  },
  {
    name: "ebaysdk",
    icon: "📦",
  },
  {
    name: "functools",
    icon: "📦",
  },
  {
    name: "authy",
    icon: "📦",
  },
  {
    name: "homeassistant",
    icon: "📦",
  },
  {
    name: "times",
    icon: "📦",
  },
  {
    name: "kfp-server-api",
    icon: "📦",
  },
  {
    name: "udatetime",
    icon: "📦",
  },
  {
    name: "pytorch-transformers",
    icon: "📦",
  },
  {
    name: "gputil",
    icon: "📦",
  },
  {
    name: "pyinquirer",
    icon: "📦",
  },
  {
    name: "pytest-profiling",
    icon: "📦",
  },
  {
    name: "imagecodecs",
    icon: "📦",
  },
  {
    name: "hdbcli",
    icon: "📦",
  },
  {
    name: "git-url-parse",
    icon: "📦",
  },
  {
    name: "aws-cdk-aws-autoscaling-common",
    icon: "📦",
  },
  {
    name: "osprofiler",
    icon: "📦",
  },
  {
    name: "typer",
    icon: "📦",
  },
  {
    name: "testcontainers",
    icon: "📦",
  },
  {
    name: "pyldavis",
    icon: "📦",
  },
  {
    name: "python-etcd",
    icon: "📦",
  },
  {
    name: "aadict",
    icon: "📦",
  },
  {
    name: "py-zipkin",
    icon: "📦",
  },
  {
    name: "click-default-group",
    icon: "📦",
  },
  {
    name: "extract-msg",
    icon: "📦",
  },
  {
    name: "pytest-factoryboy",
    icon: "📦",
  },
  {
    name: "aiokafka",
    icon: "📦",
  },
  {
    name: "flask-babelex",
    icon: "📦",
  },
  {
    name: "treeinterpreter",
    icon: "📦",
  },
  {
    name: "aws-cdk-aws-applicationautoscaling",
    icon: "📦",
  },
  {
    name: "aws-cdk-aws-elasticloadbalancingv2",
    icon: "📦",
  },
  {
    name: "svgwrite",
    icon: "📦",
  },
  {
    name: "rarfile",
    icon: "📦",
  },
  {
    name: "atpublic",
    icon: "📦",
  },
  {
    name: "aio-pika",
    icon: "📦",
  },
  {
    name: "compatibility-lib",
    icon: "📦",
  },
  {
    name: "requests-oauth",
    icon: "📦",
  },
  {
    name: "dbt-bigquery",
    icon: "📦",
  },
  {
    name: "scikit-surprise",
    icon: "📦",
  },
  {
    name: "jobspy",
    icon: "📦",
  },
  {
    name: "everett",
    icon: "📦",
  },
  {
    name: "oslo-cache",
    icon: "📦",
  },
  {
    name: "fastdiff",
    icon: "📦",
  },
  {
    name: "python-language-server",
    icon: "📦",
  },
  {
    name: "envparse",
    icon: "📦",
  },
  {
    name: "dirq",
    icon: "📦",
  },
  {
    name: "splinter",
    icon: "📦",
  },
  {
    name: "yacs",
    icon: "📦",
  },
  {
    name: "simple-settings",
    icon: "📦",
  },
  {
    name: "rpqueue",
    icon: "📦",
  },
  {
    name: "django-rq",
    icon: "📦",
  },
  {
    name: "django-tinymce",
    icon: "📦",
  },
  {
    name: "kaitaistruct",
    icon: "📦",
  },
  {
    name: "dbt-snowflake",
    icon: "📦",
  },
  {
    name: "resource",
    icon: "📦",
  },
  {
    name: "jsonsir",
    icon: "📦",
  },
  {
    name: "jsonform",
    icon: "📦",
  },
  {
    name: "mockredispy",
    icon: "📦",
  },
  {
    name: "xml2dict",
    icon: "📦",
  },
  {
    name: "python-easyconfig",
    icon: "📦",
  },
  {
    name: "importlib",
    icon: "📦",
  },
  {
    name: "djangorestframework-filters",
    icon: "📦",
  },
  {
    name: "django-elasticsearch-dsl",
    icon: "📦",
  },
  {
    name: "moderngl",
    icon: "📦",
  },
  {
    name: "mailchimp3",
    icon: "📦",
  },
  {
    name: "rabbitpy",
    icon: "📦",
  },
  {
    name: "keystonemiddleware",
    icon: "📦",
  },
  {
    name: "dbt",
    icon: "📦",
  },
  {
    name: "pyquaternion",
    icon: "📦",
  },
  {
    name: "gin-config",
    icon: "📦",
  },
  {
    name: "attr",
    icon: "📦",
  },
  {
    name: "alpha-vantage",
    icon: "📦",
  },
  {
    name: "keras-mxnet",
    icon: "📦",
  },
  {
    name: "alchemy-mock",
    icon: "📦",
  },
  {
    name: "pycontracts",
    icon: "📦",
  },
  {
    name: "pyshark",
    icon: "📦",
  },
  {
    name: "graphene-sqlalchemy",
    icon: "📦",
  },
  {
    name: "aioboto3",
    icon: "📦",
  },
  {
    name: "aws-cdk-aws-apigateway",
    icon: "📦",
  },
  {
    name: "pandavro",
    icon: "📦",
  },
  {
    name: "strip-hints",
    icon: "📦",
  },
  {
    name: "vistir",
    icon: "📦",
  },
  {
    name: "seleniumbase",
    icon: "📦",
  },
  {
    name: "oss2",
    icon: "📦",
  },
  {
    name: "pytest-lazy-fixture",
    icon: "📦",
  },
  {
    name: "python-louvain",
    icon: "📦",
  },
  {
    name: "pythonnet",
    icon: "📦",
  },
  {
    name: "google-cloud-build",
    icon: "📦",
  },
  {
    name: "keyboard",
    icon: "📦",
  },
  {
    name: "mysql",
    icon: "📦",
  },
  {
    name: "construct",
    icon: "📦",
  },
  {
    name: "pylama",
    icon: "📦",
  },
  {
    name: "replit",
    icon: "📦",
  },
  {
    name: "nose-xunitmp",
    icon: "📦",
  },
  {
    name: "watermark",
    icon: "📦",
  },
  {
    name: "pyviz-comms",
    icon: "📦",
  },
  {
    name: "yamale",
    icon: "📦",
  },
  {
    name: "pyct",
    icon: "📦",
  },
  {
    name: "pyexcel",
    icon: "📦",
  },
  {
    name: "ccxt",
    icon: "📦",
  },
  {
    name: "draftjs-exporter",
    icon: "📦",
  },
  {
    name: "caer",
    icon: "📦",
  },
  {
    name: "dependency-injector",
    icon: "📦",
  },
  {
    name: "google-cloud-redis",
    icon: "📦",
  },
  {
    name: "python-barcode",
    icon: "📦",
  },
  {
    name: "wagtail",
    icon: "📦",
  },
  {
    name: "pycadf",
    icon: "📦",
  },
  {
    name: "pip-shims",
    icon: "📦",
  },
  {
    name: "uncertainties",
    icon: "📦",
  },
  {
    name: "boto3-stubs",
    icon: "📦",
  },
  {
    name: "backports-os",
    icon: "📦",
  },
  {
    name: "pycountry-convert",
    icon: "📦",
  },
  {
    name: "aws-cdk-cloud-assembly-schema",
    icon: "📦",
  },
  {
    name: "nflx-genie-client",
    icon: "📦",
  },
  {
    name: "jsonpath",
    icon: "📦",
  },
  {
    name: "launchdarkly-server-sdk",
    icon: "📦",
  },
  {
    name: "nibabel",
    icon: "📦",
  },
  {
    name: "titlecase",
    icon: "📦",
  },
  {
    name: "pytorch-lightning",
    icon: "📦",
  },
  {
    name: "djangorestframework-stubs",
    icon: "📦",
  },
  {
    name: "py-vapid",
    icon: "📦",
  },
  {
    name: "tbb",
    icon: "📦",
  },
  {
    name: "questionary",
    icon: "📦",
  },
  {
    name: "aiohttp-jinja2",
    icon: "📦",
  },
  {
    name: "holoviews",
    icon: "📦",
  },
  {
    name: "aws-cdk-aws-sns-subscriptions",
    icon: "📦",
  },
  {
    name: "simple-crypt",
    icon: "📦",
  },
  {
    name: "tabulator",
    icon: "📦",
  },
  {
    name: "django-modelcluster",
    icon: "📦",
  },
  {
    name: "plette",
    icon: "📦",
  },
  {
    name: "sqlitedict",
    icon: "📦",
  },
  {
    name: "djangorestframework-xml",
    icon: "📦",
  },
  {
    name: "flake8-class-newline",
    icon: "📦",
  },
  {
    name: "yarn-api-client",
    icon: "📦",
  },
  {
    name: "vcversioner",
    icon: "📦",
  },
  {
    name: "python-barbicanclient",
    icon: "📦",
  },
  {
    name: "js2py",
    icon: "📦",
  },
  {
    name: "yoyo-migrations",
    icon: "📦",
  },
  {
    name: "pager",
    icon: "📦",
  },
  {
    name: "pytricia",
    icon: "📦",
  },
  {
    name: "jsbeautifier",
    icon: "📦",
  },
  {
    name: "glmnet-py",
    icon: "📦",
  },
  {
    name: "pockets",
    icon: "📦",
  },
  {
    name: "pgeocode",
    icon: "📦",
  },
  {
    name: "pycld2",
    icon: "📦",
  },
  {
    name: "opencensus-ext-zipkin",
    icon: "📦",
  },
  {
    name: "quinn",
    icon: "📦",
  },
  {
    name: "colcon-core",
    icon: "📦",
  },
  {
    name: "paypalrestsdk",
    icon: "📦",
  },
  {
    name: "aws-cdk-aws-elasticloadbalancing",
    icon: "📦",
  },
  {
    name: "www-authenticate",
    icon: "📦",
  },
  {
    name: "requirementslib",
    icon: "📦",
  },
  {
    name: "tika",
    icon: "📦",
  },
  {
    name: "cli-helpers",
    icon: "📦",
  },
  {
    name: "hashin",
    icon: "📦",
  },
  {
    name: "ansi2html",
    icon: "📦",
  },
  {
    name: "lyricwikia",
    icon: "📦",
  },
  {
    name: "aws-cdk-aws-cloudfront",
    icon: "📦",
  },
  {
    name: "django-annoying",
    icon: "📦",
  },
  {
    name: "os-testr",
    icon: "📦",
  },
  {
    name: "pyexasol",
    icon: "📦",
  },
  {
    name: "aliyun-python-sdk-kms",
    icon: "📦",
  },
  {
    name: "linear-tsv",
    icon: "📦",
  },
  {
    name: "stop-words",
    icon: "📦",
  },
  {
    name: "flake8-eradicate",
    icon: "📦",
  },
  {
    name: "gnureadline",
    icon: "📦",
  },
  {
    name: "google-cloud-datacatalog",
    icon: "📦",
  },
  {
    name: "jsons",
    icon: "📦",
  },
  {
    name: "publicsuffixlist",
    icon: "📦",
  },
  {
    name: "flake8-string-format",
    icon: "📦",
  },
  {
    name: "unipath",
    icon: "📦",
  },
  {
    name: "python-arango",
    icon: "📦",
  },
  {
    name: "py-zabbix",
    icon: "📦",
  },
  {
    name: "shade",
    icon: "📦",
  },
  {
    name: "willow",
    icon: "📦",
  },
  {
    name: "aws-cdk-aws-secretsmanager",
    icon: "📦",
  },
  {
    name: "python-status",
    icon: "📦",
  },
  {
    name: "flake8-black",
    icon: "📦",
  },
  {
    name: "daemoniker",
    icon: "📦",
  },
  {
    name: "stldecompose",
    icon: "📦",
  },
  {
    name: "flask-cache",
    icon: "📦",
  },
  {
    name: "pysolr",
    icon: "📦",
  },
  {
    name: "pyftpdlib",
    icon: "📦",
  },
  {
    name: "pykube-ng",
    icon: "📦",
  },
  {
    name: "zipcodes",
    icon: "📦",
  },
  {
    name: "wxpython",
    icon: "📦",
  },
  {
    name: "libhoney",
    icon: "📦",
  },
  {
    name: "password",
    icon: "📦",
  },
  {
    name: "nteract-scrapbook",
    icon: "📦",
  },
  {
    name: "blindspin",
    icon: "📦",
  },
  {
    name: "flake8-mutable",
    icon: "📦",
  },
  {
    name: "aws-cdk-aws-autoscaling",
    icon: "📦",
  },
  {
    name: "django-autoslug",
    icon: "📦",
  },
  {
    name: "libvirt-python",
    icon: "📦",
  },
  {
    name: "zdesk",
    icon: "📦",
  },
  {
    name: "protorpc",
    icon: "📦",
  },
  {
    name: "azure-storage-logging",
    icon: "📦",
  },
  {
    name: "exchangelib",
    icon: "📦",
  },
  {
    name: "pydot2",
    icon: "📦",
  },
  {
    name: "gender-guesser",
    icon: "📦",
  },
  {
    name: "aws-cdk-aws-route53-targets",
    icon: "📦",
  },
  {
    name: "colcon-python-setup-py",
    icon: "📦",
  },
  {
    name: "speedtest-cli",
    icon: "📦",
  },
  {
    name: "ffmpy",
    icon: "📦",
  },
  {
    name: "oslo-upgradecheck",
    icon: "📦",
  },
  {
    name: "cloudscraper",
    icon: "📦",
  },
  {
    name: "multitasking",
    icon: "📦",
  },
  {
    name: "aws-cdk-aws-ecr",
    icon: "📦",
  },
  {
    name: "itemloaders",
    icon: "📦",
  },
  {
    name: "priority",
    icon: "📦",
  },
  {
    name: "formencode",
    icon: "📦",
  },
  {
    name: "pytest-json-report",
    icon: "📦",
  },
  {
    name: "django-configurations",
    icon: "📦",
  },
  {
    name: "pygraphviz",
    icon: "📦",
  },
  {
    name: "docx",
    icon: "📦",
  },
  {
    name: "checksumdir",
    icon: "📦",
  },
  {
    name: "couchbase",
    icon: "📦",
  },
  {
    name: "ansible-runner",
    icon: "📦",
  },
  {
    name: "colcon-test-result",
    icon: "📦",
  },
  {
    name: "pyclipper",
    icon: "📦",
  },
  {
    name: "doc8",
    icon: "📦",
  },
  {
    name: "py2-ipaddress",
    icon: "📦",
  },
  {
    name: "python-jose-cryptodome",
    icon: "📦",
  },
  {
    name: "fastentrypoints",
    icon: "📦",
  },
  {
    name: "sphinxcontrib-napoleon",
    icon: "📦",
  },
  {
    name: "publicsuffix2",
    icon: "📦",
  },
  {
    name: "aws-cdk-aws-ecr-assets",
    icon: "📦",
  },
  {
    name: "python-nmap",
    icon: "📦",
  },
  {
    name: "efficientnet",
    icon: "📦",
  },
  {
    name: "editorconfig",
    icon: "📦",
  },
  {
    name: "azure-mgmt-documentdb",
    icon: "📦",
  },
  {
    name: "ruptures",
    icon: "📦",
  },
  {
    name: "uwsgitop",
    icon: "📦",
  },
  {
    name: "rapidfuzz",
    icon: "📦",
  },
  {
    name: "artifacts-keyring",
    icon: "📦",
  },
  {
    name: "htmlparser",
    icon: "📦",
  },
  {
    name: "atlassian-python-api",
    icon: "📦",
  },
  {
    name: "prov",
    icon: "📦",
  },
  {
    name: "colcon-cmake",
    icon: "📦",
  },
  {
    name: "flask-security",
    icon: "📦",
  },
  {
    name: "django-cors-middleware",
    icon: "📦",
  },
  {
    name: "django-two-factor-auth",
    icon: "📦",
  },
  {
    name: "python-monkey-business",
    icon: "📦",
  },
  {
    name: "qualname",
    icon: "📦",
  },
  {
    name: "algoliasearch",
    icon: "📦",
  },
  {
    name: "jax",
    icon: "📦",
  },
  {
    name: "pyexcel-xlsx",
    icon: "📦",
  },
  {
    name: "colcon-ros",
    icon: "📦",
  },
  {
    name: "sklearn-crfsuite",
    icon: "📦",
  },
  {
    name: "aiohttp-session",
    icon: "📦",
  },
  {
    name: "gdata",
    icon: "📦",
  },
  {
    name: "pysha3",
    icon: "📦",
  },
  {
    name: "iso4217",
    icon: "📦",
  },
  {
    name: "aws-cdk-aws-sam",
    icon: "📦",
  },
  {
    name: "plyfile",
    icon: "📦",
  },
  {
    name: "openml",
    icon: "📦",
  },
  {
    name: "discord-webhook",
    icon: "📦",
  },
  {
    name: "django-json-widget",
    icon: "📦",
  },
  {
    name: "inquirer",
    icon: "📦",
  },
  {
    name: "pilkit",
    icon: "📦",
  },
  {
    name: "flake8-bandit",
    icon: "📦",
  },
  {
    name: "crc32c",
    icon: "📦",
  },
  {
    name: "aiormq",
    icon: "📦",
  },
  {
    name: "redlock-py",
    icon: "📦",
  },
  {
    name: "eeweather",
    icon: "📦",
  },
  {
    name: "oslo-reports",
    icon: "📦",
  },
  {
    name: "pyminizip",
    icon: "📦",
  },
  {
    name: "django-statsd-mozilla",
    icon: "📦",
  },
  {
    name: "aws-cdk-aws-ecs",
    icon: "📦",
  },
  {
    name: "kfp",
    icon: "📦",
  },
  {
    name: "aws-cdk-aws-servicediscovery",
    icon: "📦",
  },
  {
    name: "http-ece",
    icon: "📦",
  },
  {
    name: "dotmap",
    icon: "📦",
  },
  {
    name: "django-jenkins",
    icon: "📦",
  },
  {
    name: "aws-cdk-aws-autoscaling-hooktargets",
    icon: "📦",
  },
  {
    name: "chalice",
    icon: "📦",
  },
  {
    name: "disklist",
    icon: "📦",
  },
  {
    name: "lizard",
    icon: "📦",
  },
  {
    name: "mirakuru",
    icon: "📦",
  },
  {
    name: "colcon-recursive-crawl",
    icon: "📦",
  },
  {
    name: "glances",
    icon: "📦",
  },
  {
    name: "doublemetaphone",
    icon: "📦",
  },
  {
    name: "waiting",
    icon: "📦",
  },
  {
    name: "typepy",
    icon: "📦",
  },
  {
    name: "simple-rest-client",
    icon: "📦",
  },
  {
    name: "colcon-library-path",
    icon: "📦",
  },
  {
    name: "mbstrdecoder",
    icon: "📦",
  },
  {
    name: "dnslib",
    icon: "📦",
  },
  {
    name: "colcon-pkg-config",
    icon: "📦",
  },
  {
    name: "twitter-common-confluence",
    icon: "📦",
  },
  {
    name: "workflow",
    icon: "📦",
  },
  {
    name: "sudachipy",
    icon: "📦",
  },
  {
    name: "pyhdb",
    icon: "📦",
  },
  {
    name: "dataset",
    icon: "📦",
  },
  {
    name: "faiss-cpu",
    icon: "📦",
  },
  {
    name: "honeycomb-beeline",
    icon: "📦",
  },
  {
    name: "django-nested-admin",
    icon: "📦",
  },
  {
    name: "featuretools",
    icon: "📦",
  },
  {
    name: "funcparserlib",
    icon: "📦",
  },
  {
    name: "bitstruct",
    icon: "📦",
  },
  {
    name: "pprint",
    icon: "📦",
  },
  {
    name: "smartsheet-python-sdk",
    icon: "📦",
  },
  {
    name: "airtable-python-wrapper",
    icon: "📦",
  },
  {
    name: "robotframework-pabot",
    icon: "📦",
  },
  {
    name: "wptools",
    icon: "📦",
  },
  {
    name: "oslo-versionedobjects",
    icon: "📦",
  },
  {
    name: "azure-mgmt-servermanager",
    icon: "📦",
  },
  {
    name: "dj-static",
    icon: "📦",
  },
  {
    name: "flake8-colors",
    icon: "📦",
  },
  {
    name: "neo4j-driver",
    icon: "📦",
  },
  {
    name: "fissix",
    icon: "📦",
  },
  {
    name: "django-imagekit",
    icon: "📦",
  },
  {
    name: "xdg",
    icon: "📦",
  },
  {
    name: "pyunpack",
    icon: "📦",
  },
  {
    name: "automaton",
    icon: "📦",
  },
  {
    name: "func-timeout",
    icon: "📦",
  },
  {
    name: "iso-639",
    icon: "📦",
  },
  {
    name: "s3io",
    icon: "📦",
  },
  {
    name: "pyicu",
    icon: "📦",
  },
  {
    name: "winkerberos",
    icon: "📦",
  },
  {
    name: "pyopengl",
    icon: "📦",
  },
  {
    name: "junitxml",
    icon: "📦",
  },
  {
    name: "web-py",
    icon: "📦",
  },
  {
    name: "kedro",
    icon: "📦",
  },
  {
    name: "google-cloud-asset",
    icon: "📦",
  },
  {
    name: "jupyterlab-launcher",
    icon: "📦",
  },
  {
    name: "django-extra-fields",
    icon: "📦",
  },
  {
    name: "django-mathfilters",
    icon: "📦",
  },
  {
    name: "pytelegrambotapi",
    icon: "📦",
  },
  {
    name: "azureml",
    icon: "📦",
  },
  {
    name: "pytest-testmon",
    icon: "📦",
  },
  {
    name: "django-recaptcha",
    icon: "📦",
  },
  {
    name: "py7zr",
    icon: "📦",
  },
  {
    name: "xlutils",
    icon: "📦",
  },
  {
    name: "osmium",
    icon: "📦",
  },
  {
    name: "pantsbuild-pants",
    icon: "📦",
  },
  {
    name: "sfmergeutility",
    icon: "📦",
  },
  {
    name: "opencv-contrib-python-headless",
    icon: "📦",
  },
  {
    name: "unidiff",
    icon: "📦",
  },
  {
    name: "aws-cdk-aws-stepfunctions",
    icon: "📦",
  },
  {
    name: "gapic-google-cloud-spanner-v1",
    icon: "📦",
  },
  {
    name: "gapic-google-cloud-spanner-admin-instance-v1",
    icon: "📦",
  },
  {
    name: "flask-swagger-ui",
    icon: "📦",
  },
  {
    name: "sphinx-copybutton",
    icon: "📦",
  },
  {
    name: "proto-google-cloud-spanner-v1",
    icon: "📦",
  },
  {
    name: "aws",
    icon: "📦",
  },
  {
    name: "gapic-google-cloud-spanner-admin-database-v1",
    icon: "📦",
  },
  {
    name: "datarobot",
    icon: "📦",
  },
  {
    name: "proto-google-cloud-spanner-admin-instance-v1",
    icon: "📦",
  },
  {
    name: "cql",
    icon: "📦",
  },
  {
    name: "proto-google-cloud-spanner-admin-database-v1",
    icon: "📦",
  },
  {
    name: "readability-lxml",
    icon: "📦",
  },
  {
    name: "sphinx-argparse",
    icon: "📦",
  },
  {
    name: "rules",
    icon: "📦",
  },
  {
    name: "python2-secrets",
    icon: "📦",
  },
  {
    name: "ibm-db",
    icon: "📦",
  },
  {
    name: "python-magnumclient",
    icon: "📦",
  },
  {
    name: "office365-rest-python-client",
    icon: "📦",
  },
  {
    name: "hachoir",
    icon: "📦",
  },
  {
    name: "async-exit-stack",
    icon: "📦",
  },
  {
    name: "win-inet-pton",
    icon: "📦",
  },
  {
    name: "sfx-jaeger-client",
    icon: "📦",
  },
  {
    name: "yarg",
    icon: "📦",
  },
  {
    name: "django-hijack",
    icon: "📦",
  },
  {
    name: "unicorn",
    icon: "📦",
  },
  {
    name: "teradatasql",
    icon: "📦",
  },
  {
    name: "pdpyras",
    icon: "📦",
  },
  {
    name: "pyprind",
    icon: "📦",
  },
  {
    name: "metaphone",
    icon: "📦",
  },
  {
    name: "jproperties",
    icon: "📦",
  },
  {
    name: "sfctl",
    icon: "📦",
  },
  {
    name: "setuptools-scm-git-archive",
    icon: "📦",
  },
  {
    name: "pytrends",
    icon: "📦",
  },
  {
    name: "python-ironicclient",
    icon: "📦",
  },
  {
    name: "ibm-db-sa",
    icon: "📦",
  },
  {
    name: "docstring-parser",
    icon: "📦",
  },
  {
    name: "py-dateutil",
    icon: "📦",
  },
  {
    name: "conllu",
    icon: "📦",
  },
  {
    name: "pyramid-tm",
    icon: "📦",
  },
  {
    name: "django-money",
    icon: "📦",
  },
  {
    name: "bowler",
    icon: "📦",
  },
  {
    name: "flufl-lock",
    icon: "📦",
  },
  {
    name: "aws-cdk-custom-resources",
    icon: "📦",
  },
  {
    name: "pyroma",
    icon: "📦",
  },
  {
    name: "colcon-output",
    icon: "📦",
  },
  {
    name: "colcon-package-information",
    icon: "📦",
  },
  {
    name: "colcon-metadata",
    icon: "📦",
  },
  {
    name: "colcon-defaults",
    icon: "📦",
  },
  {
    name: "monthdelta",
    icon: "📦",
  },
  {
    name: "colcon-package-selection",
    icon: "📦",
  },
  {
    name: "opentracing-instrumentation",
    icon: "📦",
  },
  {
    name: "polygon-geohasher",
    icon: "📦",
  },
  {
    name: "paver",
    icon: "📦",
  },
  {
    name: "django-fernet-fields",
    icon: "📦",
  },
  {
    name: "trimesh",
    icon: "📦",
  },
  {
    name: "json-encoder",
    icon: "📦",
  },
  {
    name: "avalara",
    icon: "📦",
  },
  {
    name: "colcon-powershell",
    icon: "📦",
  },
  {
    name: "netdisco",
    icon: "📦",
  },
  {
    name: "colcon-parallel-executor",
    icon: "📦",
  },
  {
    name: "untangle",
    icon: "📦",
  },
  {
    name: "django-enumfields",
    icon: "📦",
  },
  {
    name: "colcon-mixin",
    icon: "📦",
  },
  {
    name: "django-jinja",
    icon: "📦",
  },
  {
    name: "libusb1",
    icon: "📦",
  },
  {
    name: "breathe",
    icon: "📦",
  },
  {
    name: "pecan",
    icon: "📦",
  },
  {
    name: "lmfit",
    icon: "📦",
  },
  {
    name: "zope-index",
    icon: "📦",
  },
  {
    name: "oslo-rootwrap",
    icon: "📦",
  },
  {
    name: "untokenize",
    icon: "📦",
  },
  {
    name: "munkres",
    icon: "📦",
  },
  {
    name: "flake8-per-file-ignores",
    icon: "📦",
  },
  {
    name: "django-watchman",
    icon: "📦",
  },
  {
    name: "dpkt",
    icon: "📦",
  },
  {
    name: "pykcs11",
    icon: "📦",
  },
  {
    name: "marshmallow-objects",
    icon: "📦",
  },
  {
    name: "colcon-bash",
    icon: "📦",
  },
  {
    name: "plyvel",
    icon: "📦",
  },
  {
    name: "ifcfg",
    icon: "📦",
  },
  {
    name: "static3",
    icon: "📦",
  },
  {
    name: "contextdecorator",
    icon: "📦",
  },
  {
    name: "pyzbar",
    icon: "📦",
  },
  {
    name: "mujoco-py",
    icon: "📦",
  },
  {
    name: "ocspbuilder",
    icon: "📦",
  },
  {
    name: "bintrees",
    icon: "📦",
  },
  {
    name: "uplink",
    icon: "📦",
  },
  {
    name: "ropgadget",
    icon: "📦",
  },
  {
    name: "flask-redis",
    icon: "📦",
  },
  {
    name: "sparkmeasure",
    icon: "📦",
  },
  {
    name: "colcon-notification",
    icon: "📦",
  },
  {
    name: "kmodes",
    icon: "📦",
  },
  {
    name: "colcon-common-extensions",
    icon: "📦",
  },
  {
    name: "djoser",
    icon: "📦",
  },
  {
    name: "ocspresponder",
    icon: "📦",
  },
  {
    name: "ibm-cloud-sdk-core",
    icon: "📦",
  },
  {
    name: "colcon-devtools",
    icon: "📦",
  },
  {
    name: "pyhumps",
    icon: "📦",
  },
  {
    name: "pathmatch",
    icon: "📦",
  },
  {
    name: "tfds-nightly",
    icon: "📦",
  },
  {
    name: "pymodbus",
    icon: "📦",
  },
  {
    name: "goslate",
    icon: "📦",
  },
  {
    name: "ldapdomaindump",
    icon: "📦",
  },
  {
    name: "magicinvoke",
    icon: "📦",
  },
  {
    name: "cachepath",
    icon: "📦",
  },
  {
    name: "flatdict",
    icon: "📦",
  },
  {
    name: "sanic-cors",
    icon: "📦",
  },
  {
    name: "awesome-slugify",
    icon: "📦",
  },
  {
    name: "python-binary-memcached",
    icon: "📦",
  },
  {
    name: "oslo-privsep",
    icon: "📦",
  },
  {
    name: "graphene-file-upload",
    icon: "📦",
  },
  {
    name: "lupa",
    icon: "📦",
  },
  {
    name: "weakrefmethod",
    icon: "📦",
  },
  {
    name: "pyqtwebengine",
    icon: "📦",
  },
  {
    name: "hass-nabucasa",
    icon: "📦",
  },
  {
    name: "flask-mongoengine",
    icon: "📦",
  },
  {
    name: "dash-bootstrap-components",
    icon: "📦",
  },
  {
    name: "djangorestframework-bulk",
    icon: "📦",
  },
  {
    name: "aws-cdk-aws-codecommit",
    icon: "📦",
  },
  {
    name: "aws-parallelcluster-node",
    icon: "📦",
  },
  {
    name: "pipreqs",
    icon: "📦",
  },
  {
    name: "py-mini-racer",
    icon: "📦",
  },
  {
    name: "localstack-client",
    icon: "📦",
  },
  {
    name: "pbkdf2",
    icon: "📦",
  },
  {
    name: "pytest-parallel",
    icon: "📦",
  },
  {
    name: "aws-cdk-aws-codebuild",
    icon: "📦",
  },
  {
    name: "roman",
    icon: "📦",
  },
  {
    name: "bagit",
    icon: "📦",
  },
  {
    name: "plotly-express",
    icon: "📦",
  },
  {
    name: "tensorflowjs",
    icon: "📦",
  },
  {
    name: "nbstripout",
    icon: "📦",
  },
  {
    name: "moment",
    icon: "📦",
  },
  {
    name: "albumentations",
    icon: "📦",
  },
  {
    name: "awslogs",
    icon: "📦",
  },
  {
    name: "sanic-plugins-framework",
    icon: "📦",
  },
  {
    name: "swifter",
    icon: "📦",
  },
  {
    name: "singleton-decorator",
    icon: "📦",
  },
  {
    name: "django-ordered-model",
    icon: "📦",
  },
  {
    name: "django-ajax-selects",
    icon: "📦",
  },
  {
    name: "colcon-cd",
    icon: "📦",
  },
  {
    name: "zxcvbn",
    icon: "📦",
  },
  {
    name: "mimerender",
    icon: "📦",
  },
  {
    name: "pytype",
    icon: "📦",
  },
  {
    name: "forex-python",
    icon: "📦",
  },
  {
    name: "panel",
    icon: "📦",
  },
  {
    name: "hexdump",
    icon: "📦",
  },
  {
    name: "cybox",
    icon: "📦",
  },
  {
    name: "pylint-quotes",
    icon: "📦",
  },
  {
    name: "cssmin",
    icon: "📦",
  },
  {
    name: "google-cloud-scheduler",
    icon: "📦",
  },
  {
    name: "pyowm",
    icon: "📦",
  },
  {
    name: "sounddevice",
    icon: "📦",
  },
  {
    name: "posix-ipc",
    icon: "📦",
  },
  {
    name: "twitter-ads",
    icon: "📦",
  },
  {
    name: "pytest-subtests",
    icon: "📦",
  },
  {
    name: "pyjsparser",
    icon: "📦",
  },
  {
    name: "xattr",
    icon: "📦",
  },
  {
    name: "stix",
    icon: "📦",
  },
  {
    name: "nlp",
    icon: "📦",
  },
  {
    name: "shutilwhich",
    icon: "📦",
  },
  {
    name: "tf-slim",
    icon: "📦",
  },
  {
    name: "factor-analyzer",
    icon: "📦",
  },
  {
    name: "bbcode",
    icon: "📦",
  },
  {
    name: "gcovr",
    icon: "📦",
  },
  {
    name: "colcon-lcov-result",
    icon: "📦",
  },
  {
    name: "django-solo",
    icon: "📦",
  },
  {
    name: "pyjq",
    icon: "📦",
  },
  {
    name: "python-intercom",
    icon: "📦",
  },
  {
    name: "simplekml",
    icon: "📦",
  },
  {
    name: "jaconv",
    icon: "📦",
  },
  {
    name: "uhashring",
    icon: "📦",
  },
  {
    name: "import-from-github-com",
    icon: "📦",
  },
  {
    name: "django-select2",
    icon: "📦",
  },
  {
    name: "datadog-checks-base",
    icon: "📦",
  },
  {
    name: "mixbox",
    icon: "📦",
  },
  {
    name: "googleappenginecloudstorageclient",
    icon: "📦",
  },
  {
    name: "tooz",
    icon: "📦",
  },
  {
    name: "os-traits",
    icon: "📦",
  },
  {
    name: "codacy-coverage",
    icon: "📦",
  },
  {
    name: "paretochart",
    icon: "📦",
  },
  {
    name: "petname",
    icon: "📦",
  },
  {
    name: "diamond",
    icon: "📦",
  },
  {
    name: "djangorestframework-gis",
    icon: "📦",
  },
  {
    name: "django-bootstrap-form",
    icon: "📦",
  },
  {
    name: "wirerope",
    icon: "📦",
  },
  {
    name: "sentence-transformers",
    icon: "📦",
  },
  {
    name: "allure-behave",
    icon: "📦",
  },
  {
    name: "hubspot3",
    icon: "📦",
  },
  {
    name: "browsermob-proxy",
    icon: "📦",
  },
  {
    name: "python-dynamodb-lock",
    icon: "📦",
  },
  {
    name: "pyxb",
    icon: "📦",
  },
  {
    name: "instantmusic",
    icon: "📦",
  },
  {
    name: "fcm-django",
    icon: "📦",
  },
  {
    name: "textract",
    icon: "📦",
  },
  {
    name: "contractions",
    icon: "📦",
  },
  {
    name: "aws-cdk-aws-codepipeline",
    icon: "📦",
  },
  {
    name: "pyramid-mako",
    icon: "📦",
  },
  {
    name: "datacompy",
    icon: "📦",
  },
  {
    name: "yellowbrick",
    icon: "📦",
  },
  {
    name: "pybreaker",
    icon: "📦",
  },
  {
    name: "fuzzy",
    icon: "📦",
  },
  {
    name: "ariadne",
    icon: "📦",
  },
  {
    name: "anybadge",
    icon: "📦",
  },
  {
    name: "django-sslserver",
    icon: "📦",
  },
  {
    name: "neutron-lib",
    icon: "📦",
  },
  {
    name: "pip-licenses",
    icon: "📦",
  },
  {
    name: "ovsdbapp",
    icon: "📦",
  },
  {
    name: "pykafka",
    icon: "📦",
  },
  {
    name: "tableschema",
    icon: "📦",
  },
  {
    name: "ez-setup",
    icon: "📦",
  },
  {
    name: "handyspark",
    icon: "📦",
  },
  {
    name: "python-can",
    icon: "📦",
  },
  {
    name: "schema-salad",
    icon: "📦",
  },
  {
    name: "supermercado",
    icon: "📦",
  },
  {
    name: "cwltool",
    icon: "📦",
  },
  {
    name: "pdpbox",
    icon: "📦",
  },
  {
    name: "ikp3db",
    icon: "📦",
  },
  {
    name: "cronex",
    icon: "📦",
  },
  {
    name: "taskflow",
    icon: "📦",
  },
  {
    name: "scikit-plot",
    icon: "📦",
  },
  {
    name: "requests-aws-sign",
    icon: "📦",
  },
  {
    name: "geog",
    icon: "📦",
  },
  {
    name: "celery-redbeat",
    icon: "📦",
  },
  {
    name: "aws-cdk-aws-events-targets",
    icon: "📦",
  },
  {
    name: "datetime-truncate",
    icon: "📦",
  },
  {
    name: "simplekv",
    icon: "📦",
  },
  {
    name: "nose-progressive",
    icon: "📦",
  },
  {
    name: "colorcet",
    icon: "📦",
  },
  {
    name: "distribute",
    icon: "📦",
  },
  {
    name: "castellan",
    icon: "📦",
  },
  {
    name: "warrant",
    icon: "📦",
  },
  {
    name: "pyinstrument-cext",
    icon: "📦",
  },
  {
    name: "callee",
    icon: "📦",
  },
  {
    name: "jupytext",
    icon: "📦",
  },
  {
    name: "cloudinary",
    icon: "📦",
  },
  {
    name: "mixer",
    icon: "📦",
  },
  {
    name: "tinys3",
    icon: "📦",
  },
  {
    name: "importlab",
    icon: "📦",
  },
  {
    name: "kivy",
    icon: "📦",
  },
  {
    name: "dask-ml",
    icon: "📦",
  },
  {
    name: "os-vif",
    icon: "📦",
  },
  {
    name: "pymisp",
    icon: "📦",
  },
  {
    name: "ebooklib",
    icon: "📦",
  },
  {
    name: "guppy3",
    icon: "📦",
  },
  {
    name: "tendo",
    icon: "📦",
  },
  {
    name: "pyculiar",
    icon: "📦",
  },
  {
    name: "open3d-python",
    icon: "📦",
  },
  {
    name: "python-keycloak",
    icon: "📦",
  },
  {
    name: "hypercorn",
    icon: "📦",
  },
  {
    name: "sqlalchemy-continuum",
    icon: "📦",
  },
  {
    name: "trollius",
    icon: "📦",
  },
  {
    name: "treq",
    icon: "📦",
  },
  {
    name: "ara",
    icon: "📦",
  },
  {
    name: "rocketchat-api",
    icon: "📦",
  },
  {
    name: "hpsklearn",
    icon: "📦",
  },
  {
    name: "envtpl",
    icon: "📦",
  },
  {
    name: "traitsui",
    icon: "📦",
  },
  {
    name: "pytest-vcr",
    icon: "📦",
  },
  {
    name: "codespell",
    icon: "📦",
  },
  {
    name: "fastcache",
    icon: "📦",
  },
  {
    name: "jieba3k",
    icon: "📦",
  },
  {
    name: "matplotlib-venn",
    icon: "📦",
  },
  {
    name: "chameleon",
    icon: "📦",
  },
  {
    name: "colcon-zsh",
    icon: "📦",
  },
  {
    name: "yolk3k",
    icon: "📦",
  },
  {
    name: "dataproperty",
    icon: "📦",
  },
  {
    name: "smdebug",
    icon: "📦",
  },
  {
    name: "django-crum",
    icon: "📦",
  },
  {
    name: "systemd-python",
    icon: "📦",
  },
  {
    name: "torchfile",
    icon: "📦",
  },
  {
    name: "business-duration",
    icon: "📦",
  },
  {
    name: "affinegap",
    icon: "📦",
  },
  {
    name: "timeago",
    icon: "📦",
  },
  {
    name: "parquet",
    icon: "📦",
  },
  {
    name: "pykalman",
    icon: "📦",
  },
  {
    name: "django-test-without-migrations",
    icon: "📦",
  },
  {
    name: "sauceclient",
    icon: "📦",
  },
  {
    name: "requests-opentracing",
    icon: "📦",
  },
  {
    name: "django-statici18n",
    icon: "📦",
  },
  {
    name: "dnspython3",
    icon: "📦",
  },
  {
    name: "anaconda",
    icon: "📦",
  },
  {
    name: "gxformat2",
    icon: "📦",
  },
  {
    name: "traittypes",
    icon: "📦",
  },
  {
    name: "pychromecast",
    icon: "📦",
  },
  {
    name: "datefinder",
    icon: "📦",
  },
  {
    name: "curtsies",
    icon: "📦",
  },
  {
    name: "scrapy-crawlera",
    icon: "📦",
  },
  {
    name: "pydriller",
    icon: "📦",
  },
  {
    name: "traces",
    icon: "📦",
  },
  {
    name: "gluonnlp",
    icon: "📦",
  },
  {
    name: "html",
    icon: "📦",
  },
  {
    name: "flask-shell-ipython",
    icon: "📦",
  },
  {
    name: "notify2",
    icon: "📦",
  },
  {
    name: "dm-xmlsec-binding",
    icon: "📦",
  },
  {
    name: "tesserocr",
    icon: "📦",
  },
  {
    name: "pydevd-pycharm",
    icon: "📦",
  },
  {
    name: "edx-opaque-keys",
    icon: "📦",
  },
  {
    name: "os-win",
    icon: "📦",
  },
  {
    name: "pytest-localserver",
    icon: "📦",
  },
  {
    name: "python-igraph",
    icon: "📦",
  },
  {
    name: "pytest-testrail",
    icon: "📦",
  },
  {
    name: "azureml-interpret",
    icon: "📦",
  },
  {
    name: "docxtpl",
    icon: "📦",
  },
  {
    name: "email-reply-parser",
    icon: "📦",
  },
  {
    name: "paramiko-expect",
    icon: "📦",
  },
  {
    name: "djangocms-admin-style",
    icon: "📦",
  },
  {
    name: "collectfast",
    icon: "📦",
  },
  {
    name: "django-filer",
    icon: "📦",
  },
  {
    name: "visdom",
    icon: "📦",
  },
  {
    name: "towncrier",
    icon: "📦",
  },
  {
    name: "qgrid",
    icon: "📦",
  },
  {
    name: "dvc",
    icon: "📦",
  },
  {
    name: "csvkit",
    icon: "📦",
  },
  {
    name: "offspring",
    icon: "📦",
  },
  {
    name: "colcon-argcomplete",
    icon: "📦",
  },
  {
    name: "xstatic-bootstrap-scss",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-cocoa",
    icon: "📦",
  },
  {
    name: "snitun",
    icon: "📦",
  },
  {
    name: "sparse-dot-topn",
    icon: "📦",
  },
  {
    name: "urlparse3",
    icon: "📦",
  },
  {
    name: "sparkpost",
    icon: "📦",
  },
  {
    name: "jq",
    icon: "📦",
  },
  {
    name: "smtpapi",
    icon: "📦",
  },
  {
    name: "stem",
    icon: "📦",
  },
  {
    name: "df2gspread",
    icon: "📦",
  },
  {
    name: "serpy",
    icon: "📦",
  },
  {
    name: "shippo",
    icon: "📦",
  },
  {
    name: "rq-dashboard",
    icon: "📦",
  },
  {
    name: "slack-webhook",
    icon: "📦",
  },
  {
    name: "python-debian",
    icon: "📦",
  },
  {
    name: "aws-cdk-aws-batch",
    icon: "📦",
  },
  {
    name: "ndjson",
    icon: "📦",
  },
  {
    name: "django-graphql-jwt",
    icon: "📦",
  },
  {
    name: "logger",
    icon: "📦",
  },
  {
    name: "pysolar",
    icon: "📦",
  },
  {
    name: "ipwhois",
    icon: "📦",
  },
  {
    name: "google-endpoints-api-management",
    icon: "📦",
  },
  {
    name: "sphinx-gallery",
    icon: "📦",
  },
  {
    name: "oci-cli",
    icon: "📦",
  },
  {
    name: "ansible-vault",
    icon: "📦",
  },
  {
    name: "gherkin-official",
    icon: "📦",
  },
  {
    name: "pep562",
    icon: "📦",
  },
  {
    name: "grandalf",
    icon: "📦",
  },
  {
    name: "methodtools",
    icon: "📦",
  },
  {
    name: "pycognito",
    icon: "📦",
  },
  {
    name: "impacket",
    icon: "📦",
  },
  {
    name: "drf-jwt",
    icon: "📦",
  },
  {
    name: "pynvim",
    icon: "📦",
  },
  {
    name: "xstatic-jquery",
    icon: "📦",
  },
  {
    name: "pytest-test-groups",
    icon: "📦",
  },
  {
    name: "o365",
    icon: "📦",
  },
  {
    name: "pyang",
    icon: "📦",
  },
  {
    name: "pyxdameraulevenshtein",
    icon: "📦",
  },
  {
    name: "hydra-core",
    icon: "📦",
  },
  {
    name: "flake8-mypy",
    icon: "📦",
  },
  {
    name: "keras-self-attention",
    icon: "📦",
  },
  {
    name: "pymupdf",
    icon: "📦",
  },
  {
    name: "google-cloud-securitycenter",
    icon: "📦",
  },
  {
    name: "bigquery-schema-generator",
    icon: "📦",
  },
  {
    name: "django-templated-mail",
    icon: "📦",
  },
  {
    name: "scrapy-fake-useragent",
    icon: "📦",
  },
  {
    name: "flask-sslify",
    icon: "📦",
  },
  {
    name: "firebirdsql",
    icon: "📦",
  },
  {
    name: "trueskill",
    icon: "📦",
  },
  {
    name: "optimizely-sdk",
    icon: "📦",
  },
  {
    name: "kitchen",
    icon: "📦",
  },
  {
    name: "pytest-github-actions-annotate-failures",
    icon: "📦",
  },
  {
    name: "pdftotext",
    icon: "📦",
  },
  {
    name: "edx-drf-extensions",
    icon: "📦",
  },
  {
    name: "os-brick",
    icon: "📦",
  },
  {
    name: "mapbox-vector-tile",
    icon: "📦",
  },
  {
    name: "python-statsd",
    icon: "📦",
  },
  {
    name: "xstatic",
    icon: "📦",
  },
  {
    name: "conan-package-tools",
    icon: "📦",
  },
  {
    name: "mesh-tensorflow",
    icon: "📦",
  },
  {
    name: "cloudml-hypertune",
    icon: "📦",
  },
  {
    name: "nanotime",
    icon: "📦",
  },
  {
    name: "win-unicode-console",
    icon: "📦",
  },
  {
    name: "alexapy",
    icon: "📦",
  },
  {
    name: "pyramid-debugtoolbar",
    icon: "📦",
  },
  {
    name: "ulid-py",
    icon: "📦",
  },
  {
    name: "django-dotenv",
    icon: "📦",
  },
  {
    name: "georaptor",
    icon: "📦",
  },
  {
    name: "wtforms-json",
    icon: "📦",
  },
  {
    name: "os-ken",
    icon: "📦",
  },
  {
    name: "cbor",
    icon: "📦",
  },
  {
    name: "google-endpoints",
    icon: "📦",
  },
  {
    name: "dbnd",
    icon: "📦",
  },
  {
    name: "gdal",
    icon: "📦",
  },
  {
    name: "aiosqlite",
    icon: "📦",
  },
  {
    name: "django-extra-views",
    icon: "📦",
  },
  {
    name: "python3-logstash",
    icon: "📦",
  },
  {
    name: "dedupe",
    icon: "📦",
  },
  {
    name: "mypy-boto3",
    icon: "📦",
  },
  {
    name: "cymruwhois",
    icon: "📦",
  },
  {
    name: "colorhash",
    icon: "📦",
  },
  {
    name: "backports-lzma",
    icon: "📦",
  },
  {
    name: "aws-logging-handlers",
    icon: "📦",
  },
  {
    name: "binary",
    icon: "📦",
  },
  {
    name: "apispec-webframeworks",
    icon: "📦",
  },
  {
    name: "tinysegmenter",
    icon: "📦",
  },
  {
    name: "south",
    icon: "📦",
  },
  {
    name: "zthreading",
    icon: "📦",
  },
  {
    name: "django-webtest",
    icon: "📦",
  },
  {
    name: "google-cloud-happybase",
    icon: "📦",
  },
  {
    name: "nbdime",
    icon: "📦",
  },
  {
    name: "cheetah",
    icon: "📦",
  },
  {
    name: "newspaper3k",
    icon: "📦",
  },
  {
    name: "doit",
    icon: "📦",
  },
  {
    name: "asyncpool",
    icon: "📦",
  },
  {
    name: "postgres",
    icon: "📦",
  },
  {
    name: "pwntools",
    icon: "📦",
  },
  {
    name: "tensorflowonspark",
    icon: "📦",
  },
  {
    name: "healthcheck",
    icon: "📦",
  },
  {
    name: "transforms3d",
    icon: "📦",
  },
  {
    name: "python-hcl2",
    icon: "📦",
  },
  {
    name: "azureml-automl-runtime",
    icon: "📦",
  },
  {
    name: "inotify",
    icon: "📦",
  },
  {
    name: "dfply",
    icon: "📦",
  },
  {
    name: "jxmlease",
    icon: "📦",
  },
  {
    name: "repoze-who",
    icon: "📦",
  },
  {
    name: "crochet",
    icon: "📦",
  },
  {
    name: "feedfinder2",
    icon: "📦",
  },
  {
    name: "client",
    icon: "📦",
  },
  {
    name: "django-redis-sessions",
    icon: "📦",
  },
  {
    name: "google-cloud-iot",
    icon: "📦",
  },
  {
    name: "bert-tensorflow",
    icon: "📦",
  },
  {
    name: "pyblake2",
    icon: "📦",
  },
  {
    name: "chainmap",
    icon: "📦",
  },
  {
    name: "kinesis-python",
    icon: "📦",
  },
  {
    name: "aws-cdk-aws-dynamodb",
    icon: "📦",
  },
  {
    name: "zstd",
    icon: "📦",
  },
  {
    name: "bpython",
    icon: "📦",
  },
  {
    name: "nose-detecthttp",
    icon: "📦",
  },
  {
    name: "flake8-broken-line",
    icon: "📦",
  },
  {
    name: "jaxlib",
    icon: "📦",
  },
  {
    name: "scrapy-random-useragent",
    icon: "📦",
  },
  {
    name: "altair-data-server",
    icon: "📦",
  },
  {
    name: "wordninja",
    icon: "📦",
  },
  {
    name: "phpserialize",
    icon: "📦",
  },
  {
    name: "django-colorfield",
    icon: "📦",
  },
  {
    name: "dask-glm",
    icon: "📦",
  },
  {
    name: "property-cached",
    icon: "📦",
  },
  {
    name: "rook",
    icon: "📦",
  },
  {
    name: "singer-python",
    icon: "📦",
  },
  {
    name: "python-anticaptcha",
    icon: "📦",
  },
  {
    name: "aws-cdk-aws-kinesis",
    icon: "📦",
  },
  {
    name: "zope-schema",
    icon: "📦",
  },
  {
    name: "keras-transformer",
    icon: "📦",
  },
  {
    name: "braceexpand",
    icon: "📦",
  },
  {
    name: "json-logic",
    icon: "📦",
  },
  {
    name: "humpty",
    icon: "📦",
  },
  {
    name: "delegator-py",
    icon: "📦",
  },
  {
    name: "symspellpy",
    icon: "📦",
  },
  {
    name: "sip",
    icon: "📦",
  },
  {
    name: "levenshtein-search",
    icon: "📦",
  },
  {
    name: "agate-sql",
    icon: "📦",
  },
  {
    name: "envisage",
    icon: "📦",
  },
  {
    name: "altair-viewer",
    icon: "📦",
  },
  {
    name: "dedupe-hcluster",
    icon: "📦",
  },
  {
    name: "sseclient",
    icon: "📦",
  },
  {
    name: "pgpy",
    icon: "📦",
  },
  {
    name: "flask-restless",
    icon: "📦",
  },
  {
    name: "django-cookies-samesite",
    icon: "📦",
  },
  {
    name: "thespian",
    icon: "📦",
  },
  {
    name: "flake8-rst-docstrings",
    icon: "📦",
  },
  {
    name: "agate-dbf",
    icon: "📦",
  },
  {
    name: "ibm-watson",
    icon: "📦",
  },
  {
    name: "cookiejar",
    icon: "📦",
  },
  {
    name: "pytest-postgresql",
    icon: "📦",
  },
  {
    name: "etcd3gw",
    icon: "📦",
  },
  {
    name: "tryme",
    icon: "📦",
  },
  {
    name: "google-cloud-os-login",
    icon: "📦",
  },
  {
    name: "rlr",
    icon: "📦",
  },
  {
    name: "altair-saver",
    icon: "📦",
  },
  {
    name: "subliminal",
    icon: "📦",
  },
  {
    name: "pyexcelerate",
    icon: "📦",
  },
  {
    name: "agate-excel",
    icon: "📦",
  },
  {
    name: "stagger",
    icon: "📦",
  },
  {
    name: "unirest",
    icon: "📦",
  },
  {
    name: "categorical-distance",
    icon: "📦",
  },
  {
    name: "aws-cdk-aws-cognito",
    icon: "📦",
  },
  {
    name: "dai-sgqlc-3-5",
    icon: "📦",
  },
  {
    name: "django-registration",
    icon: "📦",
  },
  {
    name: "dedupe-variable-datetime",
    icon: "📦",
  },
  {
    name: "pytest-flask-sqlalchemy",
    icon: "📦",
  },
  {
    name: "pyinstrument",
    icon: "📦",
  },
  {
    name: "abbyy",
    icon: "📦",
  },
  {
    name: "pyxero",
    icon: "📦",
  },
  {
    name: "lsm-db",
    icon: "📦",
  },
  {
    name: "turicreate",
    icon: "📦",
  },
  {
    name: "weighted-levenshtein",
    icon: "📦",
  },
  {
    name: "pycallgraph",
    icon: "📦",
  },
  {
    name: "edx-django-utils",
    icon: "📦",
  },
  {
    name: "click-spinner",
    icon: "📦",
  },
  {
    name: "azure-appconfiguration",
    icon: "📦",
  },
  {
    name: "certipy",
    icon: "📦",
  },
  {
    name: "azureml-train-automl-runtime",
    icon: "📦",
  },
  {
    name: "c7n",
    icon: "📦",
  },
  {
    name: "rstcheck",
    icon: "📦",
  },
  {
    name: "pytrie",
    icon: "📦",
  },
  {
    name: "svglib",
    icon: "📦",
  },
  {
    name: "face-recognition",
    icon: "📦",
  },
  {
    name: "mojimoji",
    icon: "📦",
  },
  {
    name: "django-safedelete",
    icon: "📦",
  },
  {
    name: "pylbfgs",
    icon: "📦",
  },
  {
    name: "svn",
    icon: "📦",
  },
  {
    name: "mozdebug",
    icon: "📦",
  },
  {
    name: "django-celery-email",
    icon: "📦",
  },
  {
    name: "os-xenapi",
    icon: "📦",
  },
  {
    name: "python-miio",
    icon: "📦",
  },
  {
    name: "guessit",
    icon: "📦",
  },
  {
    name: "edx-enterprise",
    icon: "📦",
  },
  {
    name: "azureml-train-automl",
    icon: "📦",
  },
  {
    name: "gluoncv",
    icon: "📦",
  },
  {
    name: "fudge",
    icon: "📦",
  },
  {
    name: "azure-eventhub-checkpointstoreblob-aio",
    icon: "📦",
  },
  {
    name: "flask-log-request-id",
    icon: "📦",
  },
  {
    name: "git-pylint-commit-hook",
    icon: "📦",
  },
  {
    name: "passwordmeter",
    icon: "📦",
  },
  {
    name: "pygpgme",
    icon: "📦",
  },
  {
    name: "doc-warden",
    icon: "📦",
  },
  {
    name: "boto3-type-annotations-with-docs",
    icon: "📦",
  },
  {
    name: "django-cleanup",
    icon: "📦",
  },
  {
    name: "flask-dance",
    icon: "📦",
  },
  {
    name: "tinycss",
    icon: "📦",
  },
  {
    name: "sphinx-tabs",
    icon: "📦",
  },
  {
    name: "flask-oidc",
    icon: "📦",
  },
  {
    name: "highered",
    icon: "📦",
  },
  {
    name: "pyhacrf-datamade",
    icon: "📦",
  },
  {
    name: "pykube",
    icon: "📦",
  },
  {
    name: "azure-mgmt-synapse",
    icon: "📦",
  },
  {
    name: "simplecosine",
    icon: "📦",
  },
  {
    name: "blockdiag",
    icon: "📦",
  },
  {
    name: "requests-async",
    icon: "📦",
  },
  {
    name: "flake8-pep3101",
    icon: "📦",
  },
  {
    name: "mechanicalsoup",
    icon: "📦",
  },
  {
    name: "frozen-flask",
    icon: "📦",
  },
  {
    name: "datetime-distance",
    icon: "📦",
  },
  {
    name: "webexteamssdk",
    icon: "📦",
  },
  {
    name: "azureml-mlflow",
    icon: "📦",
  },
  {
    name: "caniusepython3",
    icon: "📦",
  },
  {
    name: "tslearn",
    icon: "📦",
  },
  {
    name: "keras-layer-normalization",
    icon: "📦",
  },
  {
    name: "boostedblob",
    icon: "📦",
  },
  {
    name: "django-templated-email",
    icon: "📦",
  },
  {
    name: "cursive",
    icon: "📦",
  },
  {
    name: "securesystemslib",
    icon: "📦",
  },
  {
    name: "segtok",
    icon: "📦",
  },
  {
    name: "sphinxcontrib-svg2pdfconverter",
    icon: "📦",
  },
  {
    name: "pylzma",
    icon: "📦",
  },
  {
    name: "sqlalchemy-views",
    icon: "📦",
  },
  {
    name: "shodan",
    icon: "📦",
  },
  {
    name: "cmake-format",
    icon: "📦",
  },
  {
    name: "pyclustering",
    icon: "📦",
  },
  {
    name: "shortid",
    icon: "📦",
  },
  {
    name: "fixture",
    icon: "📦",
  },
  {
    name: "pyemd",
    icon: "📦",
  },
  {
    name: "edx-rbac",
    icon: "📦",
  },
  {
    name: "json-logging",
    icon: "📦",
  },
  {
    name: "riemann-client",
    icon: "📦",
  },
  {
    name: "esprima",
    icon: "📦",
  },
  {
    name: "wsme",
    icon: "📦",
  },
  {
    name: "html-linter",
    icon: "📦",
  },
  {
    name: "pyramid-arima",
    icon: "📦",
  },
  {
    name: "djrill",
    icon: "📦",
  },
  {
    name: "pynliner",
    icon: "📦",
  },
  {
    name: "django-js-reverse",
    icon: "📦",
  },
  {
    name: "template-remover",
    icon: "📦",
  },
  {
    name: "rstr",
    icon: "📦",
  },
  {
    name: "azureml-explain-model",
    icon: "📦",
  },
  {
    name: "django-revproxy",
    icon: "📦",
  },
  {
    name: "stemming",
    icon: "📦",
  },
  {
    name: "jupyter-telemetry",
    icon: "📦",
  },
  {
    name: "pymp-pypi",
    icon: "📦",
  },
  {
    name: "pyvim",
    icon: "📦",
  },
  {
    name: "junos-eznc",
    icon: "📦",
  },
  {
    name: "pytictoc",
    icon: "📦",
  },
  {
    name: "jenkins-job-builder",
    icon: "📦",
  },
  {
    name: "airflow-exporter",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-quartz",
    icon: "📦",
  },
  {
    name: "django-jsonview",
    icon: "📦",
  },
  {
    name: "face-recognition-models",
    icon: "📦",
  },
  {
    name: "lambda-packages",
    icon: "📦",
  },
  {
    name: "tensorflow-model-optimization",
    icon: "📦",
  },
  {
    name: "pymemoize",
    icon: "📦",
  },
  {
    name: "google-cloud-datalabeling",
    icon: "📦",
  },
  {
    name: "case-conversion",
    icon: "📦",
  },
  {
    name: "pyhaversion",
    icon: "📦",
  },
  {
    name: "pyeapi",
    icon: "📦",
  },
  {
    name: "pysendfile",
    icon: "📦",
  },
  {
    name: "psycopg2-pool",
    icon: "📦",
  },
  {
    name: "in-toto",
    icon: "📦",
  },
  {
    name: "keras-multi-head",
    icon: "📦",
  },
  {
    name: "django-cms",
    icon: "📦",
  },
  {
    name: "pymobiledetect",
    icon: "📦",
  },
  {
    name: "google-cloud-talent",
    icon: "📦",
  },
  {
    name: "petastorm",
    icon: "📦",
  },
  {
    name: "textsearch",
    icon: "📦",
  },
  {
    name: "amqplib",
    icon: "📦",
  },
  {
    name: "polyglot",
    icon: "📦",
  },
  {
    name: "pyexcel-xls",
    icon: "📦",
  },
  {
    name: "elasticsearch2",
    icon: "📦",
  },
  {
    name: "django-sendgrid-v5",
    icon: "📦",
  },
  {
    name: "python-vagrant",
    icon: "📦",
  },
  {
    name: "python-hosts",
    icon: "📦",
  },
  {
    name: "flask-json",
    icon: "📦",
  },
  {
    name: "google-cloud-webrisk",
    icon: "📦",
  },
  {
    name: "python-speech-features",
    icon: "📦",
  },
  {
    name: "bpemb",
    icon: "📦",
  },
  {
    name: "restrictedpython",
    icon: "📦",
  },
  {
    name: "azure-synapse-spark",
    icon: "📦",
  },
  {
    name: "google-cloud-websecurityscanner",
    icon: "📦",
  },
  {
    name: "pydes",
    icon: "📦",
  },
  {
    name: "ics",
    icon: "📦",
  },
  {
    name: "xunitparser",
    icon: "📦",
  },
  {
    name: "pycapnp",
    icon: "📦",
  },
  {
    name: "recurly",
    icon: "📦",
  },
  {
    name: "outcome",
    icon: "📦",
  },
  {
    name: "django-dynamic-fixture",
    icon: "📦",
  },
  {
    name: "robotframework-pythonlibcore",
    icon: "📦",
  },
  {
    name: "keras-pos-embd",
    icon: "📦",
  },
  {
    name: "keras-embed-sim",
    icon: "📦",
  },
  {
    name: "python-rest-client",
    icon: "📦",
  },
  {
    name: "keras-position-wise-feed-forward",
    icon: "📦",
  },
  {
    name: "azure-synapse-accesscontrol",
    icon: "📦",
  },
  {
    name: "openstackdocstheme",
    icon: "📦",
  },
  {
    name: "http",
    icon: "📦",
  },
  {
    name: "neverbounce-sdk",
    icon: "📦",
  },
  {
    name: "aliyun-python-sdk-core-v3",
    icon: "📦",
  },
  {
    name: "janome",
    icon: "📦",
  },
  {
    name: "pytest-allure-adaptor",
    icon: "📦",
  },
  {
    name: "django-jet",
    icon: "📦",
  },
  {
    name: "sq-native",
    icon: "📦",
  },
  {
    name: "libconf",
    icon: "📦",
  },
  {
    name: "parse-accept-language",
    icon: "📦",
  },
  {
    name: "reportportal-client",
    icon: "📦",
  },
  {
    name: "cmreshandler",
    icon: "📦",
  },
  {
    name: "mercurial",
    icon: "📦",
  },
  {
    name: "django-sortedm2m",
    icon: "📦",
  },
  {
    name: "delighted",
    icon: "📦",
  },
  {
    name: "sphinx-autoapi",
    icon: "📦",
  },
  {
    name: "python3-keyczar",
    icon: "📦",
  },
  {
    name: "genshi",
    icon: "📦",
  },
  {
    name: "anytemplate",
    icon: "📦",
  },
  {
    name: "pdoc3",
    icon: "📦",
  },
  {
    name: "cos-python-sdk-v5",
    icon: "📦",
  },
  {
    name: "art",
    icon: "📦",
  },
  {
    name: "colour-runner",
    icon: "📦",
  },
  {
    name: "flexget",
    icon: "📦",
  },
  {
    name: "watchgod",
    icon: "📦",
  },
  {
    name: "ssh2-python",
    icon: "📦",
  },
  {
    name: "pygerrit2",
    icon: "📦",
  },
  {
    name: "microversion-parse",
    icon: "📦",
  },
  {
    name: "flask-sockets",
    icon: "📦",
  },
  {
    name: "socketio-client",
    icon: "📦",
  },
  {
    name: "coincurve",
    icon: "📦",
  },
  {
    name: "ibis-framework",
    icon: "📦",
  },
  {
    name: "cma",
    icon: "📦",
  },
  {
    name: "flake8-formatter-junit-xml",
    icon: "📦",
  },
  {
    name: "sdnotify",
    icon: "📦",
  },
  {
    name: "ryu",
    icon: "📦",
  },
  {
    name: "quart",
    icon: "📦",
  },
  {
    name: "oauth2-client",
    icon: "📦",
  },
  {
    name: "aiocache",
    icon: "📦",
  },
  {
    name: "executor",
    icon: "📦",
  },
  {
    name: "pytest-logbook",
    icon: "📦",
  },
  {
    name: "strsim",
    icon: "📦",
  },
  {
    name: "freetype-py",
    icon: "📦",
  },
  {
    name: "python-qpid-proton",
    icon: "📦",
  },
  {
    name: "backports-datetime-timestamp",
    icon: "📦",
  },
  {
    name: "robotframework-faker",
    icon: "📦",
  },
  {
    name: "sarge",
    icon: "📦",
  },
  {
    name: "janus",
    icon: "📦",
  },
  {
    name: "simpy",
    icon: "📦",
  },
  {
    name: "timedelta",
    icon: "📦",
  },
  {
    name: "django-memoize",
    icon: "📦",
  },
  {
    name: "odo",
    icon: "📦",
  },
  {
    name: "gdown",
    icon: "📦",
  },
  {
    name: "logentries",
    icon: "📦",
  },
  {
    name: "darglint",
    icon: "📦",
  },
  {
    name: "django-admin-tools",
    icon: "📦",
  },
  {
    name: "slugify",
    icon: "📦",
  },
  {
    name: "fs-s3fs",
    icon: "📦",
  },
  {
    name: "cfscrape",
    icon: "📦",
  },
  {
    name: "pep257",
    icon: "📦",
  },
  {
    name: "nbval",
    icon: "📦",
  },
  {
    name: "nmslib",
    icon: "📦",
  },
  {
    name: "awkward",
    icon: "📦",
  },
  {
    name: "rasa",
    icon: "📦",
  },
  {
    name: "hyperloglog",
    icon: "📦",
  },
  {
    name: "voluptuous-serialize",
    icon: "📦",
  },
  {
    name: "ciscoconfparse",
    icon: "📦",
  },
  {
    name: "user-agent",
    icon: "📦",
  },
  {
    name: "mod-wsgi",
    icon: "📦",
  },
  {
    name: "pdfminer3k",
    icon: "📦",
  },
  {
    name: "flufl-enum",
    icon: "📦",
  },
  {
    name: "python-logstash-async",
    icon: "📦",
  },
  {
    name: "l18n",
    icon: "📦",
  },
  {
    name: "sphinx-bootstrap-theme",
    icon: "📦",
  },
  {
    name: "uproot",
    icon: "📦",
  },
  {
    name: "snowflake",
    icon: "📦",
  },
  {
    name: "mohawk",
    icon: "📦",
  },
  {
    name: "netapp-lib",
    icon: "📦",
  },
  {
    name: "pyexecjs",
    icon: "📦",
  },
  {
    name: "edx-proctoring",
    icon: "📦",
  },
  {
    name: "sqlalchemy-utc",
    icon: "📦",
  },
  {
    name: "pytest-helpers-namespace",
    icon: "📦",
  },
  {
    name: "niet",
    icon: "📦",
  },
  {
    name: "python-social-auth",
    icon: "📦",
  },
  {
    name: "domain2idna",
    icon: "📦",
  },
  {
    name: "urlextract",
    icon: "📦",
  },
  {
    name: "aiomysql",
    icon: "📦",
  },
  {
    name: "esrally",
    icon: "📦",
  },
  {
    name: "geospark",
    icon: "📦",
  },
  {
    name: "pretty-bad-protocol",
    icon: "📦",
  },
  {
    name: "keras-bert",
    icon: "📦",
  },
  {
    name: "pygelf",
    icon: "📦",
  },
  {
    name: "uproot-methods",
    icon: "📦",
  },
  {
    name: "py-healthcheck",
    icon: "📦",
  },
  {
    name: "glog",
    icon: "📦",
  },
  {
    name: "spyne",
    icon: "📦",
  },
  {
    name: "cgroupspy",
    icon: "📦",
  },
  {
    name: "dbnd-airflow",
    icon: "📦",
  },
  {
    name: "htpasswd",
    icon: "📦",
  },
  {
    name: "pypowervm",
    icon: "📦",
  },
  {
    name: "dbnd-docker",
    icon: "📦",
  },
  {
    name: "zope-i18nmessageid",
    icon: "📦",
  },
  {
    name: "teradata",
    icon: "📦",
  },
  {
    name: "aws-configure",
    icon: "📦",
  },
  {
    name: "np-utils",
    icon: "📦",
  },
  {
    name: "bashate",
    icon: "📦",
  },
  {
    name: "traits",
    icon: "📦",
  },
  {
    name: "robotframework-httplibrary",
    icon: "📦",
  },
  {
    name: "django-rest-knox",
    icon: "📦",
  },
  {
    name: "bitmath",
    icon: "📦",
  },
  {
    name: "frida",
    icon: "📦",
  },
  {
    name: "databand",
    icon: "📦",
  },
  {
    name: "rest-condition",
    icon: "📦",
  },
  {
    name: "libmagic",
    icon: "📦",
  },
  {
    name: "mozilla-django-oidc",
    icon: "📦",
  },
  {
    name: "a-pytube-fork-for-spotdl-users",
    icon: "📦",
  },
  {
    name: "python-terraform",
    icon: "📦",
  },
  {
    name: "pytorch",
    icon: "📦",
  },
  {
    name: "tap-py",
    icon: "📦",
  },
  {
    name: "rasa-sdk",
    icon: "📦",
  },
  {
    name: "django-hosts",
    icon: "📦",
  },
  {
    name: "pyttsx3",
    icon: "📦",
  },
  {
    name: "dis3",
    icon: "📦",
  },
  {
    name: "faust",
    icon: "📦",
  },
  {
    name: "flask-opentracing",
    icon: "📦",
  },
  {
    name: "tabula-py",
    icon: "📦",
  },
  {
    name: "django-htmlmin",
    icon: "📦",
  },
  {
    name: "robinhood-aiokafka",
    icon: "📦",
  },
  {
    name: "pytest-json",
    icon: "📦",
  },
  {
    name: "dynamodb-encryption-sdk",
    icon: "📦",
  },
  {
    name: "tailer",
    icon: "📦",
  },
  {
    name: "undetected-chromedriver",
    icon: "📦",
  },
  {
    name: "pikepdf",
    icon: "📦",
  },
  {
    name: "git-remote-codecommit",
    icon: "📦",
  },
  {
    name: "django-impersonate",
    icon: "📦",
  },
  {
    name: "code-annotations",
    icon: "📦",
  },
  {
    name: "djangorestframework-recursive",
    icon: "📦",
  },
  {
    name: "tox-gh-actions",
    icon: "📦",
  },
  {
    name: "python-gettext",
    icon: "📦",
  },
  {
    name: "fastcore",
    icon: "📦",
  },
  {
    name: "twitter-common-contextutil",
    icon: "📦",
  },
  {
    name: "mode",
    icon: "📦",
  },
  {
    name: "py-lz4framed",
    icon: "📦",
  },
  {
    name: "zodbpickle",
    icon: "📦",
  },
  {
    name: "django-admin-sortable",
    icon: "📦",
  },
  {
    name: "flask-apscheduler",
    icon: "📦",
  },
  {
    name: "databases",
    icon: "📦",
  },
  {
    name: "hunspell",
    icon: "📦",
  },
  {
    name: "flake8-executable",
    icon: "📦",
  },
  {
    name: "ftputil",
    icon: "📦",
  },
  {
    name: "os-resource-classes",
    icon: "📦",
  },
  {
    name: "testlink-api-python-client",
    icon: "📦",
  },
  {
    name: "tox-monorepo",
    icon: "📦",
  },
  {
    name: "vdms",
    icon: "📦",
  },
  {
    name: "pyftdi",
    icon: "📦",
  },
  {
    name: "jprops",
    icon: "📦",
  },
  {
    name: "antigate",
    icon: "📦",
  },
  {
    name: "lftools",
    icon: "📦",
  },
  {
    name: "looker-sdk",
    icon: "📦",
  },
  {
    name: "flup",
    icon: "📦",
  },
  {
    name: "clearbit",
    icon: "📦",
  },
  {
    name: "alohomora",
    icon: "📦",
  },
  {
    name: "python-saml",
    icon: "📦",
  },
  {
    name: "sanic-jwt",
    icon: "📦",
  },
  {
    name: "django-sass-processor",
    icon: "📦",
  },
  {
    name: "jupyter-server",
    icon: "📦",
  },
  {
    name: "numpy-stl",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-fsevents",
    icon: "📦",
  },
  {
    name: "pyqtgraph",
    icon: "📦",
  },
  {
    name: "sqlalchemy-diff",
    icon: "📦",
  },
  {
    name: "pyspellchecker",
    icon: "📦",
  },
  {
    name: "twitter-common-util",
    icon: "📦",
  },
  {
    name: "cupy-cuda100",
    icon: "📦",
  },
  {
    name: "repoze-sendmail",
    icon: "📦",
  },
  {
    name: "oslo-vmware",
    icon: "📦",
  },
  {
    name: "wtforms-components",
    icon: "📦",
  },
  {
    name: "webhelpers",
    icon: "📦",
  },
  {
    name: "f5-icontrol-rest",
    icon: "📦",
  },
  {
    name: "pid",
    icon: "📦",
  },
  {
    name: "prometheus-async",
    icon: "📦",
  },
  {
    name: "jupyter-kernel-gateway",
    icon: "📦",
  },
  {
    name: "reprint",
    icon: "📦",
  },
  {
    name: "mahotas",
    icon: "📦",
  },
  {
    name: "twitter-common-app",
    icon: "📦",
  },
  {
    name: "twitter-common-string",
    icon: "📦",
  },
  {
    name: "yamlloader",
    icon: "📦",
  },
  {
    name: "base36",
    icon: "📦",
  },
  {
    name: "twitter-common-process",
    icon: "📦",
  },
  {
    name: "glance-store",
    icon: "📦",
  },
  {
    name: "pytest-dotenv",
    icon: "📦",
  },
  {
    name: "nose-html-reporting",
    icon: "📦",
  },
  {
    name: "pyuwsgi",
    icon: "📦",
  },
  {
    name: "pytest-logger",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-systemconfiguration",
    icon: "📦",
  },
  {
    name: "tabledata",
    icon: "📦",
  },
  {
    name: "blaze",
    icon: "📦",
  },
  {
    name: "qiniu",
    icon: "📦",
  },
  {
    name: "django-contrib-comments",
    icon: "📦",
  },
  {
    name: "jsl",
    icon: "📦",
  },
  {
    name: "pybigquery",
    icon: "📦",
  },
  {
    name: "event-tracking",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-cfnetwork",
    icon: "📦",
  },
  {
    name: "xstatic-datatables",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-launchservices",
    icon: "📦",
  },
  {
    name: "django-smtp-ssl",
    icon: "📦",
  },
  {
    name: "ldclient-py",
    icon: "📦",
  },
  {
    name: "xstatic-patternfly-bootstrap-treeview",
    icon: "📦",
  },
  {
    name: "xstatic-patternfly",
    icon: "📦",
  },
  {
    name: "instagramapi",
    icon: "📦",
  },
  {
    name: "django-suit",
    icon: "📦",
  },
  {
    name: "standardjson",
    icon: "📦",
  },
  {
    name: "sphinx-click",
    icon: "📦",
  },
  {
    name: "strif",
    icon: "📦",
  },
  {
    name: "flask-moment",
    icon: "📦",
  },
  {
    name: "bcdoc",
    icon: "📦",
  },
  {
    name: "protobuf-to-dict",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-webkit",
    icon: "📦",
  },
  {
    name: "bcolz",
    icon: "📦",
  },
  {
    name: "flake8-junit-report",
    icon: "📦",
  },
  {
    name: "pygtail",
    icon: "📦",
  },
  {
    name: "lob",
    icon: "📦",
  },
  {
    name: "pytools",
    icon: "📦",
  },
  {
    name: "travis",
    icon: "📦",
  },
  {
    name: "grpclib",
    icon: "📦",
  },
  {
    name: "python-intervals",
    icon: "📦",
  },
  {
    name: "zabbix-api",
    icon: "📦",
  },
  {
    name: "nested-lookup",
    icon: "📦",
  },
  {
    name: "edx-rest-api-client",
    icon: "📦",
  },
  {
    name: "cloudfoundry-client",
    icon: "📦",
  },
  {
    name: "rosdistro",
    icon: "📦",
  },
  {
    name: "pretrainedmodels",
    icon: "📦",
  },
  {
    name: "alphabet-detector",
    icon: "📦",
  },
  {
    name: "instaclone",
    icon: "📦",
  },
  {
    name: "pysmartdl",
    icon: "📦",
  },
  {
    name: "cbapi",
    icon: "📦",
  },
  {
    name: "python-fly",
    icon: "📦",
  },
  {
    name: "bdquaternions",
    icon: "📦",
  },
  {
    name: "edxval",
    icon: "📦",
  },
  {
    name: "robotframework-debuglibrary",
    icon: "📦",
  },
  {
    name: "gssapi",
    icon: "📦",
  },
  {
    name: "aws-cdk-aws-s3-notifications",
    icon: "📦",
  },
  {
    name: "pyghmi",
    icon: "📦",
  },
  {
    name: "dash-daq",
    icon: "📦",
  },
  {
    name: "purl",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-exceptionhandling",
    icon: "📦",
  },
  {
    name: "python-nomad",
    icon: "📦",
  },
  {
    name: "pomegranate",
    icon: "📦",
  },
  {
    name: "razorpay",
    icon: "📦",
  },
  {
    name: "bioblend",
    icon: "📦",
  },
  {
    name: "fbmessenger",
    icon: "📦",
  },
  {
    name: "gitlint",
    icon: "📦",
  },
  {
    name: "django-rosetta",
    icon: "📦",
  },
  {
    name: "flanker",
    icon: "📦",
  },
  {
    name: "aws-cdk-aws-efs",
    icon: "📦",
  },
  {
    name: "python-helpscout-v2",
    icon: "📦",
  },
  {
    name: "adyen",
    icon: "📦",
  },
  {
    name: "pytest-qt",
    icon: "📦",
  },
  {
    name: "allennlp",
    icon: "📦",
  },
  {
    name: "carbon",
    icon: "📦",
  },
  {
    name: "djangocms-text-ckeditor",
    icon: "📦",
  },
  {
    name: "transliterate",
    icon: "📦",
  },
  {
    name: "mail-parser",
    icon: "📦",
  },
  {
    name: "osc-placement",
    icon: "📦",
  },
  {
    name: "docformatter",
    icon: "📦",
  },
  {
    name: "timezonefinderl",
    icon: "📦",
  },
  {
    name: "ebcdic",
    icon: "📦",
  },
  {
    name: "logmatic-python",
    icon: "📦",
  },
  {
    name: "spooky",
    icon: "📦",
  },
  {
    name: "lesscpy",
    icon: "📦",
  },
  {
    name: "fuzzyset",
    icon: "📦",
  },
  {
    name: "flit-core",
    icon: "📦",
  },
  {
    name: "edx-bulk-grades",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-diskarbitration",
    icon: "📦",
  },
  {
    name: "spyder",
    icon: "📦",
  },
  {
    name: "python-xmp-toolkit",
    icon: "📦",
  },
  {
    name: "sure",
    icon: "📦",
  },
  {
    name: "django-prettyjson",
    icon: "📦",
  },
  {
    name: "pysrt",
    icon: "📦",
  },
  {
    name: "python-keycloak-client",
    icon: "📦",
  },
  {
    name: "pyaudioanalysis",
    icon: "📦",
  },
  {
    name: "chainer",
    icon: "📦",
  },
  {
    name: "daemonize",
    icon: "📦",
  },
  {
    name: "faulthandler",
    icon: "📦",
  },
  {
    name: "glob3",
    icon: "📦",
  },
  {
    name: "pypdf",
    icon: "📦",
  },
  {
    name: "morfessor",
    icon: "📦",
  },
  {
    name: "sqlalchemy-repr",
    icon: "📦",
  },
  {
    name: "panda",
    icon: "📦",
  },
  {
    name: "modin",
    icon: "📦",
  },
  {
    name: "zconfig",
    icon: "📦",
  },
  {
    name: "asyncio-nats-streaming",
    icon: "📦",
  },
  {
    name: "mibian",
    icon: "📦",
  },
  {
    name: "fvcore",
    icon: "📦",
  },
  {
    name: "f5-sdk",
    icon: "📦",
  },
  {
    name: "html-text",
    icon: "📦",
  },
  {
    name: "zvmcloudconnector",
    icon: "📦",
  },
  {
    name: "playsound",
    icon: "📦",
  },
  {
    name: "kerberos",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-coreservices",
    icon: "📦",
  },
  {
    name: "efficientnet-pytorch",
    icon: "📦",
  },
  {
    name: "pygaljs",
    icon: "📦",
  },
  {
    name: "slackeventsapi",
    icon: "📦",
  },
  {
    name: "pydictionary",
    icon: "📦",
  },
  {
    name: "pytest-datadir",
    icon: "📦",
  },
  {
    name: "marshmallow-union",
    icon: "📦",
  },
  {
    name: "mattermostwrapper",
    icon: "📦",
  },
  {
    name: "requests-http-signature",
    icon: "📦",
  },
  {
    name: "circus",
    icon: "📦",
  },
  {
    name: "opencensus-correlation",
    icon: "📦",
  },
  {
    name: "kivy-garden",
    icon: "📦",
  },
  {
    name: "setuptools-git-version",
    icon: "📦",
  },
  {
    name: "facepy",
    icon: "📦",
  },
  {
    name: "zope-security",
    icon: "📦",
  },
  {
    name: "bottlenose",
    icon: "📦",
  },
  {
    name: "mandrill-37",
    icon: "📦",
  },
  {
    name: "pyutilib",
    icon: "📦",
  },
  {
    name: "crontab",
    icon: "📦",
  },
  {
    name: "pytest-tornado",
    icon: "📦",
  },
  {
    name: "scaleapi",
    icon: "📦",
  },
  {
    name: "ipinfo",
    icon: "📦",
  },
  {
    name: "python-cjson",
    icon: "📦",
  },
  {
    name: "django-split-settings",
    icon: "📦",
  },
  {
    name: "simhash",
    icon: "📦",
  },
  {
    name: "suds-community",
    icon: "📦",
  },
  {
    name: "pyuca",
    icon: "📦",
  },
  {
    name: "supervisor-checks",
    icon: "📦",
  },
  {
    name: "django-push-notifications",
    icon: "📦",
  },
  {
    name: "netstorageapi",
    icon: "📦",
  },
  {
    name: "librabbitmq",
    icon: "📦",
  },
  {
    name: "django-admin-list-filter-dropdown",
    icon: "📦",
  },
  {
    name: "sphinx-markdown-builder",
    icon: "📦",
  },
  {
    name: "maya",
    icon: "📦",
  },
  {
    name: "django-render-block",
    icon: "📦",
  },
  {
    name: "centrosome",
    icon: "📦",
  },
  {
    name: "lomond",
    icon: "📦",
  },
  {
    name: "zope-configuration",
    icon: "📦",
  },
  {
    name: "djangocms-attributes-field",
    icon: "📦",
  },
  {
    name: "business-rules",
    icon: "📦",
  },
  {
    name: "rosdep",
    icon: "📦",
  },
  {
    name: "ssh-import-id",
    icon: "📦",
  },
  {
    name: "deluge-client",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-coretext",
    icon: "📦",
  },
  {
    name: "dbapi-opentracing",
    icon: "📦",
  },
  {
    name: "jsonfield2",
    icon: "📦",
  },
  {
    name: "trio",
    icon: "📦",
  },
  {
    name: "edx-submissions",
    icon: "📦",
  },
  {
    name: "dockerfile-parse",
    icon: "📦",
  },
  {
    name: "ed25519",
    icon: "📦",
  },
  {
    name: "validator-collection",
    icon: "📦",
  },
  {
    name: "pytils",
    icon: "📦",
  },
  {
    name: "petl",
    icon: "📦",
  },
  {
    name: "tempest",
    icon: "📦",
  },
  {
    name: "m3-cdecimal",
    icon: "📦",
  },
  {
    name: "fuzzysearch",
    icon: "📦",
  },
  {
    name: "torchsummary",
    icon: "📦",
  },
  {
    name: "open3d",
    icon: "📦",
  },
  {
    name: "pytorch-ignite",
    icon: "📦",
  },
  {
    name: "graphene-federation",
    icon: "📦",
  },
  {
    name: "pythainlp",
    icon: "📦",
  },
  {
    name: "zodb",
    icon: "📦",
  },
  {
    name: "remote-pdb",
    icon: "📦",
  },
  {
    name: "celery-once",
    icon: "📦",
  },
  {
    name: "unrar",
    icon: "📦",
  },
  {
    name: "lepl",
    icon: "📦",
  },
  {
    name: "pyangbind",
    icon: "📦",
  },
  {
    name: "mixpanel-api",
    icon: "📦",
  },
  {
    name: "redlock",
    icon: "📦",
  },
  {
    name: "flair",
    icon: "📦",
  },
  {
    name: "django-debug-panel",
    icon: "📦",
  },
  {
    name: "natto-py",
    icon: "📦",
  },
  {
    name: "nose-allure-plugin",
    icon: "📦",
  },
  {
    name: "javabridge",
    icon: "📦",
  },
  {
    name: "pyscss",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-coredata",
    icon: "📦",
  },
  {
    name: "marshmallow-jsonschema",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-screensaver",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-addressbook",
    icon: "📦",
  },
  {
    name: "sparse",
    icon: "📦",
  },
  {
    name: "azure-log-analytics-data-collector-api",
    icon: "📦",
  },
  {
    name: "azureml-widgets",
    icon: "📦",
  },
  {
    name: "pyfunctional",
    icon: "📦",
  },
  {
    name: "extruct",
    icon: "📦",
  },
  {
    name: "cmsis-pack-manager",
    icon: "📦",
  },
  {
    name: "google-cloud-pubsublite",
    icon: "📦",
  },
  {
    name: "captcha",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-syncservices",
    icon: "📦",
  },
  {
    name: "rtslib-fb",
    icon: "📦",
  },
  {
    name: "aws-embedded-metrics",
    icon: "📦",
  },
  {
    name: "canmatrix",
    icon: "📦",
  },
  {
    name: "sqlacodegen",
    icon: "📦",
  },
  {
    name: "pyvisa",
    icon: "📦",
  },
  {
    name: "rootpath",
    icon: "📦",
  },
  {
    name: "slumber",
    icon: "📦",
  },
  {
    name: "smartlingapisdk",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-applescriptkit",
    icon: "📦",
  },
  {
    name: "contexttimer",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-automator",
    icon: "📦",
  },
  {
    name: "zope-container",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-applicationservices",
    icon: "📦",
  },
  {
    name: "smartypants",
    icon: "📦",
  },
  {
    name: "django-url-filter",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-preferencepanes",
    icon: "📦",
  },
  {
    name: "localstack-ext",
    icon: "📦",
  },
  {
    name: "pyhaproxy",
    icon: "📦",
  },
  {
    name: "bx-python",
    icon: "📦",
  },
  {
    name: "lorem",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-installerplugins",
    icon: "📦",
  },
  {
    name: "mws",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-searchkit",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-latentsemanticmapping",
    icon: "📦",
  },
  {
    name: "emcee",
    icon: "📦",
  },
  {
    name: "marshmallow-polyfield",
    icon: "📦",
  },
  {
    name: "calmsize",
    icon: "📦",
  },
  {
    name: "rfc3339",
    icon: "📦",
  },
  {
    name: "nbgitpuller",
    icon: "📦",
  },
  {
    name: "scikit-multilearn",
    icon: "📦",
  },
  {
    name: "edx-when",
    icon: "📦",
  },
  {
    name: "zope-exceptions",
    icon: "📦",
  },
  {
    name: "pyrabbit",
    icon: "📦",
  },
  {
    name: "readerwriterlock",
    icon: "📦",
  },
  {
    name: "pytorch-memlab",
    icon: "📦",
  },
  {
    name: "flexmock",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-scriptingbridge",
    icon: "📦",
  },
  {
    name: "salt",
    icon: "📦",
  },
  {
    name: "aws-cdk-aws-lambda-event-sources",
    icon: "📦",
  },
  {
    name: "salesforce-fuelsdk",
    icon: "📦",
  },
  {
    name: "mox3",
    icon: "📦",
  },
  {
    name: "mnemonic",
    icon: "📦",
  },
  {
    name: "async",
    icon: "📦",
  },
  {
    name: "trufflehogregexes",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-corelocation",
    icon: "📦",
  },
  {
    name: "robotframework-databaselibrary",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-inputmethodkit",
    icon: "📦",
  },
  {
    name: "zerorpc",
    icon: "📦",
  },
  {
    name: "intuit-oauth",
    icon: "📦",
  },
  {
    name: "s3contents",
    icon: "📦",
  },
  {
    name: "azure-keyvault-administration",
    icon: "📦",
  },
  {
    name: "crhelper",
    icon: "📦",
  },
  {
    name: "tpot",
    icon: "📦",
  },
  {
    name: "flask-jwt",
    icon: "📦",
  },
  {
    name: "airspeed",
    icon: "📦",
  },
  {
    name: "pip-review",
    icon: "📦",
  },
  {
    name: "lark",
    icon: "📦",
  },
  {
    name: "glcontext",
    icon: "📦",
  },
  {
    name: "apyori",
    icon: "📦",
  },
  {
    name: "daiquiri",
    icon: "📦",
  },
  {
    name: "rapid-framework",
    icon: "📦",
  },
  {
    name: "arpeggio",
    icon: "📦",
  },
  {
    name: "snorkel",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-servicemanagement",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-collaboration",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-applescriptobjc",
    icon: "📦",
  },
  {
    name: "browserstack-local",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-dictionaryservices",
    icon: "📦",
  },
  {
    name: "requests-credssp",
    icon: "📦",
  },
  {
    name: "atomos",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-corebluetooth",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-instantmessage",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-corewlan",
    icon: "📦",
  },
  {
    name: "django-mock-queries",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-opendirectory",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-imagecapturecore",
    icon: "📦",
  },
  {
    name: "edx-django-release-util",
    icon: "📦",
  },
  {
    name: "image-classifiers",
    icon: "📦",
  },
  {
    name: "userpath",
    icon: "📦",
  },
  {
    name: "python-bioformats",
    icon: "📦",
  },
  {
    name: "zope-lifecycleevent",
    icon: "📦",
  },
  {
    name: "qdarkstyle",
    icon: "📦",
  },
  {
    name: "beautifultable",
    icon: "📦",
  },
  {
    name: "jenkins",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-accounts",
    icon: "📦",
  },
  {
    name: "nplusone",
    icon: "📦",
  },
  {
    name: "helpdev",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-eventkit",
    icon: "📦",
  },
  {
    name: "edx-completion",
    icon: "📦",
  },
  {
    name: "line-bot-sdk",
    icon: "📦",
  },
  {
    name: "snakeviz",
    icon: "📦",
  },
  {
    name: "junit2html",
    icon: "📦",
  },
  {
    name: "django-hashid-field",
    icon: "📦",
  },
  {
    name: "django-test-plus",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-avfoundation",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-avkit",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-social",
    icon: "📦",
  },
  {
    name: "pyupgrade",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-coreaudio",
    icon: "📦",
  },
  {
    name: "dbus-python",
    icon: "📦",
  },
  {
    name: "upyun",
    icon: "📦",
  },
  {
    name: "hashlib",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-scenekit",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-storekit",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-gamecenter",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-calendarstore",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-imserviceplugin",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-mapkit",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-notificationcenter",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-cryptotokenkit",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-multipeerconnectivity",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-spritekit",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-modelio",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-photos",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-networkextension",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-netfs",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-photosui",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-contactsui",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-contacts",
    icon: "📦",
  },
  {
    name: "pycosat",
    icon: "📦",
  },
  {
    name: "django-debug-toolbar-request-history",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-iosurface",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-safariservices",
    icon: "📦",
  },
  {
    name: "pyomo",
    icon: "📦",
  },
  {
    name: "geopyspark",
    icon: "📦",
  },
  {
    name: "json2xml",
    icon: "📦",
  },
  {
    name: "iniparse",
    icon: "📦",
  },
  {
    name: "pypsrp",
    icon: "📦",
  },
  {
    name: "emails",
    icon: "📦",
  },
  {
    name: "condor-git-config",
    icon: "📦",
  },
  {
    name: "pandas-schema",
    icon: "📦",
  },
  {
    name: "zope-cachedescriptors",
    icon: "📦",
  },
  {
    name: "colormath",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-intents",
    icon: "📦",
  },
  {
    name: "irc3-plugins-test",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-cloudkit",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-gamecontroller",
    icon: "📦",
  },
  {
    name: "django-daterange-filter",
    icon: "📦",
  },
  {
    name: "pyexcel-webio",
    icon: "📦",
  },
  {
    name: "pycpfcnpj",
    icon: "📦",
  },
  {
    name: "django-parler",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-mediaaccessibility",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-findersync",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-medialibrary",
    icon: "📦",
  },
  {
    name: "grpcio-opentracing",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-localauthentication",
    icon: "📦",
  },
  {
    name: "contentful",
    icon: "📦",
  },
  {
    name: "prokaryote",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-libdispatch",
    icon: "📦",
  },
  {
    name: "flask-injector",
    icon: "📦",
  },
  {
    name: "flask-classful",
    icon: "📦",
  },
  {
    name: "country-converter",
    icon: "📦",
  },
  {
    name: "zope-dottedname",
    icon: "📦",
  },
  {
    name: "ase",
    icon: "📦",
  },
  {
    name: "zope-testing",
    icon: "📦",
  },
  {
    name: "measurement",
    icon: "📦",
  },
  {
    name: "gpytorch",
    icon: "📦",
  },
  {
    name: "argo-models",
    icon: "📦",
  },
  {
    name: "flask-seasurf",
    icon: "📦",
  },
  {
    name: "python-grpc-prometheus",
    icon: "📦",
  },
  {
    name: "django-config-models",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-mediaplayer",
    icon: "📦",
  },
  {
    name: "pythondialog",
    icon: "📦",
  },
  {
    name: "python-mistralclient",
    icon: "📦",
  },
  {
    name: "aiostream",
    icon: "📦",
  },
  {
    name: "flask-responses",
    icon: "📦",
  },
  {
    name: "osmnx",
    icon: "📦",
  },
  {
    name: "django-choices",
    icon: "📦",
  },
  {
    name: "tensorpack",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-security",
    icon: "📦",
  },
  {
    name: "asyncinit",
    icon: "📦",
  },
  {
    name: "okta",
    icon: "📦",
  },
  {
    name: "robotbackgroundlogger",
    icon: "📦",
  },
  {
    name: "graphql-ws",
    icon: "📦",
  },
  {
    name: "import-expression",
    icon: "📦",
  },
  {
    name: "parameters-validation",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-securityinterface",
    icon: "📦",
  },
  {
    name: "style",
    icon: "📦",
  },
  {
    name: "google-images-download",
    icon: "📦",
  },
  {
    name: "characteristic",
    icon: "📦",
  },
  {
    name: "pyobjc-framework-coreaudiokit",
    icon: "📦",
  },
  {
    name: "pipx",
    icon: "📦",
  },
  {
    name: "pytest-replay",
    icon: "📦",
  },
  {
    name: "prisma",
    icon: "📦",
  },
  {
    name: "sourcery-cli",
    icon: "📦",
  },
];

const completionSpec: Fig.Spec = {
  name: "pip",
  description: "Python package manager",
  args: {},
  // options: [
  //   {
  //     name: ["-h, --help"],
  //     description: "Show help.",
  //   },
  //   {
  //     name: ["--isolated"],
  //     description:
  //       "Run pip in an isolated mode, ignoring environment variables and user configuration.",
  //   },
  //   {
  //     name: ["-v, --verbose"],
  //     description:
  //       "Give more output. Option is additive, and can be used up to 3 times.",
  //   },
  //   {
  //     name: ["-V, --version"],
  //     description: "Show version and exit.",
  //   },
  //   {
  //     name: ["-q, --quiet"],
  //     description:
  //       "Give less output. Option is additive, and can be used up to 3 times (corresponding to WARNING, ERROR, and CRITICAL logging levels).",
  //   },
  //   {
  //     name: ["--log"],
  //     description: "Path to a verbose appending log.",
  //     args: {
  //       name: "path",
  //       template: "filepaths",
  //     },
  //   },
  //   {
  //     name: ["--no-input"],
  //     description: "Disable prompting for input.",
  //   },
  //   {
  //     name: ["--proxy"],
  //     description:
  //       "Specify a proxy in the form [user:passwd@]proxy.server:port.",
  //     args: {
  //       name: "proxy",
  //       description: "[user:passwd@]proxy.server:port",
  //     },
  //   },
  //   {
  //     name: ["--retries"],
  //     description:
  //       "Maximum number of retries each connection should attempt (default 5 times).",
  //     args: {
  //       name: "retries",
  //     },
  //   },
  //   {
  //     name: ["--timeout"],
  //     description: "Set the socket timeout (default 15 seconds).",
  //     args: {
  //       name: "sec",
  //     },
  //   },
  //   {
  //     name: ["--exists-action"],
  //     description:
  //       "Default action when a path already exists: (s)witch, (i)gnore, (w)ipe, (b)ackup, (a)bort.",
  //     args: {
  //       name: "action",
  //     },
  //   },
  //   {
  //     name: ["--trusted-host"],
  //     description:
  //       "Mark this host or host:port pair as trusted, even though it does not have valid or any HTTPS.",
  //     args: {
  //       name: "hostname",
  //     },
  //   },
  //   {
  //     name: ["--cert"],
  //     description: "Path to alternate CA bundle.",
  //     args: {
  //       name: "path",
  //       template: "filepaths",
  //     },
  //   },
  //   {
  //     name: ["--client-cert"],
  //     description:
  //       "Path to SSL client certificate, a single file containing the private key and the certificate in PEM format.",
  //     args: {
  //       name: "path",
  //       template: "filepaths",
  //     },
  //   },
  //   {
  //     name: ["--cache-dir"],
  //     description: "Store the cache data in a directory.",
  //     args: {
  //       name: "dir",
  //       template: "folders",
  //     },
  //   },
  //   {
  //     name: ["--no-cache-dir"],
  //     description: "Disable the cache.",
  //   },
  //   {
  //     name: ["--disable-pip-version-check"],
  //     description:
  //       "Don't periodically check PyPI to determine whether a new version of pip is available for download. Implied with --no-index.",
  //   },
  //   {
  //     name: ["--no-color"],
  //     description: "Suppress colored output.",
  //   },
  //   {
  //     name: ["--no-python-version-warning"],
  //     description:
  //       "Silence deprecation warnings for upcoming unsupported Pythons.",
  //   },
  //   {
  //     name: ["--use-feature"],
  //     description:
  //       "Enable new functionality, that may be backward incompatible.",
  //     args: {
  //       name: "feature",
  //     },
  //   },
  //   {
  //     name: ["--use-deprecated"],
  //     description:
  //       "Enable deprecated functionality, that will be removed in the future.",
  //     args: {
  //       name: "feature",
  //     },
  //   },
  // ],
  subcommands: [
    {
      name: "install",
      description: "Install packages",
      args: {
        name: "package",
        description: "Package to install",
        suggestions: packageList,
        isVariadic: true,
      },
      options: [
        //   {
        //     name: ["--compile"],
        //     description: "Do not compile Python source files to bytecode",
        //   },
        //   {
        //     name: ["-U", "--upgrade"],
        //     description:
        //       "Upgrade all specified packages to the newest available version.",
        //   },
        //   {
        //     name: ["--upgrade-strategy"],
        //     description:
        //       "Determines how dependency upgrading should be handled [default: only-if-needed].",
        //   },
        //   {
        //     name: ["--no-deps"],
        //     description: "Don’t install package dependencies.",
        //   },
        //   {
        //     name: ["--root"],
        //     description:
        //       "Install everything relative to this alternate root directory.",
        //     args: {
        //       template: "folders",
        //     },
        //   },
        //   {
        //     name: ["--require-hashes"],
        //     description:
        //       "Require a hash to check each requirement against, for repeatable installs.",
        //   },
        //   {
        //     name: ["--prefix"],
        //     description:
        //       "Installation prefix where lib, bin and other top-level folders are placed",
        //     args: {
        //       template: "folders",
        //     },
        //   },
        //   {
        //     name: ["-t", "--target"],
        //     description: "Install packages into <dir>.",
        //     args: {
        //       name: "dir",
        //       template: "folders",
        //     },
        //   },
        //   {
        //     name: ["--no-compile"],
        //     description: "Do not compile Python source files to bytecode",
        //   },
        //   {
        //     name: ["--install-option"],
        //     description:
        //       "Extra arguments to be supplied to the setup.py install command",
        //   },
        //   {
        //     name: ["--no-build-isolation"],
        //     description:
        //       "Disable isolation when building a modern source distribution.",
        //   },
        //   {
        //     name: ["-c", "--constraint"],
        //     description:
        //       "Constrain versions using the given constraints file. This option can be used multiple times.",
        //   },
        {
          name: ["-r", "--requirement"],
          description:
            "Install from the given requirements file. This option can be used multiple times",
          isRepeatable: true,
          args: {
            name: "requirements file",
            template: "filepaths",
          },
        },
        //   {
        //     name: ["--no-deps"],
        //     description: "Don’t install package dependencies.",
        //   },
        //   {
        //     name: ["--global-option"],
        //     description:
        //       "Extra global options to be supplied to the setup.py call before the install command.",
        //   },
        //   {
        //     name: ["--no-binary"],
        //     description:
        //       "Constrain versions using the given constraints file. This option can be used multiple times.",
        //   },
        //   {
        //     name: ["--only-binary"],
        //     description: "Do not use source packages",
        //     args: {
        //       suggestions: [
        //         {
        //           name: ":all:",
        //           description: "Disable all source packages",
        //         },
        //         {
        //           name: ":none:",
        //           description: "Empty the set",
        //         },
        //       ],
        //     },
        //   },
        //   {
        //     name: ["--prefer-binary"],
        //     description:
        //       "Prefer older binary packages over newer source packages.",
        //   },
        //   {
        //     name: ["--src"],
        //     description: "Directory to check out editable projects into.",
        //     args: {
        //       name: "source folder",
        //       template: "folders",
        //     },
        //   },
        //   {
        //     name: ["--pre"],
        //     description:
        //       "Include pre-release and development versions. By default, pip only finds stable versions.",
        //   },
        //   {
        //     name: ["--require-hashes"],
        //     description:
        //       "Require a hash to check each requirement against, for repeatable installs.",
        //   },
        //   {
        //     name: ["--progress-bar"],
        //     description: "Specify type of progress to be displayed",
        //     args: {
        //       suggestions: [
        //         { name: "off" },
        //         { name: "on" },
        //         { name: "ascii" },
        //         { name: "pretty" },
        //         { name: "emoji" },
        //       ],
        //     },
        //   },
        //   {
        //     name: ["--no-build-isolation"],
        //     description:
        //       "Disable isolation when building a modern source distribution.",
        //   },
        //   {
        //     name: ["--use-pep517"],
        //     description: "Use PEP 517 for building source distributions",
        //   },
        //   {
        //     name: ["--ignore-requires-python"],
        //     description: "Ignore the Requires-Python information.",
        //   },
        //   {
        //     name: ["-d", "--dest"],
        //     description:
        //       "Require a hash to check each requirement against, for repeatable installs.",
        //     args: {
        //       name: "dir",
        //       template: "folders",
        //     },
        //   },
        //   {
        //     name: ["--platform"],
        //     description: "Only use wheels compatible with platform.",
        //     args: { name: "platform" },
        //   },
        //   {
        //     name: ["--python-version"],
        //     description:
        //       "The Python interpreter version to use for wheel and “Requires-Python” compatibility checks.",
        //   },
        //   {
        //     name: ["--implementation"],
        //     description: "Only use wheels compatible with Python implementation",
        //     args: {
        //       name: "implementation",
        //     },
        //   },
        //   {
        //     name: ["--abi"],
        //     description:
        //       "Only use wheels compatible with Python abi <abi>, e.g. ‘pypy_41’.",
        //     args: {
        //       name: "abi",
        //     },
        //   },
        //   {
        //     name: ["--no-clean"],
        //     description: "Don’t clean up build directories.",
        //   },
        //   {
        //     name: ["-i", "--index-url"],
        //     description: "Base URL of the Python Package Index",
        //     args: {
        //       name: "url",
        //     },
        //   },
        //   {
        //     name: ["--no-index"],
        //     description:
        //       "Ignore package index (only looking at --find-links URLs instead).",
        //   },
        //   {
        //     name: ["--extra-index-url"],
        //     description:
        //       "Extra URLs of package indexes to use in addition to --index-url. Should follow the same rules as --index-url.",
        //   },
        //   {
        //     name: ["-f", "--find-links"],
        //     description: "Look for archives in the directory listing",
        //     args: {
        //       name: "url",
        //       template: "filepaths",
        //     },
        //   },
      ],
    },
    {
      name: "download",
      description: "Download packages",
      args: {
        name: "path",
        template: "filepaths",
      },
      options: [
        {
          name: ["-c", "--constraint"],
          description:
            "Constrain versions using the given constraints file. This option can be used multiple times",
          isRepeatable: true,
        },
        {
          name: ["-r", "--requirement"],
          description:
            "Install from the given requirements file. This option can be used multiple times",
          isRepeatable: true,
        },
        {
          name: "--no-deps",
          description: "Don’t install package dependencies",
        },
        {
          name: "--global-option",
          description:
            "Extra global options to be supplied to the setup.py call before the install command",
        },
        {
          name: "--no-binary",
          description:
            "Constrain versions using the given constraints file. This option can be used multiple times",
          isRepeatable: true,
        },
        {
          name: "--only-binary",
          description: "Do not use source packages",
          args: {
            suggestions: [
              {
                name: ":all:",
                description: "Disable all source packages",
              },
              {
                name: ":none:",
                description: "Empty the set",
              },
            ],
          },
        },
        {
          name: "--prefer-binary",
          description:
            "Prefer older binary packages over newer source packages",
        },
        {
          name: "--src",
          description: "Directory to check out editable projects into",
          args: {
            name: "source folder",
            template: "folders",
          },
        },
        {
          name: "--pre",
          description:
            "Include pre-release and development versions. By default, pip only finds stable versions",
        },
        {
          name: "--require-hashes",
          description:
            "Require a hash to check each requirement against, for repeatable installs",
        },
        {
          name: "--progress-bar",
          description: "Specify type of progress to be displayed",
          args: {
            suggestions: [
              { name: "off" },
              { name: "on" },
              { name: "ascii" },
              { name: "pretty" },
              { name: "emoji" },
            ],
          },
        },
        {
          name: "--no-build-isolation",
          description:
            "Disable isolation when building a modern source distribution",
        },
        {
          name: "--use-pep517",
          description: "Use PEP 517 for building source distributions",
        },
        {
          name: "--ignore-requires-python",
          description: "Ignore the Requires-Python information",
        },
        {
          name: ["-d", "--dest"],
          description:
            "Require a hash to check each requirement against, for repeatable installs",
          args: {
            name: "dir",
            template: "folders",
          },
        },
        {
          name: "--platform",
          description: "Only use wheels compatible with platform",
          args: { name: "platform" },
        },
        {
          name: "--python-version",
          description:
            "The Python interpreter version to use for wheel and “Requires-Python” compatibility checks",
        },
        {
          name: "--implementation",
          description: "Only use wheels compatible with Python implementation",
          args: {
            name: "implementation",
          },
        },
        {
          name: "--abi",
          description:
            "Only use wheels compatible with Python abi <abi>, e.g. ‘pypy_41’",
          args: {
            name: "abi",
          },
        },
        {
          name: "--no-clean",
          description: "Don’t clean up build directories",
        },
        {
          name: ["-i", "--index-url"],
          description: "Base URL of the Python Package Index",
          args: {
            name: "url",
          },
        },
        {
          name: "--no-index",
          description:
            "Ignore package index (only looking at --find-links URLs instead)",
        },
        {
          name: "--extra-index-url",
          description:
            "Extra URLs of package indexes to use in addition to --index-url. Should follow the same rules as --index-url",
        },
        {
          name: ["-f", "--find-links"],
          description: "Look for archives in the directory listing",
          args: {
            name: "url",
            template: "filepaths",
          },
        },
      ],
    },
    {
      name: "uninstall",
      description: "Uninstall packages",
      args: {},
    },
    {
      name: "freeze",
      description: "Output installed packages in requirements format",
      options: [
        {
          name: ["-r", "--requirement"],
          description:
            "Use the order in the given requirements file and its comments when generating output",
        },
        {
          name: ["-l", "--local"],
          description:
            "If in a virtualenv that has global access, do not output globally-installed packages",
        },
        {
          name: "--user",
          description: "Only output packages installed in user-site",
        },
        {
          name: "--path",
          description:
            "Restrict to the specified installation path for listing packages (can be used multiple times)",
          isRepeatable: true,
        },
        {
          name: "--all",
          description:
            "Do not skip these packages in the output: setuptools, distribute, pip, wheel",
        },
        {
          name: "--exclude-editable",
          description: "Exclude editable package from output",
        },
        {
          name: "--exclude",
          description: "Exclude specified package from the output",
          args: {
            name: "package",
            suggestCurrentToken: true,
            generators: listPackages,
          },
        },
      ],
    },
    {
      name: "list",
      description: "List installed packages",
      options: [
        {
          name: ["-o", "--outdated"],
          description: "List outdated packages",
        },
        {
          name: ["-u", "--uptodate"],
          description: "List uptodate packages",
        },
        {
          name: ["-e", "--editable"],
          description: "List editable projects",
        },
        {
          name: ["-l", "--local"],
          description:
            "If in a virtualenv that has global access, do not list globally-installed packages",
        },
        {
          name: "--user",
          description: "Only output packages installed in user-site",
        },
        {
          name: "--path",
          description:
            "Restrict to the specified installation path for listing packages (can be used multiple times)",
          isRepeatable: true,
          args: {
            name: "path",
            template: "filepaths",
          },
        },
        {
          name: "--pre",
          description:
            "Include pre-release and development versions. By default, pip only finds stable versions",
        },
        {
          name: "--format",
          description:
            "Select the output format among: columns (default), freeze, or json",
        },
        {
          name: "--not-required",
          description:
            "List packages that are not dependencies of installed packages",
        },
        {
          name: "--exclude-editable",
          description: "Exclude editable package from output",
        },
        {
          name: "--include-editable",
          description: "Include editable package from output",
        },
        {
          name: "--exclude",
          description: "Exclude specified package from the output",
          args: {
            name: "package",
            generators: listPackages,
          },
        },
        {
          name: ["-i", "--index-url"],
          description:
            "Base URL of the Python Package Index (default https://pypi.org/simple)",
          args: {},
        },
        {
          name: "--extra-index-url",
          description:
            "Include pre-release and development versions. By default, pip only finds stable versions",
        },
        {
          name: "--no-index",
          description:
            "Ignore package index (only looking at --find-links URLs instead)",
        },
        {
          name: ["-f", "--find-links"],
          description:
            "If a URL or path to an html file, then parse for links to archives such as sdist (.tar.gz) or wheel (.whl) files",
          args: {
            name: "url",
          },
        },
      ],
    },
    {
      name: "show",
      description: "Show information about installed packages",
      options: [
        {
          name: ["-f", "--files"],
        },
      ],
    },
    {
      name: "check",
      description: "Verify installed packages have compatible dependencies",
    },
    {
      name: "config",
      description: "Manage local and global configuration",
      options: [
        {
          name: "--editor",
          description:
            "Editor to use to edit the file. Uses VISUAL or EDITOR environment variables if not provided",
        },
        {
          name: "--global",
          description: "Use the system-wide configuration file only",
        },
        {
          name: "--user",
          description: "Use the user configuration file only",
        },
        {
          name: "--site",
          description: "Use the current environment configuration file only",
        },
      ],
    },
    {
      name: "search",
      description: "Search PyPI for packages",
      options: [
        {
          name: ["-i", "--index"],
        },
      ],
    },
    {
      name: "cache",
      description: "Inspect and manage pip's wheel cache",
    },
    {
      name: "wheel",
      description: "Build wheels from your requirements",
    },
    {
      name: "hash",
      description: "Compute hashes of package archives",
      options: [
        {
          name: ["-a", "--algorithm"],
          description: "The hash algorithm to use",
          args: {
            suggestions: [
              { name: "sha256" },
              { name: "sha384" },
              { name: "sha512" },
            ],
          },
        },
      ],
    },
    {
      name: "completion",
      description: "A helper command used for command completion",
    },
    {
      name: "debug",
      description: "Show information useful for debugging",
      options: [
        {
          name: "--platform",
          description: "Only use wheels compatible with platform",
          args: {
            name: "platform",
          },
        },
        {
          name: "--python-version",
          description:
            "The Python interpreter version to use for wheel and “Requires-Python” compatibility checks",
          args: {
            name: "python version",
          },
        },
        {
          name: "--implementation",
          description: "Only use wheels compatible with Python implementation",
          args: {
            name: "implementation",
          },
        },
      ],
    },
    {
      name: "index",
      description: "Inspect information available from package indexes",
      subcommands: [
        {
          name: "versions",
          description: "Show the versions available for the given package",
          args: { name: "package" },
        },
      ],
    },
    {
      name: "inspect",
      description:
        "Inspect the content of a Python environment and produce a report in JSON format",
      options: [
        {
          name: "--local",
          description:
            "If in a virtualenv that has global access, do not list globally-installed packages",
        },
        {
          name: "--user",
          description: "Only output packages installed in user-site",
        },
        {
          name: "--path",
          description:
            "Restrict to the specified installation path for listing packages",
          args: { name: "path", template: "folders" },
        },
      ],
    },
    {
      name: "lock",
      description:
        "Generate a lock file (pylock.toml) for the given requirements",
      args: { name: "requirement", isOptional: true, isVariadic: true },
      options: [
        {
          name: ["-r", "--requirement"],
          description:
            "Lock all the packages listed in the given requirements file",
          args: { name: "file", template: "filepaths" },
        },
        {
          name: ["-e", "--editable"],
          description: "Lock a project in editable mode from a local path",
          args: { name: "path", template: "folders" },
        },
        {
          name: "--output",
          description:
            "The file to write the lock file to (default pylock.toml)",
          args: { name: "file", template: "filepaths" },
        },
        {
          name: "--no-deps",
          description: "Don't lock package dependencies",
        },
        {
          name: "--pre",
          description:
            "Include pre-release and development versions. By default, pip only finds stable versions",
        },
      ],
    },
    {
      name: "help",
      description: "Show help for commands",
    },
  ],
};

export default completionSpec;
