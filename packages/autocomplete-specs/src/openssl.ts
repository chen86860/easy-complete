const inFile: Fig.Option = {
  name: "-in",
  description: "Input file",
  args: { name: "infile", template: "filepaths" },
};

const outFile: Fig.Option = {
  name: "-out",
  description: "Output file",
  args: { name: "outfile", template: "filepaths" },
};

const informOpt: Fig.Option = {
  name: "-inform",
  description: "Input format",
  args: { name: "format", suggestions: ["PEM", "DER"] },
};

const outformOpt: Fig.Option = {
  name: "-outform",
  description: "Output format",
  args: { name: "format", suggestions: ["PEM", "DER"] },
};

const passin: Fig.Option = {
  name: "-passin",
  description:
    "Input file pass phrase source (e.g. pass:xxx, file:xxx, env:VAR)",
  args: { name: "val" },
};

const passout: Fig.Option = {
  name: "-passout",
  description: "Output file pass phrase source",
  args: { name: "val" },
};

const completionSpec: Fig.Spec = {
  name: "openssl",
  description:
    "OpenSSL command line tool for cryptography: keys, certificates, hashing, encryption and TLS testing",
  subcommands: [
    {
      name: "version",
      description: "Print OpenSSL version information",
      options: [
        { name: "-a", description: "Print all information" },
        { name: "-v", description: "Print the OpenSSL version number" },
        { name: "-d", description: "Print OPENSSLDIR" },
        { name: "-e", description: "Print engines directory" },
        { name: "-m", description: "Print modules directory" },
      ],
    },
    {
      name: "help",
      description: "Display a summary of commands",
      args: { name: "command", isOptional: true },
    },
    {
      name: "list",
      description: "List algorithms and capabilities",
      options: [
        {
          name: "-digest-algorithms",
          description: "List of message digest algorithms",
        },
        {
          name: "-cipher-algorithms",
          description: "List of cipher algorithms",
        },
        {
          name: "-public-key-algorithms",
          description: "List of public key algorithms",
        },
        { name: "-commands", description: "List of standard commands" },
      ],
    },
    {
      name: "ciphers",
      description: "Determine the available SSL/TLS cipher suites",
      args: { name: "cipherlist", isOptional: true },
      options: [
        { name: "-v", description: "Verbose listing of the SSL/TLS ciphers" },
        {
          name: "-V",
          description: "Like -v, but include cipher suite codes in output",
        },
        { name: "-s", description: "Only supported ciphers" },
        { name: "-tls1_3", description: "Cipher suites for TLSv1.3" },
      ],
    },
    {
      name: "genrsa",
      description: "Generate an RSA private key",
      args: { name: "numbits", isOptional: true, default: "2048" },
      options: [
        outFile,
        passout,
        {
          name: "-aes256",
          description: "Encrypt the generated key with AES-256 in CBC mode",
        },
        {
          name: "-des3",
          description: "Encrypt the generated key with triple DES",
        },
      ],
    },
    {
      name: "genpkey",
      description: "Generate a private key",
      options: [
        outFile,
        outformOpt,
        passout,
        {
          name: "-algorithm",
          description: "Public key algorithm to use",
          args: {
            name: "alg",
            suggestions: ["RSA", "EC", "ED25519", "ED448", "X25519", "DSA"],
          },
        },
        {
          name: "-pkeyopt",
          description: "Set a public key algorithm option as opt:value",
          isRepeatable: true,
          args: { name: "opt:value" },
        },
        { name: "-aes256", description: "Encrypt output with AES-256" },
      ],
    },
    {
      name: "rsa",
      description: "Process RSA keys (inspect, convert, remove passphrase)",
      options: [
        inFile,
        outFile,
        informOpt,
        outformOpt,
        passin,
        passout,
        { name: "-pubout", description: "Output the public key" },
        { name: "-pubin", description: "Expect a public key as input" },
        {
          name: "-text",
          description: "Print the key components in plain text",
        },
        {
          name: "-noout",
          description: "Don't output the encoded version of the key",
        },
        { name: "-check", description: "Verify key consistency" },
      ],
    },
    {
      name: "ec",
      description: "Process EC keys",
      options: [
        inFile,
        outFile,
        informOpt,
        outformOpt,
        passin,
        passout,
        { name: "-pubout", description: "Output the public key" },
        { name: "-pubin", description: "Expect a public key as input" },
        { name: "-text", description: "Print the key in text form" },
        { name: "-noout", description: "Don't print the key" },
      ],
    },
    {
      name: "ecparam",
      description: "Manipulate or generate EC parameters",
      options: [
        outFile,
        {
          name: "-name",
          description: "Use the EC parameters with the specified name",
          args: {
            name: "curve",
            suggestions: ["prime256v1", "secp384r1", "secp521r1", "secp256k1"],
          },
        },
        {
          name: "-genkey",
          description:
            "Generate an EC private key using the specified parameters",
        },
        {
          name: "-list_curves",
          description: "Print a list of all currently implemented EC curves",
        },
      ],
    },
    {
      name: "req",
      description:
        "Create and process PKCS#10 certificate signing requests (CSR) and self-signed certificates",
      options: [
        inFile,
        outFile,
        informOpt,
        outformOpt,
        passin,
        passout,
        { name: "-new", description: "Generate a new certificate request" },
        {
          name: "-newkey",
          description: "Generate a new private key and CSR",
          args: { name: "arg", suggestions: ["rsa:2048", "rsa:4096", "ec"] },
        },
        {
          name: "-key",
          description: "Private key to use",
          args: { name: "keyfile", template: "filepaths" },
        },
        {
          name: "-keyout",
          description: "File to write the newly created private key to",
          args: { name: "file", template: "filepaths" },
        },
        {
          name: "-nodes",
          description:
            "Don't encrypt the output private key (legacy alias of -noenc)",
        },
        { name: "-noenc", description: "Don't encrypt the output private key" },
        {
          name: "-x509",
          description:
            "Output a self-signed X.509 certificate instead of a CSR",
        },
        {
          name: "-days",
          description: "Number of days a -x509 certificate is valid for",
          args: { name: "n" },
        },
        {
          name: "-subj",
          description: "Set or modify the request subject",
          args: { name: "/C=.../CN=..." },
        },
        {
          name: "-config",
          description: "Request template config file",
          args: { name: "file", template: "filepaths" },
        },
        {
          name: "-addext",
          description: "Add a certificate extension (repeatable)",
          isRepeatable: true,
          args: { name: "ext" },
        },
        { name: "-text", description: "Print the request in text form" },
        {
          name: "-noout",
          description: "Don't output the encoded version of the request",
        },
        {
          name: "-verify",
          description: "Verify the self-signature on the request",
        },
      ],
    },
    {
      name: "x509",
      description: "Display, sign and convert X.509 certificates",
      options: [
        inFile,
        outFile,
        informOpt,
        outformOpt,
        passin,
        {
          name: "-req",
          description: "Input is a CSR file rather than a certificate",
        },
        {
          name: "-signkey",
          description: "Self-sign using the supplied private key",
          args: { name: "key", template: "filepaths" },
        },
        {
          name: "-CA",
          description: "Issuer certificate to use for signing",
          args: { name: "file", template: "filepaths" },
        },
        {
          name: "-CAkey",
          description: "Issuer private key to use with -CA",
          args: { name: "file", template: "filepaths" },
        },
        {
          name: "-days",
          description: "Number of days until the certificate expires",
          args: { name: "n" },
        },
        { name: "-text", description: "Print the certificate in text form" },
        {
          name: "-noout",
          description: "Don't output the encoded version of the certificate",
        },
        {
          name: "-fingerprint",
          description: "Print the certificate fingerprint",
        },
        { name: "-subject", description: "Print the subject name" },
        { name: "-issuer", description: "Print the issuer name" },
        { name: "-dates", description: "Print the start and expiry dates" },
        { name: "-serial", description: "Print the serial number" },
      ],
    },
    {
      name: "dgst",
      description: "Compute message digests and sign/verify data",
      args: {
        name: "file",
        isVariadic: true,
        isOptional: true,
        template: "filepaths",
      },
      options: [
        outFile,
        { name: "-sha256", description: "Use the SHA-256 digest" },
        { name: "-sha512", description: "Use the SHA-512 digest" },
        { name: "-sha1", description: "Use the SHA-1 digest" },
        { name: "-md5", description: "Use the MD5 digest" },
        { name: "-hex", description: "Output as hex dump (default)" },
        { name: "-binary", description: "Output in binary form" },
        { name: "-r", description: "Output in coreutils format" },
        {
          name: "-sign",
          description: "Sign digest using the given private key",
          args: { name: "key", template: "filepaths" },
        },
        {
          name: "-verify",
          description: "Verify a signature using the given public key",
          args: { name: "key", template: "filepaths" },
        },
        {
          name: "-signature",
          description: "Signature to verify",
          args: { name: "file", template: "filepaths" },
        },
        {
          name: "-hmac",
          description: "Create a hashed MAC using the given key",
          args: { name: "key" },
        },
      ],
    },
    {
      name: "enc",
      description: "Symmetric cipher encryption and decryption",
      options: [
        inFile,
        outFile,
        { name: "-e", description: "Encrypt the input data (default)" },
        { name: "-d", description: "Decrypt the input data" },
        {
          name: "-a",
          description: "Base64 encode/decode, depending on encryption flag",
        },
        { name: "-base64", description: "Base64 encode/decode" },
        { name: "-aes-256-cbc", description: "Use AES-256 in CBC mode" },
        { name: "-aes-128-cbc", description: "Use AES-128 in CBC mode" },
        {
          name: "-salt",
          description: "Use a salt in the key derivation routines (default)",
        },
        {
          name: "-nosalt",
          description: "Don't use a salt in the key derivation routines",
        },
        {
          name: "-pbkdf2",
          description: "Use the PBKDF2 key derivation function",
        },
        {
          name: "-iter",
          description:
            "Use a given number of iterations on the password (implies -pbkdf2)",
          args: { name: "count" },
        },
        { name: "-k", description: "Passphrase", args: { name: "val" } },
        {
          name: "-pass",
          description: "Passphrase source",
          args: { name: "val" },
        },
        { name: "-p", description: "Print out the salt, key and IV used" },
      ],
    },
    {
      name: "rand",
      description: "Generate pseudo-random bytes",
      args: { name: "num", description: "Number of bytes to generate" },
      options: [
        outFile,
        {
          name: "-base64",
          description: "Perform base64 encoding on the output",
        },
        { name: "-hex", description: "Show the output as a hex string" },
      ],
    },
    {
      name: "passwd",
      description: "Compute password hashes",
      args: { name: "password", isOptional: true },
      options: [
        {
          name: "-1",
          description: "Use the MD5-based BSD password algorithm 1",
        },
        { name: "-5", description: "Use the SHA-256 based algorithm 5" },
        { name: "-6", description: "Use the SHA-512 based algorithm 6" },
        {
          name: "-apr1",
          description: "Use the apr1 algorithm (Apache variant of BSD MD5)",
        },
        {
          name: "-salt",
          description: "Use the provided salt",
          args: { name: "string" },
        },
        { name: "-stdin", description: "Read passwords from stdin" },
      ],
    },
    {
      name: "pkcs12",
      description: "Create and parse PKCS#12 files",
      options: [
        inFile,
        outFile,
        passin,
        passout,
        {
          name: "-export",
          description: "Create a PKCS#12 file (rather than parsing one)",
        },
        {
          name: "-inkey",
          description: "Private key to include",
          args: { name: "file", template: "filepaths" },
        },
        {
          name: "-certfile",
          description: "Add additional certificates from the given file",
          args: { name: "file", template: "filepaths" },
        },
        {
          name: "-name",
          description: "Friendly name for the certificate and private key",
          args: { name: "name" },
        },
        {
          name: "-nodes",
          description: "Don't encrypt private keys (legacy alias of -noenc)",
        },
        { name: "-noenc", description: "Don't encrypt private keys" },
        { name: "-nocerts", description: "Don't output certificates" },
        { name: "-nokeys", description: "Don't output private keys" },
      ],
    },
    {
      name: "s_client",
      description: "Implements a generic SSL/TLS client to test TLS servers",
      options: [
        {
          name: "-connect",
          description:
            "TCP/IP host:port to connect to (default localhost:4433)",
          args: { name: "host:port" },
        },
        {
          name: "-servername",
          description: "Set the TLS SNI (Server Name Indication) extension",
          args: { name: "name" },
        },
        {
          name: "-showcerts",
          description: "Display the whole server certificate chain",
        },
        {
          name: "-cert",
          description: "Client certificate to use",
          args: { name: "file", template: "filepaths" },
        },
        {
          name: "-key",
          description: "Client private key to use",
          args: { name: "file", template: "filepaths" },
        },
        {
          name: "-CAfile",
          description: "PEM format file of CA certificates",
          args: { name: "file", template: "filepaths" },
        },
        { name: "-tls1_3", description: "Just use TLSv1.3" },
        { name: "-tls1_2", description: "Just use TLSv1.2" },
        {
          name: "-starttls",
          description: "Use the STARTTLS command before starting TLS",
          args: {
            name: "protocol",
            suggestions: [
              "smtp",
              "imap",
              "pop3",
              "ftp",
              "xmpp",
              "ldap",
              "mysql",
              "postgres",
            ],
          },
        },
        { name: "-quiet", description: "No s_client output" },
      ],
    },
    {
      name: "s_server",
      description: "Implements a generic SSL/TLS server for testing",
      options: [
        {
          name: "-accept",
          description: "TCP/IP port to accept on (default 4433)",
          args: { name: "port" },
        },
        {
          name: "-cert",
          description: "Server certificate to use",
          args: { name: "file", template: "filepaths" },
        },
        {
          name: "-key",
          description: "Server private key to use",
          args: { name: "file", template: "filepaths" },
        },
        {
          name: "-www",
          description: "Respond to a 'GET /' request with a status page",
        },
      ],
    },
    {
      name: "verify",
      description: "Verify X.509 certificate chains",
      args: { name: "certificate", isVariadic: true, template: "filepaths" },
      options: [
        {
          name: "-CAfile",
          description: "A file of trusted certificates",
          args: { name: "file", template: "filepaths" },
        },
        {
          name: "-CApath",
          description: "A directory of trusted certificates",
          args: { name: "dir", template: "folders" },
        },
        {
          name: "-untrusted",
          description:
            "A file of untrusted certificates to use for chain building",
          args: { name: "file", template: "filepaths" },
        },
        {
          name: "-verbose",
          description:
            "Print extra information about the operations being performed",
        },
      ],
    },
    {
      name: "base64",
      description: "Base64 encode or decode (alias of enc -base64)",
      options: [
        inFile,
        outFile,
        { name: "-e", description: "Encode the input data (default)" },
        { name: "-d", description: "Decode the input data" },
        { name: "-A", description: "Process the data on a single line" },
      ],
    },
  ],
  options: [
    {
      name: "-help",
      description: "Display a summary of options",
      isPersistent: true,
    },
  ],
};

export default completionSpec;
