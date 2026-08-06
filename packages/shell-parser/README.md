# @easy-complete/shell-parser

Tokenizer for shell command lines.

Splits the edit buffer the way a shell would — honouring quoting, escapes,
variables and command separators — and hands the resulting tokens to
[`@easy-complete/autocomplete-parser`](../autocomplete-parser), which resolves
them against a completion spec.
