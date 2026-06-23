var e={name:"container",description:"Deploy and manage clusters of machines for running containers",subcommands:[{name:"binauthz",description:"Manage attestations for Binary Authorization on Google Cloud Platform",subcommands:[{name:"attestations",description:"Create and manage Google Binary Authorization attestations",subcommands:[{name:"create",description:"Create a Binary Authorization attestation",options:[{name:"--account",description:"Google Cloud Platform user account to use for invocation. Overrides the default *core/account* property value for this command invocation",args:{name:"ACCOUNT",description:"String",suggestions:[]}},{name:"--artifact-url",description:"Container URL. May be in the `gcr.io/repository/image` format, or may optionally contain the `http` or `https` scheme",args:{name:"ARTIFACT_URL",description:"String",suggestions:[]},priority:100},{name:"--attestor",description:"ID of the attestor or fully qualified identifier for the attestor",args:{name:"ATTESTOR",description:"String",suggestions:[]},priority:100},{name:"--attestor-project",description:"Project ID of the Google Cloud Platform project for the attestor",args:{name:"ATTESTOR_PROJECT",description:"String",suggestions:[]}},{name:"--billing-project",description:"The Google Cloud Platform project that will be charged quota for operations performed in gcloud. If you need to operate on one project, but need quota against a different project, you can use this flag to specify the billing project. If both `billing/quota_project` and `--billing-project` are specified, `--billing-project` takes precedence. Run `$ gcloud config set --help` to see more information about `billing/quota_project`",args:{name:"BILLING_PROJECT",description:"String",suggestions:[]}},{name:"--configuration",description:`The configuration to use for this command invocation. For more
information on how to use configurations, run:
\`gcloud topic configurations\`.  You can also use the CLOUDSDK_ACTIVE_CONFIG_NAME environment
variable to set the equivalent of this flag for a terminal
session`,args:{name:"CONFIGURATION",description:"String",suggestions:[]}},{name:"--flags-file",description:`A YAML or JSON file that specifies a *--flag*:*value* dictionary.
Useful for specifying complex flag values with special characters
that work with any command interpreter. Additionally, each
*--flags-file* arg is replaced by its constituent flags. See
$ gcloud topic flags-file for more information`,args:{name:"YAML_FILE",description:"String",suggestions:[]}},{name:"--flatten",description:`Flatten _name_[] output resource slices in _KEY_ into separate records
for each item in each slice. Multiple keys and slices may be specified.
This also flattens keys for *--format* and *--filter*. For example,
*--flatten=abc.def* flattens *abc.def[].ghi* references to
*abc.def.ghi*. A resource record containing *abc.def[]* with N elements
will expand to N records in the flattened output. This flag interacts
with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--format",description:"Set the format for printing command output resources. The default is a\ncommand-specific human-friendly output format. The supported formats\nare: `config`, `csv`, `default`, `diff`, `disable`, `flattened`, `get`, `json`, `list`, `multi`, `none`, `object`, `table`, `text`, `value`, `yaml`. For more details run $ gcloud topic formats",args:{name:"FORMAT",description:"String",suggestions:[]}},{name:"--help",description:"Display detailed help"},{name:"--impersonate-service-account",description:"For this gcloud invocation, all API requests will be made as the given service account instead of the currently selected account. This is done without needing to create, download, and activate a key for the account. In order to perform operations as the service account, your currently selected account must have an IAM role that includes the iam.serviceAccounts.getAccessToken permission for the service account. The roles/iam.serviceAccountTokenCreator role has this permission or you may create a custom role. Overrides the default *auth/impersonate_service_account* property value for this command invocation",args:{name:"SERVICE_ACCOUNT_EMAIL",description:"String",suggestions:[]}},{name:"--log-http",description:"Log all HTTP server requests and responses to stderr. Overrides the default *core/log_http* property value for this command invocation"},{name:"--payload-file",description:`Path to file containing the payload over which the signature was
calculated.
+
This defaults to the output of the standard payload command:
+
    $ {grandparent_command} create-signature-payload
+
NOTE: If you sign a payload with e.g. different whitespace or
formatting, you must explicitly provide the payload content via this
flag`,args:{name:"PAYLOAD_FILE",description:"String",suggestions:[]}},{name:"--project",description:"The Google Cloud Platform project ID to use for this invocation. If\nomitted, then the current project is assumed; the current project can\nbe listed using `gcloud config list --format='text(core.project)'`\nand can be set using `gcloud config set project PROJECTID`.\n+\n`--project` and its fallback `core/project` property play two roles\nin the invocation. It specifies the project of the resource to\noperate on. It also specifies the project for API enablement check,\nquota, and billing. To specify a different project for quota and\nbilling, use `--billing-project` or `billing/quota_project` property",args:{name:"PROJECT_ID",description:"String",suggestions:[]}},{name:"--public-key-id",description:`The ID of the public key that will be used to verify the signature
of the created Attestation. This ID must match the one found on the
Attestor resource(s) which will verify this Attestation.
+
For PGP keys, this must be the version 4, full 160-bit fingerprint,
expressed as a 40 character hexadecimal string. See
https://tools.ietf.org/html/rfc4880#section-12.2 for details`,args:{name:"PUBLIC_KEY_ID",description:"String",suggestions:[]},priority:100},{name:"--quiet",description:`Disable all interactive prompts when running gcloud commands. If input
is required, defaults will be used, or an error will be raised.
Overrides the default core/disable_prompts property value for this
command invocation. This is equivalent to setting the environment
variable \`CLOUDSDK_CORE_DISABLE_PROMPTS\` to 1`},{name:"--signature-file",description:"Path to file containing the signature to store, or `-` to read\nsignature from stdin",args:{name:"SIGNATURE_FILE",description:"String",suggestions:[]},priority:100},{name:"--trace-token",description:"Token used to route traces of service requests for investigation of issues. Overrides the default *core/trace_token* property value for this command invocation",args:{name:"TRACE_TOKEN",description:"String",suggestions:[]}},{name:"--user-output-enabled",description:"Print user intended output to the console. Overrides the default *core/user_output_enabled* property value for this command invocation. Use *--no-user-output-enabled* to disable"},{name:"--validate",description:`Whether to validate that the Attestation can be verified by the
provided Attestor`},{name:"--verbosity",description:"Override the default verbosity for this command. Overrides the default *core/verbosity* property value for this command invocation. _VERBOSITY_ must be one of: *debug*, *info*, *warning*, *error*, *critical*, *none*",args:{name:"VERBOSITY",description:"String",suggestions:["debug","info","warning","error","critical","none"]}}]},{name:"list",description:"List Binary Authorization attestations",options:[{name:"--account",description:"Google Cloud Platform user account to use for invocation. Overrides the default *core/account* property value for this command invocation",args:{name:"ACCOUNT",description:"String",suggestions:[]}},{name:"--artifact-url",description:"Container URL. May be in the `gcr.io/repository/image` format, or may optionally contain the `http` or `https` scheme",args:{name:"ARTIFACT_URL",description:"String",suggestions:[]}},{name:"--attestor",description:"ID of the attestor or fully qualified identifier for the attestor",args:{name:"ATTESTOR",description:"String",suggestions:[]},priority:100},{name:"--attestor-project",description:"Project ID of the Google Cloud Platform project for the attestor",args:{name:"ATTESTOR_PROJECT",description:"String",suggestions:[]}},{name:"--billing-project",description:"The Google Cloud Platform project that will be charged quota for operations performed in gcloud. If you need to operate on one project, but need quota against a different project, you can use this flag to specify the billing project. If both `billing/quota_project` and `--billing-project` are specified, `--billing-project` takes precedence. Run `$ gcloud config set --help` to see more information about `billing/quota_project`",args:{name:"BILLING_PROJECT",description:"String",suggestions:[]}},{name:"--configuration",description:`The configuration to use for this command invocation. For more
information on how to use configurations, run:
\`gcloud topic configurations\`.  You can also use the CLOUDSDK_ACTIVE_CONFIG_NAME environment
variable to set the equivalent of this flag for a terminal
session`,args:{name:"CONFIGURATION",description:"String",suggestions:[]}},{name:"--filter",description:`Apply a Boolean filter _EXPRESSION_ to each resource item to be listed.
If the expression evaluates \`True\`, then that item is listed. For more
details and examples of filter expressions, run $ gcloud topic filters. This
flag interacts with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"EXPRESSION",description:"String",suggestions:[]}},{name:"--flags-file",description:`A YAML or JSON file that specifies a *--flag*:*value* dictionary.
Useful for specifying complex flag values with special characters
that work with any command interpreter. Additionally, each
*--flags-file* arg is replaced by its constituent flags. See
$ gcloud topic flags-file for more information`,args:{name:"YAML_FILE",description:"String",suggestions:[]}},{name:"--flatten",description:`Flatten _name_[] output resource slices in _KEY_ into separate records
for each item in each slice. Multiple keys and slices may be specified.
This also flattens keys for *--format* and *--filter*. For example,
*--flatten=abc.def* flattens *abc.def[].ghi* references to
*abc.def.ghi*. A resource record containing *abc.def[]* with N elements
will expand to N records in the flattened output. This flag interacts
with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--format",description:"Set the format for printing command output resources. The default is a\ncommand-specific human-friendly output format. The supported formats\nare: `config`, `csv`, `default`, `diff`, `disable`, `flattened`, `get`, `json`, `list`, `multi`, `none`, `object`, `table`, `text`, `value`, `yaml`. For more details run $ gcloud topic formats",args:{name:"FORMAT",description:"String",suggestions:[]}},{name:"--help",description:"Display detailed help"},{name:"--impersonate-service-account",description:"For this gcloud invocation, all API requests will be made as the given service account instead of the currently selected account. This is done without needing to create, download, and activate a key for the account. In order to perform operations as the service account, your currently selected account must have an IAM role that includes the iam.serviceAccounts.getAccessToken permission for the service account. The roles/iam.serviceAccountTokenCreator role has this permission or you may create a custom role. Overrides the default *auth/impersonate_service_account* property value for this command invocation",args:{name:"SERVICE_ACCOUNT_EMAIL",description:"String",suggestions:[]}},{name:"--limit",description:`Maximum number of resources to list. The default is *unlimited*.
This flag interacts with other flags that are applied in this order:
*--flatten*, *--sort-by*, *--filter*, *--limit*`,args:{name:"LIMIT",description:"Googlecloudsdk.calliope.arg_parsers:Parse",suggestions:[]}},{name:"--log-http",description:"Log all HTTP server requests and responses to stderr. Overrides the default *core/log_http* property value for this command invocation"},{name:"--page-size",description:`Some services group resource list output into pages. This flag specifies
the maximum number of resources per page. The default is determined by the
service if it supports paging, otherwise it is *unlimited* (no paging).
Paging may be applied before or after *--filter* and *--limit* depending
on the service`,args:{name:"PAGE_SIZE",description:"Googlecloudsdk.calliope.arg_parsers:Parse",suggestions:[]}},{name:"--project",description:"The Google Cloud Platform project ID to use for this invocation. If\nomitted, then the current project is assumed; the current project can\nbe listed using `gcloud config list --format='text(core.project)'`\nand can be set using `gcloud config set project PROJECTID`.\n+\n`--project` and its fallback `core/project` property play two roles\nin the invocation. It specifies the project of the resource to\noperate on. It also specifies the project for API enablement check,\nquota, and billing. To specify a different project for quota and\nbilling, use `--billing-project` or `billing/quota_project` property",args:{name:"PROJECT_ID",description:"String",suggestions:[]}},{name:"--quiet",description:`Disable all interactive prompts when running gcloud commands. If input
is required, defaults will be used, or an error will be raised.
Overrides the default core/disable_prompts property value for this
command invocation. This is equivalent to setting the environment
variable \`CLOUDSDK_CORE_DISABLE_PROMPTS\` to 1`},{name:"--sort-by",description:`Comma-separated list of resource field key names to sort by. The
default order is ascending. Prefix a field with \`\`~'' for descending
order on that field. This flag interacts with other flags that are applied
in this order: *--flatten*, *--sort-by*, *--filter*, *--limit*`,args:{name:"FIELD",description:"List",suggestions:[]}},{name:"--trace-token",description:"Token used to route traces of service requests for investigation of issues. Overrides the default *core/trace_token* property value for this command invocation",args:{name:"TRACE_TOKEN",description:"String",suggestions:[]}},{name:"--uri",description:"Print a list of resource URIs instead of the default output"},{name:"--user-output-enabled",description:"Print user intended output to the console. Overrides the default *core/user_output_enabled* property value for this command invocation. Use *--no-user-output-enabled* to disable"},{name:"--verbosity",description:"Override the default verbosity for this command. Overrides the default *core/verbosity* property value for this command invocation. _VERBOSITY_ must be one of: *debug*, *info*, *warning*, *error*, *critical*, *none*",args:{name:"VERBOSITY",description:"String",suggestions:["debug","info","warning","error","critical","none"]}}]}],options:[{name:"--account",description:"Google Cloud Platform user account to use for invocation. Overrides the default *core/account* property value for this command invocation",args:{name:"ACCOUNT",description:"String",suggestions:[]}},{name:"--billing-project",description:"The Google Cloud Platform project that will be charged quota for operations performed in gcloud. If you need to operate on one project, but need quota against a different project, you can use this flag to specify the billing project. If both `billing/quota_project` and `--billing-project` are specified, `--billing-project` takes precedence. Run `$ gcloud config set --help` to see more information about `billing/quota_project`",args:{name:"BILLING_PROJECT",description:"String",suggestions:[]}},{name:"--configuration",description:`The configuration to use for this command invocation. For more
information on how to use configurations, run:
\`gcloud topic configurations\`.  You can also use the CLOUDSDK_ACTIVE_CONFIG_NAME environment
variable to set the equivalent of this flag for a terminal
session`,args:{name:"CONFIGURATION",description:"String",suggestions:[]}},{name:"--flags-file",description:`A YAML or JSON file that specifies a *--flag*:*value* dictionary.
Useful for specifying complex flag values with special characters
that work with any command interpreter. Additionally, each
*--flags-file* arg is replaced by its constituent flags. See
$ gcloud topic flags-file for more information`,args:{name:"YAML_FILE",description:"String",suggestions:[]}},{name:"--flatten",description:`Flatten _name_[] output resource slices in _KEY_ into separate records
for each item in each slice. Multiple keys and slices may be specified.
This also flattens keys for *--format* and *--filter*. For example,
*--flatten=abc.def* flattens *abc.def[].ghi* references to
*abc.def.ghi*. A resource record containing *abc.def[]* with N elements
will expand to N records in the flattened output. This flag interacts
with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--format",description:"Set the format for printing command output resources. The default is a\ncommand-specific human-friendly output format. The supported formats\nare: `config`, `csv`, `default`, `diff`, `disable`, `flattened`, `get`, `json`, `list`, `multi`, `none`, `object`, `table`, `text`, `value`, `yaml`. For more details run $ gcloud topic formats",args:{name:"FORMAT",description:"String",suggestions:[]}},{name:"--help",description:"Display detailed help"},{name:"--impersonate-service-account",description:"For this gcloud invocation, all API requests will be made as the given service account instead of the currently selected account. This is done without needing to create, download, and activate a key for the account. In order to perform operations as the service account, your currently selected account must have an IAM role that includes the iam.serviceAccounts.getAccessToken permission for the service account. The roles/iam.serviceAccountTokenCreator role has this permission or you may create a custom role. Overrides the default *auth/impersonate_service_account* property value for this command invocation",args:{name:"SERVICE_ACCOUNT_EMAIL",description:"String",suggestions:[]}},{name:"--log-http",description:"Log all HTTP server requests and responses to stderr. Overrides the default *core/log_http* property value for this command invocation"},{name:"--project",description:"The Google Cloud Platform project ID to use for this invocation. If\nomitted, then the current project is assumed; the current project can\nbe listed using `gcloud config list --format='text(core.project)'`\nand can be set using `gcloud config set project PROJECTID`.\n+\n`--project` and its fallback `core/project` property play two roles\nin the invocation. It specifies the project of the resource to\noperate on. It also specifies the project for API enablement check,\nquota, and billing. To specify a different project for quota and\nbilling, use `--billing-project` or `billing/quota_project` property",args:{name:"PROJECT_ID",description:"String",suggestions:[]}},{name:"--quiet",description:`Disable all interactive prompts when running gcloud commands. If input
is required, defaults will be used, or an error will be raised.
Overrides the default core/disable_prompts property value for this
command invocation. This is equivalent to setting the environment
variable \`CLOUDSDK_CORE_DISABLE_PROMPTS\` to 1`},{name:"--trace-token",description:"Token used to route traces of service requests for investigation of issues. Overrides the default *core/trace_token* property value for this command invocation",args:{name:"TRACE_TOKEN",description:"String",suggestions:[]}},{name:"--user-output-enabled",description:"Print user intended output to the console. Overrides the default *core/user_output_enabled* property value for this command invocation. Use *--no-user-output-enabled* to disable"},{name:"--verbosity",description:"Override the default verbosity for this command. Overrides the default *core/verbosity* property value for this command invocation. _VERBOSITY_ must be one of: *debug*, *info*, *warning*, *error*, *critical*, *none*",args:{name:"VERBOSITY",description:"String",suggestions:["debug","info","warning","error","critical","none"]}}]},{name:"attestors",description:"Create and manage Google Binary Authorization Attestors",subcommands:[{name:"add-iam-policy-binding",description:"Add IAM policy binding to a Binary Authorization attestor",options:[{name:"--account",description:"Google Cloud Platform user account to use for invocation. Overrides the default *core/account* property value for this command invocation",args:{name:"ACCOUNT",description:"String",suggestions:[]}},{name:"--billing-project",description:"The Google Cloud Platform project that will be charged quota for operations performed in gcloud. If you need to operate on one project, but need quota against a different project, you can use this flag to specify the billing project. If both `billing/quota_project` and `--billing-project` are specified, `--billing-project` takes precedence. Run `$ gcloud config set --help` to see more information about `billing/quota_project`",args:{name:"BILLING_PROJECT",description:"String",suggestions:[]}},{name:"--configuration",description:`The configuration to use for this command invocation. For more
information on how to use configurations, run:
\`gcloud topic configurations\`.  You can also use the CLOUDSDK_ACTIVE_CONFIG_NAME environment
variable to set the equivalent of this flag for a terminal
session`,args:{name:"CONFIGURATION",description:"String",suggestions:[]}},{name:"--flags-file",description:`A YAML or JSON file that specifies a *--flag*:*value* dictionary.
Useful for specifying complex flag values with special characters
that work with any command interpreter. Additionally, each
*--flags-file* arg is replaced by its constituent flags. See
$ gcloud topic flags-file for more information`,args:{name:"YAML_FILE",description:"String",suggestions:[]}},{name:"--flatten",description:`Flatten _name_[] output resource slices in _KEY_ into separate records
for each item in each slice. Multiple keys and slices may be specified.
This also flattens keys for *--format* and *--filter*. For example,
*--flatten=abc.def* flattens *abc.def[].ghi* references to
*abc.def.ghi*. A resource record containing *abc.def[]* with N elements
will expand to N records in the flattened output. This flag interacts
with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--format",description:"Set the format for printing command output resources. The default is a\ncommand-specific human-friendly output format. The supported formats\nare: `config`, `csv`, `default`, `diff`, `disable`, `flattened`, `get`, `json`, `list`, `multi`, `none`, `object`, `table`, `text`, `value`, `yaml`. For more details run $ gcloud topic formats",args:{name:"FORMAT",description:"String",suggestions:[]}},{name:"--help",description:"Display detailed help"},{name:"--impersonate-service-account",description:"For this gcloud invocation, all API requests will be made as the given service account instead of the currently selected account. This is done without needing to create, download, and activate a key for the account. In order to perform operations as the service account, your currently selected account must have an IAM role that includes the iam.serviceAccounts.getAccessToken permission for the service account. The roles/iam.serviceAccountTokenCreator role has this permission or you may create a custom role. Overrides the default *auth/impersonate_service_account* property value for this command invocation",args:{name:"SERVICE_ACCOUNT_EMAIL",description:"String",suggestions:[]}},{name:"--log-http",description:"Log all HTTP server requests and responses to stderr. Overrides the default *core/log_http* property value for this command invocation"},{name:"--member",description:"The member to add the binding for. Should be of the form `user|group|serviceAccount:email` or\n`domain:domain`.\n+\nExamples: `user:test-user@gmail.com`, `group:admins@example.com`,\n`serviceAccount:test123@example.domain.com`, or\n`domain:example.domain.com`.\n+\nCan also be one of the following special values:\n* `allUsers` - Special identifier that represents anyone who is on the internet,\n   with or without a Google account.\n* `allAuthenticatedUsers` - Special identifier that represents anyone who is\n   authenticated with a Google account or a service account",args:{name:"MEMBER",description:"String",suggestions:[]},priority:100},{name:"--project",description:"The Google Cloud Platform project ID to use for this invocation. If\nomitted, then the current project is assumed; the current project can\nbe listed using `gcloud config list --format='text(core.project)'`\nand can be set using `gcloud config set project PROJECTID`.\n+\n`--project` and its fallback `core/project` property play two roles\nin the invocation. It specifies the project of the resource to\noperate on. It also specifies the project for API enablement check,\nquota, and billing. To specify a different project for quota and\nbilling, use `--billing-project` or `billing/quota_project` property",args:{name:"PROJECT_ID",description:"String",suggestions:[]}},{name:"--quiet",description:`Disable all interactive prompts when running gcloud commands. If input
is required, defaults will be used, or an error will be raised.
Overrides the default core/disable_prompts property value for this
command invocation. This is equivalent to setting the environment
variable \`CLOUDSDK_CORE_DISABLE_PROMPTS\` to 1`},{name:"--role",description:"Define the role of the member",args:{name:"ROLE",description:"String",suggestions:[]},priority:100},{name:"--trace-token",description:"Token used to route traces of service requests for investigation of issues. Overrides the default *core/trace_token* property value for this command invocation",args:{name:"TRACE_TOKEN",description:"String",suggestions:[]}},{name:"--user-output-enabled",description:"Print user intended output to the console. Overrides the default *core/user_output_enabled* property value for this command invocation. Use *--no-user-output-enabled* to disable"},{name:"--verbosity",description:"Override the default verbosity for this command. Overrides the default *core/verbosity* property value for this command invocation. _VERBOSITY_ must be one of: *debug*, *info*, *warning*, *error*, *critical*, *none*",args:{name:"VERBOSITY",description:"String",suggestions:["debug","info","warning","error","critical","none"]}}],args:{name:"ATTESTOR",description:"ID of the attestor or fully qualified identifier for the attestor"}},{name:"create",description:"Create an Attestor",options:[{name:"--account",description:"Google Cloud Platform user account to use for invocation. Overrides the default *core/account* property value for this command invocation",args:{name:"ACCOUNT",description:"String",suggestions:[]}},{name:"--attestation-authority-note",description:"ID of the note or fully qualified identifier for the note",args:{name:"ATTESTATION_AUTHORITY_NOTE",description:"String",suggestions:[]},priority:100},{name:"--attestation-authority-note-project",description:"The Container Analysis project for the note",args:{name:"ATTESTATION_AUTHORITY_NOTE_PROJECT",description:"String",suggestions:[]}},{name:"--billing-project",description:"The Google Cloud Platform project that will be charged quota for operations performed in gcloud. If you need to operate on one project, but need quota against a different project, you can use this flag to specify the billing project. If both `billing/quota_project` and `--billing-project` are specified, `--billing-project` takes precedence. Run `$ gcloud config set --help` to see more information about `billing/quota_project`",args:{name:"BILLING_PROJECT",description:"String",suggestions:[]}},{name:"--configuration",description:`The configuration to use for this command invocation. For more
information on how to use configurations, run:
\`gcloud topic configurations\`.  You can also use the CLOUDSDK_ACTIVE_CONFIG_NAME environment
variable to set the equivalent of this flag for a terminal
session`,args:{name:"CONFIGURATION",description:"String",suggestions:[]}},{name:"--description",description:"A description for the attestor",args:{name:"DESCRIPTION",description:"String",suggestions:[]}},{name:"--flags-file",description:`A YAML or JSON file that specifies a *--flag*:*value* dictionary.
Useful for specifying complex flag values with special characters
that work with any command interpreter. Additionally, each
*--flags-file* arg is replaced by its constituent flags. See
$ gcloud topic flags-file for more information`,args:{name:"YAML_FILE",description:"String",suggestions:[]}},{name:"--flatten",description:`Flatten _name_[] output resource slices in _KEY_ into separate records
for each item in each slice. Multiple keys and slices may be specified.
This also flattens keys for *--format* and *--filter*. For example,
*--flatten=abc.def* flattens *abc.def[].ghi* references to
*abc.def.ghi*. A resource record containing *abc.def[]* with N elements
will expand to N records in the flattened output. This flag interacts
with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--format",description:"Set the format for printing command output resources. The default is a\ncommand-specific human-friendly output format. The supported formats\nare: `config`, `csv`, `default`, `diff`, `disable`, `flattened`, `get`, `json`, `list`, `multi`, `none`, `object`, `table`, `text`, `value`, `yaml`. For more details run $ gcloud topic formats",args:{name:"FORMAT",description:"String",suggestions:[]}},{name:"--help",description:"Display detailed help"},{name:"--impersonate-service-account",description:"For this gcloud invocation, all API requests will be made as the given service account instead of the currently selected account. This is done without needing to create, download, and activate a key for the account. In order to perform operations as the service account, your currently selected account must have an IAM role that includes the iam.serviceAccounts.getAccessToken permission for the service account. The roles/iam.serviceAccountTokenCreator role has this permission or you may create a custom role. Overrides the default *auth/impersonate_service_account* property value for this command invocation",args:{name:"SERVICE_ACCOUNT_EMAIL",description:"String",suggestions:[]}},{name:"--log-http",description:"Log all HTTP server requests and responses to stderr. Overrides the default *core/log_http* property value for this command invocation"},{name:"--project",description:"The Google Cloud Platform project ID to use for this invocation. If\nomitted, then the current project is assumed; the current project can\nbe listed using `gcloud config list --format='text(core.project)'`\nand can be set using `gcloud config set project PROJECTID`.\n+\n`--project` and its fallback `core/project` property play two roles\nin the invocation. It specifies the project of the resource to\noperate on. It also specifies the project for API enablement check,\nquota, and billing. To specify a different project for quota and\nbilling, use `--billing-project` or `billing/quota_project` property",args:{name:"PROJECT_ID",description:"String",suggestions:[]}},{name:"--quiet",description:`Disable all interactive prompts when running gcloud commands. If input
is required, defaults will be used, or an error will be raised.
Overrides the default core/disable_prompts property value for this
command invocation. This is equivalent to setting the environment
variable \`CLOUDSDK_CORE_DISABLE_PROMPTS\` to 1`},{name:"--trace-token",description:"Token used to route traces of service requests for investigation of issues. Overrides the default *core/trace_token* property value for this command invocation",args:{name:"TRACE_TOKEN",description:"String",suggestions:[]}},{name:"--user-output-enabled",description:"Print user intended output to the console. Overrides the default *core/user_output_enabled* property value for this command invocation. Use *--no-user-output-enabled* to disable"},{name:"--verbosity",description:"Override the default verbosity for this command. Overrides the default *core/verbosity* property value for this command invocation. _VERBOSITY_ must be one of: *debug*, *info*, *warning*, *error*, *critical*, *none*",args:{name:"VERBOSITY",description:"String",suggestions:["debug","info","warning","error","critical","none"]}}],args:{name:"ATTESTOR",description:"ID of the attestor or fully qualified identifier for the attestor"}},{name:"delete",description:"Delete an Attestor",options:[{name:"--account",description:"Google Cloud Platform user account to use for invocation. Overrides the default *core/account* property value for this command invocation",args:{name:"ACCOUNT",description:"String",suggestions:[]}},{name:"--billing-project",description:"The Google Cloud Platform project that will be charged quota for operations performed in gcloud. If you need to operate on one project, but need quota against a different project, you can use this flag to specify the billing project. If both `billing/quota_project` and `--billing-project` are specified, `--billing-project` takes precedence. Run `$ gcloud config set --help` to see more information about `billing/quota_project`",args:{name:"BILLING_PROJECT",description:"String",suggestions:[]}},{name:"--configuration",description:`The configuration to use for this command invocation. For more
information on how to use configurations, run:
\`gcloud topic configurations\`.  You can also use the CLOUDSDK_ACTIVE_CONFIG_NAME environment
variable to set the equivalent of this flag for a terminal
session`,args:{name:"CONFIGURATION",description:"String",suggestions:[]}},{name:"--flags-file",description:`A YAML or JSON file that specifies a *--flag*:*value* dictionary.
Useful for specifying complex flag values with special characters
that work with any command interpreter. Additionally, each
*--flags-file* arg is replaced by its constituent flags. See
$ gcloud topic flags-file for more information`,args:{name:"YAML_FILE",description:"String",suggestions:[]}},{name:"--flatten",description:`Flatten _name_[] output resource slices in _KEY_ into separate records
for each item in each slice. Multiple keys and slices may be specified.
This also flattens keys for *--format* and *--filter*. For example,
*--flatten=abc.def* flattens *abc.def[].ghi* references to
*abc.def.ghi*. A resource record containing *abc.def[]* with N elements
will expand to N records in the flattened output. This flag interacts
with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--format",description:"Set the format for printing command output resources. The default is a\ncommand-specific human-friendly output format. The supported formats\nare: `config`, `csv`, `default`, `diff`, `disable`, `flattened`, `get`, `json`, `list`, `multi`, `none`, `object`, `table`, `text`, `value`, `yaml`. For more details run $ gcloud topic formats",args:{name:"FORMAT",description:"String",suggestions:[]}},{name:"--help",description:"Display detailed help"},{name:"--impersonate-service-account",description:"For this gcloud invocation, all API requests will be made as the given service account instead of the currently selected account. This is done without needing to create, download, and activate a key for the account. In order to perform operations as the service account, your currently selected account must have an IAM role that includes the iam.serviceAccounts.getAccessToken permission for the service account. The roles/iam.serviceAccountTokenCreator role has this permission or you may create a custom role. Overrides the default *auth/impersonate_service_account* property value for this command invocation",args:{name:"SERVICE_ACCOUNT_EMAIL",description:"String",suggestions:[]}},{name:"--log-http",description:"Log all HTTP server requests and responses to stderr. Overrides the default *core/log_http* property value for this command invocation"},{name:"--project",description:"The Google Cloud Platform project ID to use for this invocation. If\nomitted, then the current project is assumed; the current project can\nbe listed using `gcloud config list --format='text(core.project)'`\nand can be set using `gcloud config set project PROJECTID`.\n+\n`--project` and its fallback `core/project` property play two roles\nin the invocation. It specifies the project of the resource to\noperate on. It also specifies the project for API enablement check,\nquota, and billing. To specify a different project for quota and\nbilling, use `--billing-project` or `billing/quota_project` property",args:{name:"PROJECT_ID",description:"String",suggestions:[]}},{name:"--quiet",description:`Disable all interactive prompts when running gcloud commands. If input
is required, defaults will be used, or an error will be raised.
Overrides the default core/disable_prompts property value for this
command invocation. This is equivalent to setting the environment
variable \`CLOUDSDK_CORE_DISABLE_PROMPTS\` to 1`},{name:"--trace-token",description:"Token used to route traces of service requests for investigation of issues. Overrides the default *core/trace_token* property value for this command invocation",args:{name:"TRACE_TOKEN",description:"String",suggestions:[]}},{name:"--user-output-enabled",description:"Print user intended output to the console. Overrides the default *core/user_output_enabled* property value for this command invocation. Use *--no-user-output-enabled* to disable"},{name:"--verbosity",description:"Override the default verbosity for this command. Overrides the default *core/verbosity* property value for this command invocation. _VERBOSITY_ must be one of: *debug*, *info*, *warning*, *error*, *critical*, *none*",args:{name:"VERBOSITY",description:"String",suggestions:["debug","info","warning","error","critical","none"]}}],args:{name:"ATTESTOR",description:"ID of the attestor or fully qualified identifier for the attestor"}},{name:"describe",description:"Describe an Attestor",options:[{name:"--account",description:"Google Cloud Platform user account to use for invocation. Overrides the default *core/account* property value for this command invocation",args:{name:"ACCOUNT",description:"String",suggestions:[]}},{name:"--billing-project",description:"The Google Cloud Platform project that will be charged quota for operations performed in gcloud. If you need to operate on one project, but need quota against a different project, you can use this flag to specify the billing project. If both `billing/quota_project` and `--billing-project` are specified, `--billing-project` takes precedence. Run `$ gcloud config set --help` to see more information about `billing/quota_project`",args:{name:"BILLING_PROJECT",description:"String",suggestions:[]}},{name:"--configuration",description:`The configuration to use for this command invocation. For more
information on how to use configurations, run:
\`gcloud topic configurations\`.  You can also use the CLOUDSDK_ACTIVE_CONFIG_NAME environment
variable to set the equivalent of this flag for a terminal
session`,args:{name:"CONFIGURATION",description:"String",suggestions:[]}},{name:"--flags-file",description:`A YAML or JSON file that specifies a *--flag*:*value* dictionary.
Useful for specifying complex flag values with special characters
that work with any command interpreter. Additionally, each
*--flags-file* arg is replaced by its constituent flags. See
$ gcloud topic flags-file for more information`,args:{name:"YAML_FILE",description:"String",suggestions:[]}},{name:"--flatten",description:`Flatten _name_[] output resource slices in _KEY_ into separate records
for each item in each slice. Multiple keys and slices may be specified.
This also flattens keys for *--format* and *--filter*. For example,
*--flatten=abc.def* flattens *abc.def[].ghi* references to
*abc.def.ghi*. A resource record containing *abc.def[]* with N elements
will expand to N records in the flattened output. This flag interacts
with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--format",description:"Set the format for printing command output resources. The default is a\ncommand-specific human-friendly output format. The supported formats\nare: `config`, `csv`, `default`, `diff`, `disable`, `flattened`, `get`, `json`, `list`, `multi`, `none`, `object`, `table`, `text`, `value`, `yaml`. For more details run $ gcloud topic formats",args:{name:"FORMAT",description:"String",suggestions:[]}},{name:"--help",description:"Display detailed help"},{name:"--impersonate-service-account",description:"For this gcloud invocation, all API requests will be made as the given service account instead of the currently selected account. This is done without needing to create, download, and activate a key for the account. In order to perform operations as the service account, your currently selected account must have an IAM role that includes the iam.serviceAccounts.getAccessToken permission for the service account. The roles/iam.serviceAccountTokenCreator role has this permission or you may create a custom role. Overrides the default *auth/impersonate_service_account* property value for this command invocation",args:{name:"SERVICE_ACCOUNT_EMAIL",description:"String",suggestions:[]}},{name:"--log-http",description:"Log all HTTP server requests and responses to stderr. Overrides the default *core/log_http* property value for this command invocation"},{name:"--project",description:"The Google Cloud Platform project ID to use for this invocation. If\nomitted, then the current project is assumed; the current project can\nbe listed using `gcloud config list --format='text(core.project)'`\nand can be set using `gcloud config set project PROJECTID`.\n+\n`--project` and its fallback `core/project` property play two roles\nin the invocation. It specifies the project of the resource to\noperate on. It also specifies the project for API enablement check,\nquota, and billing. To specify a different project for quota and\nbilling, use `--billing-project` or `billing/quota_project` property",args:{name:"PROJECT_ID",description:"String",suggestions:[]}},{name:"--quiet",description:`Disable all interactive prompts when running gcloud commands. If input
is required, defaults will be used, or an error will be raised.
Overrides the default core/disable_prompts property value for this
command invocation. This is equivalent to setting the environment
variable \`CLOUDSDK_CORE_DISABLE_PROMPTS\` to 1`},{name:"--trace-token",description:"Token used to route traces of service requests for investigation of issues. Overrides the default *core/trace_token* property value for this command invocation",args:{name:"TRACE_TOKEN",description:"String",suggestions:[]}},{name:"--user-output-enabled",description:"Print user intended output to the console. Overrides the default *core/user_output_enabled* property value for this command invocation. Use *--no-user-output-enabled* to disable"},{name:"--verbosity",description:"Override the default verbosity for this command. Overrides the default *core/verbosity* property value for this command invocation. _VERBOSITY_ must be one of: *debug*, *info*, *warning*, *error*, *critical*, *none*",args:{name:"VERBOSITY",description:"String",suggestions:["debug","info","warning","error","critical","none"]}}],args:{name:"ATTESTOR",description:"ID of the attestor or fully qualified identifier for the attestor"}},{name:"get-iam-policy",description:"Get the IAM policy for an attestor",options:[{name:"--account",description:"Google Cloud Platform user account to use for invocation. Overrides the default *core/account* property value for this command invocation",args:{name:"ACCOUNT",description:"String",suggestions:[]}},{name:"--billing-project",description:"The Google Cloud Platform project that will be charged quota for operations performed in gcloud. If you need to operate on one project, but need quota against a different project, you can use this flag to specify the billing project. If both `billing/quota_project` and `--billing-project` are specified, `--billing-project` takes precedence. Run `$ gcloud config set --help` to see more information about `billing/quota_project`",args:{name:"BILLING_PROJECT",description:"String",suggestions:[]}},{name:"--configuration",description:`The configuration to use for this command invocation. For more
information on how to use configurations, run:
\`gcloud topic configurations\`.  You can also use the CLOUDSDK_ACTIVE_CONFIG_NAME environment
variable to set the equivalent of this flag for a terminal
session`,args:{name:"CONFIGURATION",description:"String",suggestions:[]}},{name:"--filter",description:`Apply a Boolean filter _EXPRESSION_ to each resource item to be listed.
If the expression evaluates \`True\`, then that item is listed. For more
details and examples of filter expressions, run $ gcloud topic filters. This
flag interacts with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"EXPRESSION",description:"String",suggestions:[]}},{name:"--flags-file",description:`A YAML or JSON file that specifies a *--flag*:*value* dictionary.
Useful for specifying complex flag values with special characters
that work with any command interpreter. Additionally, each
*--flags-file* arg is replaced by its constituent flags. See
$ gcloud topic flags-file for more information`,args:{name:"YAML_FILE",description:"String",suggestions:[]}},{name:"--flatten",description:`Flatten _name_[] output resource slices in _KEY_ into separate records
for each item in each slice. Multiple keys and slices may be specified.
This also flattens keys for *--format* and *--filter*. For example,
*--flatten=abc.def* flattens *abc.def[].ghi* references to
*abc.def.ghi*. A resource record containing *abc.def[]* with N elements
will expand to N records in the flattened output. This flag interacts
with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--format",description:"Set the format for printing command output resources. The default is a\ncommand-specific human-friendly output format. The supported formats\nare: `config`, `csv`, `default`, `diff`, `disable`, `flattened`, `get`, `json`, `list`, `multi`, `none`, `object`, `table`, `text`, `value`, `yaml`. For more details run $ gcloud topic formats",args:{name:"FORMAT",description:"String",suggestions:[]}},{name:"--help",description:"Display detailed help"},{name:"--impersonate-service-account",description:"For this gcloud invocation, all API requests will be made as the given service account instead of the currently selected account. This is done without needing to create, download, and activate a key for the account. In order to perform operations as the service account, your currently selected account must have an IAM role that includes the iam.serviceAccounts.getAccessToken permission for the service account. The roles/iam.serviceAccountTokenCreator role has this permission or you may create a custom role. Overrides the default *auth/impersonate_service_account* property value for this command invocation",args:{name:"SERVICE_ACCOUNT_EMAIL",description:"String",suggestions:[]}},{name:"--limit",description:`Maximum number of resources to list. The default is *unlimited*.
This flag interacts with other flags that are applied in this order:
*--flatten*, *--sort-by*, *--filter*, *--limit*`,args:{name:"LIMIT",description:"Googlecloudsdk.calliope.arg_parsers:Parse",suggestions:[]}},{name:"--log-http",description:"Log all HTTP server requests and responses to stderr. Overrides the default *core/log_http* property value for this command invocation"},{name:"--page-size",description:`Some services group resource list output into pages. This flag specifies
the maximum number of resources per page. The default is determined by the
service if it supports paging, otherwise it is *unlimited* (no paging).
Paging may be applied before or after *--filter* and *--limit* depending
on the service`,args:{name:"PAGE_SIZE",description:"Googlecloudsdk.calliope.arg_parsers:Parse",suggestions:[]}},{name:"--project",description:"The Google Cloud Platform project ID to use for this invocation. If\nomitted, then the current project is assumed; the current project can\nbe listed using `gcloud config list --format='text(core.project)'`\nand can be set using `gcloud config set project PROJECTID`.\n+\n`--project` and its fallback `core/project` property play two roles\nin the invocation. It specifies the project of the resource to\noperate on. It also specifies the project for API enablement check,\nquota, and billing. To specify a different project for quota and\nbilling, use `--billing-project` or `billing/quota_project` property",args:{name:"PROJECT_ID",description:"String",suggestions:[]}},{name:"--quiet",description:`Disable all interactive prompts when running gcloud commands. If input
is required, defaults will be used, or an error will be raised.
Overrides the default core/disable_prompts property value for this
command invocation. This is equivalent to setting the environment
variable \`CLOUDSDK_CORE_DISABLE_PROMPTS\` to 1`},{name:"--sort-by",description:`Comma-separated list of resource field key names to sort by. The
default order is ascending. Prefix a field with \`\`~'' for descending
order on that field. This flag interacts with other flags that are applied
in this order: *--flatten*, *--sort-by*, *--filter*, *--limit*`,args:{name:"FIELD",description:"List",suggestions:[]}},{name:"--trace-token",description:"Token used to route traces of service requests for investigation of issues. Overrides the default *core/trace_token* property value for this command invocation",args:{name:"TRACE_TOKEN",description:"String",suggestions:[]}},{name:"--uri",description:"Print a list of resource URIs instead of the default output"},{name:"--user-output-enabled",description:"Print user intended output to the console. Overrides the default *core/user_output_enabled* property value for this command invocation. Use *--no-user-output-enabled* to disable"},{name:"--verbosity",description:"Override the default verbosity for this command. Overrides the default *core/verbosity* property value for this command invocation. _VERBOSITY_ must be one of: *debug*, *info*, *warning*, *error*, *critical*, *none*",args:{name:"VERBOSITY",description:"String",suggestions:["debug","info","warning","error","critical","none"]}}],args:{name:"ATTESTOR",description:"ID of the attestor or fully qualified identifier for the attestor"}},{name:"list",description:"List Attestors associated with the current project",options:[{name:"--account",description:"Google Cloud Platform user account to use for invocation. Overrides the default *core/account* property value for this command invocation",args:{name:"ACCOUNT",description:"String",suggestions:[]}},{name:"--billing-project",description:"The Google Cloud Platform project that will be charged quota for operations performed in gcloud. If you need to operate on one project, but need quota against a different project, you can use this flag to specify the billing project. If both `billing/quota_project` and `--billing-project` are specified, `--billing-project` takes precedence. Run `$ gcloud config set --help` to see more information about `billing/quota_project`",args:{name:"BILLING_PROJECT",description:"String",suggestions:[]}},{name:"--configuration",description:`The configuration to use for this command invocation. For more
information on how to use configurations, run:
\`gcloud topic configurations\`.  You can also use the CLOUDSDK_ACTIVE_CONFIG_NAME environment
variable to set the equivalent of this flag for a terminal
session`,args:{name:"CONFIGURATION",description:"String",suggestions:[]}},{name:"--filter",description:`Apply a Boolean filter _EXPRESSION_ to each resource item to be listed.
If the expression evaluates \`True\`, then that item is listed. For more
details and examples of filter expressions, run $ gcloud topic filters. This
flag interacts with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"EXPRESSION",description:"String",suggestions:[]}},{name:"--flags-file",description:`A YAML or JSON file that specifies a *--flag*:*value* dictionary.
Useful for specifying complex flag values with special characters
that work with any command interpreter. Additionally, each
*--flags-file* arg is replaced by its constituent flags. See
$ gcloud topic flags-file for more information`,args:{name:"YAML_FILE",description:"String",suggestions:[]}},{name:"--flatten",description:`Flatten _name_[] output resource slices in _KEY_ into separate records
for each item in each slice. Multiple keys and slices may be specified.
This also flattens keys for *--format* and *--filter*. For example,
*--flatten=abc.def* flattens *abc.def[].ghi* references to
*abc.def.ghi*. A resource record containing *abc.def[]* with N elements
will expand to N records in the flattened output. This flag interacts
with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--format",description:"Set the format for printing command output resources. The default is a\ncommand-specific human-friendly output format. The supported formats\nare: `config`, `csv`, `default`, `diff`, `disable`, `flattened`, `get`, `json`, `list`, `multi`, `none`, `object`, `table`, `text`, `value`, `yaml`. For more details run $ gcloud topic formats",args:{name:"FORMAT",description:"String",suggestions:[]}},{name:"--help",description:"Display detailed help"},{name:"--impersonate-service-account",description:"For this gcloud invocation, all API requests will be made as the given service account instead of the currently selected account. This is done without needing to create, download, and activate a key for the account. In order to perform operations as the service account, your currently selected account must have an IAM role that includes the iam.serviceAccounts.getAccessToken permission for the service account. The roles/iam.serviceAccountTokenCreator role has this permission or you may create a custom role. Overrides the default *auth/impersonate_service_account* property value for this command invocation",args:{name:"SERVICE_ACCOUNT_EMAIL",description:"String",suggestions:[]}},{name:"--limit",description:`Maximum number of resources to list. The default is *unlimited*.
This flag interacts with other flags that are applied in this order:
*--flatten*, *--sort-by*, *--filter*, *--limit*`,args:{name:"LIMIT",description:"Googlecloudsdk.calliope.arg_parsers:Parse",suggestions:[]}},{name:"--log-http",description:"Log all HTTP server requests and responses to stderr. Overrides the default *core/log_http* property value for this command invocation"},{name:"--page-size",description:`Some services group resource list output into pages. This flag specifies
the maximum number of resources per page. The default is determined by the
service if it supports paging, otherwise it is *unlimited* (no paging).
Paging may be applied before or after *--filter* and *--limit* depending
on the service`,args:{name:"PAGE_SIZE",description:"Googlecloudsdk.calliope.arg_parsers:Parse",suggestions:[]}},{name:"--project",description:"The Google Cloud Platform project ID to use for this invocation. If\nomitted, then the current project is assumed; the current project can\nbe listed using `gcloud config list --format='text(core.project)'`\nand can be set using `gcloud config set project PROJECTID`.\n+\n`--project` and its fallback `core/project` property play two roles\nin the invocation. It specifies the project of the resource to\noperate on. It also specifies the project for API enablement check,\nquota, and billing. To specify a different project for quota and\nbilling, use `--billing-project` or `billing/quota_project` property",args:{name:"PROJECT_ID",description:"String",suggestions:[]}},{name:"--quiet",description:`Disable all interactive prompts when running gcloud commands. If input
is required, defaults will be used, or an error will be raised.
Overrides the default core/disable_prompts property value for this
command invocation. This is equivalent to setting the environment
variable \`CLOUDSDK_CORE_DISABLE_PROMPTS\` to 1`},{name:"--sort-by",description:`Comma-separated list of resource field key names to sort by. The
default order is ascending. Prefix a field with \`\`~'' for descending
order on that field. This flag interacts with other flags that are applied
in this order: *--flatten*, *--sort-by*, *--filter*, *--limit*`,args:{name:"FIELD",description:"List",suggestions:[]}},{name:"--trace-token",description:"Token used to route traces of service requests for investigation of issues. Overrides the default *core/trace_token* property value for this command invocation",args:{name:"TRACE_TOKEN",description:"String",suggestions:[]}},{name:"--uri",description:"Print a list of resource URIs instead of the default output"},{name:"--user-output-enabled",description:"Print user intended output to the console. Overrides the default *core/user_output_enabled* property value for this command invocation. Use *--no-user-output-enabled* to disable"},{name:"--verbosity",description:"Override the default verbosity for this command. Overrides the default *core/verbosity* property value for this command invocation. _VERBOSITY_ must be one of: *debug*, *info*, *warning*, *error*, *critical*, *none*",args:{name:"VERBOSITY",description:"String",suggestions:["debug","info","warning","error","critical","none"]}}]},{name:"public-keys",description:"Create and manage public keys associated with Attestation Authorities",subcommands:[{name:"add",description:"Add a public key to an Attestor",options:[{name:"--account",description:"Google Cloud Platform user account to use for invocation. Overrides the default *core/account* property value for this command invocation",args:{name:"ACCOUNT",description:"String",suggestions:[]}},{name:"--attestor",description:"ID of the attestor or fully qualified identifier for the attestor",args:{name:"ATTESTOR",description:"String",suggestions:[]},priority:100},{name:"--billing-project",description:"The Google Cloud Platform project that will be charged quota for operations performed in gcloud. If you need to operate on one project, but need quota against a different project, you can use this flag to specify the billing project. If both `billing/quota_project` and `--billing-project` are specified, `--billing-project` takes precedence. Run `$ gcloud config set --help` to see more information about `billing/quota_project`",args:{name:"BILLING_PROJECT",description:"String",suggestions:[]}},{name:"--comment",description:"The comment describing the public key",args:{name:"COMMENT",description:"String",suggestions:[]}},{name:"--configuration",description:`The configuration to use for this command invocation. For more
information on how to use configurations, run:
\`gcloud topic configurations\`.  You can also use the CLOUDSDK_ACTIVE_CONFIG_NAME environment
variable to set the equivalent of this flag for a terminal
session`,args:{name:"CONFIGURATION",description:"String",suggestions:[]}},{name:"--flags-file",description:`A YAML or JSON file that specifies a *--flag*:*value* dictionary.
Useful for specifying complex flag values with special characters
that work with any command interpreter. Additionally, each
*--flags-file* arg is replaced by its constituent flags. See
$ gcloud topic flags-file for more information`,args:{name:"YAML_FILE",description:"String",suggestions:[]}},{name:"--flatten",description:`Flatten _name_[] output resource slices in _KEY_ into separate records
for each item in each slice. Multiple keys and slices may be specified.
This also flattens keys for *--format* and *--filter*. For example,
*--flatten=abc.def* flattens *abc.def[].ghi* references to
*abc.def.ghi*. A resource record containing *abc.def[]* with N elements
will expand to N records in the flattened output. This flag interacts
with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--format",description:"Set the format for printing command output resources. The default is a\ncommand-specific human-friendly output format. The supported formats\nare: `config`, `csv`, `default`, `diff`, `disable`, `flattened`, `get`, `json`, `list`, `multi`, `none`, `object`, `table`, `text`, `value`, `yaml`. For more details run $ gcloud topic formats",args:{name:"FORMAT",description:"String",suggestions:[]}},{name:"--help",description:"Display detailed help"},{name:"--impersonate-service-account",description:"For this gcloud invocation, all API requests will be made as the given service account instead of the currently selected account. This is done without needing to create, download, and activate a key for the account. In order to perform operations as the service account, your currently selected account must have an IAM role that includes the iam.serviceAccounts.getAccessToken permission for the service account. The roles/iam.serviceAccountTokenCreator role has this permission or you may create a custom role. Overrides the default *auth/impersonate_service_account* property value for this command invocation",args:{name:"SERVICE_ACCOUNT_EMAIL",description:"String",suggestions:[]}},{name:"--keyversion",description:"ID of the CryptoKeyVersion or fully qualified identifier for the CryptoKeyVersion",args:{name:"KEYVERSION",description:"String",suggestions:[]},priority:100},{name:"--keyversion-key",description:"The key of the CryptoKeyVersion",args:{name:"KEYVERSION_KEY",description:"String",suggestions:[]}},{name:"--keyversion-keyring",description:"The keyring of the CryptoKeyVersion",args:{name:"KEYVERSION_KEYRING",description:"String",suggestions:[]}},{name:"--keyversion-location",description:"The location of the CryptoKeyVersion",args:{name:"KEYVERSION_LOCATION",description:"String",suggestions:[]}},{name:"--keyversion-project",description:"Project ID of the Google Cloud Platform project for the CryptoKeyVersion",args:{name:"KEYVERSION_PROJECT",description:"String",suggestions:[]}},{name:"--log-http",description:"Log all HTTP server requests and responses to stderr. Overrides the default *core/log_http* property value for this command invocation"},{name:"--pgp-public-key-file",description:"The path to the file containing the ASCII-armored PGP public key to add",args:{name:"PGP_PUBLIC_KEY_FILE",description:"Googlecloudsdk.calliope.arg_parsers:FileContents",suggestions:[]}},{name:"--pkix-public-key-algorithm",description:`The signing algorithm of the associated key. This will be used to
verify the signatures associated with this key. _PKIX_PUBLIC_KEY_ALGORITHM_ must be one of: *ec-sign-p256-sha256*, *ec-sign-p384-sha384*, *ec-sign-p521-sha512*, *ecdsa-p256-sha256*, *ecdsa-p384-sha384*, *ecdsa-p521-sha512*, *rsa-pss-2048-sha256*, *rsa-pss-3072-sha256*, *rsa-pss-4096-sha256*, *rsa-pss-4096-sha512*, *rsa-sign-pkcs1-2048-sha256*, *rsa-sign-pkcs1-3072-sha256*, *rsa-sign-pkcs1-4096-sha256*, *rsa-sign-pkcs1-4096-sha512*`,args:{name:"PKIX_PUBLIC_KEY_ALGORITHM",description:"String",suggestions:["ec-sign-p256-sha256","ec-sign-p384-sha384","ec-sign-p521-sha512","ecdsa-p256-sha256","ecdsa-p384-sha384","ecdsa-p521-sha512","rsa-pss-2048-sha256","rsa-pss-3072-sha256","rsa-pss-4096-sha256","rsa-pss-4096-sha512","rsa-sign-pkcs1-2048-sha256","rsa-sign-pkcs1-3072-sha256","rsa-sign-pkcs1-4096-sha256","rsa-sign-pkcs1-4096-sha512"]},priority:100},{name:"--pkix-public-key-file",description:"The path to the file containing the PKIX public key to add",args:{name:"PKIX_PUBLIC_KEY_FILE",description:"Googlecloudsdk.calliope.arg_parsers:FileContents",suggestions:[]},priority:100},{name:"--project",description:"The Google Cloud Platform project ID to use for this invocation. If\nomitted, then the current project is assumed; the current project can\nbe listed using `gcloud config list --format='text(core.project)'`\nand can be set using `gcloud config set project PROJECTID`.\n+\n`--project` and its fallback `core/project` property play two roles\nin the invocation. It specifies the project of the resource to\noperate on. It also specifies the project for API enablement check,\nquota, and billing. To specify a different project for quota and\nbilling, use `--billing-project` or `billing/quota_project` property",args:{name:"PROJECT_ID",description:"String",suggestions:[]}},{name:"--public-key-id-override",description:`If provided, the ID to replace the default API-generated one. All IDs
must be valid URIs as defined by RFC 3986
(https://tools.ietf.org/html/rfc3986).
+
When creating Attestations to be verified by this key, one must always
provide this custom ID as the public key ID`,args:{name:"PUBLIC_KEY_ID_OVERRIDE",description:"String",suggestions:[]}},{name:"--quiet",description:`Disable all interactive prompts when running gcloud commands. If input
is required, defaults will be used, or an error will be raised.
Overrides the default core/disable_prompts property value for this
command invocation. This is equivalent to setting the environment
variable \`CLOUDSDK_CORE_DISABLE_PROMPTS\` to 1`},{name:"--trace-token",description:"Token used to route traces of service requests for investigation of issues. Overrides the default *core/trace_token* property value for this command invocation",args:{name:"TRACE_TOKEN",description:"String",suggestions:[]}},{name:"--user-output-enabled",description:"Print user intended output to the console. Overrides the default *core/user_output_enabled* property value for this command invocation. Use *--no-user-output-enabled* to disable"},{name:"--verbosity",description:"Override the default verbosity for this command. Overrides the default *core/verbosity* property value for this command invocation. _VERBOSITY_ must be one of: *debug*, *info*, *warning*, *error*, *critical*, *none*",args:{name:"VERBOSITY",description:"String",suggestions:["debug","info","warning","error","critical","none"]}}]},{name:"remove",description:"Remove a public key from an Attestor",options:[{name:"--account",description:"Google Cloud Platform user account to use for invocation. Overrides the default *core/account* property value for this command invocation",args:{name:"ACCOUNT",description:"String",suggestions:[]}},{name:"--attestor",description:"ID of the attestor or fully qualified identifier for the attestor",args:{name:"ATTESTOR",description:"String",suggestions:[]},priority:100},{name:"--billing-project",description:"The Google Cloud Platform project that will be charged quota for operations performed in gcloud. If you need to operate on one project, but need quota against a different project, you can use this flag to specify the billing project. If both `billing/quota_project` and `--billing-project` are specified, `--billing-project` takes precedence. Run `$ gcloud config set --help` to see more information about `billing/quota_project`",args:{name:"BILLING_PROJECT",description:"String",suggestions:[]}},{name:"--configuration",description:`The configuration to use for this command invocation. For more
information on how to use configurations, run:
\`gcloud topic configurations\`.  You can also use the CLOUDSDK_ACTIVE_CONFIG_NAME environment
variable to set the equivalent of this flag for a terminal
session`,args:{name:"CONFIGURATION",description:"String",suggestions:[]}},{name:"--flags-file",description:`A YAML or JSON file that specifies a *--flag*:*value* dictionary.
Useful for specifying complex flag values with special characters
that work with any command interpreter. Additionally, each
*--flags-file* arg is replaced by its constituent flags. See
$ gcloud topic flags-file for more information`,args:{name:"YAML_FILE",description:"String",suggestions:[]}},{name:"--flatten",description:`Flatten _name_[] output resource slices in _KEY_ into separate records
for each item in each slice. Multiple keys and slices may be specified.
This also flattens keys for *--format* and *--filter*. For example,
*--flatten=abc.def* flattens *abc.def[].ghi* references to
*abc.def.ghi*. A resource record containing *abc.def[]* with N elements
will expand to N records in the flattened output. This flag interacts
with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--format",description:"Set the format for printing command output resources. The default is a\ncommand-specific human-friendly output format. The supported formats\nare: `config`, `csv`, `default`, `diff`, `disable`, `flattened`, `get`, `json`, `list`, `multi`, `none`, `object`, `table`, `text`, `value`, `yaml`. For more details run $ gcloud topic formats",args:{name:"FORMAT",description:"String",suggestions:[]}},{name:"--help",description:"Display detailed help"},{name:"--impersonate-service-account",description:"For this gcloud invocation, all API requests will be made as the given service account instead of the currently selected account. This is done without needing to create, download, and activate a key for the account. In order to perform operations as the service account, your currently selected account must have an IAM role that includes the iam.serviceAccounts.getAccessToken permission for the service account. The roles/iam.serviceAccountTokenCreator role has this permission or you may create a custom role. Overrides the default *auth/impersonate_service_account* property value for this command invocation",args:{name:"SERVICE_ACCOUNT_EMAIL",description:"String",suggestions:[]}},{name:"--log-http",description:"Log all HTTP server requests and responses to stderr. Overrides the default *core/log_http* property value for this command invocation"},{name:"--project",description:"The Google Cloud Platform project ID to use for this invocation. If\nomitted, then the current project is assumed; the current project can\nbe listed using `gcloud config list --format='text(core.project)'`\nand can be set using `gcloud config set project PROJECTID`.\n+\n`--project` and its fallback `core/project` property play two roles\nin the invocation. It specifies the project of the resource to\noperate on. It also specifies the project for API enablement check,\nquota, and billing. To specify a different project for quota and\nbilling, use `--billing-project` or `billing/quota_project` property",args:{name:"PROJECT_ID",description:"String",suggestions:[]}},{name:"--quiet",description:`Disable all interactive prompts when running gcloud commands. If input
is required, defaults will be used, or an error will be raised.
Overrides the default core/disable_prompts property value for this
command invocation. This is equivalent to setting the environment
variable \`CLOUDSDK_CORE_DISABLE_PROMPTS\` to 1`},{name:"--trace-token",description:"Token used to route traces of service requests for investigation of issues. Overrides the default *core/trace_token* property value for this command invocation",args:{name:"TRACE_TOKEN",description:"String",suggestions:[]}},{name:"--user-output-enabled",description:"Print user intended output to the console. Overrides the default *core/user_output_enabled* property value for this command invocation. Use *--no-user-output-enabled* to disable"},{name:"--verbosity",description:"Override the default verbosity for this command. Overrides the default *core/verbosity* property value for this command invocation. _VERBOSITY_ must be one of: *debug*, *info*, *warning*, *error*, *critical*, *none*",args:{name:"VERBOSITY",description:"String",suggestions:["debug","info","warning","error","critical","none"]}}],args:{name:"PUBLIC_KEY_ID",description:"The ID of the public key to remove"}},{name:"update",description:"Update a public key on an Attestor",options:[{name:"--account",description:"Google Cloud Platform user account to use for invocation. Overrides the default *core/account* property value for this command invocation",args:{name:"ACCOUNT",description:"String",suggestions:[]}},{name:"--attestor",description:"ID of the attestor or fully qualified identifier for the attestor",args:{name:"ATTESTOR",description:"String",suggestions:[]},priority:100},{name:"--billing-project",description:"The Google Cloud Platform project that will be charged quota for operations performed in gcloud. If you need to operate on one project, but need quota against a different project, you can use this flag to specify the billing project. If both `billing/quota_project` and `--billing-project` are specified, `--billing-project` takes precedence. Run `$ gcloud config set --help` to see more information about `billing/quota_project`",args:{name:"BILLING_PROJECT",description:"String",suggestions:[]}},{name:"--comment",description:"The comment describing the public key",args:{name:"COMMENT",description:"String",suggestions:[]}},{name:"--configuration",description:`The configuration to use for this command invocation. For more
information on how to use configurations, run:
\`gcloud topic configurations\`.  You can also use the CLOUDSDK_ACTIVE_CONFIG_NAME environment
variable to set the equivalent of this flag for a terminal
session`,args:{name:"CONFIGURATION",description:"String",suggestions:[]}},{name:"--flags-file",description:`A YAML or JSON file that specifies a *--flag*:*value* dictionary.
Useful for specifying complex flag values with special characters
that work with any command interpreter. Additionally, each
*--flags-file* arg is replaced by its constituent flags. See
$ gcloud topic flags-file for more information`,args:{name:"YAML_FILE",description:"String",suggestions:[]}},{name:"--flatten",description:`Flatten _name_[] output resource slices in _KEY_ into separate records
for each item in each slice. Multiple keys and slices may be specified.
This also flattens keys for *--format* and *--filter*. For example,
*--flatten=abc.def* flattens *abc.def[].ghi* references to
*abc.def.ghi*. A resource record containing *abc.def[]* with N elements
will expand to N records in the flattened output. This flag interacts
with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--format",description:"Set the format for printing command output resources. The default is a\ncommand-specific human-friendly output format. The supported formats\nare: `config`, `csv`, `default`, `diff`, `disable`, `flattened`, `get`, `json`, `list`, `multi`, `none`, `object`, `table`, `text`, `value`, `yaml`. For more details run $ gcloud topic formats",args:{name:"FORMAT",description:"String",suggestions:[]}},{name:"--help",description:"Display detailed help"},{name:"--impersonate-service-account",description:"For this gcloud invocation, all API requests will be made as the given service account instead of the currently selected account. This is done without needing to create, download, and activate a key for the account. In order to perform operations as the service account, your currently selected account must have an IAM role that includes the iam.serviceAccounts.getAccessToken permission for the service account. The roles/iam.serviceAccountTokenCreator role has this permission or you may create a custom role. Overrides the default *auth/impersonate_service_account* property value for this command invocation",args:{name:"SERVICE_ACCOUNT_EMAIL",description:"String",suggestions:[]}},{name:"--log-http",description:"Log all HTTP server requests and responses to stderr. Overrides the default *core/log_http* property value for this command invocation"},{name:"--pgp-public-key-file",description:"The path to a file containing the updated ASCII-armored PGP public key",args:{name:"PGP_PUBLIC_KEY_FILE",description:"Googlecloudsdk.calliope.arg_parsers:FileContents",suggestions:[]}},{name:"--project",description:"The Google Cloud Platform project ID to use for this invocation. If\nomitted, then the current project is assumed; the current project can\nbe listed using `gcloud config list --format='text(core.project)'`\nand can be set using `gcloud config set project PROJECTID`.\n+\n`--project` and its fallback `core/project` property play two roles\nin the invocation. It specifies the project of the resource to\noperate on. It also specifies the project for API enablement check,\nquota, and billing. To specify a different project for quota and\nbilling, use `--billing-project` or `billing/quota_project` property",args:{name:"PROJECT_ID",description:"String",suggestions:[]}},{name:"--quiet",description:`Disable all interactive prompts when running gcloud commands. If input
is required, defaults will be used, or an error will be raised.
Overrides the default core/disable_prompts property value for this
command invocation. This is equivalent to setting the environment
variable \`CLOUDSDK_CORE_DISABLE_PROMPTS\` to 1`},{name:"--trace-token",description:"Token used to route traces of service requests for investigation of issues. Overrides the default *core/trace_token* property value for this command invocation",args:{name:"TRACE_TOKEN",description:"String",suggestions:[]}},{name:"--user-output-enabled",description:"Print user intended output to the console. Overrides the default *core/user_output_enabled* property value for this command invocation. Use *--no-user-output-enabled* to disable"},{name:"--verbosity",description:"Override the default verbosity for this command. Overrides the default *core/verbosity* property value for this command invocation. _VERBOSITY_ must be one of: *debug*, *info*, *warning*, *error*, *critical*, *none*",args:{name:"VERBOSITY",description:"String",suggestions:["debug","info","warning","error","critical","none"]}}],args:{name:"PUBLIC_KEY_ID",description:"The ID of the public key to update"}}],options:[{name:"--account",description:"Google Cloud Platform user account to use for invocation. Overrides the default *core/account* property value for this command invocation",args:{name:"ACCOUNT",description:"String",suggestions:[]}},{name:"--billing-project",description:"The Google Cloud Platform project that will be charged quota for operations performed in gcloud. If you need to operate on one project, but need quota against a different project, you can use this flag to specify the billing project. If both `billing/quota_project` and `--billing-project` are specified, `--billing-project` takes precedence. Run `$ gcloud config set --help` to see more information about `billing/quota_project`",args:{name:"BILLING_PROJECT",description:"String",suggestions:[]}},{name:"--configuration",description:`The configuration to use for this command invocation. For more
information on how to use configurations, run:
\`gcloud topic configurations\`.  You can also use the CLOUDSDK_ACTIVE_CONFIG_NAME environment
variable to set the equivalent of this flag for a terminal
session`,args:{name:"CONFIGURATION",description:"String",suggestions:[]}},{name:"--flags-file",description:`A YAML or JSON file that specifies a *--flag*:*value* dictionary.
Useful for specifying complex flag values with special characters
that work with any command interpreter. Additionally, each
*--flags-file* arg is replaced by its constituent flags. See
$ gcloud topic flags-file for more information`,args:{name:"YAML_FILE",description:"String",suggestions:[]}},{name:"--flatten",description:`Flatten _name_[] output resource slices in _KEY_ into separate records
for each item in each slice. Multiple keys and slices may be specified.
This also flattens keys for *--format* and *--filter*. For example,
*--flatten=abc.def* flattens *abc.def[].ghi* references to
*abc.def.ghi*. A resource record containing *abc.def[]* with N elements
will expand to N records in the flattened output. This flag interacts
with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--format",description:"Set the format for printing command output resources. The default is a\ncommand-specific human-friendly output format. The supported formats\nare: `config`, `csv`, `default`, `diff`, `disable`, `flattened`, `get`, `json`, `list`, `multi`, `none`, `object`, `table`, `text`, `value`, `yaml`. For more details run $ gcloud topic formats",args:{name:"FORMAT",description:"String",suggestions:[]}},{name:"--help",description:"Display detailed help"},{name:"--impersonate-service-account",description:"For this gcloud invocation, all API requests will be made as the given service account instead of the currently selected account. This is done without needing to create, download, and activate a key for the account. In order to perform operations as the service account, your currently selected account must have an IAM role that includes the iam.serviceAccounts.getAccessToken permission for the service account. The roles/iam.serviceAccountTokenCreator role has this permission or you may create a custom role. Overrides the default *auth/impersonate_service_account* property value for this command invocation",args:{name:"SERVICE_ACCOUNT_EMAIL",description:"String",suggestions:[]}},{name:"--log-http",description:"Log all HTTP server requests and responses to stderr. Overrides the default *core/log_http* property value for this command invocation"},{name:"--project",description:"The Google Cloud Platform project ID to use for this invocation. If\nomitted, then the current project is assumed; the current project can\nbe listed using `gcloud config list --format='text(core.project)'`\nand can be set using `gcloud config set project PROJECTID`.\n+\n`--project` and its fallback `core/project` property play two roles\nin the invocation. It specifies the project of the resource to\noperate on. It also specifies the project for API enablement check,\nquota, and billing. To specify a different project for quota and\nbilling, use `--billing-project` or `billing/quota_project` property",args:{name:"PROJECT_ID",description:"String",suggestions:[]}},{name:"--quiet",description:`Disable all interactive prompts when running gcloud commands. If input
is required, defaults will be used, or an error will be raised.
Overrides the default core/disable_prompts property value for this
command invocation. This is equivalent to setting the environment
variable \`CLOUDSDK_CORE_DISABLE_PROMPTS\` to 1`},{name:"--trace-token",description:"Token used to route traces of service requests for investigation of issues. Overrides the default *core/trace_token* property value for this command invocation",args:{name:"TRACE_TOKEN",description:"String",suggestions:[]}},{name:"--user-output-enabled",description:"Print user intended output to the console. Overrides the default *core/user_output_enabled* property value for this command invocation. Use *--no-user-output-enabled* to disable"},{name:"--verbosity",description:"Override the default verbosity for this command. Overrides the default *core/verbosity* property value for this command invocation. _VERBOSITY_ must be one of: *debug*, *info*, *warning*, *error*, *critical*, *none*",args:{name:"VERBOSITY",description:"String",suggestions:["debug","info","warning","error","critical","none"]}}]},{name:"remove-iam-policy-binding",description:"Remove IAM policy binding of a Binary Authorization attestor",options:[{name:"--account",description:"Google Cloud Platform user account to use for invocation. Overrides the default *core/account* property value for this command invocation",args:{name:"ACCOUNT",description:"String",suggestions:[]}},{name:"--billing-project",description:"The Google Cloud Platform project that will be charged quota for operations performed in gcloud. If you need to operate on one project, but need quota against a different project, you can use this flag to specify the billing project. If both `billing/quota_project` and `--billing-project` are specified, `--billing-project` takes precedence. Run `$ gcloud config set --help` to see more information about `billing/quota_project`",args:{name:"BILLING_PROJECT",description:"String",suggestions:[]}},{name:"--configuration",description:`The configuration to use for this command invocation. For more
information on how to use configurations, run:
\`gcloud topic configurations\`.  You can also use the CLOUDSDK_ACTIVE_CONFIG_NAME environment
variable to set the equivalent of this flag for a terminal
session`,args:{name:"CONFIGURATION",description:"String",suggestions:[]}},{name:"--flags-file",description:`A YAML or JSON file that specifies a *--flag*:*value* dictionary.
Useful for specifying complex flag values with special characters
that work with any command interpreter. Additionally, each
*--flags-file* arg is replaced by its constituent flags. See
$ gcloud topic flags-file for more information`,args:{name:"YAML_FILE",description:"String",suggestions:[]}},{name:"--flatten",description:`Flatten _name_[] output resource slices in _KEY_ into separate records
for each item in each slice. Multiple keys and slices may be specified.
This also flattens keys for *--format* and *--filter*. For example,
*--flatten=abc.def* flattens *abc.def[].ghi* references to
*abc.def.ghi*. A resource record containing *abc.def[]* with N elements
will expand to N records in the flattened output. This flag interacts
with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--format",description:"Set the format for printing command output resources. The default is a\ncommand-specific human-friendly output format. The supported formats\nare: `config`, `csv`, `default`, `diff`, `disable`, `flattened`, `get`, `json`, `list`, `multi`, `none`, `object`, `table`, `text`, `value`, `yaml`. For more details run $ gcloud topic formats",args:{name:"FORMAT",description:"String",suggestions:[]}},{name:"--help",description:"Display detailed help"},{name:"--impersonate-service-account",description:"For this gcloud invocation, all API requests will be made as the given service account instead of the currently selected account. This is done without needing to create, download, and activate a key for the account. In order to perform operations as the service account, your currently selected account must have an IAM role that includes the iam.serviceAccounts.getAccessToken permission for the service account. The roles/iam.serviceAccountTokenCreator role has this permission or you may create a custom role. Overrides the default *auth/impersonate_service_account* property value for this command invocation",args:{name:"SERVICE_ACCOUNT_EMAIL",description:"String",suggestions:[]}},{name:"--log-http",description:"Log all HTTP server requests and responses to stderr. Overrides the default *core/log_http* property value for this command invocation"},{name:"--member",description:"The member to remove the binding for. Should be of the form `user|group|serviceAccount:email` or\n`domain:domain`.\n+\nExamples: `user:test-user@gmail.com`, `group:admins@example.com`,\n`serviceAccount:test123@example.domain.com`, or\n`domain:example.domain.com`.\n+\nCan also be one of the following special values:\n* `allUsers` - Special identifier that represents anyone who is on the internet,\n   with or without a Google account.\n* `allAuthenticatedUsers` - Special identifier that represents anyone who is\n   authenticated with a Google account or a service account",args:{name:"MEMBER",description:"String",suggestions:[]},priority:100},{name:"--project",description:"The Google Cloud Platform project ID to use for this invocation. If\nomitted, then the current project is assumed; the current project can\nbe listed using `gcloud config list --format='text(core.project)'`\nand can be set using `gcloud config set project PROJECTID`.\n+\n`--project` and its fallback `core/project` property play two roles\nin the invocation. It specifies the project of the resource to\noperate on. It also specifies the project for API enablement check,\nquota, and billing. To specify a different project for quota and\nbilling, use `--billing-project` or `billing/quota_project` property",args:{name:"PROJECT_ID",description:"String",suggestions:[]}},{name:"--quiet",description:`Disable all interactive prompts when running gcloud commands. If input
is required, defaults will be used, or an error will be raised.
Overrides the default core/disable_prompts property value for this
command invocation. This is equivalent to setting the environment
variable \`CLOUDSDK_CORE_DISABLE_PROMPTS\` to 1`},{name:"--role",description:"The role to remove the member from",args:{name:"ROLE",description:"String",suggestions:[]},priority:100},{name:"--trace-token",description:"Token used to route traces of service requests for investigation of issues. Overrides the default *core/trace_token* property value for this command invocation",args:{name:"TRACE_TOKEN",description:"String",suggestions:[]}},{name:"--user-output-enabled",description:"Print user intended output to the console. Overrides the default *core/user_output_enabled* property value for this command invocation. Use *--no-user-output-enabled* to disable"},{name:"--verbosity",description:"Override the default verbosity for this command. Overrides the default *core/verbosity* property value for this command invocation. _VERBOSITY_ must be one of: *debug*, *info*, *warning*, *error*, *critical*, *none*",args:{name:"VERBOSITY",description:"String",suggestions:["debug","info","warning","error","critical","none"]}}],args:{name:"ATTESTOR",description:"ID of the attestor or fully qualified identifier for the attestor"}},{name:"set-iam-policy",description:"Set the IAM policy for an attestor",options:[{name:"--account",description:"Google Cloud Platform user account to use for invocation. Overrides the default *core/account* property value for this command invocation",args:{name:"ACCOUNT",description:"String",suggestions:[]}},{name:"--billing-project",description:"The Google Cloud Platform project that will be charged quota for operations performed in gcloud. If you need to operate on one project, but need quota against a different project, you can use this flag to specify the billing project. If both `billing/quota_project` and `--billing-project` are specified, `--billing-project` takes precedence. Run `$ gcloud config set --help` to see more information about `billing/quota_project`",args:{name:"BILLING_PROJECT",description:"String",suggestions:[]}},{name:"--configuration",description:`The configuration to use for this command invocation. For more
information on how to use configurations, run:
\`gcloud topic configurations\`.  You can also use the CLOUDSDK_ACTIVE_CONFIG_NAME environment
variable to set the equivalent of this flag for a terminal
session`,args:{name:"CONFIGURATION",description:"String",suggestions:[]}},{name:"--flags-file",description:`A YAML or JSON file that specifies a *--flag*:*value* dictionary.
Useful for specifying complex flag values with special characters
that work with any command interpreter. Additionally, each
*--flags-file* arg is replaced by its constituent flags. See
$ gcloud topic flags-file for more information`,args:{name:"YAML_FILE",description:"String",suggestions:[]}},{name:"--flatten",description:`Flatten _name_[] output resource slices in _KEY_ into separate records
for each item in each slice. Multiple keys and slices may be specified.
This also flattens keys for *--format* and *--filter*. For example,
*--flatten=abc.def* flattens *abc.def[].ghi* references to
*abc.def.ghi*. A resource record containing *abc.def[]* with N elements
will expand to N records in the flattened output. This flag interacts
with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--format",description:"Set the format for printing command output resources. The default is a\ncommand-specific human-friendly output format. The supported formats\nare: `config`, `csv`, `default`, `diff`, `disable`, `flattened`, `get`, `json`, `list`, `multi`, `none`, `object`, `table`, `text`, `value`, `yaml`. For more details run $ gcloud topic formats",args:{name:"FORMAT",description:"String",suggestions:[]}},{name:"--help",description:"Display detailed help"},{name:"--impersonate-service-account",description:"For this gcloud invocation, all API requests will be made as the given service account instead of the currently selected account. This is done without needing to create, download, and activate a key for the account. In order to perform operations as the service account, your currently selected account must have an IAM role that includes the iam.serviceAccounts.getAccessToken permission for the service account. The roles/iam.serviceAccountTokenCreator role has this permission or you may create a custom role. Overrides the default *auth/impersonate_service_account* property value for this command invocation",args:{name:"SERVICE_ACCOUNT_EMAIL",description:"String",suggestions:[]}},{name:"--log-http",description:"Log all HTTP server requests and responses to stderr. Overrides the default *core/log_http* property value for this command invocation"},{name:"--project",description:"The Google Cloud Platform project ID to use for this invocation. If\nomitted, then the current project is assumed; the current project can\nbe listed using `gcloud config list --format='text(core.project)'`\nand can be set using `gcloud config set project PROJECTID`.\n+\n`--project` and its fallback `core/project` property play two roles\nin the invocation. It specifies the project of the resource to\noperate on. It also specifies the project for API enablement check,\nquota, and billing. To specify a different project for quota and\nbilling, use `--billing-project` or `billing/quota_project` property",args:{name:"PROJECT_ID",description:"String",suggestions:[]}},{name:"--quiet",description:`Disable all interactive prompts when running gcloud commands. If input
is required, defaults will be used, or an error will be raised.
Overrides the default core/disable_prompts property value for this
command invocation. This is equivalent to setting the environment
variable \`CLOUDSDK_CORE_DISABLE_PROMPTS\` to 1`},{name:"--trace-token",description:"Token used to route traces of service requests for investigation of issues. Overrides the default *core/trace_token* property value for this command invocation",args:{name:"TRACE_TOKEN",description:"String",suggestions:[]}},{name:"--user-output-enabled",description:"Print user intended output to the console. Overrides the default *core/user_output_enabled* property value for this command invocation. Use *--no-user-output-enabled* to disable"},{name:"--verbosity",description:"Override the default verbosity for this command. Overrides the default *core/verbosity* property value for this command invocation. _VERBOSITY_ must be one of: *debug*, *info*, *warning*, *error*, *critical*, *none*",args:{name:"VERBOSITY",description:"String",suggestions:["debug","info","warning","error","critical","none"]}}],args:[{name:"ATTESTOR_NAME",description:"The name of the attestor whose IAM policy will be updated"},{name:"POLICY_FILE",description:"The JSON or YAML file containing the IAM policy"}]},{name:"update",description:"Update an existing Attestor",options:[{name:"--account",description:"Google Cloud Platform user account to use for invocation. Overrides the default *core/account* property value for this command invocation",args:{name:"ACCOUNT",description:"String",suggestions:[]}},{name:"--billing-project",description:"The Google Cloud Platform project that will be charged quota for operations performed in gcloud. If you need to operate on one project, but need quota against a different project, you can use this flag to specify the billing project. If both `billing/quota_project` and `--billing-project` are specified, `--billing-project` takes precedence. Run `$ gcloud config set --help` to see more information about `billing/quota_project`",args:{name:"BILLING_PROJECT",description:"String",suggestions:[]}},{name:"--configuration",description:`The configuration to use for this command invocation. For more
information on how to use configurations, run:
\`gcloud topic configurations\`.  You can also use the CLOUDSDK_ACTIVE_CONFIG_NAME environment
variable to set the equivalent of this flag for a terminal
session`,args:{name:"CONFIGURATION",description:"String",suggestions:[]}},{name:"--description",description:"The new description for the attestor",args:{name:"DESCRIPTION",description:"String",suggestions:[]}},{name:"--flags-file",description:`A YAML or JSON file that specifies a *--flag*:*value* dictionary.
Useful for specifying complex flag values with special characters
that work with any command interpreter. Additionally, each
*--flags-file* arg is replaced by its constituent flags. See
$ gcloud topic flags-file for more information`,args:{name:"YAML_FILE",description:"String",suggestions:[]}},{name:"--flatten",description:`Flatten _name_[] output resource slices in _KEY_ into separate records
for each item in each slice. Multiple keys and slices may be specified.
This also flattens keys for *--format* and *--filter*. For example,
*--flatten=abc.def* flattens *abc.def[].ghi* references to
*abc.def.ghi*. A resource record containing *abc.def[]* with N elements
will expand to N records in the flattened output. This flag interacts
with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--format",description:"Set the format for printing command output resources. The default is a\ncommand-specific human-friendly output format. The supported formats\nare: `config`, `csv`, `default`, `diff`, `disable`, `flattened`, `get`, `json`, `list`, `multi`, `none`, `object`, `table`, `text`, `value`, `yaml`. For more details run $ gcloud topic formats",args:{name:"FORMAT",description:"String",suggestions:[]}},{name:"--help",description:"Display detailed help"},{name:"--impersonate-service-account",description:"For this gcloud invocation, all API requests will be made as the given service account instead of the currently selected account. This is done without needing to create, download, and activate a key for the account. In order to perform operations as the service account, your currently selected account must have an IAM role that includes the iam.serviceAccounts.getAccessToken permission for the service account. The roles/iam.serviceAccountTokenCreator role has this permission or you may create a custom role. Overrides the default *auth/impersonate_service_account* property value for this command invocation",args:{name:"SERVICE_ACCOUNT_EMAIL",description:"String",suggestions:[]}},{name:"--log-http",description:"Log all HTTP server requests and responses to stderr. Overrides the default *core/log_http* property value for this command invocation"},{name:"--project",description:"The Google Cloud Platform project ID to use for this invocation. If\nomitted, then the current project is assumed; the current project can\nbe listed using `gcloud config list --format='text(core.project)'`\nand can be set using `gcloud config set project PROJECTID`.\n+\n`--project` and its fallback `core/project` property play two roles\nin the invocation. It specifies the project of the resource to\noperate on. It also specifies the project for API enablement check,\nquota, and billing. To specify a different project for quota and\nbilling, use `--billing-project` or `billing/quota_project` property",args:{name:"PROJECT_ID",description:"String",suggestions:[]}},{name:"--quiet",description:`Disable all interactive prompts when running gcloud commands. If input
is required, defaults will be used, or an error will be raised.
Overrides the default core/disable_prompts property value for this
command invocation. This is equivalent to setting the environment
variable \`CLOUDSDK_CORE_DISABLE_PROMPTS\` to 1`},{name:"--trace-token",description:"Token used to route traces of service requests for investigation of issues. Overrides the default *core/trace_token* property value for this command invocation",args:{name:"TRACE_TOKEN",description:"String",suggestions:[]}},{name:"--user-output-enabled",description:"Print user intended output to the console. Overrides the default *core/user_output_enabled* property value for this command invocation. Use *--no-user-output-enabled* to disable"},{name:"--verbosity",description:"Override the default verbosity for this command. Overrides the default *core/verbosity* property value for this command invocation. _VERBOSITY_ must be one of: *debug*, *info*, *warning*, *error*, *critical*, *none*",args:{name:"VERBOSITY",description:"String",suggestions:["debug","info","warning","error","critical","none"]}}],args:{name:"ATTESTOR",description:"ID of the attestor or fully qualified identifier for the attestor"}}],options:[{name:"--account",description:"Google Cloud Platform user account to use for invocation. Overrides the default *core/account* property value for this command invocation",args:{name:"ACCOUNT",description:"String",suggestions:[]}},{name:"--billing-project",description:"The Google Cloud Platform project that will be charged quota for operations performed in gcloud. If you need to operate on one project, but need quota against a different project, you can use this flag to specify the billing project. If both `billing/quota_project` and `--billing-project` are specified, `--billing-project` takes precedence. Run `$ gcloud config set --help` to see more information about `billing/quota_project`",args:{name:"BILLING_PROJECT",description:"String",suggestions:[]}},{name:"--configuration",description:`The configuration to use for this command invocation. For more
information on how to use configurations, run:
\`gcloud topic configurations\`.  You can also use the CLOUDSDK_ACTIVE_CONFIG_NAME environment
variable to set the equivalent of this flag for a terminal
session`,args:{name:"CONFIGURATION",description:"String",suggestions:[]}},{name:"--flags-file",description:`A YAML or JSON file that specifies a *--flag*:*value* dictionary.
Useful for specifying complex flag values with special characters
that work with any command interpreter. Additionally, each
*--flags-file* arg is replaced by its constituent flags. See
$ gcloud topic flags-file for more information`,args:{name:"YAML_FILE",description:"String",suggestions:[]}},{name:"--flatten",description:`Flatten _name_[] output resource slices in _KEY_ into separate records
for each item in each slice. Multiple keys and slices may be specified.
This also flattens keys for *--format* and *--filter*. For example,
*--flatten=abc.def* flattens *abc.def[].ghi* references to
*abc.def.ghi*. A resource record containing *abc.def[]* with N elements
will expand to N records in the flattened output. This flag interacts
with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--format",description:"Set the format for printing command output resources. The default is a\ncommand-specific human-friendly output format. The supported formats\nare: `config`, `csv`, `default`, `diff`, `disable`, `flattened`, `get`, `json`, `list`, `multi`, `none`, `object`, `table`, `text`, `value`, `yaml`. For more details run $ gcloud topic formats",args:{name:"FORMAT",description:"String",suggestions:[]}},{name:"--help",description:"Display detailed help"},{name:"--impersonate-service-account",description:"For this gcloud invocation, all API requests will be made as the given service account instead of the currently selected account. This is done without needing to create, download, and activate a key for the account. In order to perform operations as the service account, your currently selected account must have an IAM role that includes the iam.serviceAccounts.getAccessToken permission for the service account. The roles/iam.serviceAccountTokenCreator role has this permission or you may create a custom role. Overrides the default *auth/impersonate_service_account* property value for this command invocation",args:{name:"SERVICE_ACCOUNT_EMAIL",description:"String",suggestions:[]}},{name:"--log-http",description:"Log all HTTP server requests and responses to stderr. Overrides the default *core/log_http* property value for this command invocation"},{name:"--project",description:"The Google Cloud Platform project ID to use for this invocation. If\nomitted, then the current project is assumed; the current project can\nbe listed using `gcloud config list --format='text(core.project)'`\nand can be set using `gcloud config set project PROJECTID`.\n+\n`--project` and its fallback `core/project` property play two roles\nin the invocation. It specifies the project of the resource to\noperate on. It also specifies the project for API enablement check,\nquota, and billing. To specify a different project for quota and\nbilling, use `--billing-project` or `billing/quota_project` property",args:{name:"PROJECT_ID",description:"String",suggestions:[]}},{name:"--quiet",description:`Disable all interactive prompts when running gcloud commands. If input
is required, defaults will be used, or an error will be raised.
Overrides the default core/disable_prompts property value for this
command invocation. This is equivalent to setting the environment
variable \`CLOUDSDK_CORE_DISABLE_PROMPTS\` to 1`},{name:"--trace-token",description:"Token used to route traces of service requests for investigation of issues. Overrides the default *core/trace_token* property value for this command invocation",args:{name:"TRACE_TOKEN",description:"String",suggestions:[]}},{name:"--user-output-enabled",description:"Print user intended output to the console. Overrides the default *core/user_output_enabled* property value for this command invocation. Use *--no-user-output-enabled* to disable"},{name:"--verbosity",description:"Override the default verbosity for this command. Overrides the default *core/verbosity* property value for this command invocation. _VERBOSITY_ must be one of: *debug*, *info*, *warning*, *error*, *critical*, *none*",args:{name:"VERBOSITY",description:"String",suggestions:["debug","info","warning","error","critical","none"]}}]},{name:"create-signature-payload",description:"Create a JSON container image signature object",options:[{name:"--account",description:"Google Cloud Platform user account to use for invocation. Overrides the default *core/account* property value for this command invocation",args:{name:"ACCOUNT",description:"String",suggestions:[]}},{name:"--artifact-url",description:"Container URL. May be in the `gcr.io/repository/image` format, or may optionally contain the `http` or `https` scheme",args:{name:"ARTIFACT_URL",description:"String",suggestions:[]},priority:100},{name:"--billing-project",description:"The Google Cloud Platform project that will be charged quota for operations performed in gcloud. If you need to operate on one project, but need quota against a different project, you can use this flag to specify the billing project. If both `billing/quota_project` and `--billing-project` are specified, `--billing-project` takes precedence. Run `$ gcloud config set --help` to see more information about `billing/quota_project`",args:{name:"BILLING_PROJECT",description:"String",suggestions:[]}},{name:"--configuration",description:`The configuration to use for this command invocation. For more
information on how to use configurations, run:
\`gcloud topic configurations\`.  You can also use the CLOUDSDK_ACTIVE_CONFIG_NAME environment
variable to set the equivalent of this flag for a terminal
session`,args:{name:"CONFIGURATION",description:"String",suggestions:[]}},{name:"--flags-file",description:`A YAML or JSON file that specifies a *--flag*:*value* dictionary.
Useful for specifying complex flag values with special characters
that work with any command interpreter. Additionally, each
*--flags-file* arg is replaced by its constituent flags. See
$ gcloud topic flags-file for more information`,args:{name:"YAML_FILE",description:"String",suggestions:[]}},{name:"--flatten",description:`Flatten _name_[] output resource slices in _KEY_ into separate records
for each item in each slice. Multiple keys and slices may be specified.
This also flattens keys for *--format* and *--filter*. For example,
*--flatten=abc.def* flattens *abc.def[].ghi* references to
*abc.def.ghi*. A resource record containing *abc.def[]* with N elements
will expand to N records in the flattened output. This flag interacts
with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--format",description:"Set the format for printing command output resources. The default is a\ncommand-specific human-friendly output format. The supported formats\nare: `config`, `csv`, `default`, `diff`, `disable`, `flattened`, `get`, `json`, `list`, `multi`, `none`, `object`, `table`, `text`, `value`, `yaml`. For more details run $ gcloud topic formats",args:{name:"FORMAT",description:"String",suggestions:[]}},{name:"--help",description:"Display detailed help"},{name:"--impersonate-service-account",description:"For this gcloud invocation, all API requests will be made as the given service account instead of the currently selected account. This is done without needing to create, download, and activate a key for the account. In order to perform operations as the service account, your currently selected account must have an IAM role that includes the iam.serviceAccounts.getAccessToken permission for the service account. The roles/iam.serviceAccountTokenCreator role has this permission or you may create a custom role. Overrides the default *auth/impersonate_service_account* property value for this command invocation",args:{name:"SERVICE_ACCOUNT_EMAIL",description:"String",suggestions:[]}},{name:"--log-http",description:"Log all HTTP server requests and responses to stderr. Overrides the default *core/log_http* property value for this command invocation"},{name:"--project",description:"The Google Cloud Platform project ID to use for this invocation. If\nomitted, then the current project is assumed; the current project can\nbe listed using `gcloud config list --format='text(core.project)'`\nand can be set using `gcloud config set project PROJECTID`.\n+\n`--project` and its fallback `core/project` property play two roles\nin the invocation. It specifies the project of the resource to\noperate on. It also specifies the project for API enablement check,\nquota, and billing. To specify a different project for quota and\nbilling, use `--billing-project` or `billing/quota_project` property",args:{name:"PROJECT_ID",description:"String",suggestions:[]}},{name:"--quiet",description:`Disable all interactive prompts when running gcloud commands. If input
is required, defaults will be used, or an error will be raised.
Overrides the default core/disable_prompts property value for this
command invocation. This is equivalent to setting the environment
variable \`CLOUDSDK_CORE_DISABLE_PROMPTS\` to 1`},{name:"--trace-token",description:"Token used to route traces of service requests for investigation of issues. Overrides the default *core/trace_token* property value for this command invocation",args:{name:"TRACE_TOKEN",description:"String",suggestions:[]}},{name:"--user-output-enabled",description:"Print user intended output to the console. Overrides the default *core/user_output_enabled* property value for this command invocation. Use *--no-user-output-enabled* to disable"},{name:"--verbosity",description:"Override the default verbosity for this command. Overrides the default *core/verbosity* property value for this command invocation. _VERBOSITY_ must be one of: *debug*, *info*, *warning*, *error*, *critical*, *none*",args:{name:"VERBOSITY",description:"String",suggestions:["debug","info","warning","error","critical","none"]}}]},{name:"policy",description:"Create and manage Google Binary Authorization policy",subcommands:[{name:"add-iam-policy-binding",description:"Add IAM policy binding to a Binary Authorization policy",options:[{name:"--account",description:"Google Cloud Platform user account to use for invocation. Overrides the default *core/account* property value for this command invocation",args:{name:"ACCOUNT",description:"String",suggestions:[]}},{name:"--billing-project",description:"The Google Cloud Platform project that will be charged quota for operations performed in gcloud. If you need to operate on one project, but need quota against a different project, you can use this flag to specify the billing project. If both `billing/quota_project` and `--billing-project` are specified, `--billing-project` takes precedence. Run `$ gcloud config set --help` to see more information about `billing/quota_project`",args:{name:"BILLING_PROJECT",description:"String",suggestions:[]}},{name:"--configuration",description:`The configuration to use for this command invocation. For more
information on how to use configurations, run:
\`gcloud topic configurations\`.  You can also use the CLOUDSDK_ACTIVE_CONFIG_NAME environment
variable to set the equivalent of this flag for a terminal
session`,args:{name:"CONFIGURATION",description:"String",suggestions:[]}},{name:"--flags-file",description:`A YAML or JSON file that specifies a *--flag*:*value* dictionary.
Useful for specifying complex flag values with special characters
that work with any command interpreter. Additionally, each
*--flags-file* arg is replaced by its constituent flags. See
$ gcloud topic flags-file for more information`,args:{name:"YAML_FILE",description:"String",suggestions:[]}},{name:"--flatten",description:`Flatten _name_[] output resource slices in _KEY_ into separate records
for each item in each slice. Multiple keys and slices may be specified.
This also flattens keys for *--format* and *--filter*. For example,
*--flatten=abc.def* flattens *abc.def[].ghi* references to
*abc.def.ghi*. A resource record containing *abc.def[]* with N elements
will expand to N records in the flattened output. This flag interacts
with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--format",description:"Set the format for printing command output resources. The default is a\ncommand-specific human-friendly output format. The supported formats\nare: `config`, `csv`, `default`, `diff`, `disable`, `flattened`, `get`, `json`, `list`, `multi`, `none`, `object`, `table`, `text`, `value`, `yaml`. For more details run $ gcloud topic formats",args:{name:"FORMAT",description:"String",suggestions:[]}},{name:"--help",description:"Display detailed help"},{name:"--impersonate-service-account",description:"For this gcloud invocation, all API requests will be made as the given service account instead of the currently selected account. This is done without needing to create, download, and activate a key for the account. In order to perform operations as the service account, your currently selected account must have an IAM role that includes the iam.serviceAccounts.getAccessToken permission for the service account. The roles/iam.serviceAccountTokenCreator role has this permission or you may create a custom role. Overrides the default *auth/impersonate_service_account* property value for this command invocation",args:{name:"SERVICE_ACCOUNT_EMAIL",description:"String",suggestions:[]}},{name:"--log-http",description:"Log all HTTP server requests and responses to stderr. Overrides the default *core/log_http* property value for this command invocation"},{name:"--member",description:"The member to add the binding for. Should be of the form `user|group|serviceAccount:email` or\n`domain:domain`.\n+\nExamples: `user:test-user@gmail.com`, `group:admins@example.com`,\n`serviceAccount:test123@example.domain.com`, or\n`domain:example.domain.com`.\n+\nCan also be one of the following special values:\n* `allUsers` - Special identifier that represents anyone who is on the internet,\n   with or without a Google account.\n* `allAuthenticatedUsers` - Special identifier that represents anyone who is\n   authenticated with a Google account or a service account",args:{name:"MEMBER",description:"String",suggestions:[]},priority:100},{name:"--project",description:"The Google Cloud Platform project ID to use for this invocation. If\nomitted, then the current project is assumed; the current project can\nbe listed using `gcloud config list --format='text(core.project)'`\nand can be set using `gcloud config set project PROJECTID`.\n+\n`--project` and its fallback `core/project` property play two roles\nin the invocation. It specifies the project of the resource to\noperate on. It also specifies the project for API enablement check,\nquota, and billing. To specify a different project for quota and\nbilling, use `--billing-project` or `billing/quota_project` property",args:{name:"PROJECT_ID",description:"String",suggestions:[]}},{name:"--quiet",description:`Disable all interactive prompts when running gcloud commands. If input
is required, defaults will be used, or an error will be raised.
Overrides the default core/disable_prompts property value for this
command invocation. This is equivalent to setting the environment
variable \`CLOUDSDK_CORE_DISABLE_PROMPTS\` to 1`},{name:"--role",description:"Define the role of the member",args:{name:"ROLE",description:"String",suggestions:[]},priority:100},{name:"--trace-token",description:"Token used to route traces of service requests for investigation of issues. Overrides the default *core/trace_token* property value for this command invocation",args:{name:"TRACE_TOKEN",description:"String",suggestions:[]}},{name:"--user-output-enabled",description:"Print user intended output to the console. Overrides the default *core/user_output_enabled* property value for this command invocation. Use *--no-user-output-enabled* to disable"},{name:"--verbosity",description:"Override the default verbosity for this command. Overrides the default *core/verbosity* property value for this command invocation. _VERBOSITY_ must be one of: *debug*, *info*, *warning*, *error*, *critical*, *none*",args:{name:"VERBOSITY",description:"String",suggestions:["debug","info","warning","error","critical","none"]}}]},{name:"export",description:"Export the Binary Authorization policy for the current project",options:[{name:"--account",description:"Google Cloud Platform user account to use for invocation. Overrides the default *core/account* property value for this command invocation",args:{name:"ACCOUNT",description:"String",suggestions:[]}},{name:"--billing-project",description:"The Google Cloud Platform project that will be charged quota for operations performed in gcloud. If you need to operate on one project, but need quota against a different project, you can use this flag to specify the billing project. If both `billing/quota_project` and `--billing-project` are specified, `--billing-project` takes precedence. Run `$ gcloud config set --help` to see more information about `billing/quota_project`",args:{name:"BILLING_PROJECT",description:"String",suggestions:[]}},{name:"--configuration",description:`The configuration to use for this command invocation. For more
information on how to use configurations, run:
\`gcloud topic configurations\`.  You can also use the CLOUDSDK_ACTIVE_CONFIG_NAME environment
variable to set the equivalent of this flag for a terminal
session`,args:{name:"CONFIGURATION",description:"String",suggestions:[]}},{name:"--flags-file",description:`A YAML or JSON file that specifies a *--flag*:*value* dictionary.
Useful for specifying complex flag values with special characters
that work with any command interpreter. Additionally, each
*--flags-file* arg is replaced by its constituent flags. See
$ gcloud topic flags-file for more information`,args:{name:"YAML_FILE",description:"String",suggestions:[]}},{name:"--flatten",description:`Flatten _name_[] output resource slices in _KEY_ into separate records
for each item in each slice. Multiple keys and slices may be specified.
This also flattens keys for *--format* and *--filter*. For example,
*--flatten=abc.def* flattens *abc.def[].ghi* references to
*abc.def.ghi*. A resource record containing *abc.def[]* with N elements
will expand to N records in the flattened output. This flag interacts
with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--format",description:"Set the format for printing command output resources. The default is a\ncommand-specific human-friendly output format. The supported formats\nare: `config`, `csv`, `default`, `diff`, `disable`, `flattened`, `get`, `json`, `list`, `multi`, `none`, `object`, `table`, `text`, `value`, `yaml`. For more details run $ gcloud topic formats",args:{name:"FORMAT",description:"String",suggestions:[]}},{name:"--help",description:"Display detailed help"},{name:"--impersonate-service-account",description:"For this gcloud invocation, all API requests will be made as the given service account instead of the currently selected account. This is done without needing to create, download, and activate a key for the account. In order to perform operations as the service account, your currently selected account must have an IAM role that includes the iam.serviceAccounts.getAccessToken permission for the service account. The roles/iam.serviceAccountTokenCreator role has this permission or you may create a custom role. Overrides the default *auth/impersonate_service_account* property value for this command invocation",args:{name:"SERVICE_ACCOUNT_EMAIL",description:"String",suggestions:[]}},{name:"--log-http",description:"Log all HTTP server requests and responses to stderr. Overrides the default *core/log_http* property value for this command invocation"},{name:"--project",description:"The Google Cloud Platform project ID to use for this invocation. If\nomitted, then the current project is assumed; the current project can\nbe listed using `gcloud config list --format='text(core.project)'`\nand can be set using `gcloud config set project PROJECTID`.\n+\n`--project` and its fallback `core/project` property play two roles\nin the invocation. It specifies the project of the resource to\noperate on. It also specifies the project for API enablement check,\nquota, and billing. To specify a different project for quota and\nbilling, use `--billing-project` or `billing/quota_project` property",args:{name:"PROJECT_ID",description:"String",suggestions:[]}},{name:"--quiet",description:`Disable all interactive prompts when running gcloud commands. If input
is required, defaults will be used, or an error will be raised.
Overrides the default core/disable_prompts property value for this
command invocation. This is equivalent to setting the environment
variable \`CLOUDSDK_CORE_DISABLE_PROMPTS\` to 1`},{name:"--trace-token",description:"Token used to route traces of service requests for investigation of issues. Overrides the default *core/trace_token* property value for this command invocation",args:{name:"TRACE_TOKEN",description:"String",suggestions:[]}},{name:"--user-output-enabled",description:"Print user intended output to the console. Overrides the default *core/user_output_enabled* property value for this command invocation. Use *--no-user-output-enabled* to disable"},{name:"--verbosity",description:"Override the default verbosity for this command. Overrides the default *core/verbosity* property value for this command invocation. _VERBOSITY_ must be one of: *debug*, *info*, *warning*, *error*, *critical*, *none*",args:{name:"VERBOSITY",description:"String",suggestions:["debug","info","warning","error","critical","none"]}}]},{name:"get-iam-policy",description:"Get the IAM policy for a Binary Authorization policy",options:[{name:"--account",description:"Google Cloud Platform user account to use for invocation. Overrides the default *core/account* property value for this command invocation",args:{name:"ACCOUNT",description:"String",suggestions:[]}},{name:"--billing-project",description:"The Google Cloud Platform project that will be charged quota for operations performed in gcloud. If you need to operate on one project, but need quota against a different project, you can use this flag to specify the billing project. If both `billing/quota_project` and `--billing-project` are specified, `--billing-project` takes precedence. Run `$ gcloud config set --help` to see more information about `billing/quota_project`",args:{name:"BILLING_PROJECT",description:"String",suggestions:[]}},{name:"--configuration",description:`The configuration to use for this command invocation. For more
information on how to use configurations, run:
\`gcloud topic configurations\`.  You can also use the CLOUDSDK_ACTIVE_CONFIG_NAME environment
variable to set the equivalent of this flag for a terminal
session`,args:{name:"CONFIGURATION",description:"String",suggestions:[]}},{name:"--filter",description:`Apply a Boolean filter _EXPRESSION_ to each resource item to be listed.
If the expression evaluates \`True\`, then that item is listed. For more
details and examples of filter expressions, run $ gcloud topic filters. This
flag interacts with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"EXPRESSION",description:"String",suggestions:[]}},{name:"--flags-file",description:`A YAML or JSON file that specifies a *--flag*:*value* dictionary.
Useful for specifying complex flag values with special characters
that work with any command interpreter. Additionally, each
*--flags-file* arg is replaced by its constituent flags. See
$ gcloud topic flags-file for more information`,args:{name:"YAML_FILE",description:"String",suggestions:[]}},{name:"--flatten",description:`Flatten _name_[] output resource slices in _KEY_ into separate records
for each item in each slice. Multiple keys and slices may be specified.
This also flattens keys for *--format* and *--filter*. For example,
*--flatten=abc.def* flattens *abc.def[].ghi* references to
*abc.def.ghi*. A resource record containing *abc.def[]* with N elements
will expand to N records in the flattened output. This flag interacts
with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--format",description:"Set the format for printing command output resources. The default is a\ncommand-specific human-friendly output format. The supported formats\nare: `config`, `csv`, `default`, `diff`, `disable`, `flattened`, `get`, `json`, `list`, `multi`, `none`, `object`, `table`, `text`, `value`, `yaml`. For more details run $ gcloud topic formats",args:{name:"FORMAT",description:"String",suggestions:[]}},{name:"--help",description:"Display detailed help"},{name:"--impersonate-service-account",description:"For this gcloud invocation, all API requests will be made as the given service account instead of the currently selected account. This is done without needing to create, download, and activate a key for the account. In order to perform operations as the service account, your currently selected account must have an IAM role that includes the iam.serviceAccounts.getAccessToken permission for the service account. The roles/iam.serviceAccountTokenCreator role has this permission or you may create a custom role. Overrides the default *auth/impersonate_service_account* property value for this command invocation",args:{name:"SERVICE_ACCOUNT_EMAIL",description:"String",suggestions:[]}},{name:"--limit",description:`Maximum number of resources to list. The default is *unlimited*.
This flag interacts with other flags that are applied in this order:
*--flatten*, *--sort-by*, *--filter*, *--limit*`,args:{name:"LIMIT",description:"Googlecloudsdk.calliope.arg_parsers:Parse",suggestions:[]}},{name:"--log-http",description:"Log all HTTP server requests and responses to stderr. Overrides the default *core/log_http* property value for this command invocation"},{name:"--page-size",description:`Some services group resource list output into pages. This flag specifies
the maximum number of resources per page. The default is determined by the
service if it supports paging, otherwise it is *unlimited* (no paging).
Paging may be applied before or after *--filter* and *--limit* depending
on the service`,args:{name:"PAGE_SIZE",description:"Googlecloudsdk.calliope.arg_parsers:Parse",suggestions:[]}},{name:"--project",description:"The Google Cloud Platform project ID to use for this invocation. If\nomitted, then the current project is assumed; the current project can\nbe listed using `gcloud config list --format='text(core.project)'`\nand can be set using `gcloud config set project PROJECTID`.\n+\n`--project` and its fallback `core/project` property play two roles\nin the invocation. It specifies the project of the resource to\noperate on. It also specifies the project for API enablement check,\nquota, and billing. To specify a different project for quota and\nbilling, use `--billing-project` or `billing/quota_project` property",args:{name:"PROJECT_ID",description:"String",suggestions:[]}},{name:"--quiet",description:`Disable all interactive prompts when running gcloud commands. If input
is required, defaults will be used, or an error will be raised.
Overrides the default core/disable_prompts property value for this
command invocation. This is equivalent to setting the environment
variable \`CLOUDSDK_CORE_DISABLE_PROMPTS\` to 1`},{name:"--sort-by",description:`Comma-separated list of resource field key names to sort by. The
default order is ascending. Prefix a field with \`\`~'' for descending
order on that field. This flag interacts with other flags that are applied
in this order: *--flatten*, *--sort-by*, *--filter*, *--limit*`,args:{name:"FIELD",description:"List",suggestions:[]}},{name:"--trace-token",description:"Token used to route traces of service requests for investigation of issues. Overrides the default *core/trace_token* property value for this command invocation",args:{name:"TRACE_TOKEN",description:"String",suggestions:[]}},{name:"--uri",description:"Print a list of resource URIs instead of the default output"},{name:"--user-output-enabled",description:"Print user intended output to the console. Overrides the default *core/user_output_enabled* property value for this command invocation. Use *--no-user-output-enabled* to disable"},{name:"--verbosity",description:"Override the default verbosity for this command. Overrides the default *core/verbosity* property value for this command invocation. _VERBOSITY_ must be one of: *debug*, *info*, *warning*, *error*, *critical*, *none*",args:{name:"VERBOSITY",description:"String",suggestions:["debug","info","warning","error","critical","none"]}}]},{name:"import",description:"Import a Binary Authorization policy to the current project",options:[{name:"--account",description:"Google Cloud Platform user account to use for invocation. Overrides the default *core/account* property value for this command invocation",args:{name:"ACCOUNT",description:"String",suggestions:[]}},{name:"--billing-project",description:"The Google Cloud Platform project that will be charged quota for operations performed in gcloud. If you need to operate on one project, but need quota against a different project, you can use this flag to specify the billing project. If both `billing/quota_project` and `--billing-project` are specified, `--billing-project` takes precedence. Run `$ gcloud config set --help` to see more information about `billing/quota_project`",args:{name:"BILLING_PROJECT",description:"String",suggestions:[]}},{name:"--configuration",description:`The configuration to use for this command invocation. For more
information on how to use configurations, run:
\`gcloud topic configurations\`.  You can also use the CLOUDSDK_ACTIVE_CONFIG_NAME environment
variable to set the equivalent of this flag for a terminal
session`,args:{name:"CONFIGURATION",description:"String",suggestions:[]}},{name:"--flags-file",description:`A YAML or JSON file that specifies a *--flag*:*value* dictionary.
Useful for specifying complex flag values with special characters
that work with any command interpreter. Additionally, each
*--flags-file* arg is replaced by its constituent flags. See
$ gcloud topic flags-file for more information`,args:{name:"YAML_FILE",description:"String",suggestions:[]}},{name:"--flatten",description:`Flatten _name_[] output resource slices in _KEY_ into separate records
for each item in each slice. Multiple keys and slices may be specified.
This also flattens keys for *--format* and *--filter*. For example,
*--flatten=abc.def* flattens *abc.def[].ghi* references to
*abc.def.ghi*. A resource record containing *abc.def[]* with N elements
will expand to N records in the flattened output. This flag interacts
with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--format",description:"Set the format for printing command output resources. The default is a\ncommand-specific human-friendly output format. The supported formats\nare: `config`, `csv`, `default`, `diff`, `disable`, `flattened`, `get`, `json`, `list`, `multi`, `none`, `object`, `table`, `text`, `value`, `yaml`. For more details run $ gcloud topic formats",args:{name:"FORMAT",description:"String",suggestions:[]}},{name:"--help",description:"Display detailed help"},{name:"--impersonate-service-account",description:"For this gcloud invocation, all API requests will be made as the given service account instead of the currently selected account. This is done without needing to create, download, and activate a key for the account. In order to perform operations as the service account, your currently selected account must have an IAM role that includes the iam.serviceAccounts.getAccessToken permission for the service account. The roles/iam.serviceAccountTokenCreator role has this permission or you may create a custom role. Overrides the default *auth/impersonate_service_account* property value for this command invocation",args:{name:"SERVICE_ACCOUNT_EMAIL",description:"String",suggestions:[]}},{name:"--log-http",description:"Log all HTTP server requests and responses to stderr. Overrides the default *core/log_http* property value for this command invocation"},{name:"--project",description:"The Google Cloud Platform project ID to use for this invocation. If\nomitted, then the current project is assumed; the current project can\nbe listed using `gcloud config list --format='text(core.project)'`\nand can be set using `gcloud config set project PROJECTID`.\n+\n`--project` and its fallback `core/project` property play two roles\nin the invocation. It specifies the project of the resource to\noperate on. It also specifies the project for API enablement check,\nquota, and billing. To specify a different project for quota and\nbilling, use `--billing-project` or `billing/quota_project` property",args:{name:"PROJECT_ID",description:"String",suggestions:[]}},{name:"--quiet",description:`Disable all interactive prompts when running gcloud commands. If input
is required, defaults will be used, or an error will be raised.
Overrides the default core/disable_prompts property value for this
command invocation. This is equivalent to setting the environment
variable \`CLOUDSDK_CORE_DISABLE_PROMPTS\` to 1`},{name:"--strict-validation",description:"Whether to perform additional checks on the validity of policy contents"},{name:"--trace-token",description:"Token used to route traces of service requests for investigation of issues. Overrides the default *core/trace_token* property value for this command invocation",args:{name:"TRACE_TOKEN",description:"String",suggestions:[]}},{name:"--user-output-enabled",description:"Print user intended output to the console. Overrides the default *core/user_output_enabled* property value for this command invocation. Use *--no-user-output-enabled* to disable"},{name:"--verbosity",description:"Override the default verbosity for this command. Overrides the default *core/verbosity* property value for this command invocation. _VERBOSITY_ must be one of: *debug*, *info*, *warning*, *error*, *critical*, *none*",args:{name:"VERBOSITY",description:"String",suggestions:["debug","info","warning","error","critical","none"]}}],args:{name:"POLICY_FILE",description:"The file containing the YAML-formatted policy description"}},{name:"remove-iam-policy-binding",description:"Remove IAM policy binding of a Binary Authorization policy",options:[{name:"--account",description:"Google Cloud Platform user account to use for invocation. Overrides the default *core/account* property value for this command invocation",args:{name:"ACCOUNT",description:"String",suggestions:[]}},{name:"--billing-project",description:"The Google Cloud Platform project that will be charged quota for operations performed in gcloud. If you need to operate on one project, but need quota against a different project, you can use this flag to specify the billing project. If both `billing/quota_project` and `--billing-project` are specified, `--billing-project` takes precedence. Run `$ gcloud config set --help` to see more information about `billing/quota_project`",args:{name:"BILLING_PROJECT",description:"String",suggestions:[]}},{name:"--configuration",description:`The configuration to use for this command invocation. For more
information on how to use configurations, run:
\`gcloud topic configurations\`.  You can also use the CLOUDSDK_ACTIVE_CONFIG_NAME environment
variable to set the equivalent of this flag for a terminal
session`,args:{name:"CONFIGURATION",description:"String",suggestions:[]}},{name:"--flags-file",description:`A YAML or JSON file that specifies a *--flag*:*value* dictionary.
Useful for specifying complex flag values with special characters
that work with any command interpreter. Additionally, each
*--flags-file* arg is replaced by its constituent flags. See
$ gcloud topic flags-file for more information`,args:{name:"YAML_FILE",description:"String",suggestions:[]}},{name:"--flatten",description:`Flatten _name_[] output resource slices in _KEY_ into separate records
for each item in each slice. Multiple keys and slices may be specified.
This also flattens keys for *--format* and *--filter*. For example,
*--flatten=abc.def* flattens *abc.def[].ghi* references to
*abc.def.ghi*. A resource record containing *abc.def[]* with N elements
will expand to N records in the flattened output. This flag interacts
with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--format",description:"Set the format for printing command output resources. The default is a\ncommand-specific human-friendly output format. The supported formats\nare: `config`, `csv`, `default`, `diff`, `disable`, `flattened`, `get`, `json`, `list`, `multi`, `none`, `object`, `table`, `text`, `value`, `yaml`. For more details run $ gcloud topic formats",args:{name:"FORMAT",description:"String",suggestions:[]}},{name:"--help",description:"Display detailed help"},{name:"--impersonate-service-account",description:"For this gcloud invocation, all API requests will be made as the given service account instead of the currently selected account. This is done without needing to create, download, and activate a key for the account. In order to perform operations as the service account, your currently selected account must have an IAM role that includes the iam.serviceAccounts.getAccessToken permission for the service account. The roles/iam.serviceAccountTokenCreator role has this permission or you may create a custom role. Overrides the default *auth/impersonate_service_account* property value for this command invocation",args:{name:"SERVICE_ACCOUNT_EMAIL",description:"String",suggestions:[]}},{name:"--log-http",description:"Log all HTTP server requests and responses to stderr. Overrides the default *core/log_http* property value for this command invocation"},{name:"--member",description:"The member to remove the binding for. Should be of the form `user|group|serviceAccount:email` or\n`domain:domain`.\n+\nExamples: `user:test-user@gmail.com`, `group:admins@example.com`,\n`serviceAccount:test123@example.domain.com`, or\n`domain:example.domain.com`.\n+\nCan also be one of the following special values:\n* `allUsers` - Special identifier that represents anyone who is on the internet,\n   with or without a Google account.\n* `allAuthenticatedUsers` - Special identifier that represents anyone who is\n   authenticated with a Google account or a service account",args:{name:"MEMBER",description:"String",suggestions:[]},priority:100},{name:"--project",description:"The Google Cloud Platform project ID to use for this invocation. If\nomitted, then the current project is assumed; the current project can\nbe listed using `gcloud config list --format='text(core.project)'`\nand can be set using `gcloud config set project PROJECTID`.\n+\n`--project` and its fallback `core/project` property play two roles\nin the invocation. It specifies the project of the resource to\noperate on. It also specifies the project for API enablement check,\nquota, and billing. To specify a different project for quota and\nbilling, use `--billing-project` or `billing/quota_project` property",args:{name:"PROJECT_ID",description:"String",suggestions:[]}},{name:"--quiet",description:`Disable all interactive prompts when running gcloud commands. If input
is required, defaults will be used, or an error will be raised.
Overrides the default core/disable_prompts property value for this
command invocation. This is equivalent to setting the environment
variable \`CLOUDSDK_CORE_DISABLE_PROMPTS\` to 1`},{name:"--role",description:"The role to remove the member from",args:{name:"ROLE",description:"String",suggestions:[]},priority:100},{name:"--trace-token",description:"Token used to route traces of service requests for investigation of issues. Overrides the default *core/trace_token* property value for this command invocation",args:{name:"TRACE_TOKEN",description:"String",suggestions:[]}},{name:"--user-output-enabled",description:"Print user intended output to the console. Overrides the default *core/user_output_enabled* property value for this command invocation. Use *--no-user-output-enabled* to disable"},{name:"--verbosity",description:"Override the default verbosity for this command. Overrides the default *core/verbosity* property value for this command invocation. _VERBOSITY_ must be one of: *debug*, *info*, *warning*, *error*, *critical*, *none*",args:{name:"VERBOSITY",description:"String",suggestions:["debug","info","warning","error","critical","none"]}}]},{name:"set-iam-policy",description:"Set the IAM policy for a Binary Authorization policy",options:[{name:"--account",description:"Google Cloud Platform user account to use for invocation. Overrides the default *core/account* property value for this command invocation",args:{name:"ACCOUNT",description:"String",suggestions:[]}},{name:"--billing-project",description:"The Google Cloud Platform project that will be charged quota for operations performed in gcloud. If you need to operate on one project, but need quota against a different project, you can use this flag to specify the billing project. If both `billing/quota_project` and `--billing-project` are specified, `--billing-project` takes precedence. Run `$ gcloud config set --help` to see more information about `billing/quota_project`",args:{name:"BILLING_PROJECT",description:"String",suggestions:[]}},{name:"--configuration",description:`The configuration to use for this command invocation. For more
information on how to use configurations, run:
\`gcloud topic configurations\`.  You can also use the CLOUDSDK_ACTIVE_CONFIG_NAME environment
variable to set the equivalent of this flag for a terminal
session`,args:{name:"CONFIGURATION",description:"String",suggestions:[]}},{name:"--flags-file",description:`A YAML or JSON file that specifies a *--flag*:*value* dictionary.
Useful for specifying complex flag values with special characters
that work with any command interpreter. Additionally, each
*--flags-file* arg is replaced by its constituent flags. See
$ gcloud topic flags-file for more information`,args:{name:"YAML_FILE",description:"String",suggestions:[]}},{name:"--flatten",description:`Flatten _name_[] output resource slices in _KEY_ into separate records
for each item in each slice. Multiple keys and slices may be specified.
This also flattens keys for *--format* and *--filter*. For example,
*--flatten=abc.def* flattens *abc.def[].ghi* references to
*abc.def.ghi*. A resource record containing *abc.def[]* with N elements
will expand to N records in the flattened output. This flag interacts
with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--format",description:"Set the format for printing command output resources. The default is a\ncommand-specific human-friendly output format. The supported formats\nare: `config`, `csv`, `default`, `diff`, `disable`, `flattened`, `get`, `json`, `list`, `multi`, `none`, `object`, `table`, `text`, `value`, `yaml`. For more details run $ gcloud topic formats",args:{name:"FORMAT",description:"String",suggestions:[]}},{name:"--help",description:"Display detailed help"},{name:"--impersonate-service-account",description:"For this gcloud invocation, all API requests will be made as the given service account instead of the currently selected account. This is done without needing to create, download, and activate a key for the account. In order to perform operations as the service account, your currently selected account must have an IAM role that includes the iam.serviceAccounts.getAccessToken permission for the service account. The roles/iam.serviceAccountTokenCreator role has this permission or you may create a custom role. Overrides the default *auth/impersonate_service_account* property value for this command invocation",args:{name:"SERVICE_ACCOUNT_EMAIL",description:"String",suggestions:[]}},{name:"--log-http",description:"Log all HTTP server requests and responses to stderr. Overrides the default *core/log_http* property value for this command invocation"},{name:"--project",description:"The Google Cloud Platform project ID to use for this invocation. If\nomitted, then the current project is assumed; the current project can\nbe listed using `gcloud config list --format='text(core.project)'`\nand can be set using `gcloud config set project PROJECTID`.\n+\n`--project` and its fallback `core/project` property play two roles\nin the invocation. It specifies the project of the resource to\noperate on. It also specifies the project for API enablement check,\nquota, and billing. To specify a different project for quota and\nbilling, use `--billing-project` or `billing/quota_project` property",args:{name:"PROJECT_ID",description:"String",suggestions:[]}},{name:"--quiet",description:`Disable all interactive prompts when running gcloud commands. If input
is required, defaults will be used, or an error will be raised.
Overrides the default core/disable_prompts property value for this
command invocation. This is equivalent to setting the environment
variable \`CLOUDSDK_CORE_DISABLE_PROMPTS\` to 1`},{name:"--trace-token",description:"Token used to route traces of service requests for investigation of issues. Overrides the default *core/trace_token* property value for this command invocation",args:{name:"TRACE_TOKEN",description:"String",suggestions:[]}},{name:"--user-output-enabled",description:"Print user intended output to the console. Overrides the default *core/user_output_enabled* property value for this command invocation. Use *--no-user-output-enabled* to disable"},{name:"--verbosity",description:"Override the default verbosity for this command. Overrides the default *core/verbosity* property value for this command invocation. _VERBOSITY_ must be one of: *debug*, *info*, *warning*, *error*, *critical*, *none*",args:{name:"VERBOSITY",description:"String",suggestions:["debug","info","warning","error","critical","none"]}}],args:{name:"POLICY_FILE",description:"The JSON or YAML file containing the IAM policy"}}],options:[{name:"--account",description:"Google Cloud Platform user account to use for invocation. Overrides the default *core/account* property value for this command invocation",args:{name:"ACCOUNT",description:"String",suggestions:[]}},{name:"--billing-project",description:"The Google Cloud Platform project that will be charged quota for operations performed in gcloud. If you need to operate on one project, but need quota against a different project, you can use this flag to specify the billing project. If both `billing/quota_project` and `--billing-project` are specified, `--billing-project` takes precedence. Run `$ gcloud config set --help` to see more information about `billing/quota_project`",args:{name:"BILLING_PROJECT",description:"String",suggestions:[]}},{name:"--configuration",description:`The configuration to use for this command invocation. For more
information on how to use configurations, run:
\`gcloud topic configurations\`.  You can also use the CLOUDSDK_ACTIVE_CONFIG_NAME environment
variable to set the equivalent of this flag for a terminal
session`,args:{name:"CONFIGURATION",description:"String",suggestions:[]}},{name:"--flags-file",description:`A YAML or JSON file that specifies a *--flag*:*value* dictionary.
Useful for specifying complex flag values with special characters
that work with any command interpreter. Additionally, each
*--flags-file* arg is replaced by its constituent flags. See
$ gcloud topic flags-file for more information`,args:{name:"YAML_FILE",description:"String",suggestions:[]}},{name:"--flatten",description:`Flatten _name_[] output resource slices in _KEY_ into separate records
for each item in each slice. Multiple keys and slices may be specified.
This also flattens keys for *--format* and *--filter*. For example,
*--flatten=abc.def* flattens *abc.def[].ghi* references to
*abc.def.ghi*. A resource record containing *abc.def[]* with N elements
will expand to N records in the flattened output. This flag interacts
with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--format",description:"Set the format for printing command output resources. The default is a\ncommand-specific human-friendly output format. The supported formats\nare: `config`, `csv`, `default`, `diff`, `disable`, `flattened`, `get`, `json`, `list`, `multi`, `none`, `object`, `table`, `text`, `value`, `yaml`. For more details run $ gcloud topic formats",args:{name:"FORMAT",description:"String",suggestions:[]}},{name:"--help",description:"Display detailed help"},{name:"--impersonate-service-account",description:"For this gcloud invocation, all API requests will be made as the given service account instead of the currently selected account. This is done without needing to create, download, and activate a key for the account. In order to perform operations as the service account, your currently selected account must have an IAM role that includes the iam.serviceAccounts.getAccessToken permission for the service account. The roles/iam.serviceAccountTokenCreator role has this permission or you may create a custom role. Overrides the default *auth/impersonate_service_account* property value for this command invocation",args:{name:"SERVICE_ACCOUNT_EMAIL",description:"String",suggestions:[]}},{name:"--log-http",description:"Log all HTTP server requests and responses to stderr. Overrides the default *core/log_http* property value for this command invocation"},{name:"--project",description:"The Google Cloud Platform project ID to use for this invocation. If\nomitted, then the current project is assumed; the current project can\nbe listed using `gcloud config list --format='text(core.project)'`\nand can be set using `gcloud config set project PROJECTID`.\n+\n`--project` and its fallback `core/project` property play two roles\nin the invocation. It specifies the project of the resource to\noperate on. It also specifies the project for API enablement check,\nquota, and billing. To specify a different project for quota and\nbilling, use `--billing-project` or `billing/quota_project` property",args:{name:"PROJECT_ID",description:"String",suggestions:[]}},{name:"--quiet",description:`Disable all interactive prompts when running gcloud commands. If input
is required, defaults will be used, or an error will be raised.
Overrides the default core/disable_prompts property value for this
command invocation. This is equivalent to setting the environment
variable \`CLOUDSDK_CORE_DISABLE_PROMPTS\` to 1`},{name:"--trace-token",description:"Token used to route traces of service requests for investigation of issues. Overrides the default *core/trace_token* property value for this command invocation",args:{name:"TRACE_TOKEN",description:"String",suggestions:[]}},{name:"--user-output-enabled",description:"Print user intended output to the console. Overrides the default *core/user_output_enabled* property value for this command invocation. Use *--no-user-output-enabled* to disable"},{name:"--verbosity",description:"Override the default verbosity for this command. Overrides the default *core/verbosity* property value for this command invocation. _VERBOSITY_ must be one of: *debug*, *info*, *warning*, *error*, *critical*, *none*",args:{name:"VERBOSITY",description:"String",suggestions:["debug","info","warning","error","critical","none"]}}]}],options:[{name:"--account",description:"Google Cloud Platform user account to use for invocation. Overrides the default *core/account* property value for this command invocation",args:{name:"ACCOUNT",description:"String",suggestions:[]}},{name:"--billing-project",description:"The Google Cloud Platform project that will be charged quota for operations performed in gcloud. If you need to operate on one project, but need quota against a different project, you can use this flag to specify the billing project. If both `billing/quota_project` and `--billing-project` are specified, `--billing-project` takes precedence. Run `$ gcloud config set --help` to see more information about `billing/quota_project`",args:{name:"BILLING_PROJECT",description:"String",suggestions:[]}},{name:"--configuration",description:`The configuration to use for this command invocation. For more
information on how to use configurations, run:
\`gcloud topic configurations\`.  You can also use the CLOUDSDK_ACTIVE_CONFIG_NAME environment
variable to set the equivalent of this flag for a terminal
session`,args:{name:"CONFIGURATION",description:"String",suggestions:[]}},{name:"--flags-file",description:`A YAML or JSON file that specifies a *--flag*:*value* dictionary.
Useful for specifying complex flag values with special characters
that work with any command interpreter. Additionally, each
*--flags-file* arg is replaced by its constituent flags. See
$ gcloud topic flags-file for more information`,args:{name:"YAML_FILE",description:"String",suggestions:[]}},{name:"--flatten",description:`Flatten _name_[] output resource slices in _KEY_ into separate records
for each item in each slice. Multiple keys and slices may be specified.
This also flattens keys for *--format* and *--filter*. For example,
*--flatten=abc.def* flattens *abc.def[].ghi* references to
*abc.def.ghi*. A resource record containing *abc.def[]* with N elements
will expand to N records in the flattened output. This flag interacts
with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--format",description:"Set the format for printing command output resources. The default is a\ncommand-specific human-friendly output format. The supported formats\nare: `config`, `csv`, `default`, `diff`, `disable`, `flattened`, `get`, `json`, `list`, `multi`, `none`, `object`, `table`, `text`, `value`, `yaml`. For more details run $ gcloud topic formats",args:{name:"FORMAT",description:"String",suggestions:[]}},{name:"--help",description:"Display detailed help"},{name:"--impersonate-service-account",description:"For this gcloud invocation, all API requests will be made as the given service account instead of the currently selected account. This is done without needing to create, download, and activate a key for the account. In order to perform operations as the service account, your currently selected account must have an IAM role that includes the iam.serviceAccounts.getAccessToken permission for the service account. The roles/iam.serviceAccountTokenCreator role has this permission or you may create a custom role. Overrides the default *auth/impersonate_service_account* property value for this command invocation",args:{name:"SERVICE_ACCOUNT_EMAIL",description:"String",suggestions:[]}},{name:"--log-http",description:"Log all HTTP server requests and responses to stderr. Overrides the default *core/log_http* property value for this command invocation"},{name:"--project",description:"The Google Cloud Platform project ID to use for this invocation. If\nomitted, then the current project is assumed; the current project can\nbe listed using `gcloud config list --format='text(core.project)'`\nand can be set using `gcloud config set project PROJECTID`.\n+\n`--project` and its fallback `core/project` property play two roles\nin the invocation. It specifies the project of the resource to\noperate on. It also specifies the project for API enablement check,\nquota, and billing. To specify a different project for quota and\nbilling, use `--billing-project` or `billing/quota_project` property",args:{name:"PROJECT_ID",description:"String",suggestions:[]}},{name:"--quiet",description:`Disable all interactive prompts when running gcloud commands. If input
is required, defaults will be used, or an error will be raised.
Overrides the default core/disable_prompts property value for this
command invocation. This is equivalent to setting the environment
variable \`CLOUDSDK_CORE_DISABLE_PROMPTS\` to 1`},{name:"--trace-token",description:"Token used to route traces of service requests for investigation of issues. Overrides the default *core/trace_token* property value for this command invocation",args:{name:"TRACE_TOKEN",description:"String",suggestions:[]}},{name:"--user-output-enabled",description:"Print user intended output to the console. Overrides the default *core/user_output_enabled* property value for this command invocation. Use *--no-user-output-enabled* to disable"},{name:"--verbosity",description:"Override the default verbosity for this command. Overrides the default *core/verbosity* property value for this command invocation. _VERBOSITY_ must be one of: *debug*, *info*, *warning*, *error*, *critical*, *none*",args:{name:"VERBOSITY",description:"String",suggestions:["debug","info","warning","error","critical","none"]}}]},{name:"clusters",description:"Deploy and teardown Google Kubernetes Engine clusters",subcommands:[{name:"create",description:"Create a cluster for running containers",options:[{name:"--accelerator",description:`Attaches accelerators (e.g. GPUs) to all nodes.
+
*type*::: (Required) The specific type (e.g. nvidia-tesla-k80 for nVidia Tesla K80)
of accelerator to attach to the instances. Use \`\`\`gcloud compute
accelerator-types list\`\`\` to learn about all available accelerator types.
+
*count*::: (Optional) The number of accelerators to attach to the
instances. The default value is 1`,args:{name:"type=TYPE,[count=COUNT]",description:"Dict",suggestions:[]}},{name:"--account",description:"Google Cloud Platform user account to use for invocation. Overrides the default *core/account* property value for this command invocation",args:{name:"ACCOUNT",description:"String",suggestions:[]}},{name:"--additional-zones",description:`(DEPRECATED) The set of additional zones in which the specified node footprint should be
replicated. All zones must be in the same region as the cluster's primary zone.
If additional-zones is not specified, all nodes will be in the cluster's primary
zone.
+
Note that \`NUM_NODES\` nodes will be created in each zone, such that if you
specify \`--num-nodes=4\` and choose one additional zone, 8 nodes will be created.
+
Multiple locations can be specified, separated by commas. For example:
+
  $ {command} example-cluster --zone us-central1-a --additional-zones us-central1-b,us-central1-c
+
This flag is deprecated. Use --node-locations=PRIMARY_ZONE,[ZONE,...] instead`,args:{name:"ZONE",description:"List",suggestions:[]}},{name:"--addons",description:`Addons
(https://cloud.google.com/kubernetes-engine/docs/reference/rest/v1/projects.locations.clusters#Cluster.AddonsConfig)
are additional Kubernetes cluster components. Addons specified by this flag will
be enabled. The others will be disabled. Default addons: HttpLoadBalancing, HorizontalPodAutoscaling. _ADDON_ must be one of: *HttpLoadBalancing*, *HorizontalPodAutoscaling*, *KubernetesDashboard*, *NetworkPolicy*, *CloudRun*, *NodeLocalDNS*, *ConfigConnector*`,args:{name:"ADDON",description:"List",suggestions:[]}},{name:"--async",description:`Return immediately, without waiting for the operation in progress to
complete`},{name:"--autoprovisioning-config-file",description:`Path of the JSON/YAML file which contains information about the
cluster's node autoprovisioning configuration. Currently it contains
a list of resource limits, identity defaults for autoprovisioning, node upgrade
settings, node management settings, minimum cpu platform, node locations for
autoprovisioning, disk type and size configuration, shielded instance settings,
and customer-managed encryption keys settings.
+
Resource limits are specified in the field 'resourceLimits'.
Each resource limits definition contains three fields:
resourceType, maximum and minimum.
Resource type can be "cpu", "memory" or an accelerator (e.g.
"nvidia-tesla-k80" for nVidia Tesla K80). Use gcloud compute accelerator-types
list to learn about available accelerator types.
Maximum is the maximum allowed amount with the unit of the resource.
Minimum is the minimum allowed amount with the unit of the resource.
+
Identity default contains at most one of the below fields:
serviceAccount: The Google Cloud Platform Service Account to be used by node VMs in
autoprovisioned node pools. If not specified, the project's default service account
is used.
scopes: A list of scopes to be used by node instances in autoprovisioned node pools.
Multiple scopes can be specified, separated by commas. For information on defaults,
look at:
https://cloud.google.com/sdk/gcloud/reference/container/clusters/create#--scopes
+
Node Upgrade settings are specified under the field
'upgradeSettings', which has the following fields:
maxSurgeUpgrade: Number of extra (surge) nodes to be created on
each upgrade of an autoprovisioned node pool.
maxUnavailableUpgrade: Number of nodes that can be unavailable at the
same time on each upgrade of an autoprovisioned node pool.
+
Node Management settings are specified under the field
'nodeManagement', which has the following fields:
enableAutoUpgrade: A boolean field that indicates if node
autoupgrade is enabled for autoprovisioned node pools.
enableAutoRepair: A boolean field that indicates if node
autorepair is enabled for autoprovisioned node pools.
+
minCpuPlatform: If specified, new autoprovisioned nodes will be
scheduled on host with specified CPU architecture or a newer one.
Note: Min CPU platform can only be specified in Beta and Alpha.
+
Autoprovisioning locations is a set of zones where new node pools
can be created by Autoprovisioning. Autoprovisioning locations are
specified in the field 'autoprovisioningLocations'. All zones must
be in the same region as the cluster's master(s).
+
Disk type and size are specified under the 'diskType' and 'diskSizeGb' fields,
respectively. If specified, new autoprovisioned nodes will be created with
custom boot disks configured by these settings.
+
Shielded instance settings are specified under the 'shieldedInstanceConfig'
field, which has the following fields:
enableSecureBoot: A boolean field that indicates if secure boot is enabled for
autoprovisioned nodes.
enableIntegrityMonitoring: A boolean field that indicates if integrity
monitoring is enabled for autoprovisioned nodes.
+
Customer Managed Encryption Keys (CMEK) used by new auto-provisioned node pools
can be specified in the 'bootDiskKmsKey' field`,args:{name:"AUTOPROVISIONING_CONFIG_FILE",description:"Googlecloudsdk.calliope.arg_parsers:FileContents",suggestions:[]}},{name:"--autoprovisioning-locations",description:`Set of zones where new node pools can be created by autoprovisioning.
All zones must be in the same region as the cluster's master(s).
Multiple locations can be specified, separated by commas`,args:{name:"ZONE",description:"List",suggestions:[]}},{name:"--autoprovisioning-max-surge-upgrade",description:`Number of extra (surge) nodes to be created on each upgrade of an
autoprovisioned node pool`,args:{name:"AUTOPROVISIONING_MAX_SURGE_UPGRADE",description:"String",suggestions:[]},priority:100},{name:"--autoprovisioning-max-unavailable-upgrade",description:`Number of nodes that can be unavailable at the same time on each
upgrade of an autoprovisioned node pool`,args:{name:"AUTOPROVISIONING_MAX_UNAVAILABLE_UPGRADE",description:"String",suggestions:[]},priority:100},{name:"--autoprovisioning-min-cpu-platform",description:`If specified, new autoprovisioned nodes will be scheduled on host with
specified CPU architecture or a newer one`,args:{name:"PLATFORM",description:"String",suggestions:[]}},{name:"--autoprovisioning-scopes",description:`The scopes be used by node instances in autoprovisioned node pools.
Multiple scopes can be specified, separated by commas. For information
on defaults, look at:
https://cloud.google.com/sdk/gcloud/reference/container/clusters/create#--scopes`,args:{name:"SCOPE",description:"List",suggestions:[]}},{name:"--autoprovisioning-service-account",description:`The Google Cloud Platform Service Account to be used by node VMs in
autoprovisioned node pools. If not specified, the project default
service account is used`,args:{name:"AUTOPROVISIONING_SERVICE_ACCOUNT",description:"String",suggestions:[]}},{name:"--billing-project",description:"The Google Cloud Platform project that will be charged quota for operations performed in gcloud. If you need to operate on one project, but need quota against a different project, you can use this flag to specify the billing project. If both `billing/quota_project` and `--billing-project` are specified, `--billing-project` takes precedence. Run `$ gcloud config set --help` to see more information about `billing/quota_project`",args:{name:"BILLING_PROJECT",description:"String",suggestions:[]}},{name:"--boot-disk-kms-key",description:`The Customer Managed Encryption Key used to encrypt the boot disk attached
to each node in the node pool. This should be of the form
projects/[KEY_PROJECT_ID]/locations/[LOCATION]/keyRings/[RING_NAME]/cryptoKeys/[KEY_NAME].
For more information about protecting resources with Cloud KMS Keys please
see:
https://cloud.google.com/compute/docs/disks/customer-managed-encryption`,args:{name:"BOOT_DISK_KMS_KEY",description:"String",suggestions:[]}},{name:"--cloud-run-config",description:`Configurations for Cloud Run addon, requires \`--addons=CloudRun\` for create
and \`--update-addons=CloudRun=ENABLED\` for update.
+
*load-balancer-type*:::Optional Type of load-balancer-type EXTERNAL or INTERNAL
Example:
+
  $ {command} example-cluster --cloud-run-config=load-balancer-type=INTERNAL`,args:{name:"load-balancer-type=EXTERNAL",description:"Dict",suggestions:[]}},{name:"--cluster-ipv4-cidr",description:`The IP address range for the pods in this cluster in CIDR notation (e.g.
10.0.0.0/14). Prior to Kubernetes version 1.7.0 this must be a subset of
10.0.0.0/8; however, starting with version 1.7.0 can be any RFC 1918 IP range.
+
If you omit this option, a range is chosen automatically.  The automatically
chosen range is randomly selected from 1.0.0.0/8 and will not include IP
address ranges allocated to VMs, existing routes, or ranges allocated to other
clusters. The automatically chosen range might conflict with reserved IP
addresses, dynamic routes, or routes within VPCs that peer with this cluster.
You should specify \`--cluster-ipv4-cidr\` to prevent conflicts`,args:{name:"CLUSTER_IPV4_CIDR",description:"String",suggestions:[]}},{name:"--cluster-secondary-range-name",description:`Set the secondary range to be used as the source for pod IPs. Alias
ranges will be allocated from this secondary range.  NAME must be the
name of an existing secondary range in the cluster subnetwork.
+
Must be used in conjunction with '--enable-ip-alias'. Cannot be used
with --create-subnetwork`,args:{name:"NAME",description:"String",suggestions:[]}},{name:"--cluster-version",description:`The Kubernetes version to use for the master and nodes. Defaults to
server-specified.
+
The default Kubernetes version is available using the following command.
+
  $ gcloud container get-server-config`,args:{name:"CLUSTER_VERSION",description:"String",suggestions:[]}},{name:"--configuration",description:`The configuration to use for this command invocation. For more
information on how to use configurations, run:
\`gcloud topic configurations\`.  You can also use the CLOUDSDK_ACTIVE_CONFIG_NAME environment
variable to set the equivalent of this flag for a terminal
session`,args:{name:"CONFIGURATION",description:"String",suggestions:[]}},{name:"--create-subnetwork",description:`Create a new subnetwork for the cluster. The name and range of the
subnetwork can be customized via optional 'name' and 'range' key-value
pairs.
+
'name' specifies the name of the subnetwork to be created.
+
'range' specifies the IP range for the new subnetwork. This can either
be a netmask size (e.g. '/20') or a CIDR range (e.g. '10.0.0.0/20').
If a netmask size is specified, the IP is automatically taken from the
free space in the cluster's network.
+
Examples:
+
Create a new subnetwork with a default name and size.
+
      $ {command} --create-subnetwork ""
+
Create a new subnetwork named "my-subnet" with netmask of size 21.
+
      $ {command} --create-subnetwork name=my-subnet,range=/21
+
Create a new subnetwork with a default name with the primary range of
10.100.0.0/16.
+
      $ {command} --create-subnetwork range=10.100.0.0/16
+
Create a new subnetwork with the name "my-subnet" with a default range.
+
      $ {command} --create-subnetwork name=my-subnet
+
Can not be specified unless '--enable-ip-alias' is also specified. Can
not be used in conjunction with the '--subnetwork' option`,args:{name:"KEY=VALUE",description:"Dict",suggestions:[]}},{name:"--database-encryption-key",description:`Enable Database Encryption.
+
Enable database encryption that will be used to encrypt Kubernetes Secrets at
the application layer. The key provided should be the resource ID in the format of
\`projects/[KEY_PROJECT_ID]/locations/[LOCATION]/keyRings/[RING_NAME]/cryptoKeys/[KEY_NAME]\`.
For more information, see
https://cloud.google.com/kubernetes-engine/docs/how-to/encrypting-secrets`,args:{name:"DATABASE_ENCRYPTION_KEY",description:"Googlecloudsdk.calliope.arg_parsers:Parse",suggestions:[]}},{name:"--default-max-pods-per-node",description:`The default max number of pods per node for node pools in the cluster.
+
This flag sets the default max-pods-per-node for node pools in the cluster. If
--max-pods-per-node is not specified explicitly for a node pool, this flag
value will be used.
+
Must be used in conjunction with '--enable-ip-alias'`,args:{name:"DEFAULT_MAX_PODS_PER_NODE",description:"String",suggestions:[]}},{name:"--disable-default-snat",description:`Disable default source NAT rules applied in cluster nodes.
+
By default, cluster nodes perform source network address translation (SNAT)
for packets sent from Pod IP address sources to destination IP addresses
that are not in the non-masquerade CIDRs list.
For more details about SNAT and IP masquerading, see:
https://cloud.google.com/kubernetes-engine/docs/how-to/ip-masquerade-agent#how_ipmasq_works
SNAT changes the packet's source IP address to the node's internal IP address.
+
When this flag is set, GKE does not perform SNAT for packets sent to any destination.
You must set this flag if the cluster uses privately reused public IPs.
+
The --disable-default-snat flag is only applicable to private GKE clusters, which are
inherently VPC-native. Thus, --disable-default-snat requires that you also set
--enable-ip-alias and --enable-private-nodes`},{name:"--disk-size",description:"Size for node VM boot disks. Defaults to 100GB",args:{name:"DISK_SIZE",description:"Googlecloudsdk.calliope.arg_parsers:ParseWithBoundsChecking",suggestions:[]}},{name:"--disk-type",description:"Type of the node VM boot disk. Defaults to pd-standard. _DISK_TYPE_ must be one of: *pd-standard*, *pd-ssd*, *pd-balanced*",args:{name:"DISK_TYPE",description:"String",suggestions:["pd-standard","pd-ssd","pd-balanced"]}},{name:"--enable-autoprovisioning",description:`Enables  node autoprovisioning for a cluster.
+
Cluster Autoscaler will be able to create new node pools. Requires maximum CPU
and memory limits to be specified`,priority:100},{name:"--enable-autoprovisioning-autorepair",description:`Enable node autorepair for autoprovisioned node pools.
Use --no-enable-autoprovisioning-autorepair to disable`,priority:100},{name:"--enable-autoprovisioning-autoupgrade",description:`Enable node autoupgrade for autoprovisioned node pools.
Use --no-enable-autoprovisioning-autoupgrade to disable`,priority:100},{name:"--enable-autorepair",description:`Enable node autorepair feature for a cluster's default node pool(s).
+
  $ {command} example-cluster --enable-autorepair
+
Node autorepair is enabled by default for clusters using COS, COS_CONTAINERD, UBUNTU or UBUNTU_CONTAINERD
as a base image, use --no-enable-autorepair to disable.
+
See https://cloud.google.com/kubernetes-engine/docs/how-to/node-auto-repair for more info`},{name:"--enable-autoscaling",description:`Enables autoscaling for a node pool.
+
Enables autoscaling in the node pool specified by --node-pool or
the default node pool if --node-pool is not provided`},{name:"--enable-autoupgrade",description:`Sets autoupgrade feature for a cluster's default node pool(s).
+
  $ {command} example-cluster --enable-autoupgrade
+
See https://cloud.google.com/kubernetes-engine/docs/node-auto-upgrades for more info.
+
Enabled by default, use *--no-enable-autoupgrade* to disable`},{name:"--enable-basic-auth",description:'Enable basic (username/password) auth for the cluster.  `--enable-basic-auth` is\nan alias for `--username=admin`; `--no-enable-basic-auth` is an alias for\n`--username=""`. Use `--password` to specify a password; if not, the server will\nrandomly generate one. For cluster versions before 1.12, if neither\n`--enable-basic-auth` nor `--username` is specified, `--enable-basic-auth` will\ndefault to `true`. After 1.12, `--enable-basic-auth` will default to `false`'},{name:"--enable-binauthz",description:"Enable Binary Authorization for this cluster"},{name:"--enable-cloud-logging",description:"(DEPRECATED) Automatically send logs from the cluster to the Google Cloud Logging API. This flag is deprecated, use `--enable-stackdriver-kubernetes` instead.\n+\nFrom 1.14, legacy Stackdriver GKE logging is deprecated. Thus, flag `--enable-cloud-logging` is also deprecated. Please use `--enable-stackdriver-kubernetes` instead, to migrate to new Stackdriver Kubernetes Engine monitoring and logging. For more details, please read: https://cloud.google.com/monitoring/kubernetes-engine/migration"},{name:"--enable-cloud-monitoring",description:"(DEPRECATED) Automatically send metrics from pods in the cluster to the Google Cloud Monitoring API. VM metrics will be collected by Google Compute Engine regardless of this setting. This flag is deprecated, use `--enable-stackdriver-kubernetes` instead.\n+\nFrom 1.14, legacy Stackdriver GKE monitoring is deprecated. Thus, flag `--enable-cloud-monitoring` is also deprecated. Please use `--enable-stackdriver-kubernetes` instead, to migrate to new Stackdriver Kubernetes Engine monitoring and logging. For more details, please read: https://cloud.google.com/monitoring/kubernetes-engine/migration"},{name:"--enable-cloud-run-alpha",description:`Enable Cloud Run alpha features on this cluster. Selecting this
option will result in the cluster having all Cloud Run alpha API groups and
features turned on.
+
Cloud Run alpha clusters are not covered by the Cloud Run SLA and should not be
used for production workloads`},{name:"--enable-intra-node-visibility",description:`Enable Intra-node visibility for this cluster.
+
Enabling intra-node visibility makes your intra-node pod-to-pod traffic
visible to the networking fabric. With this feature, you can use VPC flow
logging or other VPC features for intra-node traffic.
+
Enabling it on an existing cluster causes the cluster
master and the cluster nodes to restart, which might cause a disruption`},{name:"--enable-ip-alias",description:`Enable use of alias IPs (https://cloud.google.com/compute/docs/alias-ip/)
for Pod IPs. This will require at least two secondary ranges in the
subnetwork, one for the pod IPs and another to reserve space for the
services range`},{name:"--enable-kubernetes-alpha",description:`Enable Kubernetes alpha features on this cluster. Selecting this
option will result in the cluster having all Kubernetes alpha API groups and
features turned on. Cluster upgrades (both manual and automatic) will be
disabled and the cluster will be automatically deleted after 30 days.
+
Alpha clusters are not covered by the Kubernetes Engine SLA and should not be
used for production workloads`},{name:"--enable-legacy-authorization",description:`Enables the legacy ABAC authentication for the cluster.
User rights are granted through the use of policies which combine attributes
together. For a detailed look at these properties and related formats, see
https://kubernetes.io/docs/admin/authorization/abac/. To use RBAC permissions
instead, create or update your cluster with the option
\`--no-enable-legacy-authorization\``},{name:"--enable-master-authorized-networks",description:`Allow only specified set of CIDR blocks (specified by the
\`--master-authorized-networks\` flag) to connect to Kubernetes master through
HTTPS. Besides these blocks, the following have access as well:
+
  1) The private network the cluster connects to if
  \`--enable-private-nodes\` is specified.
  2) Google Compute Engine Public IPs if \`--enable-private-nodes\` is not
  specified.
+
Use \`--no-enable-master-authorized-networks\` to disable. When disabled, public
internet (0.0.0.0/0) is allowed to connect to Kubernetes master through HTTPS`},{name:"--enable-master-global-access",description:`Use with private clusters to allow access to the master's private endpoint from any Google Cloud region or on-premises environment regardless of the
private cluster's region.
+
Must be used in conjunction with '--enable-ip-alias' and '--enable-private-nodes'`},{name:"--enable-network-egress-metering",description:`Enable network egress metering on this cluster.
+
When enabled, a DaemonSet is deployed into the cluster. Each DaemonSet pod
meters network egress traffic by collecting data from the conntrack table, and
exports the metered metrics to the specified destination.
+
Network egress metering is disabled if this flag is omitted, or when
\`--no-enable-network-egress-metering\` is set`},{name:"--enable-network-policy",description:"Enable network policy enforcement for this cluster. If you are enabling network policy on an existing cluster the network policy addon must first be enabled on the master by using --update-addons=NetworkPolicy=ENABLED flag"},{name:"--enable-private-endpoint",description:"Cluster is managed using the private IP address of the master API endpoint"},{name:"--enable-private-nodes",description:"Cluster is created with no public IP addresses on the cluster nodes"},{name:"--enable-resource-consumption-metering",description:`Enable resource consumption metering on this cluster.
+
When enabled, a table will be created in the specified BigQuery dataset to store
resource consumption data. The resulting table can be joined with the resource
usage table or with BigQuery billing export.
+
Resource consumption metering is enabled unless \`--no-enable-resource-
consumption-metering\` is set`},{name:"--enable-shielded-nodes",description:`Enable Shielded Nodes for this cluster. Enabling Shielded Nodes will enable a
more secure Node credential bootstrapping implementation. Starting with version
1.18, clusters will have shielded GKE nodes by default`},{name:"--enable-stackdriver-kubernetes",description:"Enable Stackdriver Kubernetes monitoring and logging"},{name:"--enable-tpu",description:"Enable Cloud TPUs for this cluster.\n+\nCan not be specified unless `--enable-ip-alias` is also specified"},{name:"--enable-vertical-pod-autoscaling",description:"Enable vertical pod autoscaling for a cluster"},{name:"--flags-file",description:`A YAML or JSON file that specifies a *--flag*:*value* dictionary.
Useful for specifying complex flag values with special characters
that work with any command interpreter. Additionally, each
*--flags-file* arg is replaced by its constituent flags. See
$ gcloud topic flags-file for more information`,args:{name:"YAML_FILE",description:"String",suggestions:[]}},{name:"--flatten",description:`Flatten _name_[] output resource slices in _KEY_ into separate records
for each item in each slice. Multiple keys and slices may be specified.
This also flattens keys for *--format* and *--filter*. For example,
*--flatten=abc.def* flattens *abc.def[].ghi* references to
*abc.def.ghi*. A resource record containing *abc.def[]* with N elements
will expand to N records in the flattened output. This flag interacts
with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--format",description:"Set the format for printing command output resources. The default is a\ncommand-specific human-friendly output format. The supported formats\nare: `config`, `csv`, `default`, `diff`, `disable`, `flattened`, `get`, `json`, `list`, `multi`, `none`, `object`, `table`, `text`, `value`, `yaml`. For more details run $ gcloud topic formats",args:{name:"FORMAT",description:"String",suggestions:[]}},{name:"--help",description:"Display detailed help"},{name:"--image-type",description:`The image type to use for the cluster. Defaults to server-specified.
+
Image Type specifies the base OS that the nodes in the cluster will run on.
If an image type is specified, that will be assigned to the cluster and all
future upgrades will use the specified image type. If it is not specified the
server will pick the default image type.
+
The default image type and the list of valid image types are available
using the following command.
+
  $ gcloud container get-server-config`,args:{name:"IMAGE_TYPE",description:"String",suggestions:[]}},{name:"--impersonate-service-account",description:"For this gcloud invocation, all API requests will be made as the given service account instead of the currently selected account. This is done without needing to create, download, and activate a key for the account. In order to perform operations as the service account, your currently selected account must have an IAM role that includes the iam.serviceAccounts.getAccessToken permission for the service account. The roles/iam.serviceAccountTokenCreator role has this permission or you may create a custom role. Overrides the default *auth/impersonate_service_account* property value for this command invocation",args:{name:"SERVICE_ACCOUNT_EMAIL",description:"String",suggestions:[]}},{name:"--issue-client-certificate",description:`Issue a TLS client certificate with admin permissions.
+
When enabled, the certificate and private key pair will be present in
MasterAuth field of the Cluster object. For cluster versions before 1.12, a
client certificate will be issued by default. As of 1.12, client certificates
are disabled by default`},{name:"--labels",description:`Labels to apply to the Google Cloud resources in use by the Kubernetes Engine
cluster. These are unrelated to Kubernetes labels.
Example:
+
  $ {command} example-cluster --labels=label_a=value1,label_b=,label_c=value3`,args:{name:"KEY=VALUE",description:"Dict",suggestions:[]}},{name:"--local-ssd-count",description:`The number of local SSD disks to provision on each node, formatted and mounted
in the filesystem.
+
Local SSDs have a fixed 375 GB capacity per device. The number of disks that
can be attached to an instance is limited by the maximum number of disks
available on a machine, which differs by compute zone. See
https://cloud.google.com/compute/docs/disks/local-ssd for more information`,args:{name:"LOCAL_SSD_COUNT",description:"Int",suggestions:[]}},{name:"--log-http",description:"Log all HTTP server requests and responses to stderr. Overrides the default *core/log_http* property value for this command invocation"},{name:"--machine-type",description:'The type of machine to use for nodes. Defaults to e2-medium.\nThe list of predefined machine types is available using the following command:\n+\n  $ gcloud compute machine-types list\n+\nYou can also specify custom machine types with the string "custom-CPUS-RAM"\nwhere ```CPUS``` is the number of virtual CPUs and ```RAM``` is the amount of\nRAM in MiB.\n+\nFor example, to create a node pool using custom machines with 2 vCPUs and 12 GB\nof RAM:\n+\n  $ {command} high-mem-pool --machine-type=custom-2-12288',args:{name:"MACHINE_TYPE",description:"String",suggestions:[]}},{name:"--maintenance-window",description:`Set a time of day when you prefer maintenance to start on this cluster. For example:
+
  $ {command} example-cluster --maintenance-window=12:43
+
The time corresponds to the UTC time zone, and must be in HH:MM format.
+
Non-emergency maintenance will occur in the 4 hour block starting at the
specified time.
+
This is mutually exclusive with the recurring maintenance windows
and will overwrite any existing window. Compatible with maintenance
exclusions`,args:{name:"START_TIME",description:"Googlecloudsdk.calliope.arg_parsers:Parse",suggestions:[]}},{name:"--maintenance-window-end",description:`End time of the first window (can occur in the past). Must take place after the
start time. The difference in start and end time specifies the length of each
recurrence. See $ gcloud topic datetimes for information on time formats`,args:{name:"TIME_STAMP",description:"Googlecloudsdk.calliope.arg_parsers:Parse",suggestions:[]},priority:100},{name:"--maintenance-window-recurrence",description:`An RFC 5545 RRULE, specifying how the window will recur. Note that minimum
requirements for maintenance periods will be enforced. Note that FREQ=SECONDLY,
MINUTELY, and HOURLY are not supported`,args:{name:"RRULE",description:"String",suggestions:[]},priority:100},{name:"--maintenance-window-start",description:`Start time of the first window (can occur in the past). The start time
influences when the window will start for recurrences. See $ gcloud topic
datetimes for information on time formats`,args:{name:"TIME_STAMP",description:"Googlecloudsdk.calliope.arg_parsers:Parse",suggestions:[]},priority:100},{name:"--master-authorized-networks",description:"The list of CIDR blocks (up to 100 for private cluster, 50 for public cluster) that are allowed to connect to Kubernetes master through HTTPS. Specified in CIDR notation (e.g. 1.2.3.4/30). Cannot be specified unless `--enable-master-authorized-networks` is also specified",args:{name:"NETWORK",description:"List",suggestions:[]}},{name:"--master-ipv4-cidr",description:"IPv4 CIDR range to use for the master network.  This should have a netmask of size /28 and should be used in conjunction with the --enable-private-nodes flag",args:{name:"MASTER_IPV4_CIDR",description:"String",suggestions:[]}},{name:"--max-accelerator",description:`Sets maximum limit for a single type of accelerators (e.g. GPUs) in cluster.
+
*type*::: (Required) The specific type (e.g. nvidia-tesla-k80 for nVidia Tesla K80)
of accelerator for which the limit is set. Use \`\`\`gcloud compute
accelerator-types list\`\`\` to learn about all available accelerator types.
+
*count*::: (Required) The maximum number of accelerators
to which the cluster can be scaled`,args:{name:"type=TYPE,count=COUNT",description:"Dict",suggestions:[]},priority:100},{name:"--max-cpu",description:`Maximum number of cores in the cluster.
+
Maximum number of cores to which the cluster can scale`,args:{name:"MAX_CPU",description:"String",suggestions:[]},priority:100},{name:"--max-memory",description:`Maximum memory in the cluster.
+
Maximum number of gigabytes of memory to which the cluster can scale`,args:{name:"MAX_MEMORY",description:"String",suggestions:[]},priority:100},{name:"--max-nodes",description:`Maximum number of nodes in the node pool.
+
Maximum number of nodes to which the node pool specified by --node-pool
(or default node pool if unspecified) can scale. Ignored unless
--enable-autoscaling is also specified`,args:{name:"MAX_NODES",description:"String",suggestions:[]}},{name:"--max-nodes-per-pool",description:"The maximum number of nodes to allocate per default initial node pool. Kubernetes Engine will automatically create enough nodes pools such that each node pool contains less than `--max-nodes-per-pool` nodes. Defaults to 1000 nodes, but can be set as low as 100 nodes per pool on initial create",args:{name:"MAX_NODES_PER_POOL",description:"Googlecloudsdk.calliope.arg_parsers:Parse",suggestions:[]}},{name:"--max-pods-per-node",description:`The max number of pods per node for this node pool.
+
This flag sets the maximum number of pods that can be run at the same time on a
node. This will override the value given with --default-max-pods-per-node flag
set at the cluster level.
+
Must be used in conjunction with '--enable-ip-alias'`,args:{name:"MAX_PODS_PER_NODE",description:"String",suggestions:[]}},{name:"--max-surge-upgrade",description:`Number of extra (surge) nodes to be created on each upgrade of a node pool.
+
Specifies the number of extra (surge) nodes to be created during this node
pool's upgrades. For example, running the following command will result in
creating an extra node each time the node pool is upgraded:
+
  $ {command} example-cluster --max-surge-upgrade=1 --max-unavailable-upgrade=0
+
Must be used in conjunction with '--max-unavailable-upgrade'`,args:{name:"MAX_SURGE_UPGRADE",description:"String",suggestions:[]}},{name:"--max-unavailable-upgrade",description:`Number of nodes that can be unavailable at the same time on each upgrade of a
node pool.
+
Specifies the number of nodes that can be unavailable at the same time while
this node pool is being upgraded. For example, running the following command
will result in having 3 nodes being upgraded in parallel (1 + 2), but keeping
always at least 3 (5 - 2) available each time the node pool is upgraded:
+
   $ {command} example-cluster --num-nodes=5 --max-surge-upgrade=1      --max-unavailable-upgrade=2
+
Must be used in conjunction with '--max-surge-upgrade'`,args:{name:"MAX_UNAVAILABLE_UPGRADE",description:"String",suggestions:[]}},{name:"--metadata",description:`Compute Engine metadata to be made available to the guest operating system
running on nodes within the node pool.
+
Each metadata entry is a key/value pair separated by an equals sign.
Metadata keys must be unique and less than 128 bytes in length. Values
must be less than or equal to 32,768 bytes in length. The total size of
all keys and values must be less than 512 KB. Multiple arguments can be
passed to this flag. For example:
+
\`\`--metadata key-1=value-1,key-2=value-2,key-3=value-3''
+
Additionally, the following keys are reserved for use by Kubernetes
Engine:
+
* \`\`cluster-location''
* \`\`cluster-name''
* \`\`cluster-uid''
* \`\`configure-sh''
* \`\`enable-os-login''
* \`\`gci-update-strategy''
* \`\`gci-ensure-gke-docker''
* \`\`instance-template''
* \`\`kube-env''
* \`\`startup-script''
* \`\`user-data''
+
Google Kubernetes Engine sets the following keys by default:
+
* \`\`serial-port-logging-enable''
+
See also Compute Engine's
link:https://cloud.google.com/compute/docs/storing-retrieving-metadata[documentation]
on storing and retrieving instance metadata`,args:{name:"KEY=VALUE",description:"Dict",suggestions:[]}},{name:"--metadata-from-file",description:"Same as ``--metadata'' except that the value for the entry will\nbe read from a local file",args:{name:"KEY=LOCAL_FILE_PATH",description:"Dict",suggestions:[]}},{name:"--min-accelerator",description:`Sets minimum limit for a single type of accelerators (e.g. GPUs) in cluster. Defaults
to 0 for all accelerator types if it isn't set.
+
*type*::: (Required) The specific type (e.g. nvidia-tesla-k80 for nVidia Tesla K80)
of accelerator for which the limit is set. Use \`\`\`gcloud compute
accelerator-types list\`\`\` to learn about all available accelerator types.
+
*count*::: (Required) The minimum number of accelerators
to which the cluster can be scaled`,args:{name:"type=TYPE,count=COUNT",description:"Dict",suggestions:[]}},{name:"--min-cpu",description:`Minimum number of cores in the cluster.
+
Minimum number of cores to which the cluster can scale`,args:{name:"MIN_CPU",description:"String",suggestions:[]}},{name:"--min-cpu-platform",description:`When specified, the nodes for the new cluster's default node pool will be
scheduled on host with specified CPU architecture or a newer one.
+
Examples:
+
  $ {command} example-cluster --min-cpu-platform=PLATFORM
+
To list available CPU platforms in given zone, run:
+
  $ gcloud beta compute zones describe ZONE --format="value(availableCpuPlatforms)"
+
CPU platform selection is available only in selected zones`,args:{name:"PLATFORM",description:"String",suggestions:[]}},{name:"--min-memory",description:`Minimum memory in the cluster.
+
Minimum number of gigabytes of memory to which the cluster can scale`,args:{name:"MIN_MEMORY",description:"String",suggestions:[]}},{name:"--min-nodes",description:`Minimum number of nodes in the node pool.
+
Minimum number of nodes to which the node pool specified by --node-pool
(or default node pool if unspecified) can scale. Ignored unless
--enable-autoscaling is also specified`,args:{name:"MIN_NODES",description:"String",suggestions:[]}},{name:"--network",description:"The Compute Engine Network that the cluster will connect to. Google Kubernetes Engine will use this network when creating routes and firewalls for the clusters. Defaults to the 'default' network",args:{name:"NETWORK",description:"String",suggestions:[]}},{name:"--node-labels",description:`Applies the given kubernetes labels on all nodes in the new node pool. Example:
+
  $ {command} example-cluster --node-labels=label-a=value1,label-2=value2
+
New nodes, including ones created by resize or recreate, will have these labels
on the kubernetes API node object and can be used in nodeSelectors.
See [](http://kubernetes.io/docs/user-guide/node-selection/) for examples.
+
Note that kubernetes labels, intended to associate cluster components
and resources with one another and manage resource lifecycles, are different
from Kubernetes Engine labels that are used for the purpose of tracking billing
and usage information`,args:{name:"NODE_LABEL",description:"Dict",suggestions:[]}},{name:"--node-locations",description:`The set of zones in which the specified node footprint should be replicated.
All zones must be in the same region as the cluster's master(s), specified by
the \`--zone\` or \`--region\` flag. Additionally, for zonal clusters,
\`--node-locations\` must contain the cluster's primary zone. If not specified,
all nodes will be in the cluster's primary zone (for zonal clusters) or spread
across three randomly chosen zones within the cluster's region (for regional
clusters).
+
Note that \`NUM_NODES\` nodes will be created in each zone, such that if you
specify \`--num-nodes=4\` and choose two locations, 8 nodes will be created.
+
Multiple locations can be specified, separated by commas. For example:
+
  $ {command} example-cluster --zone us-central1-a --node-locations us-central1-a,us-central1-b`,args:{name:"ZONE",description:"List",suggestions:[]}},{name:"--node-taints",description:`Applies the given kubernetes taints on all nodes in default node pool(s) in new cluster, which can be used with tolerations for pod scheduling. Example:
+
  $ {command} example-cluster --node-taints=key1=val1:NoSchedule,key2=val2:PreferNoSchedule
+
Note, this feature uses \`gcloud beta\` commands. To use gcloud beta commands,
you must configure \`gcloud\` to use the v1beta1 API as described here: https://cloud.google.com/kubernetes-engine/docs/reference/api-organization#beta.
To read more about node-taints, see https://cloud.google.com/kubernetes-engine/docs/node-taints`,args:{name:"NODE_TAINT",description:"Dict",suggestions:[]}},{name:"--node-version",description:`The Kubernetes version to use for nodes. Defaults to server-specified.
+
The default Kubernetes version is available using the following command.
+
  $ gcloud container get-server-config`,args:{name:"NODE_VERSION",description:"String",suggestions:[]}},{name:"--num-nodes",description:"The number of nodes to be created in each of the cluster's zones",args:{name:"NUM_NODES",description:"Int",suggestions:[]}},{name:"--password",description:"The password to use for cluster auth. Defaults to a server-specified randomly-generated string",args:{name:"PASSWORD",description:"String",suggestions:[]}},{name:"--preemptible",description:`Create nodes using preemptible VM instances in the new cluster.
+
  $ {command} example-cluster --preemptible
+
New nodes, including ones created by resize or recreate, will use preemptible
VM instances. See https://cloud.google.com/kubernetes-engine/docs/preemptible-vm
for more information on how to use Preemptible VMs with Kubernetes Engine`},{name:"--project",description:"The Google Cloud Platform project ID to use for this invocation. If\nomitted, then the current project is assumed; the current project can\nbe listed using `gcloud config list --format='text(core.project)'`\nand can be set using `gcloud config set project PROJECTID`.\n+\n`--project` and its fallback `core/project` property play two roles\nin the invocation. It specifies the project of the resource to\noperate on. It also specifies the project for API enablement check,\nquota, and billing. To specify a different project for quota and\nbilling, use `--billing-project` or `billing/quota_project` property",args:{name:"PROJECT_ID",description:"String",suggestions:[]}},{name:"--quiet",description:`Disable all interactive prompts when running gcloud commands. If input
is required, defaults will be used, or an error will be raised.
Overrides the default core/disable_prompts property value for this
command invocation. This is equivalent to setting the environment
variable \`CLOUDSDK_CORE_DISABLE_PROMPTS\` to 1`},{name:"--region",description:"Compute region (e.g. us-central1) for the cluster",args:{name:"REGION",description:"String",suggestions:[]}},{name:"--release-channel",description:`Release channel a cluster is subscribed to.
+
When a cluster is subscribed to a release channel, Google maintains
both the master version and the node version. Node auto-upgrade
defaults to true and cannot be disabled.
+
_CHANNEL_ must be one of:
+
*None*::: Use 'None' to opt-out of any release channel.
+
*rapid*::: 'rapid' channel is offered on an early access basis for customers who want
to test new releases.
+
WARNING: Versions available in the 'rapid' channel may be subject to
unresolved issues with no known workaround and are not subject to any
SLAs.
+
*regular*::: Clusters subscribed to 'regular' receive versions that are considered GA
quality. 'regular' is intended for production users who want to take
advantage of new features.
+
*stable*::: Clusters subscribed to 'stable' receive versions that are known to be
stable and reliable in production.
+
:::
+`,args:{name:"CHANNEL",description:"String",suggestions:["None","rapid","regular","stable"]}},{name:"--reservation",description:"The name of the reservation, required when `--reservation-affinity=specific`",args:{name:"RESERVATION",description:"String",suggestions:[]}},{name:"--reservation-affinity",description:"The type of the reservation for the default initial node pool. _RESERVATION_AFFINITY_ must be one of: *any*, *none*, *specific*",args:{name:"RESERVATION_AFFINITY",description:"String",suggestions:["any","none","specific"]}},{name:"--resource-usage-bigquery-dataset",description:`The name of the BigQuery dataset to which the cluster's usage of cloud
resources is exported. A table will be created in the specified dataset to
store cluster resource usage. The resulting table can be joined with BigQuery
Billing Export to produce a fine-grained cost breakdown.
+
Example:
+
  $ {command} example-cluster --resource-usage-bigquery-dataset=example_bigquery_dataset_name`,args:{name:"RESOURCE_USAGE_BIGQUERY_DATASET",description:"String",suggestions:[]}},{name:"--scopes",description:`Specifies scopes for the node instances. Examples:
+
  $ {command} example-cluster --scopes=https://www.googleapis.com/auth/devstorage.read_only
+
  $ {command} example-cluster --scopes=bigquery,storage-rw,compute-ro
+
Multiple SCOPEs can be specified, separated by commas. \`logging-write\`
and/or \`monitoring\` are added unless Cloud Logging and/or Cloud Monitoring
are disabled (see \`--enable-cloud-logging\` and \`--enable-cloud-monitoring\`
for more information).
SCOPE can be either the full URI of the scope or an alias. *default* scopes are
assigned to all instances. Available aliases are:
+
Alias | URI
--- | ---
bigquery | https://www.googleapis.com/auth/bigquery
cloud-platform | https://www.googleapis.com/auth/cloud-platform
cloud-source-repos | https://www.googleapis.com/auth/source.full_control
cloud-source-repos-ro | https://www.googleapis.com/auth/source.read_only
compute-ro | https://www.googleapis.com/auth/compute.readonly
compute-rw | https://www.googleapis.com/auth/compute
datastore | https://www.googleapis.com/auth/datastore
default | https://www.googleapis.com/auth/devstorage.read_only
| https://www.googleapis.com/auth/logging.write
| https://www.googleapis.com/auth/monitoring.write
| https://www.googleapis.com/auth/pubsub
| https://www.googleapis.com/auth/service.management.readonly
| https://www.googleapis.com/auth/servicecontrol
| https://www.googleapis.com/auth/trace.append
gke-default | https://www.googleapis.com/auth/devstorage.read_only
| https://www.googleapis.com/auth/logging.write
| https://www.googleapis.com/auth/monitoring
| https://www.googleapis.com/auth/service.management.readonly
| https://www.googleapis.com/auth/servicecontrol
| https://www.googleapis.com/auth/trace.append
logging-write | https://www.googleapis.com/auth/logging.write
monitoring | https://www.googleapis.com/auth/monitoring
monitoring-read | https://www.googleapis.com/auth/monitoring.read
monitoring-write | https://www.googleapis.com/auth/monitoring.write
pubsub | https://www.googleapis.com/auth/pubsub
service-control | https://www.googleapis.com/auth/servicecontrol
service-management | https://www.googleapis.com/auth/service.management.readonly
sql (deprecated) | https://www.googleapis.com/auth/sqlservice
sql-admin | https://www.googleapis.com/auth/sqlservice.admin
storage-full | https://www.googleapis.com/auth/devstorage.full_control
storage-ro | https://www.googleapis.com/auth/devstorage.read_only
storage-rw | https://www.googleapis.com/auth/devstorage.read_write
taskqueue | https://www.googleapis.com/auth/taskqueue
trace | https://www.googleapis.com/auth/trace.append
userinfo-email | https://www.googleapis.com/auth/userinfo.email
+
DEPRECATION WARNING: https://www.googleapis.com/auth/sqlservice account scope
and \`sql\` alias do not provide SQL instance management capabilities and have
been deprecated. Please, use https://www.googleapis.com/auth/sqlservice.admin
or \`sql-admin\` to manage your Google SQL Service instances.
+`,args:{name:"SCOPE",description:"List",suggestions:[]}},{name:"--service-account",description:"The Google Cloud Platform Service Account to be used by the node VMs. If a service account is specified, the cloud-platform and userinfo.email scopes are used. If no Service Account is specified, the project default service account is used",args:{name:"SERVICE_ACCOUNT",description:"String",suggestions:[]}},{name:"--services-ipv4-cidr",description:`Set the IP range for the services IPs.
+
Can be specified as a netmask size (e.g. '/20') or as in CIDR notion
(e.g. '10.100.0.0/20'). If given as a netmask size, the IP range will
be chosen automatically from the available space in the network.
+
If unspecified, the services CIDR range will be chosen with a default
mask size.
+
Can not be specified unless '--enable-ip-alias' is also specified`,args:{name:"CIDR",description:"String",suggestions:[]}},{name:"--services-secondary-range-name",description:`Set the secondary range to be used for services (e.g. ClusterIPs).
NAME must be the name of an existing secondary range in the cluster
subnetwork.
+
Must be used in conjunction with '--enable-ip-alias'. Cannot be used
with --create-subnetwork`,args:{name:"NAME",description:"String",suggestions:[]}},{name:"--shielded-integrity-monitoring",description:`Enables monitoring and attestation of the boot integrity of the
instance. The attestation is performed against the integrity policy
baseline. This baseline is initially derived from the implicitly
trusted boot image when the instance is created`},{name:"--shielded-secure-boot",description:"The instance will boot with secure boot enabled"},{name:"--subnetwork",description:`The Google Compute Engine subnetwork
(https://cloud.google.com/compute/docs/subnetworks) to which the cluster is
connected. The subnetwork must belong to the network specified by --network.
+
Cannot be used with the "--create-subnetwork" option`,args:{name:"SUBNETWORK",description:"String",suggestions:[]}},{name:"--tags",description:`Applies the given Compute Engine tags (comma separated) on all nodes in the new
node-pool. Example:
+
  $ {command} example-cluster --tags=tag1,tag2
+
New nodes, including ones created by resize or recreate, will have these tags
on the Compute Engine API instance object and can be used in firewall rules.
See https://cloud.google.com/sdk/gcloud/reference/compute/firewall-rules/create
for examples`,args:{name:"TAG",description:"List",suggestions:[]}},{name:"--tpu-ipv4-cidr",description:`Set the IP range for the Cloud TPUs.
+
Can be specified as a netmask size (e.g. '/20') or as in CIDR notion
(e.g. '10.100.0.0/20'). If given as a netmask size, the IP range will be chosen
automatically from the available space in the network.
+
If unspecified, the TPU CIDR range will use automatic default '/20'.
+
Can not be specified unless '--enable-tpu' and '--enable-ip-alias' are also
specified`,args:{name:"CIDR",description:"String",suggestions:[]}},{name:"--trace-token",description:"Token used to route traces of service requests for investigation of issues. Overrides the default *core/trace_token* property value for this command invocation",args:{name:"TRACE_TOKEN",description:"String",suggestions:[]}},{name:"--user-output-enabled",description:"Print user intended output to the console. Overrides the default *core/user_output_enabled* property value for this command invocation. Use *--no-user-output-enabled* to disable"},{name:"--username",description:"The user name to use for basic auth for the cluster. Use `--password` to specify\na password; if not, the server will randomly generate one",args:{name:"USERNAME",description:"String",suggestions:[]}},{name:"--verbosity",description:"Override the default verbosity for this command. Overrides the default *core/verbosity* property value for this command invocation. _VERBOSITY_ must be one of: *debug*, *info*, *warning*, *error*, *critical*, *none*",args:{name:"VERBOSITY",description:"String",suggestions:["debug","info","warning","error","critical","none"]}},{name:"--workload-metadata",description:`Type of metadata server available to pods running in the node pool. _WORKLOAD_METADATA_ must be one of:
+
*GCE_METADATA*::: Pods running in this node pool have access to the node's underlying Compute Engine Metadata Server.
*GKE_METADATA*::: Run the Kubernetes Engine Metadata Server on this node. The Kubernetes Engine Metadata Server exposes a metadata API to workloads that is compatible with the V1 Compute Metadata APIs exposed by the Compute Engine and App Engine Metadata Servers. This feature can only be enabled if Workload Identity is enabled at the cluster level.
:::
+`,args:{name:"WORKLOAD_METADATA",description:"Googlecloudsdk.command_lib.container.flags:<lambda>",suggestions:["GCE_METADATA","GKE_METADATA"]}},{name:"--workload-pool",description:`Enable Workload Identity on the cluster.
+
When enabled, Kubernetes service accounts will be able to act as Cloud IAM
Service Accounts, through the provided workload pool.
+
Currently, the only accepted workload pool is the workload pool of
the Cloud project containing the cluster, \`PROJECT_ID.svc.id.goog\`.
+
For more information on Workload Identity, see
+
            https://cloud.google.com/kubernetes-engine/docs/how-to/workload-identity`,args:{name:"WORKLOAD_POOL",description:"Googlecloudsdk.calliope.arg_parsers:Parse",suggestions:[]}},{name:"--zone",description:"Compute zone (e.g. us-central1-a) for the cluster. Overrides the default *compute/zone* property value for this command invocation",args:{name:"ZONE",description:"String",suggestions:[]}}],args:{name:"NAME",description:`The name of the cluster to create.
+
The name may contain only lowercase alphanumerics and '-', must start with a
letter and end with an alphanumeric, and must be no longer than 40
characters`}},{name:"delete",description:"Delete an existing cluster for running containers",options:[{name:"--account",description:"Google Cloud Platform user account to use for invocation. Overrides the default *core/account* property value for this command invocation",args:{name:"ACCOUNT",description:"String",suggestions:[]}},{name:"--async",description:`Return immediately, without waiting for the operation in progress to
complete`},{name:"--billing-project",description:"The Google Cloud Platform project that will be charged quota for operations performed in gcloud. If you need to operate on one project, but need quota against a different project, you can use this flag to specify the billing project. If both `billing/quota_project` and `--billing-project` are specified, `--billing-project` takes precedence. Run `$ gcloud config set --help` to see more information about `billing/quota_project`",args:{name:"BILLING_PROJECT",description:"String",suggestions:[]}},{name:"--configuration",description:`The configuration to use for this command invocation. For more
information on how to use configurations, run:
\`gcloud topic configurations\`.  You can also use the CLOUDSDK_ACTIVE_CONFIG_NAME environment
variable to set the equivalent of this flag for a terminal
session`,args:{name:"CONFIGURATION",description:"String",suggestions:[]}},{name:"--flags-file",description:`A YAML or JSON file that specifies a *--flag*:*value* dictionary.
Useful for specifying complex flag values with special characters
that work with any command interpreter. Additionally, each
*--flags-file* arg is replaced by its constituent flags. See
$ gcloud topic flags-file for more information`,args:{name:"YAML_FILE",description:"String",suggestions:[]}},{name:"--flatten",description:`Flatten _name_[] output resource slices in _KEY_ into separate records
for each item in each slice. Multiple keys and slices may be specified.
This also flattens keys for *--format* and *--filter*. For example,
*--flatten=abc.def* flattens *abc.def[].ghi* references to
*abc.def.ghi*. A resource record containing *abc.def[]* with N elements
will expand to N records in the flattened output. This flag interacts
with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--format",description:"Set the format for printing command output resources. The default is a\ncommand-specific human-friendly output format. The supported formats\nare: `config`, `csv`, `default`, `diff`, `disable`, `flattened`, `get`, `json`, `list`, `multi`, `none`, `object`, `table`, `text`, `value`, `yaml`. For more details run $ gcloud topic formats",args:{name:"FORMAT",description:"String",suggestions:[]}},{name:"--help",description:"Display detailed help"},{name:"--impersonate-service-account",description:"For this gcloud invocation, all API requests will be made as the given service account instead of the currently selected account. This is done without needing to create, download, and activate a key for the account. In order to perform operations as the service account, your currently selected account must have an IAM role that includes the iam.serviceAccounts.getAccessToken permission for the service account. The roles/iam.serviceAccountTokenCreator role has this permission or you may create a custom role. Overrides the default *auth/impersonate_service_account* property value for this command invocation",args:{name:"SERVICE_ACCOUNT_EMAIL",description:"String",suggestions:[]}},{name:"--log-http",description:"Log all HTTP server requests and responses to stderr. Overrides the default *core/log_http* property value for this command invocation"},{name:"--project",description:"The Google Cloud Platform project ID to use for this invocation. If\nomitted, then the current project is assumed; the current project can\nbe listed using `gcloud config list --format='text(core.project)'`\nand can be set using `gcloud config set project PROJECTID`.\n+\n`--project` and its fallback `core/project` property play two roles\nin the invocation. It specifies the project of the resource to\noperate on. It also specifies the project for API enablement check,\nquota, and billing. To specify a different project for quota and\nbilling, use `--billing-project` or `billing/quota_project` property",args:{name:"PROJECT_ID",description:"String",suggestions:[]}},{name:"--quiet",description:`Disable all interactive prompts when running gcloud commands. If input
is required, defaults will be used, or an error will be raised.
Overrides the default core/disable_prompts property value for this
command invocation. This is equivalent to setting the environment
variable \`CLOUDSDK_CORE_DISABLE_PROMPTS\` to 1`},{name:"--region",description:"Compute region (e.g. us-central1) for the cluster",args:{name:"REGION",description:"String",suggestions:[]}},{name:"--trace-token",description:"Token used to route traces of service requests for investigation of issues. Overrides the default *core/trace_token* property value for this command invocation",args:{name:"TRACE_TOKEN",description:"String",suggestions:[]}},{name:"--user-output-enabled",description:"Print user intended output to the console. Overrides the default *core/user_output_enabled* property value for this command invocation. Use *--no-user-output-enabled* to disable"},{name:"--verbosity",description:"Override the default verbosity for this command. Overrides the default *core/verbosity* property value for this command invocation. _VERBOSITY_ must be one of: *debug*, *info*, *warning*, *error*, *critical*, *none*",args:{name:"VERBOSITY",description:"String",suggestions:["debug","info","warning","error","critical","none"]}},{name:"--zone",description:"Compute zone (e.g. us-central1-a) for the cluster. Overrides the default *compute/zone* property value for this command invocation",args:{name:"ZONE",description:"String",suggestions:[]}}],args:{name:"NAME",description:"The names of the clusters to delete",isVariadic:!0}},{name:"describe",description:"Describe an existing cluster for running containers",options:[{name:"--account",description:"Google Cloud Platform user account to use for invocation. Overrides the default *core/account* property value for this command invocation",args:{name:"ACCOUNT",description:"String",suggestions:[]}},{name:"--billing-project",description:"The Google Cloud Platform project that will be charged quota for operations performed in gcloud. If you need to operate on one project, but need quota against a different project, you can use this flag to specify the billing project. If both `billing/quota_project` and `--billing-project` are specified, `--billing-project` takes precedence. Run `$ gcloud config set --help` to see more information about `billing/quota_project`",args:{name:"BILLING_PROJECT",description:"String",suggestions:[]}},{name:"--configuration",description:`The configuration to use for this command invocation. For more
information on how to use configurations, run:
\`gcloud topic configurations\`.  You can also use the CLOUDSDK_ACTIVE_CONFIG_NAME environment
variable to set the equivalent of this flag for a terminal
session`,args:{name:"CONFIGURATION",description:"String",suggestions:[]}},{name:"--flags-file",description:`A YAML or JSON file that specifies a *--flag*:*value* dictionary.
Useful for specifying complex flag values with special characters
that work with any command interpreter. Additionally, each
*--flags-file* arg is replaced by its constituent flags. See
$ gcloud topic flags-file for more information`,args:{name:"YAML_FILE",description:"String",suggestions:[]}},{name:"--flatten",description:`Flatten _name_[] output resource slices in _KEY_ into separate records
for each item in each slice. Multiple keys and slices may be specified.
This also flattens keys for *--format* and *--filter*. For example,
*--flatten=abc.def* flattens *abc.def[].ghi* references to
*abc.def.ghi*. A resource record containing *abc.def[]* with N elements
will expand to N records in the flattened output. This flag interacts
with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--format",description:"Set the format for printing command output resources. The default is a\ncommand-specific human-friendly output format. The supported formats\nare: `config`, `csv`, `default`, `diff`, `disable`, `flattened`, `get`, `json`, `list`, `multi`, `none`, `object`, `table`, `text`, `value`, `yaml`. For more details run $ gcloud topic formats",args:{name:"FORMAT",description:"String",suggestions:[]}},{name:"--help",description:"Display detailed help"},{name:"--impersonate-service-account",description:"For this gcloud invocation, all API requests will be made as the given service account instead of the currently selected account. This is done without needing to create, download, and activate a key for the account. In order to perform operations as the service account, your currently selected account must have an IAM role that includes the iam.serviceAccounts.getAccessToken permission for the service account. The roles/iam.serviceAccountTokenCreator role has this permission or you may create a custom role. Overrides the default *auth/impersonate_service_account* property value for this command invocation",args:{name:"SERVICE_ACCOUNT_EMAIL",description:"String",suggestions:[]}},{name:"--log-http",description:"Log all HTTP server requests and responses to stderr. Overrides the default *core/log_http* property value for this command invocation"},{name:"--project",description:"The Google Cloud Platform project ID to use for this invocation. If\nomitted, then the current project is assumed; the current project can\nbe listed using `gcloud config list --format='text(core.project)'`\nand can be set using `gcloud config set project PROJECTID`.\n+\n`--project` and its fallback `core/project` property play two roles\nin the invocation. It specifies the project of the resource to\noperate on. It also specifies the project for API enablement check,\nquota, and billing. To specify a different project for quota and\nbilling, use `--billing-project` or `billing/quota_project` property",args:{name:"PROJECT_ID",description:"String",suggestions:[]}},{name:"--quiet",description:`Disable all interactive prompts when running gcloud commands. If input
is required, defaults will be used, or an error will be raised.
Overrides the default core/disable_prompts property value for this
command invocation. This is equivalent to setting the environment
variable \`CLOUDSDK_CORE_DISABLE_PROMPTS\` to 1`},{name:"--region",description:"Compute region (e.g. us-central1) for the cluster",args:{name:"REGION",description:"String",suggestions:[]}},{name:"--trace-token",description:"Token used to route traces of service requests for investigation of issues. Overrides the default *core/trace_token* property value for this command invocation",args:{name:"TRACE_TOKEN",description:"String",suggestions:[]}},{name:"--user-output-enabled",description:"Print user intended output to the console. Overrides the default *core/user_output_enabled* property value for this command invocation. Use *--no-user-output-enabled* to disable"},{name:"--verbosity",description:"Override the default verbosity for this command. Overrides the default *core/verbosity* property value for this command invocation. _VERBOSITY_ must be one of: *debug*, *info*, *warning*, *error*, *critical*, *none*",args:{name:"VERBOSITY",description:"String",suggestions:["debug","info","warning","error","critical","none"]}},{name:"--zone",description:"Compute zone (e.g. us-central1-a) for the cluster. Overrides the default *compute/zone* property value for this command invocation",args:{name:"ZONE",description:"String",suggestions:[]}}],args:{name:"NAME",description:"The name of this cluster"}},{name:"get-credentials",description:"Fetch credentials for a running cluster",options:[{name:"--account",description:"Google Cloud Platform user account to use for invocation. Overrides the default *core/account* property value for this command invocation",args:{name:"ACCOUNT",description:"String",suggestions:[]}},{name:"--billing-project",description:"The Google Cloud Platform project that will be charged quota for operations performed in gcloud. If you need to operate on one project, but need quota against a different project, you can use this flag to specify the billing project. If both `billing/quota_project` and `--billing-project` are specified, `--billing-project` takes precedence. Run `$ gcloud config set --help` to see more information about `billing/quota_project`",args:{name:"BILLING_PROJECT",description:"String",suggestions:[]}},{name:"--configuration",description:`The configuration to use for this command invocation. For more
information on how to use configurations, run:
\`gcloud topic configurations\`.  You can also use the CLOUDSDK_ACTIVE_CONFIG_NAME environment
variable to set the equivalent of this flag for a terminal
session`,args:{name:"CONFIGURATION",description:"String",suggestions:[]}},{name:"--flags-file",description:`A YAML or JSON file that specifies a *--flag*:*value* dictionary.
Useful for specifying complex flag values with special characters
that work with any command interpreter. Additionally, each
*--flags-file* arg is replaced by its constituent flags. See
$ gcloud topic flags-file for more information`,args:{name:"YAML_FILE",description:"String",suggestions:[]}},{name:"--flatten",description:`Flatten _name_[] output resource slices in _KEY_ into separate records
for each item in each slice. Multiple keys and slices may be specified.
This also flattens keys for *--format* and *--filter*. For example,
*--flatten=abc.def* flattens *abc.def[].ghi* references to
*abc.def.ghi*. A resource record containing *abc.def[]* with N elements
will expand to N records in the flattened output. This flag interacts
with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--format",description:"Set the format for printing command output resources. The default is a\ncommand-specific human-friendly output format. The supported formats\nare: `config`, `csv`, `default`, `diff`, `disable`, `flattened`, `get`, `json`, `list`, `multi`, `none`, `object`, `table`, `text`, `value`, `yaml`. For more details run $ gcloud topic formats",args:{name:"FORMAT",description:"String",suggestions:[]}},{name:"--help",description:"Display detailed help"},{name:"--impersonate-service-account",description:"For this gcloud invocation, all API requests will be made as the given service account instead of the currently selected account. This is done without needing to create, download, and activate a key for the account. In order to perform operations as the service account, your currently selected account must have an IAM role that includes the iam.serviceAccounts.getAccessToken permission for the service account. The roles/iam.serviceAccountTokenCreator role has this permission or you may create a custom role. Overrides the default *auth/impersonate_service_account* property value for this command invocation",args:{name:"SERVICE_ACCOUNT_EMAIL",description:"String",suggestions:[]}},{name:"--internal-ip",description:"Whether to use the internal IP address of the cluster endpoint"},{name:"--log-http",description:"Log all HTTP server requests and responses to stderr. Overrides the default *core/log_http* property value for this command invocation"},{name:"--project",description:"The Google Cloud Platform project ID to use for this invocation. If\nomitted, then the current project is assumed; the current project can\nbe listed using `gcloud config list --format='text(core.project)'`\nand can be set using `gcloud config set project PROJECTID`.\n+\n`--project` and its fallback `core/project` property play two roles\nin the invocation. It specifies the project of the resource to\noperate on. It also specifies the project for API enablement check,\nquota, and billing. To specify a different project for quota and\nbilling, use `--billing-project` or `billing/quota_project` property",args:{name:"PROJECT_ID",description:"String",suggestions:[]}},{name:"--quiet",description:`Disable all interactive prompts when running gcloud commands. If input
is required, defaults will be used, or an error will be raised.
Overrides the default core/disable_prompts property value for this
command invocation. This is equivalent to setting the environment
variable \`CLOUDSDK_CORE_DISABLE_PROMPTS\` to 1`},{name:"--region",description:"Compute region (e.g. us-central1) for the cluster",args:{name:"REGION",description:"String",suggestions:[]}},{name:"--trace-token",description:"Token used to route traces of service requests for investigation of issues. Overrides the default *core/trace_token* property value for this command invocation",args:{name:"TRACE_TOKEN",description:"String",suggestions:[]}},{name:"--user-output-enabled",description:"Print user intended output to the console. Overrides the default *core/user_output_enabled* property value for this command invocation. Use *--no-user-output-enabled* to disable"},{name:"--verbosity",description:"Override the default verbosity for this command. Overrides the default *core/verbosity* property value for this command invocation. _VERBOSITY_ must be one of: *debug*, *info*, *warning*, *error*, *critical*, *none*",args:{name:"VERBOSITY",description:"String",suggestions:["debug","info","warning","error","critical","none"]}},{name:"--zone",description:"Compute zone (e.g. us-central1-a) for the cluster. Overrides the default *compute/zone* property value for this command invocation",args:{name:"ZONE",description:"String",suggestions:[]}}],args:{name:"NAME",description:"Name of the cluster to get credentials for. Overrides the default *container/cluster* property value for this command invocation"}},{name:"list",description:"List existing clusters for running containers",options:[{name:"--account",description:"Google Cloud Platform user account to use for invocation. Overrides the default *core/account* property value for this command invocation",args:{name:"ACCOUNT",description:"String",suggestions:[]}},{name:"--billing-project",description:"The Google Cloud Platform project that will be charged quota for operations performed in gcloud. If you need to operate on one project, but need quota against a different project, you can use this flag to specify the billing project. If both `billing/quota_project` and `--billing-project` are specified, `--billing-project` takes precedence. Run `$ gcloud config set --help` to see more information about `billing/quota_project`",args:{name:"BILLING_PROJECT",description:"String",suggestions:[]}},{name:"--configuration",description:`The configuration to use for this command invocation. For more
information on how to use configurations, run:
\`gcloud topic configurations\`.  You can also use the CLOUDSDK_ACTIVE_CONFIG_NAME environment
variable to set the equivalent of this flag for a terminal
session`,args:{name:"CONFIGURATION",description:"String",suggestions:[]}},{name:"--filter",description:`Apply a Boolean filter _EXPRESSION_ to each resource item to be listed.
If the expression evaluates \`True\`, then that item is listed. For more
details and examples of filter expressions, run $ gcloud topic filters. This
flag interacts with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"EXPRESSION",description:"String",suggestions:[]}},{name:"--flags-file",description:`A YAML or JSON file that specifies a *--flag*:*value* dictionary.
Useful for specifying complex flag values with special characters
that work with any command interpreter. Additionally, each
*--flags-file* arg is replaced by its constituent flags. See
$ gcloud topic flags-file for more information`,args:{name:"YAML_FILE",description:"String",suggestions:[]}},{name:"--flatten",description:`Flatten _name_[] output resource slices in _KEY_ into separate records
for each item in each slice. Multiple keys and slices may be specified.
This also flattens keys for *--format* and *--filter*. For example,
*--flatten=abc.def* flattens *abc.def[].ghi* references to
*abc.def.ghi*. A resource record containing *abc.def[]* with N elements
will expand to N records in the flattened output. This flag interacts
with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--format",description:"Set the format for printing command output resources. The default is a\ncommand-specific human-friendly output format. The supported formats\nare: `config`, `csv`, `default`, `diff`, `disable`, `flattened`, `get`, `json`, `list`, `multi`, `none`, `object`, `table`, `text`, `value`, `yaml`. For more details run $ gcloud topic formats",args:{name:"FORMAT",description:"String",suggestions:[]}},{name:"--help",description:"Display detailed help"},{name:"--impersonate-service-account",description:"For this gcloud invocation, all API requests will be made as the given service account instead of the currently selected account. This is done without needing to create, download, and activate a key for the account. In order to perform operations as the service account, your currently selected account must have an IAM role that includes the iam.serviceAccounts.getAccessToken permission for the service account. The roles/iam.serviceAccountTokenCreator role has this permission or you may create a custom role. Overrides the default *auth/impersonate_service_account* property value for this command invocation",args:{name:"SERVICE_ACCOUNT_EMAIL",description:"String",suggestions:[]}},{name:"--limit",description:`Maximum number of resources to list. The default is *unlimited*.
This flag interacts with other flags that are applied in this order:
*--flatten*, *--sort-by*, *--filter*, *--limit*`,args:{name:"LIMIT",description:"Googlecloudsdk.calliope.arg_parsers:Parse",suggestions:[]}},{name:"--log-http",description:"Log all HTTP server requests and responses to stderr. Overrides the default *core/log_http* property value for this command invocation"},{name:"--page-size",description:`Some services group resource list output into pages. This flag specifies
the maximum number of resources per page. The default is determined by the
service if it supports paging, otherwise it is *unlimited* (no paging).
Paging may be applied before or after *--filter* and *--limit* depending
on the service`,args:{name:"PAGE_SIZE",description:"Googlecloudsdk.calliope.arg_parsers:Parse",suggestions:[]}},{name:"--project",description:"The Google Cloud Platform project ID to use for this invocation. If\nomitted, then the current project is assumed; the current project can\nbe listed using `gcloud config list --format='text(core.project)'`\nand can be set using `gcloud config set project PROJECTID`.\n+\n`--project` and its fallback `core/project` property play two roles\nin the invocation. It specifies the project of the resource to\noperate on. It also specifies the project for API enablement check,\nquota, and billing. To specify a different project for quota and\nbilling, use `--billing-project` or `billing/quota_project` property",args:{name:"PROJECT_ID",description:"String",suggestions:[]}},{name:"--quiet",description:`Disable all interactive prompts when running gcloud commands. If input
is required, defaults will be used, or an error will be raised.
Overrides the default core/disable_prompts property value for this
command invocation. This is equivalent to setting the environment
variable \`CLOUDSDK_CORE_DISABLE_PROMPTS\` to 1`},{name:"--region",description:"Compute region (e.g. us-central1) for the cluster",args:{name:"REGION",description:"String",suggestions:[]}},{name:"--sort-by",description:`Comma-separated list of resource field key names to sort by. The
default order is ascending. Prefix a field with \`\`~'' for descending
order on that field. This flag interacts with other flags that are applied
in this order: *--flatten*, *--sort-by*, *--filter*, *--limit*`,args:{name:"FIELD",description:"List",suggestions:[]}},{name:"--trace-token",description:"Token used to route traces of service requests for investigation of issues. Overrides the default *core/trace_token* property value for this command invocation",args:{name:"TRACE_TOKEN",description:"String",suggestions:[]}},{name:"--uri",description:"Print a list of resource URIs instead of the default output"},{name:"--user-output-enabled",description:"Print user intended output to the console. Overrides the default *core/user_output_enabled* property value for this command invocation. Use *--no-user-output-enabled* to disable"},{name:"--verbosity",description:"Override the default verbosity for this command. Overrides the default *core/verbosity* property value for this command invocation. _VERBOSITY_ must be one of: *debug*, *info*, *warning*, *error*, *critical*, *none*",args:{name:"VERBOSITY",description:"String",suggestions:["debug","info","warning","error","critical","none"]}},{name:"--zone",description:"Compute zone (e.g. us-central1-a) for the cluster. Overrides the default *compute/zone* property value for this command invocation",args:{name:"ZONE",description:"String",suggestions:[]}}]},{name:"resize",description:"Resizes an existing cluster for running containers",options:[{name:"--account",description:"Google Cloud Platform user account to use for invocation. Overrides the default *core/account* property value for this command invocation",args:{name:"ACCOUNT",description:"String",suggestions:[]}},{name:"--async",description:`Return immediately, without waiting for the operation in progress to
complete`},{name:"--billing-project",description:"The Google Cloud Platform project that will be charged quota for operations performed in gcloud. If you need to operate on one project, but need quota against a different project, you can use this flag to specify the billing project. If both `billing/quota_project` and `--billing-project` are specified, `--billing-project` takes precedence. Run `$ gcloud config set --help` to see more information about `billing/quota_project`",args:{name:"BILLING_PROJECT",description:"String",suggestions:[]}},{name:"--configuration",description:`The configuration to use for this command invocation. For more
information on how to use configurations, run:
\`gcloud topic configurations\`.  You can also use the CLOUDSDK_ACTIVE_CONFIG_NAME environment
variable to set the equivalent of this flag for a terminal
session`,args:{name:"CONFIGURATION",description:"String",suggestions:[]}},{name:"--flags-file",description:`A YAML or JSON file that specifies a *--flag*:*value* dictionary.
Useful for specifying complex flag values with special characters
that work with any command interpreter. Additionally, each
*--flags-file* arg is replaced by its constituent flags. See
$ gcloud topic flags-file for more information`,args:{name:"YAML_FILE",description:"String",suggestions:[]}},{name:"--flatten",description:`Flatten _name_[] output resource slices in _KEY_ into separate records
for each item in each slice. Multiple keys and slices may be specified.
This also flattens keys for *--format* and *--filter*. For example,
*--flatten=abc.def* flattens *abc.def[].ghi* references to
*abc.def.ghi*. A resource record containing *abc.def[]* with N elements
will expand to N records in the flattened output. This flag interacts
with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--format",description:"Set the format for printing command output resources. The default is a\ncommand-specific human-friendly output format. The supported formats\nare: `config`, `csv`, `default`, `diff`, `disable`, `flattened`, `get`, `json`, `list`, `multi`, `none`, `object`, `table`, `text`, `value`, `yaml`. For more details run $ gcloud topic formats",args:{name:"FORMAT",description:"String",suggestions:[]}},{name:"--help",description:"Display detailed help"},{name:"--impersonate-service-account",description:"For this gcloud invocation, all API requests will be made as the given service account instead of the currently selected account. This is done without needing to create, download, and activate a key for the account. In order to perform operations as the service account, your currently selected account must have an IAM role that includes the iam.serviceAccounts.getAccessToken permission for the service account. The roles/iam.serviceAccountTokenCreator role has this permission or you may create a custom role. Overrides the default *auth/impersonate_service_account* property value for this command invocation",args:{name:"SERVICE_ACCOUNT_EMAIL",description:"String",suggestions:[]}},{name:"--log-http",description:"Log all HTTP server requests and responses to stderr. Overrides the default *core/log_http* property value for this command invocation"},{name:"--node-pool",description:"The node pool to resize",args:{name:"NODE_POOL",description:"String",suggestions:[]}},{name:"--num-nodes",description:"Target number of nodes in the cluster",args:{name:"NUM_NODES",description:"String",suggestions:[]}},{name:"--project",description:"The Google Cloud Platform project ID to use for this invocation. If\nomitted, then the current project is assumed; the current project can\nbe listed using `gcloud config list --format='text(core.project)'`\nand can be set using `gcloud config set project PROJECTID`.\n+\n`--project` and its fallback `core/project` property play two roles\nin the invocation. It specifies the project of the resource to\noperate on. It also specifies the project for API enablement check,\nquota, and billing. To specify a different project for quota and\nbilling, use `--billing-project` or `billing/quota_project` property",args:{name:"PROJECT_ID",description:"String",suggestions:[]}},{name:"--quiet",description:`Disable all interactive prompts when running gcloud commands. If input
is required, defaults will be used, or an error will be raised.
Overrides the default core/disable_prompts property value for this
command invocation. This is equivalent to setting the environment
variable \`CLOUDSDK_CORE_DISABLE_PROMPTS\` to 1`},{name:"--region",description:"Compute region (e.g. us-central1) for the cluster",args:{name:"REGION",description:"String",suggestions:[]}},{name:"--size",description:"(DEPRECATED) Target number of nodes in the cluster.\n+\nThe --size flag is now deprecated. Please use `--num-nodes` instead",args:{name:"SIZE",description:"String",suggestions:[]}},{name:"--trace-token",description:"Token used to route traces of service requests for investigation of issues. Overrides the default *core/trace_token* property value for this command invocation",args:{name:"TRACE_TOKEN",description:"String",suggestions:[]}},{name:"--user-output-enabled",description:"Print user intended output to the console. Overrides the default *core/user_output_enabled* property value for this command invocation. Use *--no-user-output-enabled* to disable"},{name:"--verbosity",description:"Override the default verbosity for this command. Overrides the default *core/verbosity* property value for this command invocation. _VERBOSITY_ must be one of: *debug*, *info*, *warning*, *error*, *critical*, *none*",args:{name:"VERBOSITY",description:"String",suggestions:["debug","info","warning","error","critical","none"]}},{name:"--zone",description:"Compute zone (e.g. us-central1-a) for the cluster. Overrides the default *compute/zone* property value for this command invocation",args:{name:"ZONE",description:"String",suggestions:[]}}],args:{name:"NAME",description:"The name of this cluster"}},{name:"update",description:"Update cluster settings for an existing container cluster",options:[{name:"--account",description:"Google Cloud Platform user account to use for invocation. Overrides the default *core/account* property value for this command invocation",args:{name:"ACCOUNT",description:"String",suggestions:[]}},{name:"--add-maintenance-exclusion-end",description:`End time of the exclusion window. Must take place after the start time. See
$ gcloud topic datetimes for information on time formats`,args:{name:"TIME_STAMP",description:"Googlecloudsdk.calliope.arg_parsers:Parse",suggestions:[]},priority:100},{name:"--add-maintenance-exclusion-name",description:`A descriptor for the exclusion that can be used to remove it. If not specified,
it will be autogenerated`,args:{name:"NAME",description:"String",suggestions:[]}},{name:"--add-maintenance-exclusion-start",description:`Start time of the exclusion window (can occur in the past). If not specified,
the current time will be used. See $ gcloud topic datetimes for information on
time formats`,args:{name:"TIME_STAMP",description:"Googlecloudsdk.calliope.arg_parsers:Parse",suggestions:[]}},{name:"--async",description:`Return immediately, without waiting for the operation in progress to
complete`},{name:"--autoprovisioning-config-file",description:`Path of the JSON/YAML file which contains information about the
cluster's node autoprovisioning configuration. Currently it contains
a list of resource limits, identity defaults for autoprovisioning, node upgrade
settings, node management settings, minimum cpu platform, node locations for
autoprovisioning, disk type and size configuration, shielded instance settings,
and customer-managed encryption keys settings.
+
Resource limits are specified in the field 'resourceLimits'.
Each resource limits definition contains three fields:
resourceType, maximum and minimum.
Resource type can be "cpu", "memory" or an accelerator (e.g.
"nvidia-tesla-k80" for nVidia Tesla K80). Use gcloud compute accelerator-types
list to learn about available accelerator types.
Maximum is the maximum allowed amount with the unit of the resource.
Minimum is the minimum allowed amount with the unit of the resource.
+
Identity default contains at most one of the below fields:
serviceAccount: The Google Cloud Platform Service Account to be used by node VMs in
autoprovisioned node pools. If not specified, the project's default service account
is used.
scopes: A list of scopes to be used by node instances in autoprovisioned node pools.
Multiple scopes can be specified, separated by commas. For information on defaults,
look at:
https://cloud.google.com/sdk/gcloud/reference/container/clusters/create#--scopes
+
Node Upgrade settings are specified under the field
'upgradeSettings', which has the following fields:
maxSurgeUpgrade: Number of extra (surge) nodes to be created on
each upgrade of an autoprovisioned node pool.
maxUnavailableUpgrade: Number of nodes that can be unavailable at the
same time on each upgrade of an autoprovisioned node pool.
+
Node Management settings are specified under the field
'nodeManagement', which has the following fields:
enableAutoUpgrade: A boolean field that indicates if node
autoupgrade is enabled for autoprovisioned node pools.
enableAutoRepair: A boolean field that indicates if node
autorepair is enabled for autoprovisioned node pools.
+
minCpuPlatform: If specified, new autoprovisioned nodes will be
scheduled on host with specified CPU architecture or a newer one.
Note: Min CPU platform can only be specified in Beta and Alpha.
+
Autoprovisioning locations is a set of zones where new node pools
can be created by Autoprovisioning. Autoprovisioning locations are
specified in the field 'autoprovisioningLocations'. All zones must
be in the same region as the cluster's master(s).
+
Disk type and size are specified under the 'diskType' and 'diskSizeGb' fields,
respectively. If specified, new autoprovisioned nodes will be created with
custom boot disks configured by these settings.
+
Shielded instance settings are specified under the 'shieldedInstanceConfig'
field, which has the following fields:
enableSecureBoot: A boolean field that indicates if secure boot is enabled for
autoprovisioned nodes.
enableIntegrityMonitoring: A boolean field that indicates if integrity
monitoring is enabled for autoprovisioned nodes.
+
Customer Managed Encryption Keys (CMEK) used by new auto-provisioned node pools
can be specified in the 'bootDiskKmsKey' field`,args:{name:"AUTOPROVISIONING_CONFIG_FILE",description:"Googlecloudsdk.calliope.arg_parsers:FileContents",suggestions:[]}},{name:"--autoprovisioning-locations",description:`Set of zones where new node pools can be created by autoprovisioning.
All zones must be in the same region as the cluster's master(s).
Multiple locations can be specified, separated by commas`,args:{name:"ZONE",description:"List",suggestions:[]}},{name:"--autoprovisioning-max-surge-upgrade",description:`Number of extra (surge) nodes to be created on each upgrade of an
autoprovisioned node pool`,args:{name:"AUTOPROVISIONING_MAX_SURGE_UPGRADE",description:"String",suggestions:[]},priority:100},{name:"--autoprovisioning-max-unavailable-upgrade",description:`Number of nodes that can be unavailable at the same time on each
upgrade of an autoprovisioned node pool`,args:{name:"AUTOPROVISIONING_MAX_UNAVAILABLE_UPGRADE",description:"String",suggestions:[]},priority:100},{name:"--autoprovisioning-min-cpu-platform",description:`If specified, new autoprovisioned nodes will be scheduled on host with
specified CPU architecture or a newer one`,args:{name:"PLATFORM",description:"String",suggestions:[]}},{name:"--autoprovisioning-scopes",description:`The scopes be used by node instances in autoprovisioned node pools.
Multiple scopes can be specified, separated by commas. For information
on defaults, look at:
https://cloud.google.com/sdk/gcloud/reference/container/clusters/create#--scopes`,args:{name:"SCOPE",description:"List",suggestions:[]}},{name:"--autoprovisioning-service-account",description:`The Google Cloud Platform Service Account to be used by node VMs in
autoprovisioned node pools. If not specified, the project default
service account is used`,args:{name:"AUTOPROVISIONING_SERVICE_ACCOUNT",description:"String",suggestions:[]}},{name:"--billing-project",description:"The Google Cloud Platform project that will be charged quota for operations performed in gcloud. If you need to operate on one project, but need quota against a different project, you can use this flag to specify the billing project. If both `billing/quota_project` and `--billing-project` are specified, `--billing-project` takes precedence. Run `$ gcloud config set --help` to see more information about `billing/quota_project`",args:{name:"BILLING_PROJECT",description:"String",suggestions:[]}},{name:"--clear-maintenance-window",description:`If set, remove the maintenance window that was set with --maintenance-window
family of flags`},{name:"--clear-resource-usage-bigquery-dataset",description:"Disables exporting cluster resource usage to BigQuery"},{name:"--cloud-run-config",description:`Configurations for Cloud Run addon, requires \`--addons=CloudRun\` for create
and \`--update-addons=CloudRun=ENABLED\` for update.
+
*load-balancer-type*:::Optional Type of load-balancer-type EXTERNAL or INTERNAL
Example:
+
  $ {command} example-cluster --cloud-run-config=load-balancer-type=INTERNAL`,args:{name:"load-balancer-type=EXTERNAL",description:"Dict",suggestions:[]}},{name:"--complete-credential-rotation",description:`Complete the IP and credential rotation for this cluster. For example:
+
  $ {command} example-cluster --complete-credential-rotation
+
This causes the cluster to stop serving its old IP, return to a single IP, and invalidate old credentials`},{name:"--complete-ip-rotation",description:`Complete the IP rotation for this cluster. For example:
+
  $ {command} example-cluster --complete-ip-rotation
+
This causes the cluster to stop serving its old IP, and return to a single IP state`},{name:"--configuration",description:`The configuration to use for this command invocation. For more
information on how to use configurations, run:
\`gcloud topic configurations\`.  You can also use the CLOUDSDK_ACTIVE_CONFIG_NAME environment
variable to set the equivalent of this flag for a terminal
session`,args:{name:"CONFIGURATION",description:"String",suggestions:[]}},{name:"--database-encryption-key",description:`Enable Database Encryption.
+
Enable database encryption that will be used to encrypt Kubernetes Secrets at
the application layer. The key provided should be the resource ID in the format of
\`projects/[KEY_PROJECT_ID]/locations/[LOCATION]/keyRings/[RING_NAME]/cryptoKeys/[KEY_NAME]\`.
For more information, see
https://cloud.google.com/kubernetes-engine/docs/how-to/encrypting-secrets`,args:{name:"DATABASE_ENCRYPTION_KEY",description:"Googlecloudsdk.calliope.arg_parsers:Parse",suggestions:[]}},{name:"--disable-database-encryption",description:`Disable database encryption.
+
Disable Database Encryption which encrypt Kubernetes Secrets at
the application layer. For more information, see
https://cloud.google.com/kubernetes-engine/docs/how-to/encrypting-secrets`},{name:"--disable-default-snat",description:`Disable default source NAT rules applied in cluster nodes.
+
By default, cluster nodes perform source network address translation (SNAT)
for packets sent from Pod IP address sources to destination IP addresses
that are not in the non-masquerade CIDRs list.
For more details about SNAT and IP masquerading, see:
https://cloud.google.com/kubernetes-engine/docs/how-to/ip-masquerade-agent#how_ipmasq_works
SNAT changes the packet's source IP address to the node's internal IP address.
+
When this flag is set, GKE does not perform SNAT for packets sent to any destination.
You must set this flag if the cluster uses privately reused public IPs.
+
The --disable-default-snat flag is only applicable to private GKE clusters, which are
inherently VPC-native. Thus, --disable-default-snat requires that the cluster was created
with both --enable-ip-alias and --enable-private-nodes`},{name:"--disable-workload-identity",description:`Disable Workload Identity on the cluster.
+
For more information on Workload Identity, see
+
            https://cloud.google.com/kubernetes-engine/docs/how-to/workload-identity`},{name:"--enable-autoprovisioning",description:`Enables  node autoprovisioning for a cluster.
+
Cluster Autoscaler will be able to create new node pools. Requires maximum CPU
and memory limits to be specified`,priority:100},{name:"--enable-autoprovisioning-autorepair",description:`Enable node autorepair for autoprovisioned node pools.
Use --no-enable-autoprovisioning-autorepair to disable`,priority:100},{name:"--enable-autoprovisioning-autoupgrade",description:`Enable node autoupgrade for autoprovisioned node pools.
Use --no-enable-autoprovisioning-autoupgrade to disable`,priority:100},{name:"--enable-autoscaling",description:`Enables autoscaling for a node pool.
+
Enables autoscaling in the node pool specified by --node-pool or
the default node pool if --node-pool is not provided`},{name:"--enable-basic-auth",description:'Enable basic (username/password) auth for the cluster.  `--enable-basic-auth` is\nan alias for `--username=admin`; `--no-enable-basic-auth` is an alias for\n`--username=""`. Use `--password` to specify a password; if not, the server will\nrandomly generate one. For cluster versions before 1.12, if neither\n`--enable-basic-auth` nor `--username` is specified, `--enable-basic-auth` will\ndefault to `true`. After 1.12, `--enable-basic-auth` will default to `false`'},{name:"--enable-binauthz",description:"Enable Binary Authorization for this cluster"},{name:"--enable-intra-node-visibility",description:`Enable Intra-node visibility for this cluster.
+
Enabling intra-node visibility makes your intra-node pod-to-pod traffic
visible to the networking fabric. With this feature, you can use VPC flow
logging or other VPC features for intra-node traffic.
+
Enabling it on an existing cluster causes the cluster
master and the cluster nodes to restart, which might cause a disruption`},{name:"--enable-legacy-authorization",description:`Enables the legacy ABAC authentication for the cluster.
User rights are granted through the use of policies which combine attributes
together. For a detailed look at these properties and related formats, see
https://kubernetes.io/docs/admin/authorization/abac/. To use RBAC permissions
instead, create or update your cluster with the option
\`--no-enable-legacy-authorization\``},{name:"--enable-master-authorized-networks",description:`Allow only specified set of CIDR blocks (specified by the
\`--master-authorized-networks\` flag) to connect to Kubernetes master through
HTTPS. Besides these blocks, the following have access as well:
+
  1) The private network the cluster connects to if
  \`--enable-private-nodes\` is specified.
  2) Google Compute Engine Public IPs if \`--enable-private-nodes\` is not
  specified.
+
Use \`--no-enable-master-authorized-networks\` to disable. When disabled, public
internet (0.0.0.0/0) is allowed to connect to Kubernetes master through HTTPS`},{name:"--enable-master-global-access",description:`Use with private clusters to allow access to the master's private endpoint from any Google Cloud region or on-premises environment regardless of the
private cluster's region`},{name:"--enable-network-egress-metering",description:`Enable network egress metering on this cluster.
+
When enabled, a DaemonSet is deployed into the cluster. Each DaemonSet pod
meters network egress traffic by collecting data from the conntrack table, and
exports the metered metrics to the specified destination.
+
Network egress metering is disabled if this flag is omitted, or when
\`--no-enable-network-egress-metering\` is set`},{name:"--enable-network-policy",description:"Enable network policy enforcement for this cluster. If you are enabling network policy on an existing cluster the network policy addon must first be enabled on the master by using --update-addons=NetworkPolicy=ENABLED flag"},{name:"--enable-resource-consumption-metering",description:`Enable resource consumption metering on this cluster.
+
When enabled, a table will be created in the specified BigQuery dataset to store
resource consumption data. The resulting table can be joined with the resource
usage table or with BigQuery billing export.
+
To disable resource consumption metering, set \`--no-enable-resource-consumption-
metering\`. If this flag is omitted, then resource consumption metering will
remain enabled or disabled depending on what is already configured for this
cluster`},{name:"--enable-shielded-nodes",description:`Enable Shielded Nodes for this cluster. Enabling Shielded Nodes will enable a
more secure Node credential bootstrapping implementation. Starting with version
1.18, clusters will have shielded GKE nodes by default`},{name:"--enable-stackdriver-kubernetes",description:"Enable Stackdriver Kubernetes monitoring and logging"},{name:"--enable-vertical-pod-autoscaling",description:"Enable vertical pod autoscaling for a cluster"},{name:"--flags-file",description:`A YAML or JSON file that specifies a *--flag*:*value* dictionary.
Useful for specifying complex flag values with special characters
that work with any command interpreter. Additionally, each
*--flags-file* arg is replaced by its constituent flags. See
$ gcloud topic flags-file for more information`,args:{name:"YAML_FILE",description:"String",suggestions:[]}},{name:"--flatten",description:`Flatten _name_[] output resource slices in _KEY_ into separate records
for each item in each slice. Multiple keys and slices may be specified.
This also flattens keys for *--format* and *--filter*. For example,
*--flatten=abc.def* flattens *abc.def[].ghi* references to
*abc.def.ghi*. A resource record containing *abc.def[]* with N elements
will expand to N records in the flattened output. This flag interacts
with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--format",description:"Set the format for printing command output resources. The default is a\ncommand-specific human-friendly output format. The supported formats\nare: `config`, `csv`, `default`, `diff`, `disable`, `flattened`, `get`, `json`, `list`, `multi`, `none`, `object`, `table`, `text`, `value`, `yaml`. For more details run $ gcloud topic formats",args:{name:"FORMAT",description:"String",suggestions:[]}},{name:"--generate-password",description:"Ask the server to generate a secure password and use that as the basic auth password, keeping the existing username"},{name:"--help",description:"Display detailed help"},{name:"--impersonate-service-account",description:"For this gcloud invocation, all API requests will be made as the given service account instead of the currently selected account. This is done without needing to create, download, and activate a key for the account. In order to perform operations as the service account, your currently selected account must have an IAM role that includes the iam.serviceAccounts.getAccessToken permission for the service account. The roles/iam.serviceAccountTokenCreator role has this permission or you may create a custom role. Overrides the default *auth/impersonate_service_account* property value for this command invocation",args:{name:"SERVICE_ACCOUNT_EMAIL",description:"String",suggestions:[]}},{name:"--log-http",description:"Log all HTTP server requests and responses to stderr. Overrides the default *core/log_http* property value for this command invocation"},{name:"--logging-service",description:`Logging service to use for the cluster. Options are:
"logging.googleapis.com/kubernetes" (the Google Cloud Logging
service with Kubernetes-native resource model enabled),
"logging.googleapis.com" (the Google Cloud Logging service),
"none" (logs will not be exported from the cluster)`,args:{name:"LOGGING_SERVICE",description:"String",suggestions:[]}},{name:"--maintenance-window",description:`Set a time of day when you prefer maintenance to start on this cluster. For example:
+
  $ {command} example-cluster --maintenance-window=12:43
+
The time corresponds to the UTC time zone, and must be in HH:MM format.
+
Non-emergency maintenance will occur in the 4 hour block starting at the
specified time.
+
This is mutually exclusive with the recurring maintenance windows
and will overwrite any existing window. Compatible with maintenance
exclusions.
+
To remove an existing maintenance window from the cluster, use
'--clear-maintenance-window'`,args:{name:"START_TIME",description:"Googlecloudsdk.calliope.arg_parsers:Parse",suggestions:[]}},{name:"--maintenance-window-end",description:`End time of the first window (can occur in the past). Must take place after the
start time. The difference in start and end time specifies the length of each
recurrence. See $ gcloud topic datetimes for information on time formats`,args:{name:"TIME_STAMP",description:"Googlecloudsdk.calliope.arg_parsers:Parse",suggestions:[]},priority:100},{name:"--maintenance-window-recurrence",description:`An RFC 5545 RRULE, specifying how the window will recur. Note that minimum
requirements for maintenance periods will be enforced. Note that FREQ=SECONDLY,
MINUTELY, and HOURLY are not supported`,args:{name:"RRULE",description:"String",suggestions:[]},priority:100},{name:"--maintenance-window-start",description:`Start time of the first window (can occur in the past). The start time
influences when the window will start for recurrences. See $ gcloud topic
datetimes for information on time formats`,args:{name:"TIME_STAMP",description:"Googlecloudsdk.calliope.arg_parsers:Parse",suggestions:[]},priority:100},{name:"--master-authorized-networks",description:"The list of CIDR blocks (up to 100 for private cluster, 50 for public cluster) that are allowed to connect to Kubernetes master through HTTPS. Specified in CIDR notation (e.g. 1.2.3.4/30). Cannot be specified unless `--enable-master-authorized-networks` is also specified",args:{name:"NETWORK",description:"List",suggestions:[]}},{name:"--max-accelerator",description:`Sets maximum limit for a single type of accelerators (e.g. GPUs) in cluster.
+
*type*::: (Required) The specific type (e.g. nvidia-tesla-k80 for nVidia Tesla K80)
of accelerator for which the limit is set. Use \`\`\`gcloud compute
accelerator-types list\`\`\` to learn about all available accelerator types.
+
*count*::: (Required) The maximum number of accelerators
to which the cluster can be scaled`,args:{name:"type=TYPE,count=COUNT",description:"Dict",suggestions:[]},priority:100},{name:"--max-cpu",description:`Maximum number of cores in the cluster.
+
Maximum number of cores to which the cluster can scale`,args:{name:"MAX_CPU",description:"String",suggestions:[]}},{name:"--max-memory",description:`Maximum memory in the cluster.
+
Maximum number of gigabytes of memory to which the cluster can scale`,args:{name:"MAX_MEMORY",description:"String",suggestions:[]}},{name:"--max-nodes",description:`Maximum number of nodes in the node pool.
+
Maximum number of nodes to which the node pool specified by --node-pool
(or default node pool if unspecified) can scale. Ignored unless
--enable-autoscaling is also specified`,args:{name:"MAX_NODES",description:"String",suggestions:[]}},{name:"--min-accelerator",description:`Sets minimum limit for a single type of accelerators (e.g. GPUs) in cluster. Defaults
to 0 for all accelerator types if it isn't set.
+
*type*::: (Required) The specific type (e.g. nvidia-tesla-k80 for nVidia Tesla K80)
of accelerator for which the limit is set. Use \`\`\`gcloud compute
accelerator-types list\`\`\` to learn about all available accelerator types.
+
*count*::: (Required) The minimum number of accelerators
to which the cluster can be scaled`,args:{name:"type=TYPE,count=COUNT",description:"Dict",suggestions:[]}},{name:"--min-cpu",description:`Minimum number of cores in the cluster.
+
Minimum number of cores to which the cluster can scale`,args:{name:"MIN_CPU",description:"String",suggestions:[]}},{name:"--min-memory",description:`Minimum memory in the cluster.
+
Minimum number of gigabytes of memory to which the cluster can scale`,args:{name:"MIN_MEMORY",description:"String",suggestions:[]}},{name:"--min-nodes",description:`Minimum number of nodes in the node pool.
+
Minimum number of nodes to which the node pool specified by --node-pool
(or default node pool if unspecified) can scale. Ignored unless
--enable-autoscaling is also specified`,args:{name:"MIN_NODES",description:"String",suggestions:[]}},{name:"--monitoring-service",description:`Monitoring service to use for the cluster. Options are:
"monitoring.googleapis.com/kubernetes" (the Google Cloud
Monitoring service with Kubernetes-native resource model enabled),
"monitoring.googleapis.com" (the Google Cloud Monitoring service),
"none" (no metrics will be exported from the cluster)`,args:{name:"MONITORING_SERVICE",description:"String",suggestions:[]}},{name:"--node-locations",description:`The set of zones in which the specified node footprint should be replicated.
All zones must be in the same region as the cluster's master(s), specified by
the \`--zone\` or \`--region\` flag. Additionally, for zonal clusters,
\`--node-locations\` must contain the cluster's primary zone. If not specified,
all nodes will be in the cluster's primary zone (for zonal clusters) or spread
across three randomly chosen zones within the cluster's region (for regional
clusters).
+
Note that \`NUM_NODES\` nodes will be created in each zone, such that if you
specify \`--num-nodes=4\` and choose two locations, 8 nodes will be created.
+
Multiple locations can be specified, separated by commas. For example:
+
  $ {command} example-cluster --zone us-central1-a --node-locations us-central1-a,us-central1-b`,args:{name:"ZONE",description:"List",suggestions:[]}},{name:"--node-pool",description:"Node pool to be updated",args:{name:"NODE_POOL",description:"String",suggestions:[]}},{name:"--password",description:"The password to use for cluster auth. Defaults to a server-specified randomly-generated string",args:{name:"PASSWORD",description:"String",suggestions:[]}},{name:"--project",description:"The Google Cloud Platform project ID to use for this invocation. If\nomitted, then the current project is assumed; the current project can\nbe listed using `gcloud config list --format='text(core.project)'`\nand can be set using `gcloud config set project PROJECTID`.\n+\n`--project` and its fallback `core/project` property play two roles\nin the invocation. It specifies the project of the resource to\noperate on. It also specifies the project for API enablement check,\nquota, and billing. To specify a different project for quota and\nbilling, use `--billing-project` or `billing/quota_project` property",args:{name:"PROJECT_ID",description:"String",suggestions:[]}},{name:"--quiet",description:`Disable all interactive prompts when running gcloud commands. If input
is required, defaults will be used, or an error will be raised.
Overrides the default core/disable_prompts property value for this
command invocation. This is equivalent to setting the environment
variable \`CLOUDSDK_CORE_DISABLE_PROMPTS\` to 1`},{name:"--region",description:"Compute region (e.g. us-central1) for the cluster",args:{name:"REGION",description:"String",suggestions:[]}},{name:"--release-channel",description:`Subscribe or unsubscribe this cluster to a release channel.
+
When a cluster is subscribed to a release channel, Google maintains
both the master version and the node version. Node auto-upgrade
defaults to true and cannot be disabled.
+
_CHANNEL_ must be one of:
+
*None*::: Use 'None' to opt-out of any release channel.
+
*rapid*::: 'rapid' channel is offered on an early access basis for customers who want
to test new releases.
+
WARNING: Versions available in the 'rapid' channel may be subject to
unresolved issues with no known workaround and are not subject to any
SLAs.
+
*regular*::: Clusters subscribed to 'regular' receive versions that are considered GA
quality. 'regular' is intended for production users who want to take
advantage of new features.
+
*stable*::: Clusters subscribed to 'stable' receive versions that are known to be
stable and reliable in production.
+
:::
+`,args:{name:"CHANNEL",description:"String",suggestions:["None","rapid","regular","stable"]}},{name:"--remove-labels",description:`Labels to remove from the Google Cloud resources in use by the Kubernetes Engine
cluster. These are unrelated to Kubernetes labels.
Example:
+
  $ {command} example-cluster --remove-labels=label_a,label_b`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--remove-maintenance-exclusion",description:`Name of a maintenance exclusion to remove. If you hadn't specified a name, one
was auto-generated. Get it with $ gcloud container clusters describe`,args:{name:"NAME",description:"String",suggestions:[]}},{name:"--resource-usage-bigquery-dataset",description:`The name of the BigQuery dataset to which the cluster's usage of cloud
resources is exported. A table will be created in the specified dataset to
store cluster resource usage. The resulting table can be joined with BigQuery
Billing Export to produce a fine-grained cost breakdown.
+
Example:
+
  $ {command} example-cluster --resource-usage-bigquery-dataset=example_bigquery_dataset_name`,args:{name:"RESOURCE_USAGE_BIGQUERY_DATASET",description:"String",suggestions:[]}},{name:"--set-password",description:"Set the basic auth password to the specified value, keeping the existing username"},{name:"--start-credential-rotation",description:`Start the rotation of IP and credentials for this cluster. For example:
+
  $ {command} example-cluster --start-credential-rotation
+
This causes the cluster to serve on two IPs, and will initiate a node upgrade to point to the new IP`},{name:"--start-ip-rotation",description:`Start the rotation of this cluster to a new IP. For example:
+
  $ {command} example-cluster --start-ip-rotation
+
This causes the cluster to serve on two IPs, and will initiate a node upgrade to point to the new IP`},{name:"--trace-token",description:"Token used to route traces of service requests for investigation of issues. Overrides the default *core/trace_token* property value for this command invocation",args:{name:"TRACE_TOKEN",description:"String",suggestions:[]}},{name:"--update-addons",description:`Cluster addons to enable or disable. Options are
HorizontalPodAutoscaling=ENABLED|DISABLED
HttpLoadBalancing=ENABLED|DISABLED
KubernetesDashboard=ENABLED|DISABLED
NetworkPolicy=ENABLED|DISABLED
CloudRun=ENABLED|DISABLED
ConfigConnector=ENABLED|DISABLED
NodeLocalDNS=ENABLED|DISABLED`,args:{name:"ADDON=ENABLED|DISABLED",description:"Dict",suggestions:[]}},{name:"--update-labels",description:`Labels to apply to the Google Cloud resources in use by the Kubernetes Engine
cluster. These are unrelated to Kubernetes labels.
Example:
+
  $ {command} example-cluster --update-labels=label_a=value1,label_b=value2`,args:{name:"KEY=VALUE",description:"Dict",suggestions:[]}},{name:"--user-output-enabled",description:"Print user intended output to the console. Overrides the default *core/user_output_enabled* property value for this command invocation. Use *--no-user-output-enabled* to disable"},{name:"--username",description:"The user name to use for basic auth for the cluster. Use `--password` to specify\na password; if not, the server will randomly generate one",args:{name:"USERNAME",description:"String",suggestions:[]}},{name:"--verbosity",description:"Override the default verbosity for this command. Overrides the default *core/verbosity* property value for this command invocation. _VERBOSITY_ must be one of: *debug*, *info*, *warning*, *error*, *critical*, *none*",args:{name:"VERBOSITY",description:"String",suggestions:["debug","info","warning","error","critical","none"]}},{name:"--workload-pool",description:`Enable Workload Identity on the cluster.
+
When enabled, Kubernetes service accounts will be able to act as Cloud IAM
Service Accounts, through the provided workload pool.
+
Currently, the only accepted workload pool is the workload pool of
the Cloud project containing the cluster, \`PROJECT_ID.svc.id.goog\`.
+
For more information on Workload Identity, see
+
            https://cloud.google.com/kubernetes-engine/docs/how-to/workload-identity`,args:{name:"WORKLOAD_POOL",description:"Googlecloudsdk.calliope.arg_parsers:Parse",suggestions:[]}},{name:"--zone",description:"Compute zone (e.g. us-central1-a) for the cluster. Overrides the default *compute/zone* property value for this command invocation",args:{name:"ZONE",description:"String",suggestions:[]}}],args:{name:"NAME",description:"The name of the cluster to update"}},{name:"upgrade",description:"Upgrade the Kubernetes version of an existing container cluster",options:[{name:"--account",description:"Google Cloud Platform user account to use for invocation. Overrides the default *core/account* property value for this command invocation",args:{name:"ACCOUNT",description:"String",suggestions:[]}},{name:"--async",description:`Return immediately, without waiting for the operation in progress to
complete`},{name:"--billing-project",description:"The Google Cloud Platform project that will be charged quota for operations performed in gcloud. If you need to operate on one project, but need quota against a different project, you can use this flag to specify the billing project. If both `billing/quota_project` and `--billing-project` are specified, `--billing-project` takes precedence. Run `$ gcloud config set --help` to see more information about `billing/quota_project`",args:{name:"BILLING_PROJECT",description:"String",suggestions:[]}},{name:"--cluster-version",description:`The Kubernetes release version to which to upgrade the cluster's nodes.
+
If desired cluster version is omitted, *node* upgrades default to the current
*master* version and *master* upgrades default to the default cluster version,
which can be found in the server config.
+
You can find the list of allowed versions for upgrades by running:
+
  $ gcloud container get-server-config`,args:{name:"CLUSTER_VERSION",description:"String",suggestions:[]}},{name:"--configuration",description:`The configuration to use for this command invocation. For more
information on how to use configurations, run:
\`gcloud topic configurations\`.  You can also use the CLOUDSDK_ACTIVE_CONFIG_NAME environment
variable to set the equivalent of this flag for a terminal
session`,args:{name:"CONFIGURATION",description:"String",suggestions:[]}},{name:"--flags-file",description:`A YAML or JSON file that specifies a *--flag*:*value* dictionary.
Useful for specifying complex flag values with special characters
that work with any command interpreter. Additionally, each
*--flags-file* arg is replaced by its constituent flags. See
$ gcloud topic flags-file for more information`,args:{name:"YAML_FILE",description:"String",suggestions:[]}},{name:"--flatten",description:`Flatten _name_[] output resource slices in _KEY_ into separate records
for each item in each slice. Multiple keys and slices may be specified.
This also flattens keys for *--format* and *--filter*. For example,
*--flatten=abc.def* flattens *abc.def[].ghi* references to
*abc.def.ghi*. A resource record containing *abc.def[]* with N elements
will expand to N records in the flattened output. This flag interacts
with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--format",description:"Set the format for printing command output resources. The default is a\ncommand-specific human-friendly output format. The supported formats\nare: `config`, `csv`, `default`, `diff`, `disable`, `flattened`, `get`, `json`, `list`, `multi`, `none`, `object`, `table`, `text`, `value`, `yaml`. For more details run $ gcloud topic formats",args:{name:"FORMAT",description:"String",suggestions:[]}},{name:"--help",description:"Display detailed help"},{name:"--image-type",description:`The image type to use for the cluster/node pool. Defaults to server-specified.
+
Image Type specifies the base OS that the nodes in the cluster/node pool will run on.
If an image type is specified, that will be assigned to the cluster/node pool and all
future upgrades will use the specified image type. If it is not specified the
server will pick the default image type.
+
The default image type and the list of valid image types are available
using the following command.
+
  $ gcloud container get-server-config`,args:{name:"IMAGE_TYPE",description:"String",suggestions:[]}},{name:"--impersonate-service-account",description:"For this gcloud invocation, all API requests will be made as the given service account instead of the currently selected account. This is done without needing to create, download, and activate a key for the account. In order to perform operations as the service account, your currently selected account must have an IAM role that includes the iam.serviceAccounts.getAccessToken permission for the service account. The roles/iam.serviceAccountTokenCreator role has this permission or you may create a custom role. Overrides the default *auth/impersonate_service_account* property value for this command invocation",args:{name:"SERVICE_ACCOUNT_EMAIL",description:"String",suggestions:[]}},{name:"--log-http",description:"Log all HTTP server requests and responses to stderr. Overrides the default *core/log_http* property value for this command invocation"},{name:"--master",description:"Upgrade the cluster's master to the latest version of Kubernetes supported on Kubernetes Engine. Nodes cannot be upgraded at the same time as the master"},{name:"--node-pool",description:"The node pool to upgrade",args:{name:"NODE_POOL",description:"String",suggestions:[]}},{name:"--project",description:"The Google Cloud Platform project ID to use for this invocation. If\nomitted, then the current project is assumed; the current project can\nbe listed using `gcloud config list --format='text(core.project)'`\nand can be set using `gcloud config set project PROJECTID`.\n+\n`--project` and its fallback `core/project` property play two roles\nin the invocation. It specifies the project of the resource to\noperate on. It also specifies the project for API enablement check,\nquota, and billing. To specify a different project for quota and\nbilling, use `--billing-project` or `billing/quota_project` property",args:{name:"PROJECT_ID",description:"String",suggestions:[]}},{name:"--quiet",description:`Disable all interactive prompts when running gcloud commands. If input
is required, defaults will be used, or an error will be raised.
Overrides the default core/disable_prompts property value for this
command invocation. This is equivalent to setting the environment
variable \`CLOUDSDK_CORE_DISABLE_PROMPTS\` to 1`},{name:"--region",description:"Compute region (e.g. us-central1) for the cluster",args:{name:"REGION",description:"String",suggestions:[]}},{name:"--trace-token",description:"Token used to route traces of service requests for investigation of issues. Overrides the default *core/trace_token* property value for this command invocation",args:{name:"TRACE_TOKEN",description:"String",suggestions:[]}},{name:"--user-output-enabled",description:"Print user intended output to the console. Overrides the default *core/user_output_enabled* property value for this command invocation. Use *--no-user-output-enabled* to disable"},{name:"--verbosity",description:"Override the default verbosity for this command. Overrides the default *core/verbosity* property value for this command invocation. _VERBOSITY_ must be one of: *debug*, *info*, *warning*, *error*, *critical*, *none*",args:{name:"VERBOSITY",description:"String",suggestions:["debug","info","warning","error","critical","none"]}},{name:"--zone",description:"Compute zone (e.g. us-central1-a) for the cluster. Overrides the default *compute/zone* property value for this command invocation",args:{name:"ZONE",description:"String",suggestions:[]}}],args:{name:"NAME",description:"The name of the cluster to upgrade"}}],options:[{name:"--account",description:"Google Cloud Platform user account to use for invocation. Overrides the default *core/account* property value for this command invocation",args:{name:"ACCOUNT",description:"String",suggestions:[]}},{name:"--billing-project",description:"The Google Cloud Platform project that will be charged quota for operations performed in gcloud. If you need to operate on one project, but need quota against a different project, you can use this flag to specify the billing project. If both `billing/quota_project` and `--billing-project` are specified, `--billing-project` takes precedence. Run `$ gcloud config set --help` to see more information about `billing/quota_project`",args:{name:"BILLING_PROJECT",description:"String",suggestions:[]}},{name:"--configuration",description:`The configuration to use for this command invocation. For more
information on how to use configurations, run:
\`gcloud topic configurations\`.  You can also use the CLOUDSDK_ACTIVE_CONFIG_NAME environment
variable to set the equivalent of this flag for a terminal
session`,args:{name:"CONFIGURATION",description:"String",suggestions:[]}},{name:"--flags-file",description:`A YAML or JSON file that specifies a *--flag*:*value* dictionary.
Useful for specifying complex flag values with special characters
that work with any command interpreter. Additionally, each
*--flags-file* arg is replaced by its constituent flags. See
$ gcloud topic flags-file for more information`,args:{name:"YAML_FILE",description:"String",suggestions:[]}},{name:"--flatten",description:`Flatten _name_[] output resource slices in _KEY_ into separate records
for each item in each slice. Multiple keys and slices may be specified.
This also flattens keys for *--format* and *--filter*. For example,
*--flatten=abc.def* flattens *abc.def[].ghi* references to
*abc.def.ghi*. A resource record containing *abc.def[]* with N elements
will expand to N records in the flattened output. This flag interacts
with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--format",description:"Set the format for printing command output resources. The default is a\ncommand-specific human-friendly output format. The supported formats\nare: `config`, `csv`, `default`, `diff`, `disable`, `flattened`, `get`, `json`, `list`, `multi`, `none`, `object`, `table`, `text`, `value`, `yaml`. For more details run $ gcloud topic formats",args:{name:"FORMAT",description:"String",suggestions:[]}},{name:"--help",description:"Display detailed help"},{name:"--impersonate-service-account",description:"For this gcloud invocation, all API requests will be made as the given service account instead of the currently selected account. This is done without needing to create, download, and activate a key for the account. In order to perform operations as the service account, your currently selected account must have an IAM role that includes the iam.serviceAccounts.getAccessToken permission for the service account. The roles/iam.serviceAccountTokenCreator role has this permission or you may create a custom role. Overrides the default *auth/impersonate_service_account* property value for this command invocation",args:{name:"SERVICE_ACCOUNT_EMAIL",description:"String",suggestions:[]}},{name:"--log-http",description:"Log all HTTP server requests and responses to stderr. Overrides the default *core/log_http* property value for this command invocation"},{name:"--project",description:"The Google Cloud Platform project ID to use for this invocation. If\nomitted, then the current project is assumed; the current project can\nbe listed using `gcloud config list --format='text(core.project)'`\nand can be set using `gcloud config set project PROJECTID`.\n+\n`--project` and its fallback `core/project` property play two roles\nin the invocation. It specifies the project of the resource to\noperate on. It also specifies the project for API enablement check,\nquota, and billing. To specify a different project for quota and\nbilling, use `--billing-project` or `billing/quota_project` property",args:{name:"PROJECT_ID",description:"String",suggestions:[]}},{name:"--quiet",description:`Disable all interactive prompts when running gcloud commands. If input
is required, defaults will be used, or an error will be raised.
Overrides the default core/disable_prompts property value for this
command invocation. This is equivalent to setting the environment
variable \`CLOUDSDK_CORE_DISABLE_PROMPTS\` to 1`},{name:"--region",description:"Compute region (e.g. us-central1) for the cluster",args:{name:"REGION",description:"String",suggestions:[]}},{name:"--trace-token",description:"Token used to route traces of service requests for investigation of issues. Overrides the default *core/trace_token* property value for this command invocation",args:{name:"TRACE_TOKEN",description:"String",suggestions:[]}},{name:"--user-output-enabled",description:"Print user intended output to the console. Overrides the default *core/user_output_enabled* property value for this command invocation. Use *--no-user-output-enabled* to disable"},{name:"--verbosity",description:"Override the default verbosity for this command. Overrides the default *core/verbosity* property value for this command invocation. _VERBOSITY_ must be one of: *debug*, *info*, *warning*, *error*, *critical*, *none*",args:{name:"VERBOSITY",description:"String",suggestions:["debug","info","warning","error","critical","none"]}},{name:"--zone",description:"Compute zone (e.g. us-central1-a) for the cluster. Overrides the default *compute/zone* property value for this command invocation",args:{name:"ZONE",description:"String",suggestions:[]}}]},{name:"get-server-config",description:"Get Kubernetes Engine server config",options:[{name:"--account",description:"Google Cloud Platform user account to use for invocation. Overrides the default *core/account* property value for this command invocation",args:{name:"ACCOUNT",description:"String",suggestions:[]}},{name:"--billing-project",description:"The Google Cloud Platform project that will be charged quota for operations performed in gcloud. If you need to operate on one project, but need quota against a different project, you can use this flag to specify the billing project. If both `billing/quota_project` and `--billing-project` are specified, `--billing-project` takes precedence. Run `$ gcloud config set --help` to see more information about `billing/quota_project`",args:{name:"BILLING_PROJECT",description:"String",suggestions:[]}},{name:"--configuration",description:`The configuration to use for this command invocation. For more
information on how to use configurations, run:
\`gcloud topic configurations\`.  You can also use the CLOUDSDK_ACTIVE_CONFIG_NAME environment
variable to set the equivalent of this flag for a terminal
session`,args:{name:"CONFIGURATION",description:"String",suggestions:[]}},{name:"--filter",description:`Apply a Boolean filter _EXPRESSION_ to each resource item to be listed.
If the expression evaluates \`True\`, then that item is listed. For more
details and examples of filter expressions, run $ gcloud topic filters. This
flag interacts with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"EXPRESSION",description:"String",suggestions:[]}},{name:"--flags-file",description:`A YAML or JSON file that specifies a *--flag*:*value* dictionary.
Useful for specifying complex flag values with special characters
that work with any command interpreter. Additionally, each
*--flags-file* arg is replaced by its constituent flags. See
$ gcloud topic flags-file for more information`,args:{name:"YAML_FILE",description:"String",suggestions:[]}},{name:"--flatten",description:`Flatten _name_[] output resource slices in _KEY_ into separate records
for each item in each slice. Multiple keys and slices may be specified.
This also flattens keys for *--format* and *--filter*. For example,
*--flatten=abc.def* flattens *abc.def[].ghi* references to
*abc.def.ghi*. A resource record containing *abc.def[]* with N elements
will expand to N records in the flattened output. This flag interacts
with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--format",description:"Set the format for printing command output resources. The default is a\ncommand-specific human-friendly output format. The supported formats\nare: `config`, `csv`, `default`, `diff`, `disable`, `flattened`, `get`, `json`, `list`, `multi`, `none`, `object`, `table`, `text`, `value`, `yaml`. For more details run $ gcloud topic formats",args:{name:"FORMAT",description:"String",suggestions:[]}},{name:"--help",description:"Display detailed help"},{name:"--impersonate-service-account",description:"For this gcloud invocation, all API requests will be made as the given service account instead of the currently selected account. This is done without needing to create, download, and activate a key for the account. In order to perform operations as the service account, your currently selected account must have an IAM role that includes the iam.serviceAccounts.getAccessToken permission for the service account. The roles/iam.serviceAccountTokenCreator role has this permission or you may create a custom role. Overrides the default *auth/impersonate_service_account* property value for this command invocation",args:{name:"SERVICE_ACCOUNT_EMAIL",description:"String",suggestions:[]}},{name:"--limit",description:`Maximum number of resources to list. The default is *unlimited*.
This flag interacts with other flags that are applied in this order:
*--flatten*, *--sort-by*, *--filter*, *--limit*`,args:{name:"LIMIT",description:"Googlecloudsdk.calliope.arg_parsers:Parse",suggestions:[]}},{name:"--log-http",description:"Log all HTTP server requests and responses to stderr. Overrides the default *core/log_http* property value for this command invocation"},{name:"--project",description:"The Google Cloud Platform project ID to use for this invocation. If\nomitted, then the current project is assumed; the current project can\nbe listed using `gcloud config list --format='text(core.project)'`\nand can be set using `gcloud config set project PROJECTID`.\n+\n`--project` and its fallback `core/project` property play two roles\nin the invocation. It specifies the project of the resource to\noperate on. It also specifies the project for API enablement check,\nquota, and billing. To specify a different project for quota and\nbilling, use `--billing-project` or `billing/quota_project` property",args:{name:"PROJECT_ID",description:"String",suggestions:[]}},{name:"--quiet",description:`Disable all interactive prompts when running gcloud commands. If input
is required, defaults will be used, or an error will be raised.
Overrides the default core/disable_prompts property value for this
command invocation. This is equivalent to setting the environment
variable \`CLOUDSDK_CORE_DISABLE_PROMPTS\` to 1`},{name:"--region",description:"Compute region (e.g. us-central1) for the cluster",args:{name:"REGION",description:"String",suggestions:[]}},{name:"--sort-by",description:`Comma-separated list of resource field key names to sort by. The
default order is ascending. Prefix a field with \`\`~'' for descending
order on that field. This flag interacts with other flags that are applied
in this order: *--flatten*, *--sort-by*, *--filter*, *--limit*`,args:{name:"FIELD",description:"List",suggestions:[]}},{name:"--trace-token",description:"Token used to route traces of service requests for investigation of issues. Overrides the default *core/trace_token* property value for this command invocation",args:{name:"TRACE_TOKEN",description:"String",suggestions:[]}},{name:"--user-output-enabled",description:"Print user intended output to the console. Overrides the default *core/user_output_enabled* property value for this command invocation. Use *--no-user-output-enabled* to disable"},{name:"--verbosity",description:"Override the default verbosity for this command. Overrides the default *core/verbosity* property value for this command invocation. _VERBOSITY_ must be one of: *debug*, *info*, *warning*, *error*, *critical*, *none*",args:{name:"VERBOSITY",description:"String",suggestions:["debug","info","warning","error","critical","none"]}},{name:"--zone",description:"Compute zone (e.g. us-central1-a) for the cluster. Overrides the default *compute/zone* property value for this command invocation",args:{name:"ZONE",description:"String",suggestions:[]}}]},{name:"hub",description:"Centrally manage features and services on all your Kubernetes clusters with Hub",subcommands:[{name:"memberships",description:"Manage memberships of all your GKE and other Kubernetes cluster with HUB",subcommands:[{name:"create",description:"Create a new membership for a cluster",options:[{name:"--account",description:"Google Cloud Platform user account to use for invocation. Overrides the default *core/account* property value for this command invocation",args:{name:"ACCOUNT",description:"String",suggestions:[]}},{name:"--async",description:`Return immediately, without waiting for the operation in progress to
complete`},{name:"--billing-project",description:"The Google Cloud Platform project that will be charged quota for operations performed in gcloud. If you need to operate on one project, but need quota against a different project, you can use this flag to specify the billing project. If both `billing/quota_project` and `--billing-project` are specified, `--billing-project` takes precedence. Run `$ gcloud config set --help` to see more information about `billing/quota_project`",args:{name:"BILLING_PROJECT",description:"String",suggestions:[]}},{name:"--configuration",description:`The configuration to use for this command invocation. For more
information on how to use configurations, run:
\`gcloud topic configurations\`.  You can also use the CLOUDSDK_ACTIVE_CONFIG_NAME environment
variable to set the equivalent of this flag for a terminal
session`,args:{name:"CONFIGURATION",description:"String",suggestions:[]}},{name:"--external-id",description:"External-id of the membership resource",args:{name:"EXTERNAL_ID",description:"String",suggestions:[]}},{name:"--flags-file",description:`A YAML or JSON file that specifies a *--flag*:*value* dictionary.
Useful for specifying complex flag values with special characters
that work with any command interpreter. Additionally, each
*--flags-file* arg is replaced by its constituent flags. See
$ gcloud topic flags-file for more information`,args:{name:"YAML_FILE",description:"String",suggestions:[]}},{name:"--flatten",description:`Flatten _name_[] output resource slices in _KEY_ into separate records
for each item in each slice. Multiple keys and slices may be specified.
This also flattens keys for *--format* and *--filter*. For example,
*--flatten=abc.def* flattens *abc.def[].ghi* references to
*abc.def.ghi*. A resource record containing *abc.def[]* with N elements
will expand to N records in the flattened output. This flag interacts
with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--format",description:"Set the format for printing command output resources. The default is a\ncommand-specific human-friendly output format. The supported formats\nare: `config`, `csv`, `default`, `diff`, `disable`, `flattened`, `get`, `json`, `list`, `multi`, `none`, `object`, `table`, `text`, `value`, `yaml`. For more details run $ gcloud topic formats",args:{name:"FORMAT",description:"String",suggestions:[]}},{name:"--gke-cluster-self-link",description:`GKE cluster self-link of the cluster represented by this membership;
for example,
'//container.googleapis.com/projects/my-project/locations/us-central1-a/clusters/my-cluster.'
This is only valid if the represented cluster is a GKE cluster. The
provided self-link will be validated to confirm that it maps to the
cluster represented by this membership`,args:{name:"GKE_CLUSTER_SELF_LINK",description:"String",suggestions:[]}},{name:"--help",description:"Display detailed help"},{name:"--impersonate-service-account",description:"For this gcloud invocation, all API requests will be made as the given service account instead of the currently selected account. This is done without needing to create, download, and activate a key for the account. In order to perform operations as the service account, your currently selected account must have an IAM role that includes the iam.serviceAccounts.getAccessToken permission for the service account. The roles/iam.serviceAccountTokenCreator role has this permission or you may create a custom role. Overrides the default *auth/impersonate_service_account* property value for this command invocation",args:{name:"SERVICE_ACCOUNT_EMAIL",description:"String",suggestions:[]}},{name:"--labels",description:"List of label KEY=VALUE pairs to add.\n+\nKeys must start with a lowercase character and contain only hyphens (`-`), underscores (```_```), lowercase characters, and numbers. Values must contain only hyphens (`-`), underscores (```_```), lowercase characters, and numbers",args:{name:"KEY=VALUE",description:"Dict",suggestions:[]}},{name:"--location",description:"The location name",args:{name:"LOCATION",description:"String",suggestions:[]}},{name:"--log-http",description:"Log all HTTP server requests and responses to stderr. Overrides the default *core/log_http* property value for this command invocation"},{name:"--project",description:"The Google Cloud Platform project ID to use for this invocation. If\nomitted, then the current project is assumed; the current project can\nbe listed using `gcloud config list --format='text(core.project)'`\nand can be set using `gcloud config set project PROJECTID`.\n+\n`--project` and its fallback `core/project` property play two roles\nin the invocation. It specifies the project of the resource to\noperate on. It also specifies the project for API enablement check,\nquota, and billing. To specify a different project for quota and\nbilling, use `--billing-project` or `billing/quota_project` property",args:{name:"PROJECT_ID",description:"String",suggestions:[]}},{name:"--quiet",description:`Disable all interactive prompts when running gcloud commands. If input
is required, defaults will be used, or an error will be raised.
Overrides the default core/disable_prompts property value for this
command invocation. This is equivalent to setting the environment
variable \`CLOUDSDK_CORE_DISABLE_PROMPTS\` to 1`},{name:"--trace-token",description:"Token used to route traces of service requests for investigation of issues. Overrides the default *core/trace_token* property value for this command invocation",args:{name:"TRACE_TOKEN",description:"String",suggestions:[]}},{name:"--user-output-enabled",description:"Print user intended output to the console. Overrides the default *core/user_output_enabled* property value for this command invocation. Use *--no-user-output-enabled* to disable"},{name:"--verbosity",description:"Override the default verbosity for this command. Overrides the default *core/verbosity* property value for this command invocation. _VERBOSITY_ must be one of: *debug*, *info*, *warning*, *error*, *critical*, *none*",args:{name:"VERBOSITY",description:"String",suggestions:["debug","info","warning","error","critical","none"]}}],args:{name:"MEMBERSHIP",description:"ID of the membership or fully qualified identifier for the membership"}},{name:"delete",description:"Delete a membership",options:[{name:"--account",description:"Google Cloud Platform user account to use for invocation. Overrides the default *core/account* property value for this command invocation",args:{name:"ACCOUNT",description:"String",suggestions:[]}},{name:"--async",description:`Return immediately, without waiting for the operation in progress to
complete`},{name:"--billing-project",description:"The Google Cloud Platform project that will be charged quota for operations performed in gcloud. If you need to operate on one project, but need quota against a different project, you can use this flag to specify the billing project. If both `billing/quota_project` and `--billing-project` are specified, `--billing-project` takes precedence. Run `$ gcloud config set --help` to see more information about `billing/quota_project`",args:{name:"BILLING_PROJECT",description:"String",suggestions:[]}},{name:"--configuration",description:`The configuration to use for this command invocation. For more
information on how to use configurations, run:
\`gcloud topic configurations\`.  You can also use the CLOUDSDK_ACTIVE_CONFIG_NAME environment
variable to set the equivalent of this flag for a terminal
session`,args:{name:"CONFIGURATION",description:"String",suggestions:[]}},{name:"--flags-file",description:`A YAML or JSON file that specifies a *--flag*:*value* dictionary.
Useful for specifying complex flag values with special characters
that work with any command interpreter. Additionally, each
*--flags-file* arg is replaced by its constituent flags. See
$ gcloud topic flags-file for more information`,args:{name:"YAML_FILE",description:"String",suggestions:[]}},{name:"--flatten",description:`Flatten _name_[] output resource slices in _KEY_ into separate records
for each item in each slice. Multiple keys and slices may be specified.
This also flattens keys for *--format* and *--filter*. For example,
*--flatten=abc.def* flattens *abc.def[].ghi* references to
*abc.def.ghi*. A resource record containing *abc.def[]* with N elements
will expand to N records in the flattened output. This flag interacts
with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--format",description:"Set the format for printing command output resources. The default is a\ncommand-specific human-friendly output format. The supported formats\nare: `config`, `csv`, `default`, `diff`, `disable`, `flattened`, `get`, `json`, `list`, `multi`, `none`, `object`, `table`, `text`, `value`, `yaml`. For more details run $ gcloud topic formats",args:{name:"FORMAT",description:"String",suggestions:[]}},{name:"--help",description:"Display detailed help"},{name:"--impersonate-service-account",description:"For this gcloud invocation, all API requests will be made as the given service account instead of the currently selected account. This is done without needing to create, download, and activate a key for the account. In order to perform operations as the service account, your currently selected account must have an IAM role that includes the iam.serviceAccounts.getAccessToken permission for the service account. The roles/iam.serviceAccountTokenCreator role has this permission or you may create a custom role. Overrides the default *auth/impersonate_service_account* property value for this command invocation",args:{name:"SERVICE_ACCOUNT_EMAIL",description:"String",suggestions:[]}},{name:"--location",description:"The location name",args:{name:"LOCATION",description:"String",suggestions:[]}},{name:"--log-http",description:"Log all HTTP server requests and responses to stderr. Overrides the default *core/log_http* property value for this command invocation"},{name:"--project",description:"The Google Cloud Platform project ID to use for this invocation. If\nomitted, then the current project is assumed; the current project can\nbe listed using `gcloud config list --format='text(core.project)'`\nand can be set using `gcloud config set project PROJECTID`.\n+\n`--project` and its fallback `core/project` property play two roles\nin the invocation. It specifies the project of the resource to\noperate on. It also specifies the project for API enablement check,\nquota, and billing. To specify a different project for quota and\nbilling, use `--billing-project` or `billing/quota_project` property",args:{name:"PROJECT_ID",description:"String",suggestions:[]}},{name:"--quiet",description:`Disable all interactive prompts when running gcloud commands. If input
is required, defaults will be used, or an error will be raised.
Overrides the default core/disable_prompts property value for this
command invocation. This is equivalent to setting the environment
variable \`CLOUDSDK_CORE_DISABLE_PROMPTS\` to 1`},{name:"--trace-token",description:"Token used to route traces of service requests for investigation of issues. Overrides the default *core/trace_token* property value for this command invocation",args:{name:"TRACE_TOKEN",description:"String",suggestions:[]}},{name:"--user-output-enabled",description:"Print user intended output to the console. Overrides the default *core/user_output_enabled* property value for this command invocation. Use *--no-user-output-enabled* to disable"},{name:"--verbosity",description:"Override the default verbosity for this command. Overrides the default *core/verbosity* property value for this command invocation. _VERBOSITY_ must be one of: *debug*, *info*, *warning*, *error*, *critical*, *none*",args:{name:"VERBOSITY",description:"String",suggestions:["debug","info","warning","error","critical","none"]}}],args:{name:"MEMBERSHIP",description:"ID of the membership or fully qualified identifier for the membership"}},{name:"describe",description:"Describe a membership",options:[{name:"--account",description:"Google Cloud Platform user account to use for invocation. Overrides the default *core/account* property value for this command invocation",args:{name:"ACCOUNT",description:"String",suggestions:[]}},{name:"--billing-project",description:"The Google Cloud Platform project that will be charged quota for operations performed in gcloud. If you need to operate on one project, but need quota against a different project, you can use this flag to specify the billing project. If both `billing/quota_project` and `--billing-project` are specified, `--billing-project` takes precedence. Run `$ gcloud config set --help` to see more information about `billing/quota_project`",args:{name:"BILLING_PROJECT",description:"String",suggestions:[]}},{name:"--configuration",description:`The configuration to use for this command invocation. For more
information on how to use configurations, run:
\`gcloud topic configurations\`.  You can also use the CLOUDSDK_ACTIVE_CONFIG_NAME environment
variable to set the equivalent of this flag for a terminal
session`,args:{name:"CONFIGURATION",description:"String",suggestions:[]}},{name:"--flags-file",description:`A YAML or JSON file that specifies a *--flag*:*value* dictionary.
Useful for specifying complex flag values with special characters
that work with any command interpreter. Additionally, each
*--flags-file* arg is replaced by its constituent flags. See
$ gcloud topic flags-file for more information`,args:{name:"YAML_FILE",description:"String",suggestions:[]}},{name:"--flatten",description:`Flatten _name_[] output resource slices in _KEY_ into separate records
for each item in each slice. Multiple keys and slices may be specified.
This also flattens keys for *--format* and *--filter*. For example,
*--flatten=abc.def* flattens *abc.def[].ghi* references to
*abc.def.ghi*. A resource record containing *abc.def[]* with N elements
will expand to N records in the flattened output. This flag interacts
with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--format",description:"Set the format for printing command output resources. The default is a\ncommand-specific human-friendly output format. The supported formats\nare: `config`, `csv`, `default`, `diff`, `disable`, `flattened`, `get`, `json`, `list`, `multi`, `none`, `object`, `table`, `text`, `value`, `yaml`. For more details run $ gcloud topic formats",args:{name:"FORMAT",description:"String",suggestions:[]}},{name:"--help",description:"Display detailed help"},{name:"--impersonate-service-account",description:"For this gcloud invocation, all API requests will be made as the given service account instead of the currently selected account. This is done without needing to create, download, and activate a key for the account. In order to perform operations as the service account, your currently selected account must have an IAM role that includes the iam.serviceAccounts.getAccessToken permission for the service account. The roles/iam.serviceAccountTokenCreator role has this permission or you may create a custom role. Overrides the default *auth/impersonate_service_account* property value for this command invocation",args:{name:"SERVICE_ACCOUNT_EMAIL",description:"String",suggestions:[]}},{name:"--location",description:"The location name",args:{name:"LOCATION",description:"String",suggestions:[]}},{name:"--log-http",description:"Log all HTTP server requests and responses to stderr. Overrides the default *core/log_http* property value for this command invocation"},{name:"--project",description:"The Google Cloud Platform project ID to use for this invocation. If\nomitted, then the current project is assumed; the current project can\nbe listed using `gcloud config list --format='text(core.project)'`\nand can be set using `gcloud config set project PROJECTID`.\n+\n`--project` and its fallback `core/project` property play two roles\nin the invocation. It specifies the project of the resource to\noperate on. It also specifies the project for API enablement check,\nquota, and billing. To specify a different project for quota and\nbilling, use `--billing-project` or `billing/quota_project` property",args:{name:"PROJECT_ID",description:"String",suggestions:[]}},{name:"--quiet",description:`Disable all interactive prompts when running gcloud commands. If input
is required, defaults will be used, or an error will be raised.
Overrides the default core/disable_prompts property value for this
command invocation. This is equivalent to setting the environment
variable \`CLOUDSDK_CORE_DISABLE_PROMPTS\` to 1`},{name:"--trace-token",description:"Token used to route traces of service requests for investigation of issues. Overrides the default *core/trace_token* property value for this command invocation",args:{name:"TRACE_TOKEN",description:"String",suggestions:[]}},{name:"--user-output-enabled",description:"Print user intended output to the console. Overrides the default *core/user_output_enabled* property value for this command invocation. Use *--no-user-output-enabled* to disable"},{name:"--verbosity",description:"Override the default verbosity for this command. Overrides the default *core/verbosity* property value for this command invocation. _VERBOSITY_ must be one of: *debug*, *info*, *warning*, *error*, *critical*, *none*",args:{name:"VERBOSITY",description:"String",suggestions:["debug","info","warning","error","critical","none"]}}],args:{name:"MEMBERSHIP",description:"ID of the membership or fully qualified identifier for the membership"}},{name:"list",description:"List memberships",options:[{name:"--account",description:"Google Cloud Platform user account to use for invocation. Overrides the default *core/account* property value for this command invocation",args:{name:"ACCOUNT",description:"String",suggestions:[]}},{name:"--billing-project",description:"The Google Cloud Platform project that will be charged quota for operations performed in gcloud. If you need to operate on one project, but need quota against a different project, you can use this flag to specify the billing project. If both `billing/quota_project` and `--billing-project` are specified, `--billing-project` takes precedence. Run `$ gcloud config set --help` to see more information about `billing/quota_project`",args:{name:"BILLING_PROJECT",description:"String",suggestions:[]}},{name:"--configuration",description:`The configuration to use for this command invocation. For more
information on how to use configurations, run:
\`gcloud topic configurations\`.  You can also use the CLOUDSDK_ACTIVE_CONFIG_NAME environment
variable to set the equivalent of this flag for a terminal
session`,args:{name:"CONFIGURATION",description:"String",suggestions:[]}},{name:"--filter",description:`Apply a Boolean filter _EXPRESSION_ to each resource item to be listed.
If the expression evaluates \`True\`, then that item is listed. For more
details and examples of filter expressions, run $ gcloud topic filters. This
flag interacts with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"EXPRESSION",description:"String",suggestions:[]}},{name:"--flags-file",description:`A YAML or JSON file that specifies a *--flag*:*value* dictionary.
Useful for specifying complex flag values with special characters
that work with any command interpreter. Additionally, each
*--flags-file* arg is replaced by its constituent flags. See
$ gcloud topic flags-file for more information`,args:{name:"YAML_FILE",description:"String",suggestions:[]}},{name:"--flatten",description:`Flatten _name_[] output resource slices in _KEY_ into separate records
for each item in each slice. Multiple keys and slices may be specified.
This also flattens keys for *--format* and *--filter*. For example,
*--flatten=abc.def* flattens *abc.def[].ghi* references to
*abc.def.ghi*. A resource record containing *abc.def[]* with N elements
will expand to N records in the flattened output. This flag interacts
with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--format",description:"Set the format for printing command output resources. The default is a\ncommand-specific human-friendly output format. The supported formats\nare: `config`, `csv`, `default`, `diff`, `disable`, `flattened`, `get`, `json`, `list`, `multi`, `none`, `object`, `table`, `text`, `value`, `yaml`. For more details run $ gcloud topic formats",args:{name:"FORMAT",description:"String",suggestions:[]}},{name:"--help",description:"Display detailed help"},{name:"--impersonate-service-account",description:"For this gcloud invocation, all API requests will be made as the given service account instead of the currently selected account. This is done without needing to create, download, and activate a key for the account. In order to perform operations as the service account, your currently selected account must have an IAM role that includes the iam.serviceAccounts.getAccessToken permission for the service account. The roles/iam.serviceAccountTokenCreator role has this permission or you may create a custom role. Overrides the default *auth/impersonate_service_account* property value for this command invocation",args:{name:"SERVICE_ACCOUNT_EMAIL",description:"String",suggestions:[]}},{name:"--limit",description:`Maximum number of resources to list. The default is *unlimited*.
This flag interacts with other flags that are applied in this order:
*--flatten*, *--sort-by*, *--filter*, *--limit*`,args:{name:"LIMIT",description:"Googlecloudsdk.calliope.arg_parsers:Parse",suggestions:[]}},{name:"--log-http",description:"Log all HTTP server requests and responses to stderr. Overrides the default *core/log_http* property value for this command invocation"},{name:"--page-size",description:`Some services group resource list output into pages. This flag specifies
the maximum number of resources per page. The default is determined by the
service if it supports paging, otherwise it is *unlimited* (no paging).
Paging may be applied before or after *--filter* and *--limit* depending
on the service`,args:{name:"PAGE_SIZE",description:"Googlecloudsdk.calliope.arg_parsers:Parse",suggestions:[]}},{name:"--project",description:"The Google Cloud Platform project ID to use for this invocation. If\nomitted, then the current project is assumed; the current project can\nbe listed using `gcloud config list --format='text(core.project)'`\nand can be set using `gcloud config set project PROJECTID`.\n+\n`--project` and its fallback `core/project` property play two roles\nin the invocation. It specifies the project of the resource to\noperate on. It also specifies the project for API enablement check,\nquota, and billing. To specify a different project for quota and\nbilling, use `--billing-project` or `billing/quota_project` property",args:{name:"PROJECT_ID",description:"String",suggestions:[]}},{name:"--quiet",description:`Disable all interactive prompts when running gcloud commands. If input
is required, defaults will be used, or an error will be raised.
Overrides the default core/disable_prompts property value for this
command invocation. This is equivalent to setting the environment
variable \`CLOUDSDK_CORE_DISABLE_PROMPTS\` to 1`},{name:"--sort-by",description:`Comma-separated list of resource field key names to sort by. The
default order is ascending. Prefix a field with \`\`~'' for descending
order on that field. This flag interacts with other flags that are applied
in this order: *--flatten*, *--sort-by*, *--filter*, *--limit*`,args:{name:"FIELD",description:"List",suggestions:[]}},{name:"--trace-token",description:"Token used to route traces of service requests for investigation of issues. Overrides the default *core/trace_token* property value for this command invocation",args:{name:"TRACE_TOKEN",description:"String",suggestions:[]}},{name:"--uri",description:"Print a list of resource URIs instead of the default output"},{name:"--user-output-enabled",description:"Print user intended output to the console. Overrides the default *core/user_output_enabled* property value for this command invocation. Use *--no-user-output-enabled* to disable"},{name:"--verbosity",description:"Override the default verbosity for this command. Overrides the default *core/verbosity* property value for this command invocation. _VERBOSITY_ must be one of: *debug*, *info*, *warning*, *error*, *critical*, *none*",args:{name:"VERBOSITY",description:"String",suggestions:["debug","info","warning","error","critical","none"]}}]},{name:"register",description:"Register a cluster with Hub",options:[{name:"--account",description:"Google Cloud Platform user account to use for invocation. Overrides the default *core/account* property value for this command invocation",args:{name:"ACCOUNT",description:"String",suggestions:[]}},{name:"--billing-project",description:"The Google Cloud Platform project that will be charged quota for operations performed in gcloud. If you need to operate on one project, but need quota against a different project, you can use this flag to specify the billing project. If both `billing/quota_project` and `--billing-project` are specified, `--billing-project` takes precedence. Run `$ gcloud config set --help` to see more information about `billing/quota_project`",args:{name:"BILLING_PROJECT",description:"String",suggestions:[]}},{name:"--configuration",description:`The configuration to use for this command invocation. For more
information on how to use configurations, run:
\`gcloud topic configurations\`.  You can also use the CLOUDSDK_ACTIVE_CONFIG_NAME environment
variable to set the equivalent of this flag for a terminal
session`,args:{name:"CONFIGURATION",description:"String",suggestions:[]}},{name:"--context",description:"The cluster context as it appears in the kubeconfig file. You can get\nthis value from the command line by running command:\n`kubectl config current-context`",args:{name:"CONTEXT",description:"String",suggestions:[]},priority:100},{name:"--flags-file",description:`A YAML or JSON file that specifies a *--flag*:*value* dictionary.
Useful for specifying complex flag values with special characters
that work with any command interpreter. Additionally, each
*--flags-file* arg is replaced by its constituent flags. See
$ gcloud topic flags-file for more information`,args:{name:"YAML_FILE",description:"String",suggestions:[]}},{name:"--flatten",description:`Flatten _name_[] output resource slices in _KEY_ into separate records
for each item in each slice. Multiple keys and slices may be specified.
This also flattens keys for *--format* and *--filter*. For example,
*--flatten=abc.def* flattens *abc.def[].ghi* references to
*abc.def.ghi*. A resource record containing *abc.def[]* with N elements
will expand to N records in the flattened output. This flag interacts
with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--format",description:"Set the format for printing command output resources. The default is a\ncommand-specific human-friendly output format. The supported formats\nare: `config`, `csv`, `default`, `diff`, `disable`, `flattened`, `get`, `json`, `list`, `multi`, `none`, `object`, `table`, `text`, `value`, `yaml`. For more details run $ gcloud topic formats",args:{name:"FORMAT",description:"String",suggestions:[]}},{name:"--gke-cluster",description:"The location/name of the GKE cluster. The location can be a zone or\na region for e.g `us-central1-a/my-cluster`",args:{name:"LOCATION/CLUSTER_NAME",description:"String",suggestions:[]}},{name:"--gke-uri",description:`The URI of the GKE cluster; for example,
'https://container.googleapis.com/projects/my-project/locations/us-central1-a/clusters/my-cluster'
The URI can obtain by calling:
    gcloud container clusters list --uri
This is only valid if the represented cluster is a GKE cluster. The
provided URI will be validated to confirm that it maps to the valid
GKE cluster`,args:{name:"GKE_URI",description:"String",suggestions:[]}},{name:"--help",description:"Display detailed help"},{name:"--impersonate-service-account",description:"For this gcloud invocation, all API requests will be made as the given service account instead of the currently selected account. This is done without needing to create, download, and activate a key for the account. In order to perform operations as the service account, your currently selected account must have an IAM role that includes the iam.serviceAccounts.getAccessToken permission for the service account. The roles/iam.serviceAccountTokenCreator role has this permission or you may create a custom role. Overrides the default *auth/impersonate_service_account* property value for this command invocation",args:{name:"SERVICE_ACCOUNT_EMAIL",description:"String",suggestions:[]}},{name:"--kubeconfig",description:`The kubeconfig file containing an entry for the cluster. Defaults to
$KUBECONFIG if it is set in the environment, otherwise defaults to
$HOME/.kube/config`,args:{name:"KUBECONFIG",description:"String",suggestions:[]}},{name:"--log-http",description:"Log all HTTP server requests and responses to stderr. Overrides the default *core/log_http* property value for this command invocation"},{name:"--manifest-output-file",description:`The full path of the file into which the Connect Agent installation
manifest should be stored. If this option is provided, then the
manifest will be written to this file and will not be deployed into
the cluster by gcloud, and it will need to be deployed manually`,args:{name:"MANIFEST_OUTPUT_FILE",description:"String",suggestions:[]}},{name:"--project",description:"The Google Cloud Platform project ID to use for this invocation. If\nomitted, then the current project is assumed; the current project can\nbe listed using `gcloud config list --format='text(core.project)'`\nand can be set using `gcloud config set project PROJECTID`.\n+\n`--project` and its fallback `core/project` property play two roles\nin the invocation. It specifies the project of the resource to\noperate on. It also specifies the project for API enablement check,\nquota, and billing. To specify a different project for quota and\nbilling, use `--billing-project` or `billing/quota_project` property",args:{name:"PROJECT_ID",description:"String",suggestions:[]}},{name:"--proxy",description:`The proxy address in the format of http[s]://{hostname}. The proxy
must support the HTTP CONNECT method in order for this connection to
succeed`,args:{name:"PROXY",description:"String",suggestions:[]}},{name:"--quiet",description:`Disable all interactive prompts when running gcloud commands. If input
is required, defaults will be used, or an error will be raised.
Overrides the default core/disable_prompts property value for this
command invocation. This is equivalent to setting the environment
variable \`CLOUDSDK_CORE_DISABLE_PROMPTS\` to 1`},{name:"--service-account-key-file",description:`The JSON file of a Google Cloud service account private key. This
service account key is stored as a secret named \`\`creds-gcp'' in
gke-connect namespace. To update the \`\`creds-gcp'' secret in
gke-connect namespace with a new service account key file, run the
following command:
+
kubectl delete secret creds-gcp -n gke-connect
+
kubectl create secret generic creds-gcp -n gke-connect --from-file=creds-gcp.json=/path/to/file`,args:{name:"SERVICE_ACCOUNT_KEY_FILE",description:"String",suggestions:[]}},{name:"--trace-token",description:"Token used to route traces of service requests for investigation of issues. Overrides the default *core/trace_token* property value for this command invocation",args:{name:"TRACE_TOKEN",description:"String",suggestions:[]}},{name:"--user-output-enabled",description:"Print user intended output to the console. Overrides the default *core/user_output_enabled* property value for this command invocation. Use *--no-user-output-enabled* to disable"},{name:"--verbosity",description:"Override the default verbosity for this command. Overrides the default *core/verbosity* property value for this command invocation. _VERBOSITY_ must be one of: *debug*, *info*, *warning*, *error*, *critical*, *none*",args:{name:"VERBOSITY",description:"String",suggestions:["debug","info","warning","error","critical","none"]}}],args:{name:"CLUSTER_NAME",description:`The membership name that you choose to uniquely represents the cluster
being registered on the Hub`}},{name:"unregister",description:"Unregister a cluster from Hub",options:[{name:"--account",description:"Google Cloud Platform user account to use for invocation. Overrides the default *core/account* property value for this command invocation",args:{name:"ACCOUNT",description:"String",suggestions:[]}},{name:"--billing-project",description:"The Google Cloud Platform project that will be charged quota for operations performed in gcloud. If you need to operate on one project, but need quota against a different project, you can use this flag to specify the billing project. If both `billing/quota_project` and `--billing-project` are specified, `--billing-project` takes precedence. Run `$ gcloud config set --help` to see more information about `billing/quota_project`",args:{name:"BILLING_PROJECT",description:"String",suggestions:[]}},{name:"--configuration",description:`The configuration to use for this command invocation. For more
information on how to use configurations, run:
\`gcloud topic configurations\`.  You can also use the CLOUDSDK_ACTIVE_CONFIG_NAME environment
variable to set the equivalent of this flag for a terminal
session`,args:{name:"CONFIGURATION",description:"String",suggestions:[]}},{name:"--context",description:"The cluster context as it appears in the kubeconfig file. You can get\nthis value from the command line by running command:\n`kubectl config current-context`",args:{name:"CONTEXT",description:"String",suggestions:[]},priority:100},{name:"--flags-file",description:`A YAML or JSON file that specifies a *--flag*:*value* dictionary.
Useful for specifying complex flag values with special characters
that work with any command interpreter. Additionally, each
*--flags-file* arg is replaced by its constituent flags. See
$ gcloud topic flags-file for more information`,args:{name:"YAML_FILE",description:"String",suggestions:[]}},{name:"--flatten",description:`Flatten _name_[] output resource slices in _KEY_ into separate records
for each item in each slice. Multiple keys and slices may be specified.
This also flattens keys for *--format* and *--filter*. For example,
*--flatten=abc.def* flattens *abc.def[].ghi* references to
*abc.def.ghi*. A resource record containing *abc.def[]* with N elements
will expand to N records in the flattened output. This flag interacts
with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--format",description:"Set the format for printing command output resources. The default is a\ncommand-specific human-friendly output format. The supported formats\nare: `config`, `csv`, `default`, `diff`, `disable`, `flattened`, `get`, `json`, `list`, `multi`, `none`, `object`, `table`, `text`, `value`, `yaml`. For more details run $ gcloud topic formats",args:{name:"FORMAT",description:"String",suggestions:[]}},{name:"--gke-cluster",description:"The location/name of the GKE cluster. The location can be a zone or\na region for e.g `us-central1-a/my-cluster`",args:{name:"LOCATION/CLUSTER_NAME",description:"String",suggestions:[]}},{name:"--gke-uri",description:`The URI of the GKE cluster; for example,
'https://container.googleapis.com/projects/my-project/locations/us-central1-a/clusters/my-cluster'
The URI can obtain by calling:
    gcloud container clusters list --uri
This is only valid if the represented cluster is a GKE cluster. The
provided URI will be validated to confirm that it maps to the valid
GKE cluster`,args:{name:"GKE_URI",description:"String",suggestions:[]}},{name:"--help",description:"Display detailed help"},{name:"--impersonate-service-account",description:"For this gcloud invocation, all API requests will be made as the given service account instead of the currently selected account. This is done without needing to create, download, and activate a key for the account. In order to perform operations as the service account, your currently selected account must have an IAM role that includes the iam.serviceAccounts.getAccessToken permission for the service account. The roles/iam.serviceAccountTokenCreator role has this permission or you may create a custom role. Overrides the default *auth/impersonate_service_account* property value for this command invocation",args:{name:"SERVICE_ACCOUNT_EMAIL",description:"String",suggestions:[]}},{name:"--kubeconfig",description:`The kubeconfig file containing an entry for the cluster. Defaults to
$KUBECONFIG if it is set in the environment, otherwise defaults to
$HOME/.kube/config`,args:{name:"KUBECONFIG",description:"String",suggestions:[]}},{name:"--log-http",description:"Log all HTTP server requests and responses to stderr. Overrides the default *core/log_http* property value for this command invocation"},{name:"--project",description:"The Google Cloud Platform project ID to use for this invocation. If\nomitted, then the current project is assumed; the current project can\nbe listed using `gcloud config list --format='text(core.project)'`\nand can be set using `gcloud config set project PROJECTID`.\n+\n`--project` and its fallback `core/project` property play two roles\nin the invocation. It specifies the project of the resource to\noperate on. It also specifies the project for API enablement check,\nquota, and billing. To specify a different project for quota and\nbilling, use `--billing-project` or `billing/quota_project` property",args:{name:"PROJECT_ID",description:"String",suggestions:[]}},{name:"--quiet",description:`Disable all interactive prompts when running gcloud commands. If input
is required, defaults will be used, or an error will be raised.
Overrides the default core/disable_prompts property value for this
command invocation. This is equivalent to setting the environment
variable \`CLOUDSDK_CORE_DISABLE_PROMPTS\` to 1`},{name:"--trace-token",description:"Token used to route traces of service requests for investigation of issues. Overrides the default *core/trace_token* property value for this command invocation",args:{name:"TRACE_TOKEN",description:"String",suggestions:[]}},{name:"--user-output-enabled",description:"Print user intended output to the console. Overrides the default *core/user_output_enabled* property value for this command invocation. Use *--no-user-output-enabled* to disable"},{name:"--verbosity",description:"Override the default verbosity for this command. Overrides the default *core/verbosity* property value for this command invocation. _VERBOSITY_ must be one of: *debug*, *info*, *warning*, *error*, *critical*, *none*",args:{name:"VERBOSITY",description:"String",suggestions:["debug","info","warning","error","critical","none"]}}],args:{name:"CLUSTER_NAME",description:"The membership name that corresponds to the cluster being\nunregistered. To get list of all the memberships on the Hub,\nconsider using the command: `{parent_command} list`"}},{name:"update",description:"Update a membership",options:[{name:"--account",description:"Google Cloud Platform user account to use for invocation. Overrides the default *core/account* property value for this command invocation",args:{name:"ACCOUNT",description:"String",suggestions:[]}},{name:"--async",description:`Return immediately, without waiting for the operation in progress to
complete`},{name:"--billing-project",description:"The Google Cloud Platform project that will be charged quota for operations performed in gcloud. If you need to operate on one project, but need quota against a different project, you can use this flag to specify the billing project. If both `billing/quota_project` and `--billing-project` are specified, `--billing-project` takes precedence. Run `$ gcloud config set --help` to see more information about `billing/quota_project`",args:{name:"BILLING_PROJECT",description:"String",suggestions:[]}},{name:"--clear-labels",description:`Remove all labels. If \`--update-labels\` is also specified then
\`--clear-labels\` is applied first.
+
For example, to remove all labels:
+
    $ {command} --clear-labels
+
To set the labels to exactly "foo" and "baz":
+
    $ {command} --clear-labels --update-labels foo=bar,baz=qux`},{name:"--configuration",description:`The configuration to use for this command invocation. For more
information on how to use configurations, run:
\`gcloud topic configurations\`.  You can also use the CLOUDSDK_ACTIVE_CONFIG_NAME environment
variable to set the equivalent of this flag for a terminal
session`,args:{name:"CONFIGURATION",description:"String",suggestions:[]}},{name:"--flags-file",description:`A YAML or JSON file that specifies a *--flag*:*value* dictionary.
Useful for specifying complex flag values with special characters
that work with any command interpreter. Additionally, each
*--flags-file* arg is replaced by its constituent flags. See
$ gcloud topic flags-file for more information`,args:{name:"YAML_FILE",description:"String",suggestions:[]}},{name:"--flatten",description:`Flatten _name_[] output resource slices in _KEY_ into separate records
for each item in each slice. Multiple keys and slices may be specified.
This also flattens keys for *--format* and *--filter*. For example,
*--flatten=abc.def* flattens *abc.def[].ghi* references to
*abc.def.ghi*. A resource record containing *abc.def[]* with N elements
will expand to N records in the flattened output. This flag interacts
with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--format",description:"Set the format for printing command output resources. The default is a\ncommand-specific human-friendly output format. The supported formats\nare: `config`, `csv`, `default`, `diff`, `disable`, `flattened`, `get`, `json`, `list`, `multi`, `none`, `object`, `table`, `text`, `value`, `yaml`. For more details run $ gcloud topic formats",args:{name:"FORMAT",description:"String",suggestions:[]}},{name:"--help",description:"Display detailed help"},{name:"--impersonate-service-account",description:"For this gcloud invocation, all API requests will be made as the given service account instead of the currently selected account. This is done without needing to create, download, and activate a key for the account. In order to perform operations as the service account, your currently selected account must have an IAM role that includes the iam.serviceAccounts.getAccessToken permission for the service account. The roles/iam.serviceAccountTokenCreator role has this permission or you may create a custom role. Overrides the default *auth/impersonate_service_account* property value for this command invocation",args:{name:"SERVICE_ACCOUNT_EMAIL",description:"String",suggestions:[]}},{name:"--location",description:"The location name",args:{name:"LOCATION",description:"String",suggestions:[]}},{name:"--log-http",description:"Log all HTTP server requests and responses to stderr. Overrides the default *core/log_http* property value for this command invocation"},{name:"--project",description:"The Google Cloud Platform project ID to use for this invocation. If\nomitted, then the current project is assumed; the current project can\nbe listed using `gcloud config list --format='text(core.project)'`\nand can be set using `gcloud config set project PROJECTID`.\n+\n`--project` and its fallback `core/project` property play two roles\nin the invocation. It specifies the project of the resource to\noperate on. It also specifies the project for API enablement check,\nquota, and billing. To specify a different project for quota and\nbilling, use `--billing-project` or `billing/quota_project` property",args:{name:"PROJECT_ID",description:"String",suggestions:[]}},{name:"--quiet",description:`Disable all interactive prompts when running gcloud commands. If input
is required, defaults will be used, or an error will be raised.
Overrides the default core/disable_prompts property value for this
command invocation. This is equivalent to setting the environment
variable \`CLOUDSDK_CORE_DISABLE_PROMPTS\` to 1`},{name:"--remove-labels",description:"List of label keys to remove. If a label does not exist it is\nsilently ignored. If `--update-labels` is also specified then\n`--remove-labels` is applied first",args:{name:"KEY",description:"List",suggestions:[]}},{name:"--trace-token",description:"Token used to route traces of service requests for investigation of issues. Overrides the default *core/trace_token* property value for this command invocation",args:{name:"TRACE_TOKEN",description:"String",suggestions:[]}},{name:"--update-labels",description:"List of label KEY=VALUE pairs to update. If a label exists its value is modified, otherwise a new label is created.\n+\nKeys must start with a lowercase character and contain only hyphens (`-`), underscores (```_```), lowercase characters, and numbers. Values must contain only hyphens (`-`), underscores (```_```), lowercase characters, and numbers",args:{name:"KEY=VALUE",description:"Dict",suggestions:[]}},{name:"--user-output-enabled",description:"Print user intended output to the console. Overrides the default *core/user_output_enabled* property value for this command invocation. Use *--no-user-output-enabled* to disable"},{name:"--verbosity",description:"Override the default verbosity for this command. Overrides the default *core/verbosity* property value for this command invocation. _VERBOSITY_ must be one of: *debug*, *info*, *warning*, *error*, *critical*, *none*",args:{name:"VERBOSITY",description:"String",suggestions:["debug","info","warning","error","critical","none"]}}],args:{name:"MEMBERSHIP",description:"ID of the membership or fully qualified identifier for the membership"}}],options:[{name:"--account",description:"Google Cloud Platform user account to use for invocation. Overrides the default *core/account* property value for this command invocation",args:{name:"ACCOUNT",description:"String",suggestions:[]}},{name:"--billing-project",description:"The Google Cloud Platform project that will be charged quota for operations performed in gcloud. If you need to operate on one project, but need quota against a different project, you can use this flag to specify the billing project. If both `billing/quota_project` and `--billing-project` are specified, `--billing-project` takes precedence. Run `$ gcloud config set --help` to see more information about `billing/quota_project`",args:{name:"BILLING_PROJECT",description:"String",suggestions:[]}},{name:"--configuration",description:`The configuration to use for this command invocation. For more
information on how to use configurations, run:
\`gcloud topic configurations\`.  You can also use the CLOUDSDK_ACTIVE_CONFIG_NAME environment
variable to set the equivalent of this flag for a terminal
session`,args:{name:"CONFIGURATION",description:"String",suggestions:[]}},{name:"--flags-file",description:`A YAML or JSON file that specifies a *--flag*:*value* dictionary.
Useful for specifying complex flag values with special characters
that work with any command interpreter. Additionally, each
*--flags-file* arg is replaced by its constituent flags. See
$ gcloud topic flags-file for more information`,args:{name:"YAML_FILE",description:"String",suggestions:[]}},{name:"--flatten",description:`Flatten _name_[] output resource slices in _KEY_ into separate records
for each item in each slice. Multiple keys and slices may be specified.
This also flattens keys for *--format* and *--filter*. For example,
*--flatten=abc.def* flattens *abc.def[].ghi* references to
*abc.def.ghi*. A resource record containing *abc.def[]* with N elements
will expand to N records in the flattened output. This flag interacts
with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--format",description:"Set the format for printing command output resources. The default is a\ncommand-specific human-friendly output format. The supported formats\nare: `config`, `csv`, `default`, `diff`, `disable`, `flattened`, `get`, `json`, `list`, `multi`, `none`, `object`, `table`, `text`, `value`, `yaml`. For more details run $ gcloud topic formats",args:{name:"FORMAT",description:"String",suggestions:[]}},{name:"--help",description:"Display detailed help"},{name:"--impersonate-service-account",description:"For this gcloud invocation, all API requests will be made as the given service account instead of the currently selected account. This is done without needing to create, download, and activate a key for the account. In order to perform operations as the service account, your currently selected account must have an IAM role that includes the iam.serviceAccounts.getAccessToken permission for the service account. The roles/iam.serviceAccountTokenCreator role has this permission or you may create a custom role. Overrides the default *auth/impersonate_service_account* property value for this command invocation",args:{name:"SERVICE_ACCOUNT_EMAIL",description:"String",suggestions:[]}},{name:"--log-http",description:"Log all HTTP server requests and responses to stderr. Overrides the default *core/log_http* property value for this command invocation"},{name:"--project",description:"The Google Cloud Platform project ID to use for this invocation. If\nomitted, then the current project is assumed; the current project can\nbe listed using `gcloud config list --format='text(core.project)'`\nand can be set using `gcloud config set project PROJECTID`.\n+\n`--project` and its fallback `core/project` property play two roles\nin the invocation. It specifies the project of the resource to\noperate on. It also specifies the project for API enablement check,\nquota, and billing. To specify a different project for quota and\nbilling, use `--billing-project` or `billing/quota_project` property",args:{name:"PROJECT_ID",description:"String",suggestions:[]}},{name:"--quiet",description:`Disable all interactive prompts when running gcloud commands. If input
is required, defaults will be used, or an error will be raised.
Overrides the default core/disable_prompts property value for this
command invocation. This is equivalent to setting the environment
variable \`CLOUDSDK_CORE_DISABLE_PROMPTS\` to 1`},{name:"--trace-token",description:"Token used to route traces of service requests for investigation of issues. Overrides the default *core/trace_token* property value for this command invocation",args:{name:"TRACE_TOKEN",description:"String",suggestions:[]}},{name:"--user-output-enabled",description:"Print user intended output to the console. Overrides the default *core/user_output_enabled* property value for this command invocation. Use *--no-user-output-enabled* to disable"},{name:"--verbosity",description:"Override the default verbosity for this command. Overrides the default *core/verbosity* property value for this command invocation. _VERBOSITY_ must be one of: *debug*, *info*, *warning*, *error*, *critical*, *none*",args:{name:"VERBOSITY",description:"String",suggestions:["debug","info","warning","error","critical","none"]}}]}],options:[{name:"--account",description:"Google Cloud Platform user account to use for invocation. Overrides the default *core/account* property value for this command invocation",args:{name:"ACCOUNT",description:"String",suggestions:[]}},{name:"--billing-project",description:"The Google Cloud Platform project that will be charged quota for operations performed in gcloud. If you need to operate on one project, but need quota against a different project, you can use this flag to specify the billing project. If both `billing/quota_project` and `--billing-project` are specified, `--billing-project` takes precedence. Run `$ gcloud config set --help` to see more information about `billing/quota_project`",args:{name:"BILLING_PROJECT",description:"String",suggestions:[]}},{name:"--configuration",description:`The configuration to use for this command invocation. For more
information on how to use configurations, run:
\`gcloud topic configurations\`.  You can also use the CLOUDSDK_ACTIVE_CONFIG_NAME environment
variable to set the equivalent of this flag for a terminal
session`,args:{name:"CONFIGURATION",description:"String",suggestions:[]}},{name:"--flags-file",description:`A YAML or JSON file that specifies a *--flag*:*value* dictionary.
Useful for specifying complex flag values with special characters
that work with any command interpreter. Additionally, each
*--flags-file* arg is replaced by its constituent flags. See
$ gcloud topic flags-file for more information`,args:{name:"YAML_FILE",description:"String",suggestions:[]}},{name:"--flatten",description:`Flatten _name_[] output resource slices in _KEY_ into separate records
for each item in each slice. Multiple keys and slices may be specified.
This also flattens keys for *--format* and *--filter*. For example,
*--flatten=abc.def* flattens *abc.def[].ghi* references to
*abc.def.ghi*. A resource record containing *abc.def[]* with N elements
will expand to N records in the flattened output. This flag interacts
with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--format",description:"Set the format for printing command output resources. The default is a\ncommand-specific human-friendly output format. The supported formats\nare: `config`, `csv`, `default`, `diff`, `disable`, `flattened`, `get`, `json`, `list`, `multi`, `none`, `object`, `table`, `text`, `value`, `yaml`. For more details run $ gcloud topic formats",args:{name:"FORMAT",description:"String",suggestions:[]}},{name:"--help",description:"Display detailed help"},{name:"--impersonate-service-account",description:"For this gcloud invocation, all API requests will be made as the given service account instead of the currently selected account. This is done without needing to create, download, and activate a key for the account. In order to perform operations as the service account, your currently selected account must have an IAM role that includes the iam.serviceAccounts.getAccessToken permission for the service account. The roles/iam.serviceAccountTokenCreator role has this permission or you may create a custom role. Overrides the default *auth/impersonate_service_account* property value for this command invocation",args:{name:"SERVICE_ACCOUNT_EMAIL",description:"String",suggestions:[]}},{name:"--log-http",description:"Log all HTTP server requests and responses to stderr. Overrides the default *core/log_http* property value for this command invocation"},{name:"--project",description:"The Google Cloud Platform project ID to use for this invocation. If\nomitted, then the current project is assumed; the current project can\nbe listed using `gcloud config list --format='text(core.project)'`\nand can be set using `gcloud config set project PROJECTID`.\n+\n`--project` and its fallback `core/project` property play two roles\nin the invocation. It specifies the project of the resource to\noperate on. It also specifies the project for API enablement check,\nquota, and billing. To specify a different project for quota and\nbilling, use `--billing-project` or `billing/quota_project` property",args:{name:"PROJECT_ID",description:"String",suggestions:[]}},{name:"--quiet",description:`Disable all interactive prompts when running gcloud commands. If input
is required, defaults will be used, or an error will be raised.
Overrides the default core/disable_prompts property value for this
command invocation. This is equivalent to setting the environment
variable \`CLOUDSDK_CORE_DISABLE_PROMPTS\` to 1`},{name:"--trace-token",description:"Token used to route traces of service requests for investigation of issues. Overrides the default *core/trace_token* property value for this command invocation",args:{name:"TRACE_TOKEN",description:"String",suggestions:[]}},{name:"--user-output-enabled",description:"Print user intended output to the console. Overrides the default *core/user_output_enabled* property value for this command invocation. Use *--no-user-output-enabled* to disable"},{name:"--verbosity",description:"Override the default verbosity for this command. Overrides the default *core/verbosity* property value for this command invocation. _VERBOSITY_ must be one of: *debug*, *info*, *warning*, *error*, *critical*, *none*",args:{name:"VERBOSITY",description:"String",suggestions:["debug","info","warning","error","critical","none"]}}]},{name:"images",description:"List and manipulate Google Container Registry images",subcommands:[{name:"add-tag",description:"Adds tags to existing image",options:[{name:"--account",description:"Google Cloud Platform user account to use for invocation. Overrides the default *core/account* property value for this command invocation",args:{name:"ACCOUNT",description:"String",suggestions:[]}},{name:"--billing-project",description:"The Google Cloud Platform project that will be charged quota for operations performed in gcloud. If you need to operate on one project, but need quota against a different project, you can use this flag to specify the billing project. If both `billing/quota_project` and `--billing-project` are specified, `--billing-project` takes precedence. Run `$ gcloud config set --help` to see more information about `billing/quota_project`",args:{name:"BILLING_PROJECT",description:"String",suggestions:[]}},{name:"--configuration",description:`The configuration to use for this command invocation. For more
information on how to use configurations, run:
\`gcloud topic configurations\`.  You can also use the CLOUDSDK_ACTIVE_CONFIG_NAME environment
variable to set the equivalent of this flag for a terminal
session`,args:{name:"CONFIGURATION",description:"String",suggestions:[]}},{name:"--flags-file",description:`A YAML or JSON file that specifies a *--flag*:*value* dictionary.
Useful for specifying complex flag values with special characters
that work with any command interpreter. Additionally, each
*--flags-file* arg is replaced by its constituent flags. See
$ gcloud topic flags-file for more information`,args:{name:"YAML_FILE",description:"String",suggestions:[]}},{name:"--flatten",description:`Flatten _name_[] output resource slices in _KEY_ into separate records
for each item in each slice. Multiple keys and slices may be specified.
This also flattens keys for *--format* and *--filter*. For example,
*--flatten=abc.def* flattens *abc.def[].ghi* references to
*abc.def.ghi*. A resource record containing *abc.def[]* with N elements
will expand to N records in the flattened output. This flag interacts
with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--format",description:"Set the format for printing command output resources. The default is a\ncommand-specific human-friendly output format. The supported formats\nare: `config`, `csv`, `default`, `diff`, `disable`, `flattened`, `get`, `json`, `list`, `multi`, `none`, `object`, `table`, `text`, `value`, `yaml`. For more details run $ gcloud topic formats",args:{name:"FORMAT",description:"String",suggestions:[]}},{name:"--help",description:"Display detailed help"},{name:"--impersonate-service-account",description:"For this gcloud invocation, all API requests will be made as the given service account instead of the currently selected account. This is done without needing to create, download, and activate a key for the account. In order to perform operations as the service account, your currently selected account must have an IAM role that includes the iam.serviceAccounts.getAccessToken permission for the service account. The roles/iam.serviceAccountTokenCreator role has this permission or you may create a custom role. Overrides the default *auth/impersonate_service_account* property value for this command invocation",args:{name:"SERVICE_ACCOUNT_EMAIL",description:"String",suggestions:[]}},{name:"--log-http",description:"Log all HTTP server requests and responses to stderr. Overrides the default *core/log_http* property value for this command invocation"},{name:"--project",description:"The Google Cloud Platform project ID to use for this invocation. If\nomitted, then the current project is assumed; the current project can\nbe listed using `gcloud config list --format='text(core.project)'`\nand can be set using `gcloud config set project PROJECTID`.\n+\n`--project` and its fallback `core/project` property play two roles\nin the invocation. It specifies the project of the resource to\noperate on. It also specifies the project for API enablement check,\nquota, and billing. To specify a different project for quota and\nbilling, use `--billing-project` or `billing/quota_project` property",args:{name:"PROJECT_ID",description:"String",suggestions:[]}},{name:"--quiet",description:`Disable all interactive prompts when running gcloud commands. If input
is required, defaults will be used, or an error will be raised.
Overrides the default core/disable_prompts property value for this
command invocation. This is equivalent to setting the environment
variable \`CLOUDSDK_CORE_DISABLE_PROMPTS\` to 1`},{name:"--trace-token",description:"Token used to route traces of service requests for investigation of issues. Overrides the default *core/trace_token* property value for this command invocation",args:{name:"TRACE_TOKEN",description:"String",suggestions:[]}},{name:"--user-output-enabled",description:"Print user intended output to the console. Overrides the default *core/user_output_enabled* property value for this command invocation. Use *--no-user-output-enabled* to disable"},{name:"--verbosity",description:"Override the default verbosity for this command. Overrides the default *core/verbosity* property value for this command invocation. _VERBOSITY_ must be one of: *debug*, *info*, *warning*, *error*, *critical*, *none*",args:{name:"VERBOSITY",description:"String",suggestions:["debug","info","warning","error","critical","none"]}}],args:[{name:"SRC_IMAGE",description:"The fully qualified name(s) of image(s) to add tags for. The name(s) should be formatted as *.gcr.io/PROJECT_ID/IMAGE_PATH@sha256:DIGEST or *.gcr.io/PROJECT_ID/IMAGE_PATH:TAG"},{name:"DEST_IMAGE",description:"The fully qualified name(s) of image(s) to be the new tags. The name(s) should be formatted as  *.gcr.io/PROJECT_ID/IMAGE_PATH:TAG",isVariadic:!0}]},{name:"delete",description:"Delete existing images",options:[{name:"--account",description:"Google Cloud Platform user account to use for invocation. Overrides the default *core/account* property value for this command invocation",args:{name:"ACCOUNT",description:"String",suggestions:[]}},{name:"--billing-project",description:"The Google Cloud Platform project that will be charged quota for operations performed in gcloud. If you need to operate on one project, but need quota against a different project, you can use this flag to specify the billing project. If both `billing/quota_project` and `--billing-project` are specified, `--billing-project` takes precedence. Run `$ gcloud config set --help` to see more information about `billing/quota_project`",args:{name:"BILLING_PROJECT",description:"String",suggestions:[]}},{name:"--configuration",description:`The configuration to use for this command invocation. For more
information on how to use configurations, run:
\`gcloud topic configurations\`.  You can also use the CLOUDSDK_ACTIVE_CONFIG_NAME environment
variable to set the equivalent of this flag for a terminal
session`,args:{name:"CONFIGURATION",description:"String",suggestions:[]}},{name:"--flags-file",description:`A YAML or JSON file that specifies a *--flag*:*value* dictionary.
Useful for specifying complex flag values with special characters
that work with any command interpreter. Additionally, each
*--flags-file* arg is replaced by its constituent flags. See
$ gcloud topic flags-file for more information`,args:{name:"YAML_FILE",description:"String",suggestions:[]}},{name:"--flatten",description:`Flatten _name_[] output resource slices in _KEY_ into separate records
for each item in each slice. Multiple keys and slices may be specified.
This also flattens keys for *--format* and *--filter*. For example,
*--flatten=abc.def* flattens *abc.def[].ghi* references to
*abc.def.ghi*. A resource record containing *abc.def[]* with N elements
will expand to N records in the flattened output. This flag interacts
with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--force-delete-tags",description:"If there are tags pointing to an image to be deleted then they must all be specified explicitly, or this flag must be specified, for the command to succeed"},{name:"--format",description:"Set the format for printing command output resources. The default is a\ncommand-specific human-friendly output format. The supported formats\nare: `config`, `csv`, `default`, `diff`, `disable`, `flattened`, `get`, `json`, `list`, `multi`, `none`, `object`, `table`, `text`, `value`, `yaml`. For more details run $ gcloud topic formats",args:{name:"FORMAT",description:"String",suggestions:[]}},{name:"--help",description:"Display detailed help"},{name:"--impersonate-service-account",description:"For this gcloud invocation, all API requests will be made as the given service account instead of the currently selected account. This is done without needing to create, download, and activate a key for the account. In order to perform operations as the service account, your currently selected account must have an IAM role that includes the iam.serviceAccounts.getAccessToken permission for the service account. The roles/iam.serviceAccountTokenCreator role has this permission or you may create a custom role. Overrides the default *auth/impersonate_service_account* property value for this command invocation",args:{name:"SERVICE_ACCOUNT_EMAIL",description:"String",suggestions:[]}},{name:"--log-http",description:"Log all HTTP server requests and responses to stderr. Overrides the default *core/log_http* property value for this command invocation"},{name:"--project",description:"The Google Cloud Platform project ID to use for this invocation. If\nomitted, then the current project is assumed; the current project can\nbe listed using `gcloud config list --format='text(core.project)'`\nand can be set using `gcloud config set project PROJECTID`.\n+\n`--project` and its fallback `core/project` property play two roles\nin the invocation. It specifies the project of the resource to\noperate on. It also specifies the project for API enablement check,\nquota, and billing. To specify a different project for quota and\nbilling, use `--billing-project` or `billing/quota_project` property",args:{name:"PROJECT_ID",description:"String",suggestions:[]}},{name:"--quiet",description:`Disable all interactive prompts when running gcloud commands. If input
is required, defaults will be used, or an error will be raised.
Overrides the default core/disable_prompts property value for this
command invocation. This is equivalent to setting the environment
variable \`CLOUDSDK_CORE_DISABLE_PROMPTS\` to 1`},{name:"--trace-token",description:"Token used to route traces of service requests for investigation of issues. Overrides the default *core/trace_token* property value for this command invocation",args:{name:"TRACE_TOKEN",description:"String",suggestions:[]}},{name:"--user-output-enabled",description:"Print user intended output to the console. Overrides the default *core/user_output_enabled* property value for this command invocation. Use *--no-user-output-enabled* to disable"},{name:"--verbosity",description:"Override the default verbosity for this command. Overrides the default *core/verbosity* property value for this command invocation. _VERBOSITY_ must be one of: *debug*, *info*, *warning*, *error*, *critical*, *none*",args:{name:"VERBOSITY",description:"String",suggestions:["debug","info","warning","error","critical","none"]}}],args:{name:"IMAGE_NAME",description:"The fully qualified name(s) of image(s) to delete. The name(s) should be formatted as *.gcr.io/PROJECT_ID/IMAGE_PATH@sha256:DIGEST or *.gcr.io/PROJECT_ID/IMAGE_PATH:TAG",isVariadic:!0}},{name:"describe",description:"Lists information about the specified image",options:[{name:"--account",description:"Google Cloud Platform user account to use for invocation. Overrides the default *core/account* property value for this command invocation",args:{name:"ACCOUNT",description:"String",suggestions:[]}},{name:"--billing-project",description:"The Google Cloud Platform project that will be charged quota for operations performed in gcloud. If you need to operate on one project, but need quota against a different project, you can use this flag to specify the billing project. If both `billing/quota_project` and `--billing-project` are specified, `--billing-project` takes precedence. Run `$ gcloud config set --help` to see more information about `billing/quota_project`",args:{name:"BILLING_PROJECT",description:"String",suggestions:[]}},{name:"--configuration",description:`The configuration to use for this command invocation. For more
information on how to use configurations, run:
\`gcloud topic configurations\`.  You can also use the CLOUDSDK_ACTIVE_CONFIG_NAME environment
variable to set the equivalent of this flag for a terminal
session`,args:{name:"CONFIGURATION",description:"String",suggestions:[]}},{name:"--flags-file",description:`A YAML or JSON file that specifies a *--flag*:*value* dictionary.
Useful for specifying complex flag values with special characters
that work with any command interpreter. Additionally, each
*--flags-file* arg is replaced by its constituent flags. See
$ gcloud topic flags-file for more information`,args:{name:"YAML_FILE",description:"String",suggestions:[]}},{name:"--flatten",description:`Flatten _name_[] output resource slices in _KEY_ into separate records
for each item in each slice. Multiple keys and slices may be specified.
This also flattens keys for *--format* and *--filter*. For example,
*--flatten=abc.def* flattens *abc.def[].ghi* references to
*abc.def.ghi*. A resource record containing *abc.def[]* with N elements
will expand to N records in the flattened output. This flag interacts
with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--format",description:"Set the format for printing command output resources. The default is a\ncommand-specific human-friendly output format. The supported formats\nare: `config`, `csv`, `default`, `diff`, `disable`, `flattened`, `get`, `json`, `list`, `multi`, `none`, `object`, `table`, `text`, `value`, `yaml`. For more details run $ gcloud topic formats",args:{name:"FORMAT",description:"String",suggestions:[]}},{name:"--help",description:"Display detailed help"},{name:"--impersonate-service-account",description:"For this gcloud invocation, all API requests will be made as the given service account instead of the currently selected account. This is done without needing to create, download, and activate a key for the account. In order to perform operations as the service account, your currently selected account must have an IAM role that includes the iam.serviceAccounts.getAccessToken permission for the service account. The roles/iam.serviceAccountTokenCreator role has this permission or you may create a custom role. Overrides the default *auth/impersonate_service_account* property value for this command invocation",args:{name:"SERVICE_ACCOUNT_EMAIL",description:"String",suggestions:[]}},{name:"--log-http",description:"Log all HTTP server requests and responses to stderr. Overrides the default *core/log_http* property value for this command invocation"},{name:"--project",description:"The Google Cloud Platform project ID to use for this invocation. If\nomitted, then the current project is assumed; the current project can\nbe listed using `gcloud config list --format='text(core.project)'`\nand can be set using `gcloud config set project PROJECTID`.\n+\n`--project` and its fallback `core/project` property play two roles\nin the invocation. It specifies the project of the resource to\noperate on. It also specifies the project for API enablement check,\nquota, and billing. To specify a different project for quota and\nbilling, use `--billing-project` or `billing/quota_project` property",args:{name:"PROJECT_ID",description:"String",suggestions:[]}},{name:"--quiet",description:`Disable all interactive prompts when running gcloud commands. If input
is required, defaults will be used, or an error will be raised.
Overrides the default core/disable_prompts property value for this
command invocation. This is equivalent to setting the environment
variable \`CLOUDSDK_CORE_DISABLE_PROMPTS\` to 1`},{name:"--trace-token",description:"Token used to route traces of service requests for investigation of issues. Overrides the default *core/trace_token* property value for this command invocation",args:{name:"TRACE_TOKEN",description:"String",suggestions:[]}},{name:"--user-output-enabled",description:"Print user intended output to the console. Overrides the default *core/user_output_enabled* property value for this command invocation. Use *--no-user-output-enabled* to disable"},{name:"--verbosity",description:"Override the default verbosity for this command. Overrides the default *core/verbosity* property value for this command invocation. _VERBOSITY_ must be one of: *debug*, *info*, *warning*, *error*, *critical*, *none*",args:{name:"VERBOSITY",description:"String",suggestions:["debug","info","warning","error","critical","none"]}}],args:{name:"IMAGE_NAME",description:"The fully qualified name(s) of image(s) to describe. The name(s) should be formatted as *.gcr.io/PROJECT_ID/IMAGE_PATH@sha256:DIGEST or *.gcr.io/PROJECT_ID/IMAGE_PATH:TAG"}},{name:"list",description:"List existing images",options:[{name:"--account",description:"Google Cloud Platform user account to use for invocation. Overrides the default *core/account* property value for this command invocation",args:{name:"ACCOUNT",description:"String",suggestions:[]}},{name:"--billing-project",description:"The Google Cloud Platform project that will be charged quota for operations performed in gcloud. If you need to operate on one project, but need quota against a different project, you can use this flag to specify the billing project. If both `billing/quota_project` and `--billing-project` are specified, `--billing-project` takes precedence. Run `$ gcloud config set --help` to see more information about `billing/quota_project`",args:{name:"BILLING_PROJECT",description:"String",suggestions:[]}},{name:"--configuration",description:`The configuration to use for this command invocation. For more
information on how to use configurations, run:
\`gcloud topic configurations\`.  You can also use the CLOUDSDK_ACTIVE_CONFIG_NAME environment
variable to set the equivalent of this flag for a terminal
session`,args:{name:"CONFIGURATION",description:"String",suggestions:[]}},{name:"--filter",description:`Apply a Boolean filter _EXPRESSION_ to each resource item to be listed.
If the expression evaluates \`True\`, then that item is listed. For more
details and examples of filter expressions, run $ gcloud topic filters. This
flag interacts with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"EXPRESSION",description:"String",suggestions:[]}},{name:"--flags-file",description:`A YAML or JSON file that specifies a *--flag*:*value* dictionary.
Useful for specifying complex flag values with special characters
that work with any command interpreter. Additionally, each
*--flags-file* arg is replaced by its constituent flags. See
$ gcloud topic flags-file for more information`,args:{name:"YAML_FILE",description:"String",suggestions:[]}},{name:"--flatten",description:`Flatten _name_[] output resource slices in _KEY_ into separate records
for each item in each slice. Multiple keys and slices may be specified.
This also flattens keys for *--format* and *--filter*. For example,
*--flatten=abc.def* flattens *abc.def[].ghi* references to
*abc.def.ghi*. A resource record containing *abc.def[]* with N elements
will expand to N records in the flattened output. This flag interacts
with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--format",description:"Set the format for printing command output resources. The default is a\ncommand-specific human-friendly output format. The supported formats\nare: `config`, `csv`, `default`, `diff`, `disable`, `flattened`, `get`, `json`, `list`, `multi`, `none`, `object`, `table`, `text`, `value`, `yaml`. For more details run $ gcloud topic formats",args:{name:"FORMAT",description:"String",suggestions:[]}},{name:"--help",description:"Display detailed help"},{name:"--impersonate-service-account",description:"For this gcloud invocation, all API requests will be made as the given service account instead of the currently selected account. This is done without needing to create, download, and activate a key for the account. In order to perform operations as the service account, your currently selected account must have an IAM role that includes the iam.serviceAccounts.getAccessToken permission for the service account. The roles/iam.serviceAccountTokenCreator role has this permission or you may create a custom role. Overrides the default *auth/impersonate_service_account* property value for this command invocation",args:{name:"SERVICE_ACCOUNT_EMAIL",description:"String",suggestions:[]}},{name:"--limit",description:`Maximum number of resources to list. The default is *unlimited*.
This flag interacts with other flags that are applied in this order:
*--flatten*, *--sort-by*, *--filter*, *--limit*`,args:{name:"LIMIT",description:"Googlecloudsdk.calliope.arg_parsers:Parse",suggestions:[]}},{name:"--log-http",description:"Log all HTTP server requests and responses to stderr. Overrides the default *core/log_http* property value for this command invocation"},{name:"--page-size",description:`Some services group resource list output into pages. This flag specifies
the maximum number of resources per page. The default is determined by the
service if it supports paging, otherwise it is *unlimited* (no paging).
Paging may be applied before or after *--filter* and *--limit* depending
on the service`,args:{name:"PAGE_SIZE",description:"Googlecloudsdk.calliope.arg_parsers:Parse",suggestions:[]}},{name:"--project",description:"The Google Cloud Platform project ID to use for this invocation. If\nomitted, then the current project is assumed; the current project can\nbe listed using `gcloud config list --format='text(core.project)'`\nand can be set using `gcloud config set project PROJECTID`.\n+\n`--project` and its fallback `core/project` property play two roles\nin the invocation. It specifies the project of the resource to\noperate on. It also specifies the project for API enablement check,\nquota, and billing. To specify a different project for quota and\nbilling, use `--billing-project` or `billing/quota_project` property",args:{name:"PROJECT_ID",description:"String",suggestions:[]}},{name:"--quiet",description:`Disable all interactive prompts when running gcloud commands. If input
is required, defaults will be used, or an error will be raised.
Overrides the default core/disable_prompts property value for this
command invocation. This is equivalent to setting the environment
variable \`CLOUDSDK_CORE_DISABLE_PROMPTS\` to 1`},{name:"--repository",description:"The name of the repository. Format: *.gcr.io/repository. Defaults to gcr.io/<project>, for the active project",args:{name:"REPOSITORY",description:"String",suggestions:[]}},{name:"--sort-by",description:`Comma-separated list of resource field key names to sort by. The
default order is ascending. Prefix a field with \`\`~'' for descending
order on that field. This flag interacts with other flags that are applied
in this order: *--flatten*, *--sort-by*, *--filter*, *--limit*`,args:{name:"FIELD",description:"List",suggestions:[]}},{name:"--trace-token",description:"Token used to route traces of service requests for investigation of issues. Overrides the default *core/trace_token* property value for this command invocation",args:{name:"TRACE_TOKEN",description:"String",suggestions:[]}},{name:"--uri",description:"Print a list of resource URIs instead of the default output"},{name:"--user-output-enabled",description:"Print user intended output to the console. Overrides the default *core/user_output_enabled* property value for this command invocation. Use *--no-user-output-enabled* to disable"},{name:"--verbosity",description:"Override the default verbosity for this command. Overrides the default *core/verbosity* property value for this command invocation. _VERBOSITY_ must be one of: *debug*, *info*, *warning*, *error*, *critical*, *none*",args:{name:"VERBOSITY",description:"String",suggestions:["debug","info","warning","error","critical","none"]}}]},{name:"list-tags",description:"List tags and digests for the specified image",options:[{name:"--account",description:"Google Cloud Platform user account to use for invocation. Overrides the default *core/account* property value for this command invocation",args:{name:"ACCOUNT",description:"String",suggestions:[]}},{name:"--billing-project",description:"The Google Cloud Platform project that will be charged quota for operations performed in gcloud. If you need to operate on one project, but need quota against a different project, you can use this flag to specify the billing project. If both `billing/quota_project` and `--billing-project` are specified, `--billing-project` takes precedence. Run `$ gcloud config set --help` to see more information about `billing/quota_project`",args:{name:"BILLING_PROJECT",description:"String",suggestions:[]}},{name:"--configuration",description:`The configuration to use for this command invocation. For more
information on how to use configurations, run:
\`gcloud topic configurations\`.  You can also use the CLOUDSDK_ACTIVE_CONFIG_NAME environment
variable to set the equivalent of this flag for a terminal
session`,args:{name:"CONFIGURATION",description:"String",suggestions:[]}},{name:"--filter",description:`Apply a Boolean filter _EXPRESSION_ to each resource item to be listed.
If the expression evaluates \`True\`, then that item is listed. For more
details and examples of filter expressions, run $ gcloud topic filters. This
flag interacts with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"EXPRESSION",description:"String",suggestions:[]}},{name:"--flags-file",description:`A YAML or JSON file that specifies a *--flag*:*value* dictionary.
Useful for specifying complex flag values with special characters
that work with any command interpreter. Additionally, each
*--flags-file* arg is replaced by its constituent flags. See
$ gcloud topic flags-file for more information`,args:{name:"YAML_FILE",description:"String",suggestions:[]}},{name:"--flatten",description:`Flatten _name_[] output resource slices in _KEY_ into separate records
for each item in each slice. Multiple keys and slices may be specified.
This also flattens keys for *--format* and *--filter*. For example,
*--flatten=abc.def* flattens *abc.def[].ghi* references to
*abc.def.ghi*. A resource record containing *abc.def[]* with N elements
will expand to N records in the flattened output. This flag interacts
with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--format",description:"Set the format for printing command output resources. The default is a\ncommand-specific human-friendly output format. The supported formats\nare: `config`, `csv`, `default`, `diff`, `disable`, `flattened`, `get`, `json`, `list`, `multi`, `none`, `object`, `table`, `text`, `value`, `yaml`. For more details run $ gcloud topic formats",args:{name:"FORMAT",description:"String",suggestions:[]}},{name:"--help",description:"Display detailed help"},{name:"--impersonate-service-account",description:"For this gcloud invocation, all API requests will be made as the given service account instead of the currently selected account. This is done without needing to create, download, and activate a key for the account. In order to perform operations as the service account, your currently selected account must have an IAM role that includes the iam.serviceAccounts.getAccessToken permission for the service account. The roles/iam.serviceAccountTokenCreator role has this permission or you may create a custom role. Overrides the default *auth/impersonate_service_account* property value for this command invocation",args:{name:"SERVICE_ACCOUNT_EMAIL",description:"String",suggestions:[]}},{name:"--limit",description:`Maximum number of resources to list. The default is *unlimited*.
This flag interacts with other flags that are applied in this order:
*--flatten*, *--sort-by*, *--filter*, *--limit*`,args:{name:"LIMIT",description:"Googlecloudsdk.calliope.arg_parsers:Parse",suggestions:[]}},{name:"--log-http",description:"Log all HTTP server requests and responses to stderr. Overrides the default *core/log_http* property value for this command invocation"},{name:"--page-size",description:`Some services group resource list output into pages. This flag specifies
the maximum number of resources per page. The default is determined by the
service if it supports paging, otherwise it is *unlimited* (no paging).
Paging may be applied before or after *--filter* and *--limit* depending
on the service`,args:{name:"PAGE_SIZE",description:"Googlecloudsdk.calliope.arg_parsers:Parse",suggestions:[]}},{name:"--project",description:"The Google Cloud Platform project ID to use for this invocation. If\nomitted, then the current project is assumed; the current project can\nbe listed using `gcloud config list --format='text(core.project)'`\nand can be set using `gcloud config set project PROJECTID`.\n+\n`--project` and its fallback `core/project` property play two roles\nin the invocation. It specifies the project of the resource to\noperate on. It also specifies the project for API enablement check,\nquota, and billing. To specify a different project for quota and\nbilling, use `--billing-project` or `billing/quota_project` property",args:{name:"PROJECT_ID",description:"String",suggestions:[]}},{name:"--quiet",description:`Disable all interactive prompts when running gcloud commands. If input
is required, defaults will be used, or an error will be raised.
Overrides the default core/disable_prompts property value for this
command invocation. This is equivalent to setting the environment
variable \`CLOUDSDK_CORE_DISABLE_PROMPTS\` to 1`},{name:"--sort-by",description:`Comma-separated list of resource field key names to sort by. The
default order is ascending. Prefix a field with \`\`~'' for descending
order on that field. This flag interacts with other flags that are applied
in this order: *--flatten*, *--sort-by*, *--filter*, *--limit*.
 The default is *~timestamp*`,args:{name:"FIELD",description:"List",suggestions:[]}},{name:"--trace-token",description:"Token used to route traces of service requests for investigation of issues. Overrides the default *core/trace_token* property value for this command invocation",args:{name:"TRACE_TOKEN",description:"String",suggestions:[]}},{name:"--user-output-enabled",description:"Print user intended output to the console. Overrides the default *core/user_output_enabled* property value for this command invocation. Use *--no-user-output-enabled* to disable"},{name:"--verbosity",description:"Override the default verbosity for this command. Overrides the default *core/verbosity* property value for this command invocation. _VERBOSITY_ must be one of: *debug*, *info*, *warning*, *error*, *critical*, *none*",args:{name:"VERBOSITY",description:"String",suggestions:["debug","info","warning","error","critical","none"]}}],args:{name:"IMAGE_NAME",description:"The name of the image to list tags for. The name format should be *.gcr.io/PROJECT_ID/IMAGE_PATH"}},{name:"untag",description:"Remove existing image tags",options:[{name:"--account",description:"Google Cloud Platform user account to use for invocation. Overrides the default *core/account* property value for this command invocation",args:{name:"ACCOUNT",description:"String",suggestions:[]}},{name:"--billing-project",description:"The Google Cloud Platform project that will be charged quota for operations performed in gcloud. If you need to operate on one project, but need quota against a different project, you can use this flag to specify the billing project. If both `billing/quota_project` and `--billing-project` are specified, `--billing-project` takes precedence. Run `$ gcloud config set --help` to see more information about `billing/quota_project`",args:{name:"BILLING_PROJECT",description:"String",suggestions:[]}},{name:"--configuration",description:`The configuration to use for this command invocation. For more
information on how to use configurations, run:
\`gcloud topic configurations\`.  You can also use the CLOUDSDK_ACTIVE_CONFIG_NAME environment
variable to set the equivalent of this flag for a terminal
session`,args:{name:"CONFIGURATION",description:"String",suggestions:[]}},{name:"--flags-file",description:`A YAML or JSON file that specifies a *--flag*:*value* dictionary.
Useful for specifying complex flag values with special characters
that work with any command interpreter. Additionally, each
*--flags-file* arg is replaced by its constituent flags. See
$ gcloud topic flags-file for more information`,args:{name:"YAML_FILE",description:"String",suggestions:[]}},{name:"--flatten",description:`Flatten _name_[] output resource slices in _KEY_ into separate records
for each item in each slice. Multiple keys and slices may be specified.
This also flattens keys for *--format* and *--filter*. For example,
*--flatten=abc.def* flattens *abc.def[].ghi* references to
*abc.def.ghi*. A resource record containing *abc.def[]* with N elements
will expand to N records in the flattened output. This flag interacts
with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--format",description:"Set the format for printing command output resources. The default is a\ncommand-specific human-friendly output format. The supported formats\nare: `config`, `csv`, `default`, `diff`, `disable`, `flattened`, `get`, `json`, `list`, `multi`, `none`, `object`, `table`, `text`, `value`, `yaml`. For more details run $ gcloud topic formats",args:{name:"FORMAT",description:"String",suggestions:[]}},{name:"--help",description:"Display detailed help"},{name:"--impersonate-service-account",description:"For this gcloud invocation, all API requests will be made as the given service account instead of the currently selected account. This is done without needing to create, download, and activate a key for the account. In order to perform operations as the service account, your currently selected account must have an IAM role that includes the iam.serviceAccounts.getAccessToken permission for the service account. The roles/iam.serviceAccountTokenCreator role has this permission or you may create a custom role. Overrides the default *auth/impersonate_service_account* property value for this command invocation",args:{name:"SERVICE_ACCOUNT_EMAIL",description:"String",suggestions:[]}},{name:"--log-http",description:"Log all HTTP server requests and responses to stderr. Overrides the default *core/log_http* property value for this command invocation"},{name:"--project",description:"The Google Cloud Platform project ID to use for this invocation. If\nomitted, then the current project is assumed; the current project can\nbe listed using `gcloud config list --format='text(core.project)'`\nand can be set using `gcloud config set project PROJECTID`.\n+\n`--project` and its fallback `core/project` property play two roles\nin the invocation. It specifies the project of the resource to\noperate on. It also specifies the project for API enablement check,\nquota, and billing. To specify a different project for quota and\nbilling, use `--billing-project` or `billing/quota_project` property",args:{name:"PROJECT_ID",description:"String",suggestions:[]}},{name:"--quiet",description:`Disable all interactive prompts when running gcloud commands. If input
is required, defaults will be used, or an error will be raised.
Overrides the default core/disable_prompts property value for this
command invocation. This is equivalent to setting the environment
variable \`CLOUDSDK_CORE_DISABLE_PROMPTS\` to 1`},{name:"--trace-token",description:"Token used to route traces of service requests for investigation of issues. Overrides the default *core/trace_token* property value for this command invocation",args:{name:"TRACE_TOKEN",description:"String",suggestions:[]}},{name:"--user-output-enabled",description:"Print user intended output to the console. Overrides the default *core/user_output_enabled* property value for this command invocation. Use *--no-user-output-enabled* to disable"},{name:"--verbosity",description:"Override the default verbosity for this command. Overrides the default *core/verbosity* property value for this command invocation. _VERBOSITY_ must be one of: *debug*, *info*, *warning*, *error*, *critical*, *none*",args:{name:"VERBOSITY",description:"String",suggestions:["debug","info","warning","error","critical","none"]}}],args:{name:"IMAGE_NAME",description:"The fully qualified name(s) of image(s) to untag. The name(s) should be formatted as  *.gcr.io/PROJECT_ID/IMAGE_PATH:TAG",isVariadic:!0}}],options:[{name:"--account",description:"Google Cloud Platform user account to use for invocation. Overrides the default *core/account* property value for this command invocation",args:{name:"ACCOUNT",description:"String",suggestions:[]}},{name:"--billing-project",description:"The Google Cloud Platform project that will be charged quota for operations performed in gcloud. If you need to operate on one project, but need quota against a different project, you can use this flag to specify the billing project. If both `billing/quota_project` and `--billing-project` are specified, `--billing-project` takes precedence. Run `$ gcloud config set --help` to see more information about `billing/quota_project`",args:{name:"BILLING_PROJECT",description:"String",suggestions:[]}},{name:"--configuration",description:`The configuration to use for this command invocation. For more
information on how to use configurations, run:
\`gcloud topic configurations\`.  You can also use the CLOUDSDK_ACTIVE_CONFIG_NAME environment
variable to set the equivalent of this flag for a terminal
session`,args:{name:"CONFIGURATION",description:"String",suggestions:[]}},{name:"--flags-file",description:`A YAML or JSON file that specifies a *--flag*:*value* dictionary.
Useful for specifying complex flag values with special characters
that work with any command interpreter. Additionally, each
*--flags-file* arg is replaced by its constituent flags. See
$ gcloud topic flags-file for more information`,args:{name:"YAML_FILE",description:"String",suggestions:[]}},{name:"--flatten",description:`Flatten _name_[] output resource slices in _KEY_ into separate records
for each item in each slice. Multiple keys and slices may be specified.
This also flattens keys for *--format* and *--filter*. For example,
*--flatten=abc.def* flattens *abc.def[].ghi* references to
*abc.def.ghi*. A resource record containing *abc.def[]* with N elements
will expand to N records in the flattened output. This flag interacts
with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--format",description:"Set the format for printing command output resources. The default is a\ncommand-specific human-friendly output format. The supported formats\nare: `config`, `csv`, `default`, `diff`, `disable`, `flattened`, `get`, `json`, `list`, `multi`, `none`, `object`, `table`, `text`, `value`, `yaml`. For more details run $ gcloud topic formats",args:{name:"FORMAT",description:"String",suggestions:[]}},{name:"--help",description:"Display detailed help"},{name:"--impersonate-service-account",description:"For this gcloud invocation, all API requests will be made as the given service account instead of the currently selected account. This is done without needing to create, download, and activate a key for the account. In order to perform operations as the service account, your currently selected account must have an IAM role that includes the iam.serviceAccounts.getAccessToken permission for the service account. The roles/iam.serviceAccountTokenCreator role has this permission or you may create a custom role. Overrides the default *auth/impersonate_service_account* property value for this command invocation",args:{name:"SERVICE_ACCOUNT_EMAIL",description:"String",suggestions:[]}},{name:"--log-http",description:"Log all HTTP server requests and responses to stderr. Overrides the default *core/log_http* property value for this command invocation"},{name:"--project",description:"The Google Cloud Platform project ID to use for this invocation. If\nomitted, then the current project is assumed; the current project can\nbe listed using `gcloud config list --format='text(core.project)'`\nand can be set using `gcloud config set project PROJECTID`.\n+\n`--project` and its fallback `core/project` property play two roles\nin the invocation. It specifies the project of the resource to\noperate on. It also specifies the project for API enablement check,\nquota, and billing. To specify a different project for quota and\nbilling, use `--billing-project` or `billing/quota_project` property",args:{name:"PROJECT_ID",description:"String",suggestions:[]}},{name:"--quiet",description:`Disable all interactive prompts when running gcloud commands. If input
is required, defaults will be used, or an error will be raised.
Overrides the default core/disable_prompts property value for this
command invocation. This is equivalent to setting the environment
variable \`CLOUDSDK_CORE_DISABLE_PROMPTS\` to 1`},{name:"--trace-token",description:"Token used to route traces of service requests for investigation of issues. Overrides the default *core/trace_token* property value for this command invocation",args:{name:"TRACE_TOKEN",description:"String",suggestions:[]}},{name:"--user-output-enabled",description:"Print user intended output to the console. Overrides the default *core/user_output_enabled* property value for this command invocation. Use *--no-user-output-enabled* to disable"},{name:"--verbosity",description:"Override the default verbosity for this command. Overrides the default *core/verbosity* property value for this command invocation. _VERBOSITY_ must be one of: *debug*, *info*, *warning*, *error*, *critical*, *none*",args:{name:"VERBOSITY",description:"String",suggestions:["debug","info","warning","error","critical","none"]}}]},{name:"node-pools",description:"Create and delete operations for Google Kubernetes Engine node pools",subcommands:[{name:"create",description:"Create a node pool in a running cluster",options:[{name:"--accelerator",description:`Attaches accelerators (e.g. GPUs) to all nodes.
+
*type*::: (Required) The specific type (e.g. nvidia-tesla-k80 for nVidia Tesla K80)
of accelerator to attach to the instances. Use \`\`\`gcloud compute
accelerator-types list\`\`\` to learn about all available accelerator types.
+
*count*::: (Optional) The number of accelerators to attach to the
instances. The default value is 1`,args:{name:"type=TYPE,[count=COUNT]",description:"Dict",suggestions:[]}},{name:"--account",description:"Google Cloud Platform user account to use for invocation. Overrides the default *core/account* property value for this command invocation",args:{name:"ACCOUNT",description:"String",suggestions:[]}},{name:"--billing-project",description:"The Google Cloud Platform project that will be charged quota for operations performed in gcloud. If you need to operate on one project, but need quota against a different project, you can use this flag to specify the billing project. If both `billing/quota_project` and `--billing-project` are specified, `--billing-project` takes precedence. Run `$ gcloud config set --help` to see more information about `billing/quota_project`",args:{name:"BILLING_PROJECT",description:"String",suggestions:[]}},{name:"--boot-disk-kms-key",description:`The Customer Managed Encryption Key used to encrypt the boot disk attached
to each node in the node pool. This should be of the form
projects/[KEY_PROJECT_ID]/locations/[LOCATION]/keyRings/[RING_NAME]/cryptoKeys/[KEY_NAME].
For more information about protecting resources with Cloud KMS Keys please
see:
https://cloud.google.com/compute/docs/disks/customer-managed-encryption`,args:{name:"BOOT_DISK_KMS_KEY",description:"String",suggestions:[]}},{name:"--cluster",description:"The cluster to add the node pool to. Overrides the default *container/cluster* property value for this command invocation",args:{name:"CLUSTER",description:"String",suggestions:[]}},{name:"--configuration",description:`The configuration to use for this command invocation. For more
information on how to use configurations, run:
\`gcloud topic configurations\`.  You can also use the CLOUDSDK_ACTIVE_CONFIG_NAME environment
variable to set the equivalent of this flag for a terminal
session`,args:{name:"CONFIGURATION",description:"String",suggestions:[]}},{name:"--disk-size",description:"Size for node VM boot disks. Defaults to 100GB",args:{name:"DISK_SIZE",description:"Googlecloudsdk.calliope.arg_parsers:ParseWithBoundsChecking",suggestions:[]}},{name:"--disk-type",description:"Type of the node VM boot disk. Defaults to pd-standard. _DISK_TYPE_ must be one of: *pd-standard*, *pd-ssd*, *pd-balanced*",args:{name:"DISK_TYPE",description:"String",suggestions:["pd-standard","pd-ssd","pd-balanced"]}},{name:"--enable-autoprovisioning",description:`Enables Cluster Autoscaler to treat the node pool as if it was autoprovisioned.
+
Cluster Autoscaler will be able to delete the node pool if it's unneeded`},{name:"--enable-autorepair",description:`Enable node autorepair feature for a node pool.
+
  $ {command} node-pool-1 --cluster=example-cluster --enable-autorepair
+
Node autorepair is enabled by default for node pools using COS, COS_CONTAINERD, UBUNTU or UBUNTU_CONTAINERD
as a base image, use --no-enable-autorepair to disable.
+
See https://cloud.google.com/kubernetes-engine/docs/how-to/node-auto-repair for more info`},{name:"--enable-autoscaling",description:`Enables autoscaling for a node pool.
+
Enables autoscaling in the node pool specified by --node-pool or
the default node pool if --node-pool is not provided`},{name:"--enable-autoupgrade",description:`Sets autoupgrade feature for a node pool.
+
  $ {command} node-pool-1 --cluster=example-cluster --enable-autoupgrade
+
See https://cloud.google.com/kubernetes-engine/docs/node-auto-upgrades for more info.
+
Enabled by default, use *--no-enable-autoupgrade* to disable`},{name:"--flags-file",description:`A YAML or JSON file that specifies a *--flag*:*value* dictionary.
Useful for specifying complex flag values with special characters
that work with any command interpreter. Additionally, each
*--flags-file* arg is replaced by its constituent flags. See
$ gcloud topic flags-file for more information`,args:{name:"YAML_FILE",description:"String",suggestions:[]}},{name:"--flatten",description:`Flatten _name_[] output resource slices in _KEY_ into separate records
for each item in each slice. Multiple keys and slices may be specified.
This also flattens keys for *--format* and *--filter*. For example,
*--flatten=abc.def* flattens *abc.def[].ghi* references to
*abc.def.ghi*. A resource record containing *abc.def[]* with N elements
will expand to N records in the flattened output. This flag interacts
with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--format",description:"Set the format for printing command output resources. The default is a\ncommand-specific human-friendly output format. The supported formats\nare: `config`, `csv`, `default`, `diff`, `disable`, `flattened`, `get`, `json`, `list`, `multi`, `none`, `object`, `table`, `text`, `value`, `yaml`. For more details run $ gcloud topic formats",args:{name:"FORMAT",description:"String",suggestions:[]}},{name:"--help",description:"Display detailed help"},{name:"--image-type",description:`The image type to use for the node pool. Defaults to server-specified.
+
Image Type specifies the base OS that the nodes in the node pool will run on.
If an image type is specified, that will be assigned to the node pool and all
future upgrades will use the specified image type. If it is not specified the
server will pick the default image type.
+
The default image type and the list of valid image types are available
using the following command.
+
  $ gcloud container get-server-config`,args:{name:"IMAGE_TYPE",description:"String",suggestions:[]}},{name:"--impersonate-service-account",description:"For this gcloud invocation, all API requests will be made as the given service account instead of the currently selected account. This is done without needing to create, download, and activate a key for the account. In order to perform operations as the service account, your currently selected account must have an IAM role that includes the iam.serviceAccounts.getAccessToken permission for the service account. The roles/iam.serviceAccountTokenCreator role has this permission or you may create a custom role. Overrides the default *auth/impersonate_service_account* property value for this command invocation",args:{name:"SERVICE_ACCOUNT_EMAIL",description:"String",suggestions:[]}},{name:"--local-ssd-count",description:`The number of local SSD disks to provision on each node, formatted and mounted
in the filesystem.
+
Local SSDs have a fixed 375 GB capacity per device. The number of disks that
can be attached to an instance is limited by the maximum number of disks
available on a machine, which differs by compute zone. See
https://cloud.google.com/compute/docs/disks/local-ssd for more information`,args:{name:"LOCAL_SSD_COUNT",description:"Int",suggestions:[]}},{name:"--log-http",description:"Log all HTTP server requests and responses to stderr. Overrides the default *core/log_http* property value for this command invocation"},{name:"--machine-type",description:'The type of machine to use for nodes. Defaults to e2-medium.\nThe list of predefined machine types is available using the following command:\n+\n  $ gcloud compute machine-types list\n+\nYou can also specify custom machine types with the string "custom-CPUS-RAM"\nwhere ```CPUS``` is the number of virtual CPUs and ```RAM``` is the amount of\nRAM in MiB.\n+\nFor example, to create a node pool using custom machines with 2 vCPUs and 12 GB\nof RAM:\n+\n  $ {command} high-mem-pool --machine-type=custom-2-12288',args:{name:"MACHINE_TYPE",description:"String",suggestions:[]}},{name:"--max-nodes",description:`Maximum number of nodes in the node pool.
+
Maximum number of nodes to which the node pool specified by --node-pool
(or default node pool if unspecified) can scale. Ignored unless
--enable-autoscaling is also specified`,args:{name:"MAX_NODES",description:"String",suggestions:[]}},{name:"--max-pods-per-node",description:`The max number of pods per node for this node pool.
+
This flag sets the maximum number of pods that can be run at the same time on a
node. This will override the value given with --default-max-pods-per-node flag
set at the cluster level.
+
Must be used in conjunction with '--enable-ip-alias'`,args:{name:"MAX_PODS_PER_NODE",description:"String",suggestions:[]}},{name:"--max-surge-upgrade",description:`Number of extra (surge) nodes to be created on each upgrade of the node pool.
+
Specifies the number of extra (surge) nodes to be created during this node
pool's upgrades. For example, running the following command will result in
creating an extra node each time the node pool is upgraded:
+
  $ {command} node-pool-1 --cluster=example-cluster --max-surge-upgrade=1   --max-unavailable-upgrade=0
+
Must be used in conjunction with '--max-unavailable-upgrade'`,args:{name:"MAX_SURGE_UPGRADE",description:"String",suggestions:[]}},{name:"--max-unavailable-upgrade",description:`Number of nodes that can be unavailable at the same time on each upgrade of the
node pool.
+
Specifies the number of nodes that can be unavailable at the same time during
this node pool's upgrades. For example, running the following command will
result in having 3 nodes being upgraded in parallel (1 + 2), but keeping always
at least 3 (5 - 2) available each time the node pool is upgraded:
+
  $ {command} node-pool-1 --cluster=example-cluster --num-nodes=5   --max-surge-upgrade=1 --max-unavailable-upgrade=2
+
Must be used in conjunction with '--max-surge-upgrade'`,args:{name:"MAX_UNAVAILABLE_UPGRADE",description:"String",suggestions:[]}},{name:"--metadata",description:`Compute Engine metadata to be made available to the guest operating system
running on nodes within the node pool.
+
Each metadata entry is a key/value pair separated by an equals sign.
Metadata keys must be unique and less than 128 bytes in length. Values
must be less than or equal to 32,768 bytes in length. The total size of
all keys and values must be less than 512 KB. Multiple arguments can be
passed to this flag. For example:
+
\`\`--metadata key-1=value-1,key-2=value-2,key-3=value-3''
+
Additionally, the following keys are reserved for use by Kubernetes
Engine:
+
* \`\`cluster-location''
* \`\`cluster-name''
* \`\`cluster-uid''
* \`\`configure-sh''
* \`\`enable-os-login''
* \`\`gci-update-strategy''
* \`\`gci-ensure-gke-docker''
* \`\`instance-template''
* \`\`kube-env''
* \`\`startup-script''
* \`\`user-data''
+
Google Kubernetes Engine sets the following keys by default:
+
* \`\`serial-port-logging-enable''
+
See also Compute Engine's
link:https://cloud.google.com/compute/docs/storing-retrieving-metadata[documentation]
on storing and retrieving instance metadata`,args:{name:"KEY=VALUE",description:"Dict",suggestions:[]}},{name:"--metadata-from-file",description:"Same as ``--metadata'' except that the value for the entry will\nbe read from a local file",args:{name:"KEY=LOCAL_FILE_PATH",description:"Dict",suggestions:[]}},{name:"--min-cpu-platform",description:`When specified, the nodes for the new node pool will be scheduled on host with
specified CPU architecture or a newer one.
+
Examples:
+
  $ {command} node-pool-1 --cluster=example-cluster --min-cpu-platform=PLATFORM
+
To list available CPU platforms in given zone, run:
+
  $ gcloud beta compute zones describe ZONE --format="value(availableCpuPlatforms)"
+
CPU platform selection is available only in selected zones`,args:{name:"PLATFORM",description:"String",suggestions:[]}},{name:"--min-nodes",description:`Minimum number of nodes in the node pool.
+
Minimum number of nodes to which the node pool specified by --node-pool
(or default node pool if unspecified) can scale. Ignored unless
--enable-autoscaling is also specified`,args:{name:"MIN_NODES",description:"String",suggestions:[]}},{name:"--node-group",description:`Assign instances of this pool to run on the specified Google Compute Engine
node group. This is useful for running workloads on sole tenant nodes.
+
To see available sole tenant node-groups, run:
+
  $ gcloud compute sole-tenancy node-groups list
+
To create a sole tenant node group, run:
+
  $ gcloud compute sole-tenancy node-groups create [GROUP_NAME]     --zone [ZONE] --node-template [TEMPLATE_NAME] --target-size [TARGET_SIZE]
+
See https://cloud.google.com/compute/docs/nodes for more
information on sole tenancy and node groups`,args:{name:"NODE_GROUP",description:"String",suggestions:[]}},{name:"--node-labels",description:`Applies the given kubernetes labels on all nodes in the new node pool. Example:
+
  $ {command} node-pool-1 --cluster=example-cluster --node-labels=label1=value1,label2=value2
+
New nodes, including ones created by resize or recreate, will have these labels
on the kubernetes API node object and can be used in nodeSelectors.
See [](http://kubernetes.io/docs/user-guide/node-selection/) for examples.
+
Note that kubernetes labels, intended to associate cluster components
and resources with one another and manage resource lifecycles, are different
from Kubernetes Engine labels that are used for the purpose of tracking billing
and usage information`,args:{name:"NODE_LABEL",description:"Dict",suggestions:[]}},{name:"--node-locations",description:`The set of zones in which the node pool's nodes should be located.
+
Multiple locations can be specified, separated by commas. For example:
+
  $ {command} node-pool-1 --node-locations=us-central1-a,us-central1-b`,args:{name:"ZONE",description:"List",suggestions:[]}},{name:"--node-taints",description:`Applies the given kubernetes taints on all nodes in the new node pool, which can be used with tolerations for pod scheduling. Example:
+
  $ {command} node-pool-1 --cluster=example-cluster --node-taints=key1=val1:NoSchedule,key2=val2:PreferNoSchedule
+
Note, this feature uses \`gcloud beta\` commands. To use gcloud beta commands,
you must configure \`gcloud\` to use the v1beta1 API as described here: https://cloud.google.com/kubernetes-engine/docs/reference/api-organization#beta.
To read more about node-taints, see https://cloud.google.com/kubernetes-engine/docs/node-taints`,args:{name:"NODE_TAINT",description:"Dict",suggestions:[]}},{name:"--node-version",description:`The Kubernetes version to use for nodes. Defaults to server-specified.
+
The default Kubernetes version is available using the following command.
+
  $ gcloud container get-server-config`,args:{name:"NODE_VERSION",description:"String",suggestions:[]}},{name:"--num-nodes",description:"The number of nodes in the node pool in each of the cluster's zones",args:{name:"NUM_NODES",description:"Int",suggestions:[]}},{name:"--preemptible",description:`Create nodes using preemptible VM instances in the new node pool.
+
  $ {command} node-pool-1 --cluster=example-cluster --preemptible
+
New nodes, including ones created by resize or recreate, will use preemptible
VM instances. See https://cloud.google.com/kubernetes-engine/docs/preemptible-vm
for more information on how to use Preemptible VMs with Kubernetes Engine`},{name:"--project",description:"The Google Cloud Platform project ID to use for this invocation. If\nomitted, then the current project is assumed; the current project can\nbe listed using `gcloud config list --format='text(core.project)'`\nand can be set using `gcloud config set project PROJECTID`.\n+\n`--project` and its fallback `core/project` property play two roles\nin the invocation. It specifies the project of the resource to\noperate on. It also specifies the project for API enablement check,\nquota, and billing. To specify a different project for quota and\nbilling, use `--billing-project` or `billing/quota_project` property",args:{name:"PROJECT_ID",description:"String",suggestions:[]}},{name:"--quiet",description:`Disable all interactive prompts when running gcloud commands. If input
is required, defaults will be used, or an error will be raised.
Overrides the default core/disable_prompts property value for this
command invocation. This is equivalent to setting the environment
variable \`CLOUDSDK_CORE_DISABLE_PROMPTS\` to 1`},{name:"--region",description:"Compute region (e.g. us-central1) for the cluster",args:{name:"REGION",description:"String",suggestions:[]}},{name:"--reservation",description:"The name of the reservation, required when `--reservation-affinity=specific`",args:{name:"RESERVATION",description:"String",suggestions:[]}},{name:"--reservation-affinity",description:"The type of the reservation for the node pool. _RESERVATION_AFFINITY_ must be one of: *any*, *none*, *specific*",args:{name:"RESERVATION_AFFINITY",description:"String",suggestions:["any","none","specific"]}},{name:"--sandbox",description:`Enables the requested sandbox on all nodes in the node pool. Example:
+
  $ {command} node-pool-1 --cluster=example-cluster --sandbox="type=gvisor"
+
The only supported type is 'gvisor'`,args:{name:"type=TYPE",description:"Dict",suggestions:[]}},{name:"--scopes",description:`Specifies scopes for the node instances. Examples:
+
  $ {command} node-pool-1 --cluster=example-cluster --scopes=https://www.googleapis.com/auth/devstorage.read_only
+
  $ {command} node-pool-1 --cluster=example-cluster --scopes=bigquery,storage-rw,compute-ro
+
Multiple SCOPEs can be specified, separated by commas. \`logging-write\`
and/or \`monitoring\` are added unless Cloud Logging and/or Cloud Monitoring
are disabled (see \`--enable-cloud-logging\` and \`--enable-cloud-monitoring\`
for more information).
SCOPE can be either the full URI of the scope or an alias. *default* scopes are
assigned to all instances. Available aliases are:
+
Alias | URI
--- | ---
bigquery | https://www.googleapis.com/auth/bigquery
cloud-platform | https://www.googleapis.com/auth/cloud-platform
cloud-source-repos | https://www.googleapis.com/auth/source.full_control
cloud-source-repos-ro | https://www.googleapis.com/auth/source.read_only
compute-ro | https://www.googleapis.com/auth/compute.readonly
compute-rw | https://www.googleapis.com/auth/compute
datastore | https://www.googleapis.com/auth/datastore
default | https://www.googleapis.com/auth/devstorage.read_only
| https://www.googleapis.com/auth/logging.write
| https://www.googleapis.com/auth/monitoring.write
| https://www.googleapis.com/auth/pubsub
| https://www.googleapis.com/auth/service.management.readonly
| https://www.googleapis.com/auth/servicecontrol
| https://www.googleapis.com/auth/trace.append
gke-default | https://www.googleapis.com/auth/devstorage.read_only
| https://www.googleapis.com/auth/logging.write
| https://www.googleapis.com/auth/monitoring
| https://www.googleapis.com/auth/service.management.readonly
| https://www.googleapis.com/auth/servicecontrol
| https://www.googleapis.com/auth/trace.append
logging-write | https://www.googleapis.com/auth/logging.write
monitoring | https://www.googleapis.com/auth/monitoring
monitoring-read | https://www.googleapis.com/auth/monitoring.read
monitoring-write | https://www.googleapis.com/auth/monitoring.write
pubsub | https://www.googleapis.com/auth/pubsub
service-control | https://www.googleapis.com/auth/servicecontrol
service-management | https://www.googleapis.com/auth/service.management.readonly
sql (deprecated) | https://www.googleapis.com/auth/sqlservice
sql-admin | https://www.googleapis.com/auth/sqlservice.admin
storage-full | https://www.googleapis.com/auth/devstorage.full_control
storage-ro | https://www.googleapis.com/auth/devstorage.read_only
storage-rw | https://www.googleapis.com/auth/devstorage.read_write
taskqueue | https://www.googleapis.com/auth/taskqueue
trace | https://www.googleapis.com/auth/trace.append
userinfo-email | https://www.googleapis.com/auth/userinfo.email
+
DEPRECATION WARNING: https://www.googleapis.com/auth/sqlservice account scope
and \`sql\` alias do not provide SQL instance management capabilities and have
been deprecated. Please, use https://www.googleapis.com/auth/sqlservice.admin
or \`sql-admin\` to manage your Google SQL Service instances.
+`,args:{name:"SCOPE",description:"List",suggestions:[]}},{name:"--service-account",description:"The Google Cloud Platform Service Account to be used by the node VMs. If a service account is specified, the cloud-platform and userinfo.email scopes are used. If no Service Account is specified, the project default service account is used",args:{name:"SERVICE_ACCOUNT",description:"String",suggestions:[]}},{name:"--shielded-integrity-monitoring",description:`Enables monitoring and attestation of the boot integrity of the
instance. The attestation is performed against the integrity policy
baseline. This baseline is initially derived from the implicitly
trusted boot image when the instance is created`},{name:"--shielded-secure-boot",description:"The instance will boot with secure boot enabled"},{name:"--tags",description:`Applies the given Compute Engine tags (comma separated) on all nodes in the new
node-pool. Example:
+
  $ {command} node-pool-1 --cluster=example-cluster --tags=tag1,tag2
+
New nodes, including ones created by resize or recreate, will have these tags
on the Compute Engine API instance object and can be used in firewall rules.
See https://cloud.google.com/sdk/gcloud/reference/compute/firewall-rules/create
for examples`,args:{name:"TAG",description:"List",suggestions:[]}},{name:"--trace-token",description:"Token used to route traces of service requests for investigation of issues. Overrides the default *core/trace_token* property value for this command invocation",args:{name:"TRACE_TOKEN",description:"String",suggestions:[]}},{name:"--user-output-enabled",description:"Print user intended output to the console. Overrides the default *core/user_output_enabled* property value for this command invocation. Use *--no-user-output-enabled* to disable"},{name:"--verbosity",description:"Override the default verbosity for this command. Overrides the default *core/verbosity* property value for this command invocation. _VERBOSITY_ must be one of: *debug*, *info*, *warning*, *error*, *critical*, *none*",args:{name:"VERBOSITY",description:"String",suggestions:["debug","info","warning","error","critical","none"]}},{name:"--workload-metadata",description:`Type of metadata server available to pods running in the node pool. _WORKLOAD_METADATA_ must be one of:
+
*GCE_METADATA*::: Pods running in this node pool have access to the node's underlying Compute Engine Metadata Server.
*GKE_METADATA*::: Run the Kubernetes Engine Metadata Server on this node. The Kubernetes Engine Metadata Server exposes a metadata API to workloads that is compatible with the V1 Compute Metadata APIs exposed by the Compute Engine and App Engine Metadata Servers. This feature can only be enabled if Workload Identity is enabled at the cluster level.
:::
+`,args:{name:"WORKLOAD_METADATA",description:"Googlecloudsdk.command_lib.container.flags:<lambda>",suggestions:["GCE_METADATA","GKE_METADATA"]}},{name:"--zone",description:"Compute zone (e.g. us-central1-a) for the cluster. Overrides the default *compute/zone* property value for this command invocation",args:{name:"ZONE",description:"String",suggestions:[]}}],args:{name:"NAME",description:"The name of the node pool to create"}},{name:"delete",description:"Delete an existing node pool in a running cluster",options:[{name:"--account",description:"Google Cloud Platform user account to use for invocation. Overrides the default *core/account* property value for this command invocation",args:{name:"ACCOUNT",description:"String",suggestions:[]}},{name:"--async",description:`Return immediately, without waiting for the operation in progress to
complete`},{name:"--billing-project",description:"The Google Cloud Platform project that will be charged quota for operations performed in gcloud. If you need to operate on one project, but need quota against a different project, you can use this flag to specify the billing project. If both `billing/quota_project` and `--billing-project` are specified, `--billing-project` takes precedence. Run `$ gcloud config set --help` to see more information about `billing/quota_project`",args:{name:"BILLING_PROJECT",description:"String",suggestions:[]}},{name:"--cluster",description:"The cluster from which to delete the node pool. Overrides the default *container/cluster* property value for this command invocation",args:{name:"CLUSTER",description:"String",suggestions:[]}},{name:"--configuration",description:`The configuration to use for this command invocation. For more
information on how to use configurations, run:
\`gcloud topic configurations\`.  You can also use the CLOUDSDK_ACTIVE_CONFIG_NAME environment
variable to set the equivalent of this flag for a terminal
session`,args:{name:"CONFIGURATION",description:"String",suggestions:[]}},{name:"--flags-file",description:`A YAML or JSON file that specifies a *--flag*:*value* dictionary.
Useful for specifying complex flag values with special characters
that work with any command interpreter. Additionally, each
*--flags-file* arg is replaced by its constituent flags. See
$ gcloud topic flags-file for more information`,args:{name:"YAML_FILE",description:"String",suggestions:[]}},{name:"--flatten",description:`Flatten _name_[] output resource slices in _KEY_ into separate records
for each item in each slice. Multiple keys and slices may be specified.
This also flattens keys for *--format* and *--filter*. For example,
*--flatten=abc.def* flattens *abc.def[].ghi* references to
*abc.def.ghi*. A resource record containing *abc.def[]* with N elements
will expand to N records in the flattened output. This flag interacts
with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--format",description:"Set the format for printing command output resources. The default is a\ncommand-specific human-friendly output format. The supported formats\nare: `config`, `csv`, `default`, `diff`, `disable`, `flattened`, `get`, `json`, `list`, `multi`, `none`, `object`, `table`, `text`, `value`, `yaml`. For more details run $ gcloud topic formats",args:{name:"FORMAT",description:"String",suggestions:[]}},{name:"--help",description:"Display detailed help"},{name:"--impersonate-service-account",description:"For this gcloud invocation, all API requests will be made as the given service account instead of the currently selected account. This is done without needing to create, download, and activate a key for the account. In order to perform operations as the service account, your currently selected account must have an IAM role that includes the iam.serviceAccounts.getAccessToken permission for the service account. The roles/iam.serviceAccountTokenCreator role has this permission or you may create a custom role. Overrides the default *auth/impersonate_service_account* property value for this command invocation",args:{name:"SERVICE_ACCOUNT_EMAIL",description:"String",suggestions:[]}},{name:"--log-http",description:"Log all HTTP server requests and responses to stderr. Overrides the default *core/log_http* property value for this command invocation"},{name:"--project",description:"The Google Cloud Platform project ID to use for this invocation. If\nomitted, then the current project is assumed; the current project can\nbe listed using `gcloud config list --format='text(core.project)'`\nand can be set using `gcloud config set project PROJECTID`.\n+\n`--project` and its fallback `core/project` property play two roles\nin the invocation. It specifies the project of the resource to\noperate on. It also specifies the project for API enablement check,\nquota, and billing. To specify a different project for quota and\nbilling, use `--billing-project` or `billing/quota_project` property",args:{name:"PROJECT_ID",description:"String",suggestions:[]}},{name:"--quiet",description:`Disable all interactive prompts when running gcloud commands. If input
is required, defaults will be used, or an error will be raised.
Overrides the default core/disable_prompts property value for this
command invocation. This is equivalent to setting the environment
variable \`CLOUDSDK_CORE_DISABLE_PROMPTS\` to 1`},{name:"--region",description:"Compute region (e.g. us-central1) for the cluster",args:{name:"REGION",description:"String",suggestions:[]}},{name:"--trace-token",description:"Token used to route traces of service requests for investigation of issues. Overrides the default *core/trace_token* property value for this command invocation",args:{name:"TRACE_TOKEN",description:"String",suggestions:[]}},{name:"--user-output-enabled",description:"Print user intended output to the console. Overrides the default *core/user_output_enabled* property value for this command invocation. Use *--no-user-output-enabled* to disable"},{name:"--verbosity",description:"Override the default verbosity for this command. Overrides the default *core/verbosity* property value for this command invocation. _VERBOSITY_ must be one of: *debug*, *info*, *warning*, *error*, *critical*, *none*",args:{name:"VERBOSITY",description:"String",suggestions:["debug","info","warning","error","critical","none"]}},{name:"--zone",description:"Compute zone (e.g. us-central1-a) for the cluster. Overrides the default *compute/zone* property value for this command invocation",args:{name:"ZONE",description:"String",suggestions:[]}}],args:{name:"NAME",description:"The name of the node pool to delete"}},{name:"describe",description:"Describe an existing node pool for a cluster",options:[{name:"--account",description:"Google Cloud Platform user account to use for invocation. Overrides the default *core/account* property value for this command invocation",args:{name:"ACCOUNT",description:"String",suggestions:[]}},{name:"--billing-project",description:"The Google Cloud Platform project that will be charged quota for operations performed in gcloud. If you need to operate on one project, but need quota against a different project, you can use this flag to specify the billing project. If both `billing/quota_project` and `--billing-project` are specified, `--billing-project` takes precedence. Run `$ gcloud config set --help` to see more information about `billing/quota_project`",args:{name:"BILLING_PROJECT",description:"String",suggestions:[]}},{name:"--cluster",description:"The name of the cluster. Overrides the default *container/cluster* property value for this command invocation",args:{name:"CLUSTER",description:"String",suggestions:[]}},{name:"--configuration",description:`The configuration to use for this command invocation. For more
information on how to use configurations, run:
\`gcloud topic configurations\`.  You can also use the CLOUDSDK_ACTIVE_CONFIG_NAME environment
variable to set the equivalent of this flag for a terminal
session`,args:{name:"CONFIGURATION",description:"String",suggestions:[]}},{name:"--flags-file",description:`A YAML or JSON file that specifies a *--flag*:*value* dictionary.
Useful for specifying complex flag values with special characters
that work with any command interpreter. Additionally, each
*--flags-file* arg is replaced by its constituent flags. See
$ gcloud topic flags-file for more information`,args:{name:"YAML_FILE",description:"String",suggestions:[]}},{name:"--flatten",description:`Flatten _name_[] output resource slices in _KEY_ into separate records
for each item in each slice. Multiple keys and slices may be specified.
This also flattens keys for *--format* and *--filter*. For example,
*--flatten=abc.def* flattens *abc.def[].ghi* references to
*abc.def.ghi*. A resource record containing *abc.def[]* with N elements
will expand to N records in the flattened output. This flag interacts
with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--format",description:"Set the format for printing command output resources. The default is a\ncommand-specific human-friendly output format. The supported formats\nare: `config`, `csv`, `default`, `diff`, `disable`, `flattened`, `get`, `json`, `list`, `multi`, `none`, `object`, `table`, `text`, `value`, `yaml`. For more details run $ gcloud topic formats",args:{name:"FORMAT",description:"String",suggestions:[]}},{name:"--help",description:"Display detailed help"},{name:"--impersonate-service-account",description:"For this gcloud invocation, all API requests will be made as the given service account instead of the currently selected account. This is done without needing to create, download, and activate a key for the account. In order to perform operations as the service account, your currently selected account must have an IAM role that includes the iam.serviceAccounts.getAccessToken permission for the service account. The roles/iam.serviceAccountTokenCreator role has this permission or you may create a custom role. Overrides the default *auth/impersonate_service_account* property value for this command invocation",args:{name:"SERVICE_ACCOUNT_EMAIL",description:"String",suggestions:[]}},{name:"--log-http",description:"Log all HTTP server requests and responses to stderr. Overrides the default *core/log_http* property value for this command invocation"},{name:"--project",description:"The Google Cloud Platform project ID to use for this invocation. If\nomitted, then the current project is assumed; the current project can\nbe listed using `gcloud config list --format='text(core.project)'`\nand can be set using `gcloud config set project PROJECTID`.\n+\n`--project` and its fallback `core/project` property play two roles\nin the invocation. It specifies the project of the resource to\noperate on. It also specifies the project for API enablement check,\nquota, and billing. To specify a different project for quota and\nbilling, use `--billing-project` or `billing/quota_project` property",args:{name:"PROJECT_ID",description:"String",suggestions:[]}},{name:"--quiet",description:`Disable all interactive prompts when running gcloud commands. If input
is required, defaults will be used, or an error will be raised.
Overrides the default core/disable_prompts property value for this
command invocation. This is equivalent to setting the environment
variable \`CLOUDSDK_CORE_DISABLE_PROMPTS\` to 1`},{name:"--region",description:"Compute region (e.g. us-central1) for the cluster",args:{name:"REGION",description:"String",suggestions:[]}},{name:"--trace-token",description:"Token used to route traces of service requests for investigation of issues. Overrides the default *core/trace_token* property value for this command invocation",args:{name:"TRACE_TOKEN",description:"String",suggestions:[]}},{name:"--user-output-enabled",description:"Print user intended output to the console. Overrides the default *core/user_output_enabled* property value for this command invocation. Use *--no-user-output-enabled* to disable"},{name:"--verbosity",description:"Override the default verbosity for this command. Overrides the default *core/verbosity* property value for this command invocation. _VERBOSITY_ must be one of: *debug*, *info*, *warning*, *error*, *critical*, *none*",args:{name:"VERBOSITY",description:"String",suggestions:["debug","info","warning","error","critical","none"]}},{name:"--zone",description:"Compute zone (e.g. us-central1-a) for the cluster. Overrides the default *compute/zone* property value for this command invocation",args:{name:"ZONE",description:"String",suggestions:[]}}],args:{name:"NAME",description:"The name of the node pool"}},{name:"list",description:"List existing node pools for a cluster",options:[{name:"--account",description:"Google Cloud Platform user account to use for invocation. Overrides the default *core/account* property value for this command invocation",args:{name:"ACCOUNT",description:"String",suggestions:[]}},{name:"--billing-project",description:"The Google Cloud Platform project that will be charged quota for operations performed in gcloud. If you need to operate on one project, but need quota against a different project, you can use this flag to specify the billing project. If both `billing/quota_project` and `--billing-project` are specified, `--billing-project` takes precedence. Run `$ gcloud config set --help` to see more information about `billing/quota_project`",args:{name:"BILLING_PROJECT",description:"String",suggestions:[]}},{name:"--cluster",description:"The name of the cluster. Overrides the default *container/cluster* property value for this command invocation",args:{name:"CLUSTER",description:"String",suggestions:[]}},{name:"--configuration",description:`The configuration to use for this command invocation. For more
information on how to use configurations, run:
\`gcloud topic configurations\`.  You can also use the CLOUDSDK_ACTIVE_CONFIG_NAME environment
variable to set the equivalent of this flag for a terminal
session`,args:{name:"CONFIGURATION",description:"String",suggestions:[]}},{name:"--filter",description:`Apply a Boolean filter _EXPRESSION_ to each resource item to be listed.
If the expression evaluates \`True\`, then that item is listed. For more
details and examples of filter expressions, run $ gcloud topic filters. This
flag interacts with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"EXPRESSION",description:"String",suggestions:[]}},{name:"--flags-file",description:`A YAML or JSON file that specifies a *--flag*:*value* dictionary.
Useful for specifying complex flag values with special characters
that work with any command interpreter. Additionally, each
*--flags-file* arg is replaced by its constituent flags. See
$ gcloud topic flags-file for more information`,args:{name:"YAML_FILE",description:"String",suggestions:[]}},{name:"--flatten",description:`Flatten _name_[] output resource slices in _KEY_ into separate records
for each item in each slice. Multiple keys and slices may be specified.
This also flattens keys for *--format* and *--filter*. For example,
*--flatten=abc.def* flattens *abc.def[].ghi* references to
*abc.def.ghi*. A resource record containing *abc.def[]* with N elements
will expand to N records in the flattened output. This flag interacts
with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--format",description:"Set the format for printing command output resources. The default is a\ncommand-specific human-friendly output format. The supported formats\nare: `config`, `csv`, `default`, `diff`, `disable`, `flattened`, `get`, `json`, `list`, `multi`, `none`, `object`, `table`, `text`, `value`, `yaml`. For more details run $ gcloud topic formats",args:{name:"FORMAT",description:"String",suggestions:[]}},{name:"--help",description:"Display detailed help"},{name:"--impersonate-service-account",description:"For this gcloud invocation, all API requests will be made as the given service account instead of the currently selected account. This is done without needing to create, download, and activate a key for the account. In order to perform operations as the service account, your currently selected account must have an IAM role that includes the iam.serviceAccounts.getAccessToken permission for the service account. The roles/iam.serviceAccountTokenCreator role has this permission or you may create a custom role. Overrides the default *auth/impersonate_service_account* property value for this command invocation",args:{name:"SERVICE_ACCOUNT_EMAIL",description:"String",suggestions:[]}},{name:"--limit",description:`Maximum number of resources to list. The default is *unlimited*.
This flag interacts with other flags that are applied in this order:
*--flatten*, *--sort-by*, *--filter*, *--limit*`,args:{name:"LIMIT",description:"Googlecloudsdk.calliope.arg_parsers:Parse",suggestions:[]}},{name:"--log-http",description:"Log all HTTP server requests and responses to stderr. Overrides the default *core/log_http* property value for this command invocation"},{name:"--page-size",description:`Some services group resource list output into pages. This flag specifies
the maximum number of resources per page. The default is determined by the
service if it supports paging, otherwise it is *unlimited* (no paging).
Paging may be applied before or after *--filter* and *--limit* depending
on the service`,args:{name:"PAGE_SIZE",description:"Googlecloudsdk.calliope.arg_parsers:Parse",suggestions:[]}},{name:"--project",description:"The Google Cloud Platform project ID to use for this invocation. If\nomitted, then the current project is assumed; the current project can\nbe listed using `gcloud config list --format='text(core.project)'`\nand can be set using `gcloud config set project PROJECTID`.\n+\n`--project` and its fallback `core/project` property play two roles\nin the invocation. It specifies the project of the resource to\noperate on. It also specifies the project for API enablement check,\nquota, and billing. To specify a different project for quota and\nbilling, use `--billing-project` or `billing/quota_project` property",args:{name:"PROJECT_ID",description:"String",suggestions:[]}},{name:"--quiet",description:`Disable all interactive prompts when running gcloud commands. If input
is required, defaults will be used, or an error will be raised.
Overrides the default core/disable_prompts property value for this
command invocation. This is equivalent to setting the environment
variable \`CLOUDSDK_CORE_DISABLE_PROMPTS\` to 1`},{name:"--region",description:"Compute region (e.g. us-central1) for the cluster",args:{name:"REGION",description:"String",suggestions:[]}},{name:"--sort-by",description:`Comma-separated list of resource field key names to sort by. The
default order is ascending. Prefix a field with \`\`~'' for descending
order on that field. This flag interacts with other flags that are applied
in this order: *--flatten*, *--sort-by*, *--filter*, *--limit*`,args:{name:"FIELD",description:"List",suggestions:[]}},{name:"--trace-token",description:"Token used to route traces of service requests for investigation of issues. Overrides the default *core/trace_token* property value for this command invocation",args:{name:"TRACE_TOKEN",description:"String",suggestions:[]}},{name:"--uri",description:"Print a list of resource URIs instead of the default output"},{name:"--user-output-enabled",description:"Print user intended output to the console. Overrides the default *core/user_output_enabled* property value for this command invocation. Use *--no-user-output-enabled* to disable"},{name:"--verbosity",description:"Override the default verbosity for this command. Overrides the default *core/verbosity* property value for this command invocation. _VERBOSITY_ must be one of: *debug*, *info*, *warning*, *error*, *critical*, *none*",args:{name:"VERBOSITY",description:"String",suggestions:["debug","info","warning","error","critical","none"]}},{name:"--zone",description:"Compute zone (e.g. us-central1-a) for the cluster. Overrides the default *compute/zone* property value for this command invocation",args:{name:"ZONE",description:"String",suggestions:[]}}]},{name:"rollback",description:"Rollback a node-pool upgrade",options:[{name:"--account",description:"Google Cloud Platform user account to use for invocation. Overrides the default *core/account* property value for this command invocation",args:{name:"ACCOUNT",description:"String",suggestions:[]}},{name:"--async",description:`Return immediately, without waiting for the operation in progress to
complete`},{name:"--billing-project",description:"The Google Cloud Platform project that will be charged quota for operations performed in gcloud. If you need to operate on one project, but need quota against a different project, you can use this flag to specify the billing project. If both `billing/quota_project` and `--billing-project` are specified, `--billing-project` takes precedence. Run `$ gcloud config set --help` to see more information about `billing/quota_project`",args:{name:"BILLING_PROJECT",description:"String",suggestions:[]}},{name:"--cluster",description:"The cluster from which to rollback the node pool. Overrides the default *container/cluster* property value for this command invocation",args:{name:"CLUSTER",description:"String",suggestions:[]}},{name:"--configuration",description:`The configuration to use for this command invocation. For more
information on how to use configurations, run:
\`gcloud topic configurations\`.  You can also use the CLOUDSDK_ACTIVE_CONFIG_NAME environment
variable to set the equivalent of this flag for a terminal
session`,args:{name:"CONFIGURATION",description:"String",suggestions:[]}},{name:"--flags-file",description:`A YAML or JSON file that specifies a *--flag*:*value* dictionary.
Useful for specifying complex flag values with special characters
that work with any command interpreter. Additionally, each
*--flags-file* arg is replaced by its constituent flags. See
$ gcloud topic flags-file for more information`,args:{name:"YAML_FILE",description:"String",suggestions:[]}},{name:"--flatten",description:`Flatten _name_[] output resource slices in _KEY_ into separate records
for each item in each slice. Multiple keys and slices may be specified.
This also flattens keys for *--format* and *--filter*. For example,
*--flatten=abc.def* flattens *abc.def[].ghi* references to
*abc.def.ghi*. A resource record containing *abc.def[]* with N elements
will expand to N records in the flattened output. This flag interacts
with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--format",description:"Set the format for printing command output resources. The default is a\ncommand-specific human-friendly output format. The supported formats\nare: `config`, `csv`, `default`, `diff`, `disable`, `flattened`, `get`, `json`, `list`, `multi`, `none`, `object`, `table`, `text`, `value`, `yaml`. For more details run $ gcloud topic formats",args:{name:"FORMAT",description:"String",suggestions:[]}},{name:"--help",description:"Display detailed help"},{name:"--impersonate-service-account",description:"For this gcloud invocation, all API requests will be made as the given service account instead of the currently selected account. This is done without needing to create, download, and activate a key for the account. In order to perform operations as the service account, your currently selected account must have an IAM role that includes the iam.serviceAccounts.getAccessToken permission for the service account. The roles/iam.serviceAccountTokenCreator role has this permission or you may create a custom role. Overrides the default *auth/impersonate_service_account* property value for this command invocation",args:{name:"SERVICE_ACCOUNT_EMAIL",description:"String",suggestions:[]}},{name:"--log-http",description:"Log all HTTP server requests and responses to stderr. Overrides the default *core/log_http* property value for this command invocation"},{name:"--project",description:"The Google Cloud Platform project ID to use for this invocation. If\nomitted, then the current project is assumed; the current project can\nbe listed using `gcloud config list --format='text(core.project)'`\nand can be set using `gcloud config set project PROJECTID`.\n+\n`--project` and its fallback `core/project` property play two roles\nin the invocation. It specifies the project of the resource to\noperate on. It also specifies the project for API enablement check,\nquota, and billing. To specify a different project for quota and\nbilling, use `--billing-project` or `billing/quota_project` property",args:{name:"PROJECT_ID",description:"String",suggestions:[]}},{name:"--quiet",description:`Disable all interactive prompts when running gcloud commands. If input
is required, defaults will be used, or an error will be raised.
Overrides the default core/disable_prompts property value for this
command invocation. This is equivalent to setting the environment
variable \`CLOUDSDK_CORE_DISABLE_PROMPTS\` to 1`},{name:"--region",description:"Compute region (e.g. us-central1) for the cluster",args:{name:"REGION",description:"String",suggestions:[]}},{name:"--trace-token",description:"Token used to route traces of service requests for investigation of issues. Overrides the default *core/trace_token* property value for this command invocation",args:{name:"TRACE_TOKEN",description:"String",suggestions:[]}},{name:"--user-output-enabled",description:"Print user intended output to the console. Overrides the default *core/user_output_enabled* property value for this command invocation. Use *--no-user-output-enabled* to disable"},{name:"--verbosity",description:"Override the default verbosity for this command. Overrides the default *core/verbosity* property value for this command invocation. _VERBOSITY_ must be one of: *debug*, *info*, *warning*, *error*, *critical*, *none*",args:{name:"VERBOSITY",description:"String",suggestions:["debug","info","warning","error","critical","none"]}},{name:"--zone",description:"Compute zone (e.g. us-central1-a) for the cluster. Overrides the default *compute/zone* property value for this command invocation",args:{name:"ZONE",description:"String",suggestions:[]}}],args:{name:"NAME",description:"The name of the node pool to rollback"}},{name:"update",description:"Updates a node pool in a running cluster",options:[{name:"--account",description:"Google Cloud Platform user account to use for invocation. Overrides the default *core/account* property value for this command invocation",args:{name:"ACCOUNT",description:"String",suggestions:[]}},{name:"--billing-project",description:"The Google Cloud Platform project that will be charged quota for operations performed in gcloud. If you need to operate on one project, but need quota against a different project, you can use this flag to specify the billing project. If both `billing/quota_project` and `--billing-project` are specified, `--billing-project` takes precedence. Run `$ gcloud config set --help` to see more information about `billing/quota_project`",args:{name:"BILLING_PROJECT",description:"String",suggestions:[]}},{name:"--cluster",description:"The name of the cluster. Overrides the default *container/cluster* property value for this command invocation",args:{name:"CLUSTER",description:"String",suggestions:[]}},{name:"--configuration",description:`The configuration to use for this command invocation. For more
information on how to use configurations, run:
\`gcloud topic configurations\`.  You can also use the CLOUDSDK_ACTIVE_CONFIG_NAME environment
variable to set the equivalent of this flag for a terminal
session`,args:{name:"CONFIGURATION",description:"String",suggestions:[]}},{name:"--enable-autoprovisioning",description:`Enables Cluster Autoscaler to treat the node pool as if it was autoprovisioned.
+
Cluster Autoscaler will be able to delete the node pool if it's unneeded`},{name:"--enable-autorepair",description:`Enable node autorepair feature for a node pool.
+
  $ {command} node-pool-1 --cluster=example-cluster --enable-autorepair
+
See https://cloud.google.com/kubernetes-engine/docs/how-to/node-auto-repair for more info`},{name:"--enable-autoscaling",description:`Enables autoscaling for a node pool.
+
Enables autoscaling in the node pool specified by --node-pool or
the default node pool if --node-pool is not provided`},{name:"--enable-autoupgrade",description:`Sets autoupgrade feature for a node pool.
+
  $ {command} node-pool-1 --cluster=example-cluster --enable-autoupgrade
+
See https://cloud.google.com/kubernetes-engine/docs/node-auto-upgrades for more info`},{name:"--flags-file",description:`A YAML or JSON file that specifies a *--flag*:*value* dictionary.
Useful for specifying complex flag values with special characters
that work with any command interpreter. Additionally, each
*--flags-file* arg is replaced by its constituent flags. See
$ gcloud topic flags-file for more information`,args:{name:"YAML_FILE",description:"String",suggestions:[]}},{name:"--flatten",description:`Flatten _name_[] output resource slices in _KEY_ into separate records
for each item in each slice. Multiple keys and slices may be specified.
This also flattens keys for *--format* and *--filter*. For example,
*--flatten=abc.def* flattens *abc.def[].ghi* references to
*abc.def.ghi*. A resource record containing *abc.def[]* with N elements
will expand to N records in the flattened output. This flag interacts
with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--format",description:"Set the format for printing command output resources. The default is a\ncommand-specific human-friendly output format. The supported formats\nare: `config`, `csv`, `default`, `diff`, `disable`, `flattened`, `get`, `json`, `list`, `multi`, `none`, `object`, `table`, `text`, `value`, `yaml`. For more details run $ gcloud topic formats",args:{name:"FORMAT",description:"String",suggestions:[]}},{name:"--help",description:"Display detailed help"},{name:"--impersonate-service-account",description:"For this gcloud invocation, all API requests will be made as the given service account instead of the currently selected account. This is done without needing to create, download, and activate a key for the account. In order to perform operations as the service account, your currently selected account must have an IAM role that includes the iam.serviceAccounts.getAccessToken permission for the service account. The roles/iam.serviceAccountTokenCreator role has this permission or you may create a custom role. Overrides the default *auth/impersonate_service_account* property value for this command invocation",args:{name:"SERVICE_ACCOUNT_EMAIL",description:"String",suggestions:[]}},{name:"--log-http",description:"Log all HTTP server requests and responses to stderr. Overrides the default *core/log_http* property value for this command invocation"},{name:"--max-nodes",description:`Maximum number of nodes in the node pool.
+
Maximum number of nodes to which the node pool specified by --node-pool
(or default node pool if unspecified) can scale. Ignored unless
--enable-autoscaling is also specified`,args:{name:"MAX_NODES",description:"String",suggestions:[]}},{name:"--max-surge-upgrade",description:`Number of extra (surge) nodes to be created on each upgrade of the node pool.
+
Specifies the number of extra (surge) nodes to be created during this node
pool's upgrades. For example, running the following command will result in
creating an extra node each time the node pool is upgraded:
+
  $ {command} node-pool-1 --cluster=example-cluster --max-surge-upgrade=1   --max-unavailable-upgrade=0
+
Must be used in conjunction with '--max-unavailable-upgrade'`,args:{name:"MAX_SURGE_UPGRADE",description:"String",suggestions:[]}},{name:"--max-unavailable-upgrade",description:`Number of nodes that can be unavailable at the same time on each upgrade of the
node pool.
+
Specifies the number of nodes that can be unavailable at the same time during
this node pool's upgrades. For example, assume the node pool has 5 nodes,
running the following command will result in having 3 nodes being upgraded in
parallel (1 + 2), but keeping always at least 3 (5 - 2) available each time the
node pool is upgraded:
+
  $ {command} node-pool-1 --cluster=example-cluster --max-surge-upgrade=1   --max-unavailable-upgrade=2
+
Must be used in conjunction with '--max-surge-upgrade'`,args:{name:"MAX_UNAVAILABLE_UPGRADE",description:"String",suggestions:[]}},{name:"--min-nodes",description:`Minimum number of nodes in the node pool.
+
Minimum number of nodes to which the node pool specified by --node-pool
(or default node pool if unspecified) can scale. Ignored unless
--enable-autoscaling is also specified`,args:{name:"MIN_NODES",description:"String",suggestions:[]}},{name:"--node-locations",description:`Set of zones in which the node pool's nodes should be located.
Changing the locations for a node pool will result in nodes being either created or removed
from the node pool, depending on whether locations are being added or removed.
+
Multiple locations can be specified, separated by commas. For example:
+
  $ {command} node-pool-1 --node-locations=us-central1-a,us-central1-b`,args:{name:"ZONE",description:"List",suggestions:[]}},{name:"--project",description:"The Google Cloud Platform project ID to use for this invocation. If\nomitted, then the current project is assumed; the current project can\nbe listed using `gcloud config list --format='text(core.project)'`\nand can be set using `gcloud config set project PROJECTID`.\n+\n`--project` and its fallback `core/project` property play two roles\nin the invocation. It specifies the project of the resource to\noperate on. It also specifies the project for API enablement check,\nquota, and billing. To specify a different project for quota and\nbilling, use `--billing-project` or `billing/quota_project` property",args:{name:"PROJECT_ID",description:"String",suggestions:[]}},{name:"--quiet",description:`Disable all interactive prompts when running gcloud commands. If input
is required, defaults will be used, or an error will be raised.
Overrides the default core/disable_prompts property value for this
command invocation. This is equivalent to setting the environment
variable \`CLOUDSDK_CORE_DISABLE_PROMPTS\` to 1`},{name:"--region",description:"Compute region (e.g. us-central1) for the cluster",args:{name:"REGION",description:"String",suggestions:[]}},{name:"--trace-token",description:"Token used to route traces of service requests for investigation of issues. Overrides the default *core/trace_token* property value for this command invocation",args:{name:"TRACE_TOKEN",description:"String",suggestions:[]}},{name:"--user-output-enabled",description:"Print user intended output to the console. Overrides the default *core/user_output_enabled* property value for this command invocation. Use *--no-user-output-enabled* to disable"},{name:"--verbosity",description:"Override the default verbosity for this command. Overrides the default *core/verbosity* property value for this command invocation. _VERBOSITY_ must be one of: *debug*, *info*, *warning*, *error*, *critical*, *none*",args:{name:"VERBOSITY",description:"String",suggestions:["debug","info","warning","error","critical","none"]}},{name:"--workload-metadata",description:`Type of metadata server available to pods running in the node pool. _WORKLOAD_METADATA_ must be one of:
+
*GCE_METADATA*::: Pods running in this node pool have access to the node's underlying Compute Engine Metadata Server.
*GKE_METADATA*::: Run the Kubernetes Engine Metadata Server on this node. The Kubernetes Engine Metadata Server exposes a metadata API to workloads that is compatible with the V1 Compute Metadata APIs exposed by the Compute Engine and App Engine Metadata Servers. This feature can only be enabled if Workload Identity is enabled at the cluster level.
:::
+`,args:{name:"WORKLOAD_METADATA",description:"Googlecloudsdk.command_lib.container.flags:<lambda>",suggestions:["GCE_METADATA","GKE_METADATA"]}},{name:"--zone",description:"Compute zone (e.g. us-central1-a) for the cluster. Overrides the default *compute/zone* property value for this command invocation",args:{name:"ZONE",description:"String",suggestions:[]}}],args:{name:"NAME",description:"The name of the node pool"}}],options:[{name:"--account",description:"Google Cloud Platform user account to use for invocation. Overrides the default *core/account* property value for this command invocation",args:{name:"ACCOUNT",description:"String",suggestions:[]}},{name:"--billing-project",description:"The Google Cloud Platform project that will be charged quota for operations performed in gcloud. If you need to operate on one project, but need quota against a different project, you can use this flag to specify the billing project. If both `billing/quota_project` and `--billing-project` are specified, `--billing-project` takes precedence. Run `$ gcloud config set --help` to see more information about `billing/quota_project`",args:{name:"BILLING_PROJECT",description:"String",suggestions:[]}},{name:"--configuration",description:`The configuration to use for this command invocation. For more
information on how to use configurations, run:
\`gcloud topic configurations\`.  You can also use the CLOUDSDK_ACTIVE_CONFIG_NAME environment
variable to set the equivalent of this flag for a terminal
session`,args:{name:"CONFIGURATION",description:"String",suggestions:[]}},{name:"--flags-file",description:`A YAML or JSON file that specifies a *--flag*:*value* dictionary.
Useful for specifying complex flag values with special characters
that work with any command interpreter. Additionally, each
*--flags-file* arg is replaced by its constituent flags. See
$ gcloud topic flags-file for more information`,args:{name:"YAML_FILE",description:"String",suggestions:[]}},{name:"--flatten",description:`Flatten _name_[] output resource slices in _KEY_ into separate records
for each item in each slice. Multiple keys and slices may be specified.
This also flattens keys for *--format* and *--filter*. For example,
*--flatten=abc.def* flattens *abc.def[].ghi* references to
*abc.def.ghi*. A resource record containing *abc.def[]* with N elements
will expand to N records in the flattened output. This flag interacts
with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--format",description:"Set the format for printing command output resources. The default is a\ncommand-specific human-friendly output format. The supported formats\nare: `config`, `csv`, `default`, `diff`, `disable`, `flattened`, `get`, `json`, `list`, `multi`, `none`, `object`, `table`, `text`, `value`, `yaml`. For more details run $ gcloud topic formats",args:{name:"FORMAT",description:"String",suggestions:[]}},{name:"--help",description:"Display detailed help"},{name:"--impersonate-service-account",description:"For this gcloud invocation, all API requests will be made as the given service account instead of the currently selected account. This is done without needing to create, download, and activate a key for the account. In order to perform operations as the service account, your currently selected account must have an IAM role that includes the iam.serviceAccounts.getAccessToken permission for the service account. The roles/iam.serviceAccountTokenCreator role has this permission or you may create a custom role. Overrides the default *auth/impersonate_service_account* property value for this command invocation",args:{name:"SERVICE_ACCOUNT_EMAIL",description:"String",suggestions:[]}},{name:"--log-http",description:"Log all HTTP server requests and responses to stderr. Overrides the default *core/log_http* property value for this command invocation"},{name:"--project",description:"The Google Cloud Platform project ID to use for this invocation. If\nomitted, then the current project is assumed; the current project can\nbe listed using `gcloud config list --format='text(core.project)'`\nand can be set using `gcloud config set project PROJECTID`.\n+\n`--project` and its fallback `core/project` property play two roles\nin the invocation. It specifies the project of the resource to\noperate on. It also specifies the project for API enablement check,\nquota, and billing. To specify a different project for quota and\nbilling, use `--billing-project` or `billing/quota_project` property",args:{name:"PROJECT_ID",description:"String",suggestions:[]}},{name:"--quiet",description:`Disable all interactive prompts when running gcloud commands. If input
is required, defaults will be used, or an error will be raised.
Overrides the default core/disable_prompts property value for this
command invocation. This is equivalent to setting the environment
variable \`CLOUDSDK_CORE_DISABLE_PROMPTS\` to 1`},{name:"--region",description:"Compute region (e.g. us-central1) for the cluster",args:{name:"REGION",description:"String",suggestions:[]}},{name:"--trace-token",description:"Token used to route traces of service requests for investigation of issues. Overrides the default *core/trace_token* property value for this command invocation",args:{name:"TRACE_TOKEN",description:"String",suggestions:[]}},{name:"--user-output-enabled",description:"Print user intended output to the console. Overrides the default *core/user_output_enabled* property value for this command invocation. Use *--no-user-output-enabled* to disable"},{name:"--verbosity",description:"Override the default verbosity for this command. Overrides the default *core/verbosity* property value for this command invocation. _VERBOSITY_ must be one of: *debug*, *info*, *warning*, *error*, *critical*, *none*",args:{name:"VERBOSITY",description:"String",suggestions:["debug","info","warning","error","critical","none"]}},{name:"--zone",description:"Compute zone (e.g. us-central1-a) for the cluster. Overrides the default *compute/zone* property value for this command invocation",args:{name:"ZONE",description:"String",suggestions:[]}}]},{name:"operations",description:"Get and list operations for Google Kubernetes Engine clusters",subcommands:[{name:"describe",description:"Describe an operation",options:[{name:"--account",description:"Google Cloud Platform user account to use for invocation. Overrides the default *core/account* property value for this command invocation",args:{name:"ACCOUNT",description:"String",suggestions:[]}},{name:"--billing-project",description:"The Google Cloud Platform project that will be charged quota for operations performed in gcloud. If you need to operate on one project, but need quota against a different project, you can use this flag to specify the billing project. If both `billing/quota_project` and `--billing-project` are specified, `--billing-project` takes precedence. Run `$ gcloud config set --help` to see more information about `billing/quota_project`",args:{name:"BILLING_PROJECT",description:"String",suggestions:[]}},{name:"--configuration",description:`The configuration to use for this command invocation. For more
information on how to use configurations, run:
\`gcloud topic configurations\`.  You can also use the CLOUDSDK_ACTIVE_CONFIG_NAME environment
variable to set the equivalent of this flag for a terminal
session`,args:{name:"CONFIGURATION",description:"String",suggestions:[]}},{name:"--flags-file",description:`A YAML or JSON file that specifies a *--flag*:*value* dictionary.
Useful for specifying complex flag values with special characters
that work with any command interpreter. Additionally, each
*--flags-file* arg is replaced by its constituent flags. See
$ gcloud topic flags-file for more information`,args:{name:"YAML_FILE",description:"String",suggestions:[]}},{name:"--flatten",description:`Flatten _name_[] output resource slices in _KEY_ into separate records
for each item in each slice. Multiple keys and slices may be specified.
This also flattens keys for *--format* and *--filter*. For example,
*--flatten=abc.def* flattens *abc.def[].ghi* references to
*abc.def.ghi*. A resource record containing *abc.def[]* with N elements
will expand to N records in the flattened output. This flag interacts
with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--format",description:"Set the format for printing command output resources. The default is a\ncommand-specific human-friendly output format. The supported formats\nare: `config`, `csv`, `default`, `diff`, `disable`, `flattened`, `get`, `json`, `list`, `multi`, `none`, `object`, `table`, `text`, `value`, `yaml`. For more details run $ gcloud topic formats",args:{name:"FORMAT",description:"String",suggestions:[]}},{name:"--help",description:"Display detailed help"},{name:"--impersonate-service-account",description:"For this gcloud invocation, all API requests will be made as the given service account instead of the currently selected account. This is done without needing to create, download, and activate a key for the account. In order to perform operations as the service account, your currently selected account must have an IAM role that includes the iam.serviceAccounts.getAccessToken permission for the service account. The roles/iam.serviceAccountTokenCreator role has this permission or you may create a custom role. Overrides the default *auth/impersonate_service_account* property value for this command invocation",args:{name:"SERVICE_ACCOUNT_EMAIL",description:"String",suggestions:[]}},{name:"--log-http",description:"Log all HTTP server requests and responses to stderr. Overrides the default *core/log_http* property value for this command invocation"},{name:"--project",description:"The Google Cloud Platform project ID to use for this invocation. If\nomitted, then the current project is assumed; the current project can\nbe listed using `gcloud config list --format='text(core.project)'`\nand can be set using `gcloud config set project PROJECTID`.\n+\n`--project` and its fallback `core/project` property play two roles\nin the invocation. It specifies the project of the resource to\noperate on. It also specifies the project for API enablement check,\nquota, and billing. To specify a different project for quota and\nbilling, use `--billing-project` or `billing/quota_project` property",args:{name:"PROJECT_ID",description:"String",suggestions:[]}},{name:"--quiet",description:`Disable all interactive prompts when running gcloud commands. If input
is required, defaults will be used, or an error will be raised.
Overrides the default core/disable_prompts property value for this
command invocation. This is equivalent to setting the environment
variable \`CLOUDSDK_CORE_DISABLE_PROMPTS\` to 1`},{name:"--region",description:"Compute region (e.g. us-central1) for the cluster",args:{name:"REGION",description:"String",suggestions:[]}},{name:"--trace-token",description:"Token used to route traces of service requests for investigation of issues. Overrides the default *core/trace_token* property value for this command invocation",args:{name:"TRACE_TOKEN",description:"String",suggestions:[]}},{name:"--user-output-enabled",description:"Print user intended output to the console. Overrides the default *core/user_output_enabled* property value for this command invocation. Use *--no-user-output-enabled* to disable"},{name:"--verbosity",description:"Override the default verbosity for this command. Overrides the default *core/verbosity* property value for this command invocation. _VERBOSITY_ must be one of: *debug*, *info*, *warning*, *error*, *critical*, *none*",args:{name:"VERBOSITY",description:"String",suggestions:["debug","info","warning","error","critical","none"]}},{name:"--zone",description:"Compute zone (e.g. us-central1-a) for the cluster. Overrides the default *compute/zone* property value for this command invocation",args:{name:"ZONE",description:"String",suggestions:[]}}],args:{name:"OPERATION_ID",description:"The operation id to look up"}},{name:"list",description:"List operations for container clusters",options:[{name:"--account",description:"Google Cloud Platform user account to use for invocation. Overrides the default *core/account* property value for this command invocation",args:{name:"ACCOUNT",description:"String",suggestions:[]}},{name:"--billing-project",description:"The Google Cloud Platform project that will be charged quota for operations performed in gcloud. If you need to operate on one project, but need quota against a different project, you can use this flag to specify the billing project. If both `billing/quota_project` and `--billing-project` are specified, `--billing-project` takes precedence. Run `$ gcloud config set --help` to see more information about `billing/quota_project`",args:{name:"BILLING_PROJECT",description:"String",suggestions:[]}},{name:"--configuration",description:`The configuration to use for this command invocation. For more
information on how to use configurations, run:
\`gcloud topic configurations\`.  You can also use the CLOUDSDK_ACTIVE_CONFIG_NAME environment
variable to set the equivalent of this flag for a terminal
session`,args:{name:"CONFIGURATION",description:"String",suggestions:[]}},{name:"--filter",description:`Apply a Boolean filter _EXPRESSION_ to each resource item to be listed.
If the expression evaluates \`True\`, then that item is listed. For more
details and examples of filter expressions, run $ gcloud topic filters. This
flag interacts with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"EXPRESSION",description:"String",suggestions:[]}},{name:"--flags-file",description:`A YAML or JSON file that specifies a *--flag*:*value* dictionary.
Useful for specifying complex flag values with special characters
that work with any command interpreter. Additionally, each
*--flags-file* arg is replaced by its constituent flags. See
$ gcloud topic flags-file for more information`,args:{name:"YAML_FILE",description:"String",suggestions:[]}},{name:"--flatten",description:`Flatten _name_[] output resource slices in _KEY_ into separate records
for each item in each slice. Multiple keys and slices may be specified.
This also flattens keys for *--format* and *--filter*. For example,
*--flatten=abc.def* flattens *abc.def[].ghi* references to
*abc.def.ghi*. A resource record containing *abc.def[]* with N elements
will expand to N records in the flattened output. This flag interacts
with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--format",description:"Set the format for printing command output resources. The default is a\ncommand-specific human-friendly output format. The supported formats\nare: `config`, `csv`, `default`, `diff`, `disable`, `flattened`, `get`, `json`, `list`, `multi`, `none`, `object`, `table`, `text`, `value`, `yaml`. For more details run $ gcloud topic formats",args:{name:"FORMAT",description:"String",suggestions:[]}},{name:"--help",description:"Display detailed help"},{name:"--impersonate-service-account",description:"For this gcloud invocation, all API requests will be made as the given service account instead of the currently selected account. This is done without needing to create, download, and activate a key for the account. In order to perform operations as the service account, your currently selected account must have an IAM role that includes the iam.serviceAccounts.getAccessToken permission for the service account. The roles/iam.serviceAccountTokenCreator role has this permission or you may create a custom role. Overrides the default *auth/impersonate_service_account* property value for this command invocation",args:{name:"SERVICE_ACCOUNT_EMAIL",description:"String",suggestions:[]}},{name:"--limit",description:`Maximum number of resources to list. The default is *unlimited*.
This flag interacts with other flags that are applied in this order:
*--flatten*, *--sort-by*, *--filter*, *--limit*`,args:{name:"LIMIT",description:"Googlecloudsdk.calliope.arg_parsers:Parse",suggestions:[]}},{name:"--log-http",description:"Log all HTTP server requests and responses to stderr. Overrides the default *core/log_http* property value for this command invocation"},{name:"--page-size",description:`Some services group resource list output into pages. This flag specifies
the maximum number of resources per page. The default is determined by the
service if it supports paging, otherwise it is *unlimited* (no paging).
Paging may be applied before or after *--filter* and *--limit* depending
on the service`,args:{name:"PAGE_SIZE",description:"Googlecloudsdk.calliope.arg_parsers:Parse",suggestions:[]}},{name:"--project",description:"The Google Cloud Platform project ID to use for this invocation. If\nomitted, then the current project is assumed; the current project can\nbe listed using `gcloud config list --format='text(core.project)'`\nand can be set using `gcloud config set project PROJECTID`.\n+\n`--project` and its fallback `core/project` property play two roles\nin the invocation. It specifies the project of the resource to\noperate on. It also specifies the project for API enablement check,\nquota, and billing. To specify a different project for quota and\nbilling, use `--billing-project` or `billing/quota_project` property",args:{name:"PROJECT_ID",description:"String",suggestions:[]}},{name:"--quiet",description:`Disable all interactive prompts when running gcloud commands. If input
is required, defaults will be used, or an error will be raised.
Overrides the default core/disable_prompts property value for this
command invocation. This is equivalent to setting the environment
variable \`CLOUDSDK_CORE_DISABLE_PROMPTS\` to 1`},{name:"--region",description:"Compute region (e.g. us-central1) for the cluster",args:{name:"REGION",description:"String",suggestions:[]}},{name:"--sort-by",description:`Comma-separated list of resource field key names to sort by. The
default order is ascending. Prefix a field with \`\`~'' for descending
order on that field. This flag interacts with other flags that are applied
in this order: *--flatten*, *--sort-by*, *--filter*, *--limit*`,args:{name:"FIELD",description:"List",suggestions:[]}},{name:"--trace-token",description:"Token used to route traces of service requests for investigation of issues. Overrides the default *core/trace_token* property value for this command invocation",args:{name:"TRACE_TOKEN",description:"String",suggestions:[]}},{name:"--user-output-enabled",description:"Print user intended output to the console. Overrides the default *core/user_output_enabled* property value for this command invocation. Use *--no-user-output-enabled* to disable"},{name:"--verbosity",description:"Override the default verbosity for this command. Overrides the default *core/verbosity* property value for this command invocation. _VERBOSITY_ must be one of: *debug*, *info*, *warning*, *error*, *critical*, *none*",args:{name:"VERBOSITY",description:"String",suggestions:["debug","info","warning","error","critical","none"]}},{name:"--zone",description:"Compute zone (e.g. us-central1-a) for the cluster. Overrides the default *compute/zone* property value for this command invocation",args:{name:"ZONE",description:"String",suggestions:[]}}]},{name:"wait",description:"Poll an operation for completion",options:[{name:"--account",description:"Google Cloud Platform user account to use for invocation. Overrides the default *core/account* property value for this command invocation",args:{name:"ACCOUNT",description:"String",suggestions:[]}},{name:"--billing-project",description:"The Google Cloud Platform project that will be charged quota for operations performed in gcloud. If you need to operate on one project, but need quota against a different project, you can use this flag to specify the billing project. If both `billing/quota_project` and `--billing-project` are specified, `--billing-project` takes precedence. Run `$ gcloud config set --help` to see more information about `billing/quota_project`",args:{name:"BILLING_PROJECT",description:"String",suggestions:[]}},{name:"--configuration",description:`The configuration to use for this command invocation. For more
information on how to use configurations, run:
\`gcloud topic configurations\`.  You can also use the CLOUDSDK_ACTIVE_CONFIG_NAME environment
variable to set the equivalent of this flag for a terminal
session`,args:{name:"CONFIGURATION",description:"String",suggestions:[]}},{name:"--flags-file",description:`A YAML or JSON file that specifies a *--flag*:*value* dictionary.
Useful for specifying complex flag values with special characters
that work with any command interpreter. Additionally, each
*--flags-file* arg is replaced by its constituent flags. See
$ gcloud topic flags-file for more information`,args:{name:"YAML_FILE",description:"String",suggestions:[]}},{name:"--flatten",description:`Flatten _name_[] output resource slices in _KEY_ into separate records
for each item in each slice. Multiple keys and slices may be specified.
This also flattens keys for *--format* and *--filter*. For example,
*--flatten=abc.def* flattens *abc.def[].ghi* references to
*abc.def.ghi*. A resource record containing *abc.def[]* with N elements
will expand to N records in the flattened output. This flag interacts
with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--format",description:"Set the format for printing command output resources. The default is a\ncommand-specific human-friendly output format. The supported formats\nare: `config`, `csv`, `default`, `diff`, `disable`, `flattened`, `get`, `json`, `list`, `multi`, `none`, `object`, `table`, `text`, `value`, `yaml`. For more details run $ gcloud topic formats",args:{name:"FORMAT",description:"String",suggestions:[]}},{name:"--help",description:"Display detailed help"},{name:"--impersonate-service-account",description:"For this gcloud invocation, all API requests will be made as the given service account instead of the currently selected account. This is done without needing to create, download, and activate a key for the account. In order to perform operations as the service account, your currently selected account must have an IAM role that includes the iam.serviceAccounts.getAccessToken permission for the service account. The roles/iam.serviceAccountTokenCreator role has this permission or you may create a custom role. Overrides the default *auth/impersonate_service_account* property value for this command invocation",args:{name:"SERVICE_ACCOUNT_EMAIL",description:"String",suggestions:[]}},{name:"--log-http",description:"Log all HTTP server requests and responses to stderr. Overrides the default *core/log_http* property value for this command invocation"},{name:"--project",description:"The Google Cloud Platform project ID to use for this invocation. If\nomitted, then the current project is assumed; the current project can\nbe listed using `gcloud config list --format='text(core.project)'`\nand can be set using `gcloud config set project PROJECTID`.\n+\n`--project` and its fallback `core/project` property play two roles\nin the invocation. It specifies the project of the resource to\noperate on. It also specifies the project for API enablement check,\nquota, and billing. To specify a different project for quota and\nbilling, use `--billing-project` or `billing/quota_project` property",args:{name:"PROJECT_ID",description:"String",suggestions:[]}},{name:"--quiet",description:`Disable all interactive prompts when running gcloud commands. If input
is required, defaults will be used, or an error will be raised.
Overrides the default core/disable_prompts property value for this
command invocation. This is equivalent to setting the environment
variable \`CLOUDSDK_CORE_DISABLE_PROMPTS\` to 1`},{name:"--region",description:"Compute region (e.g. us-central1) for the cluster",args:{name:"REGION",description:"String",suggestions:[]}},{name:"--trace-token",description:"Token used to route traces of service requests for investigation of issues. Overrides the default *core/trace_token* property value for this command invocation",args:{name:"TRACE_TOKEN",description:"String",suggestions:[]}},{name:"--user-output-enabled",description:"Print user intended output to the console. Overrides the default *core/user_output_enabled* property value for this command invocation. Use *--no-user-output-enabled* to disable"},{name:"--verbosity",description:"Override the default verbosity for this command. Overrides the default *core/verbosity* property value for this command invocation. _VERBOSITY_ must be one of: *debug*, *info*, *warning*, *error*, *critical*, *none*",args:{name:"VERBOSITY",description:"String",suggestions:["debug","info","warning","error","critical","none"]}},{name:"--zone",description:"Compute zone (e.g. us-central1-a) for the cluster. Overrides the default *compute/zone* property value for this command invocation",args:{name:"ZONE",description:"String",suggestions:[]}}],args:{name:"OPERATION_ID",description:"The operation id to poll"}}],options:[{name:"--account",description:"Google Cloud Platform user account to use for invocation. Overrides the default *core/account* property value for this command invocation",args:{name:"ACCOUNT",description:"String",suggestions:[]}},{name:"--billing-project",description:"The Google Cloud Platform project that will be charged quota for operations performed in gcloud. If you need to operate on one project, but need quota against a different project, you can use this flag to specify the billing project. If both `billing/quota_project` and `--billing-project` are specified, `--billing-project` takes precedence. Run `$ gcloud config set --help` to see more information about `billing/quota_project`",args:{name:"BILLING_PROJECT",description:"String",suggestions:[]}},{name:"--configuration",description:`The configuration to use for this command invocation. For more
information on how to use configurations, run:
\`gcloud topic configurations\`.  You can also use the CLOUDSDK_ACTIVE_CONFIG_NAME environment
variable to set the equivalent of this flag for a terminal
session`,args:{name:"CONFIGURATION",description:"String",suggestions:[]}},{name:"--flags-file",description:`A YAML or JSON file that specifies a *--flag*:*value* dictionary.
Useful for specifying complex flag values with special characters
that work with any command interpreter. Additionally, each
*--flags-file* arg is replaced by its constituent flags. See
$ gcloud topic flags-file for more information`,args:{name:"YAML_FILE",description:"String",suggestions:[]}},{name:"--flatten",description:`Flatten _name_[] output resource slices in _KEY_ into separate records
for each item in each slice. Multiple keys and slices may be specified.
This also flattens keys for *--format* and *--filter*. For example,
*--flatten=abc.def* flattens *abc.def[].ghi* references to
*abc.def.ghi*. A resource record containing *abc.def[]* with N elements
will expand to N records in the flattened output. This flag interacts
with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--format",description:"Set the format for printing command output resources. The default is a\ncommand-specific human-friendly output format. The supported formats\nare: `config`, `csv`, `default`, `diff`, `disable`, `flattened`, `get`, `json`, `list`, `multi`, `none`, `object`, `table`, `text`, `value`, `yaml`. For more details run $ gcloud topic formats",args:{name:"FORMAT",description:"String",suggestions:[]}},{name:"--help",description:"Display detailed help"},{name:"--impersonate-service-account",description:"For this gcloud invocation, all API requests will be made as the given service account instead of the currently selected account. This is done without needing to create, download, and activate a key for the account. In order to perform operations as the service account, your currently selected account must have an IAM role that includes the iam.serviceAccounts.getAccessToken permission for the service account. The roles/iam.serviceAccountTokenCreator role has this permission or you may create a custom role. Overrides the default *auth/impersonate_service_account* property value for this command invocation",args:{name:"SERVICE_ACCOUNT_EMAIL",description:"String",suggestions:[]}},{name:"--log-http",description:"Log all HTTP server requests and responses to stderr. Overrides the default *core/log_http* property value for this command invocation"},{name:"--project",description:"The Google Cloud Platform project ID to use for this invocation. If\nomitted, then the current project is assumed; the current project can\nbe listed using `gcloud config list --format='text(core.project)'`\nand can be set using `gcloud config set project PROJECTID`.\n+\n`--project` and its fallback `core/project` property play two roles\nin the invocation. It specifies the project of the resource to\noperate on. It also specifies the project for API enablement check,\nquota, and billing. To specify a different project for quota and\nbilling, use `--billing-project` or `billing/quota_project` property",args:{name:"PROJECT_ID",description:"String",suggestions:[]}},{name:"--quiet",description:`Disable all interactive prompts when running gcloud commands. If input
is required, defaults will be used, or an error will be raised.
Overrides the default core/disable_prompts property value for this
command invocation. This is equivalent to setting the environment
variable \`CLOUDSDK_CORE_DISABLE_PROMPTS\` to 1`},{name:"--region",description:"Compute region (e.g. us-central1) for the cluster",args:{name:"REGION",description:"String",suggestions:[]}},{name:"--trace-token",description:"Token used to route traces of service requests for investigation of issues. Overrides the default *core/trace_token* property value for this command invocation",args:{name:"TRACE_TOKEN",description:"String",suggestions:[]}},{name:"--user-output-enabled",description:"Print user intended output to the console. Overrides the default *core/user_output_enabled* property value for this command invocation. Use *--no-user-output-enabled* to disable"},{name:"--verbosity",description:"Override the default verbosity for this command. Overrides the default *core/verbosity* property value for this command invocation. _VERBOSITY_ must be one of: *debug*, *info*, *warning*, *error*, *critical*, *none*",args:{name:"VERBOSITY",description:"String",suggestions:["debug","info","warning","error","critical","none"]}},{name:"--zone",description:"Compute zone (e.g. us-central1-a) for the cluster. Overrides the default *compute/zone* property value for this command invocation",args:{name:"ZONE",description:"String",suggestions:[]}}]},{name:"subnets",description:"Manage subnets to be used by Google Kubernetes Engine clusters",subcommands:[{name:"list-usable",description:"List subnets usable for cluster creation in a specific project",options:[{name:"--account",description:"Google Cloud Platform user account to use for invocation. Overrides the default *core/account* property value for this command invocation",args:{name:"ACCOUNT",description:"String",suggestions:[]}},{name:"--billing-project",description:"The Google Cloud Platform project that will be charged quota for operations performed in gcloud. If you need to operate on one project, but need quota against a different project, you can use this flag to specify the billing project. If both `billing/quota_project` and `--billing-project` are specified, `--billing-project` takes precedence. Run `$ gcloud config set --help` to see more information about `billing/quota_project`",args:{name:"BILLING_PROJECT",description:"String",suggestions:[]}},{name:"--configuration",description:`The configuration to use for this command invocation. For more
information on how to use configurations, run:
\`gcloud topic configurations\`.  You can also use the CLOUDSDK_ACTIVE_CONFIG_NAME environment
variable to set the equivalent of this flag for a terminal
session`,args:{name:"CONFIGURATION",description:"String",suggestions:[]}},{name:"--filter",description:`Apply a Boolean filter _EXPRESSION_ to each resource item to be listed.
If the expression evaluates \`True\`, then that item is listed. For more
details and examples of filter expressions, run $ gcloud topic filters. This
flag interacts with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"EXPRESSION",description:"String",suggestions:[]}},{name:"--flags-file",description:`A YAML or JSON file that specifies a *--flag*:*value* dictionary.
Useful for specifying complex flag values with special characters
that work with any command interpreter. Additionally, each
*--flags-file* arg is replaced by its constituent flags. See
$ gcloud topic flags-file for more information`,args:{name:"YAML_FILE",description:"String",suggestions:[]}},{name:"--flatten",description:`Flatten _name_[] output resource slices in _KEY_ into separate records
for each item in each slice. Multiple keys and slices may be specified.
This also flattens keys for *--format* and *--filter*. For example,
*--flatten=abc.def* flattens *abc.def[].ghi* references to
*abc.def.ghi*. A resource record containing *abc.def[]* with N elements
will expand to N records in the flattened output. This flag interacts
with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--format",description:"Set the format for printing command output resources. The default is a\ncommand-specific human-friendly output format. The supported formats\nare: `config`, `csv`, `default`, `diff`, `disable`, `flattened`, `get`, `json`, `list`, `multi`, `none`, `object`, `table`, `text`, `value`, `yaml`. For more details run $ gcloud topic formats",args:{name:"FORMAT",description:"String",suggestions:[]}},{name:"--help",description:"Display detailed help"},{name:"--impersonate-service-account",description:"For this gcloud invocation, all API requests will be made as the given service account instead of the currently selected account. This is done without needing to create, download, and activate a key for the account. In order to perform operations as the service account, your currently selected account must have an IAM role that includes the iam.serviceAccounts.getAccessToken permission for the service account. The roles/iam.serviceAccountTokenCreator role has this permission or you may create a custom role. Overrides the default *auth/impersonate_service_account* property value for this command invocation",args:{name:"SERVICE_ACCOUNT_EMAIL",description:"String",suggestions:[]}},{name:"--limit",description:`Maximum number of resources to list. The default is *unlimited*.
This flag interacts with other flags that are applied in this order:
*--flatten*, *--sort-by*, *--filter*, *--limit*`,args:{name:"LIMIT",description:"Googlecloudsdk.calliope.arg_parsers:Parse",suggestions:[]}},{name:"--log-http",description:"Log all HTTP server requests and responses to stderr. Overrides the default *core/log_http* property value for this command invocation"},{name:"--network-project",description:"The project owning the subnetworks returned. This field is translated\ninto the expression `networkProjectId=[PROJECT_ID]` and ANDed to\nthe `--filter` flag value.\n+\nDefaults to the *--project* value",args:{name:"NETWORK_PROJECT",description:"String",suggestions:[]}},{name:"--page-size",description:`Some services group resource list output into pages. This flag specifies
the maximum number of resources per page. The default is determined by the
service if it supports paging, otherwise it is *unlimited* (no paging).
Paging may be applied before or after *--filter* and *--limit* depending
on the service`,args:{name:"PAGE_SIZE",description:"Googlecloudsdk.calliope.arg_parsers:Parse",suggestions:[]}},{name:"--project",description:"The Google Cloud Platform project ID to use for this invocation. If\nomitted, then the current project is assumed; the current project can\nbe listed using `gcloud config list --format='text(core.project)'`\nand can be set using `gcloud config set project PROJECTID`.\n+\n`--project` and its fallback `core/project` property play two roles\nin the invocation. It specifies the project of the resource to\noperate on. It also specifies the project for API enablement check,\nquota, and billing. To specify a different project for quota and\nbilling, use `--billing-project` or `billing/quota_project` property",args:{name:"PROJECT_ID",description:"String",suggestions:[]}},{name:"--quiet",description:`Disable all interactive prompts when running gcloud commands. If input
is required, defaults will be used, or an error will be raised.
Overrides the default core/disable_prompts property value for this
command invocation. This is equivalent to setting the environment
variable \`CLOUDSDK_CORE_DISABLE_PROMPTS\` to 1`},{name:"--sort-by",description:`Comma-separated list of resource field key names to sort by. The
default order is ascending. Prefix a field with \`\`~'' for descending
order on that field. This flag interacts with other flags that are applied
in this order: *--flatten*, *--sort-by*, *--filter*, *--limit*`,args:{name:"FIELD",description:"List",suggestions:[]}},{name:"--trace-token",description:"Token used to route traces of service requests for investigation of issues. Overrides the default *core/trace_token* property value for this command invocation",args:{name:"TRACE_TOKEN",description:"String",suggestions:[]}},{name:"--uri",description:"Print a list of resource URIs instead of the default output"},{name:"--user-output-enabled",description:"Print user intended output to the console. Overrides the default *core/user_output_enabled* property value for this command invocation. Use *--no-user-output-enabled* to disable"},{name:"--verbosity",description:"Override the default verbosity for this command. Overrides the default *core/verbosity* property value for this command invocation. _VERBOSITY_ must be one of: *debug*, *info*, *warning*, *error*, *critical*, *none*",args:{name:"VERBOSITY",description:"String",suggestions:["debug","info","warning","error","critical","none"]}}]}],options:[{name:"--account",description:"Google Cloud Platform user account to use for invocation. Overrides the default *core/account* property value for this command invocation",args:{name:"ACCOUNT",description:"String",suggestions:[]}},{name:"--billing-project",description:"The Google Cloud Platform project that will be charged quota for operations performed in gcloud. If you need to operate on one project, but need quota against a different project, you can use this flag to specify the billing project. If both `billing/quota_project` and `--billing-project` are specified, `--billing-project` takes precedence. Run `$ gcloud config set --help` to see more information about `billing/quota_project`",args:{name:"BILLING_PROJECT",description:"String",suggestions:[]}},{name:"--configuration",description:`The configuration to use for this command invocation. For more
information on how to use configurations, run:
\`gcloud topic configurations\`.  You can also use the CLOUDSDK_ACTIVE_CONFIG_NAME environment
variable to set the equivalent of this flag for a terminal
session`,args:{name:"CONFIGURATION",description:"String",suggestions:[]}},{name:"--flags-file",description:`A YAML or JSON file that specifies a *--flag*:*value* dictionary.
Useful for specifying complex flag values with special characters
that work with any command interpreter. Additionally, each
*--flags-file* arg is replaced by its constituent flags. See
$ gcloud topic flags-file for more information`,args:{name:"YAML_FILE",description:"String",suggestions:[]}},{name:"--flatten",description:`Flatten _name_[] output resource slices in _KEY_ into separate records
for each item in each slice. Multiple keys and slices may be specified.
This also flattens keys for *--format* and *--filter*. For example,
*--flatten=abc.def* flattens *abc.def[].ghi* references to
*abc.def.ghi*. A resource record containing *abc.def[]* with N elements
will expand to N records in the flattened output. This flag interacts
with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--format",description:"Set the format for printing command output resources. The default is a\ncommand-specific human-friendly output format. The supported formats\nare: `config`, `csv`, `default`, `diff`, `disable`, `flattened`, `get`, `json`, `list`, `multi`, `none`, `object`, `table`, `text`, `value`, `yaml`. For more details run $ gcloud topic formats",args:{name:"FORMAT",description:"String",suggestions:[]}},{name:"--help",description:"Display detailed help"},{name:"--impersonate-service-account",description:"For this gcloud invocation, all API requests will be made as the given service account instead of the currently selected account. This is done without needing to create, download, and activate a key for the account. In order to perform operations as the service account, your currently selected account must have an IAM role that includes the iam.serviceAccounts.getAccessToken permission for the service account. The roles/iam.serviceAccountTokenCreator role has this permission or you may create a custom role. Overrides the default *auth/impersonate_service_account* property value for this command invocation",args:{name:"SERVICE_ACCOUNT_EMAIL",description:"String",suggestions:[]}},{name:"--log-http",description:"Log all HTTP server requests and responses to stderr. Overrides the default *core/log_http* property value for this command invocation"},{name:"--project",description:"The Google Cloud Platform project ID to use for this invocation. If\nomitted, then the current project is assumed; the current project can\nbe listed using `gcloud config list --format='text(core.project)'`\nand can be set using `gcloud config set project PROJECTID`.\n+\n`--project` and its fallback `core/project` property play two roles\nin the invocation. It specifies the project of the resource to\noperate on. It also specifies the project for API enablement check,\nquota, and billing. To specify a different project for quota and\nbilling, use `--billing-project` or `billing/quota_project` property",args:{name:"PROJECT_ID",description:"String",suggestions:[]}},{name:"--quiet",description:`Disable all interactive prompts when running gcloud commands. If input
is required, defaults will be used, or an error will be raised.
Overrides the default core/disable_prompts property value for this
command invocation. This is equivalent to setting the environment
variable \`CLOUDSDK_CORE_DISABLE_PROMPTS\` to 1`},{name:"--trace-token",description:"Token used to route traces of service requests for investigation of issues. Overrides the default *core/trace_token* property value for this command invocation",args:{name:"TRACE_TOKEN",description:"String",suggestions:[]}},{name:"--user-output-enabled",description:"Print user intended output to the console. Overrides the default *core/user_output_enabled* property value for this command invocation. Use *--no-user-output-enabled* to disable"},{name:"--verbosity",description:"Override the default verbosity for this command. Overrides the default *core/verbosity* property value for this command invocation. _VERBOSITY_ must be one of: *debug*, *info*, *warning*, *error*, *critical*, *none*",args:{name:"VERBOSITY",description:"String",suggestions:["debug","info","warning","error","critical","none"]}}]}],options:[{name:"--account",description:"Google Cloud Platform user account to use for invocation. Overrides the default *core/account* property value for this command invocation",args:{name:"ACCOUNT",description:"String",suggestions:[]}},{name:"--billing-project",description:"The Google Cloud Platform project that will be charged quota for operations performed in gcloud. If you need to operate on one project, but need quota against a different project, you can use this flag to specify the billing project. If both `billing/quota_project` and `--billing-project` are specified, `--billing-project` takes precedence. Run `$ gcloud config set --help` to see more information about `billing/quota_project`",args:{name:"BILLING_PROJECT",description:"String",suggestions:[]}},{name:"--configuration",description:`The configuration to use for this command invocation. For more
information on how to use configurations, run:
\`gcloud topic configurations\`.  You can also use the CLOUDSDK_ACTIVE_CONFIG_NAME environment
variable to set the equivalent of this flag for a terminal
session`,args:{name:"CONFIGURATION",description:"String",suggestions:[]}},{name:"--flags-file",description:`A YAML or JSON file that specifies a *--flag*:*value* dictionary.
Useful for specifying complex flag values with special characters
that work with any command interpreter. Additionally, each
*--flags-file* arg is replaced by its constituent flags. See
$ gcloud topic flags-file for more information`,args:{name:"YAML_FILE",description:"String",suggestions:[]}},{name:"--flatten",description:`Flatten _name_[] output resource slices in _KEY_ into separate records
for each item in each slice. Multiple keys and slices may be specified.
This also flattens keys for *--format* and *--filter*. For example,
*--flatten=abc.def* flattens *abc.def[].ghi* references to
*abc.def.ghi*. A resource record containing *abc.def[]* with N elements
will expand to N records in the flattened output. This flag interacts
with other flags that are applied in this order: *--flatten*,
*--sort-by*, *--filter*, *--limit*`,args:{name:"KEY",description:"List",suggestions:[]}},{name:"--format",description:"Set the format for printing command output resources. The default is a\ncommand-specific human-friendly output format. The supported formats\nare: `config`, `csv`, `default`, `diff`, `disable`, `flattened`, `get`, `json`, `list`, `multi`, `none`, `object`, `table`, `text`, `value`, `yaml`. For more details run $ gcloud topic formats",args:{name:"FORMAT",description:"String",suggestions:[]}},{name:"--help",description:"Display detailed help"},{name:"--impersonate-service-account",description:"For this gcloud invocation, all API requests will be made as the given service account instead of the currently selected account. This is done without needing to create, download, and activate a key for the account. In order to perform operations as the service account, your currently selected account must have an IAM role that includes the iam.serviceAccounts.getAccessToken permission for the service account. The roles/iam.serviceAccountTokenCreator role has this permission or you may create a custom role. Overrides the default *auth/impersonate_service_account* property value for this command invocation",args:{name:"SERVICE_ACCOUNT_EMAIL",description:"String",suggestions:[]}},{name:"--log-http",description:"Log all HTTP server requests and responses to stderr. Overrides the default *core/log_http* property value for this command invocation"},{name:"--project",description:"The Google Cloud Platform project ID to use for this invocation. If\nomitted, then the current project is assumed; the current project can\nbe listed using `gcloud config list --format='text(core.project)'`\nand can be set using `gcloud config set project PROJECTID`.\n+\n`--project` and its fallback `core/project` property play two roles\nin the invocation. It specifies the project of the resource to\noperate on. It also specifies the project for API enablement check,\nquota, and billing. To specify a different project for quota and\nbilling, use `--billing-project` or `billing/quota_project` property",args:{name:"PROJECT_ID",description:"String",suggestions:[]}},{name:"--quiet",description:`Disable all interactive prompts when running gcloud commands. If input
is required, defaults will be used, or an error will be raised.
Overrides the default core/disable_prompts property value for this
command invocation. This is equivalent to setting the environment
variable \`CLOUDSDK_CORE_DISABLE_PROMPTS\` to 1`},{name:"--trace-token",description:"Token used to route traces of service requests for investigation of issues. Overrides the default *core/trace_token* property value for this command invocation",args:{name:"TRACE_TOKEN",description:"String",suggestions:[]}},{name:"--user-output-enabled",description:"Print user intended output to the console. Overrides the default *core/user_output_enabled* property value for this command invocation. Use *--no-user-output-enabled* to disable"},{name:"--verbosity",description:"Override the default verbosity for this command. Overrides the default *core/verbosity* property value for this command invocation. _VERBOSITY_ must be one of: *debug*, *info*, *warning*, *error*, *critical*, *none*",args:{name:"VERBOSITY",description:"String",suggestions:["debug","info","warning","error","critical","none"]}}]},t=e;export{t as default};
