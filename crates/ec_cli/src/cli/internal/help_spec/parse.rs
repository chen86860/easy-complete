//! Turns a command's `--help` output into a Fig spec.
//!
//! The parser knows no particular framework. It reads the section headers (`Options:`,
//! `Commands:`, `GENERAL COMMANDS`…) and, under them, one entry per line: an option is a line
//! starting with `-`, a subcommand a name followed by its description. This covers the output of
//! clap, cobra, click, argparse, commander, yargs and Go's `flag` package.

use std::collections::HashSet;

use serde::Serialize;

#[derive(Debug, Default, Serialize, PartialEq, Eq)]
pub struct Spec {
    pub name: String,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    pub subcommands: Vec<Subcommand>,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    pub options: Vec<Opt>,
}

#[derive(Debug, Serialize, PartialEq, Eq)]
pub struct Subcommand {
    pub name: Vec<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
}

#[derive(Debug, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct Opt {
    pub name: Vec<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub args: Option<Arg>,
    #[serde(skip_serializing_if = "std::ops::Not::not")]
    pub is_repeatable: bool,
}

#[derive(Debug, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct Arg {
    pub name: String,
    #[serde(skip_serializing_if = "std::ops::Not::not")]
    pub is_optional: bool,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    pub suggestions: Vec<String>,
}

impl Spec {
    pub fn is_empty(&self) -> bool {
        self.subcommands.is_empty() && self.options.is_empty()
    }
}

#[derive(Clone, Copy, PartialEq, Eq)]
enum Section {
    /// Text before the first header, or under one we don't know: options only.
    Other,
    Usage,
    Commands,
    /// argparse's `positional arguments:`, where its subcommands are listed as `{a,b,c}`.
    Positional,
    /// Examples, help topics, environment…: nothing to read.
    Skip,
}

/// The entry that a following, more indented line may continue.
enum Last {
    None,
    Opt {
        index: usize,
        indent: usize,
    },
    Subcommand {
        index: usize,
        indent: usize,
    },
    /// A line that isn't a new entry, or repeats one: the lines under it are dropped too.
    Dropped {
        indent: usize,
    },
}

/// Parses `text`, the `--help` output of `words` (`["gh", "pr"]`).
pub fn parse(words: &[&str], text: &str) -> Spec {
    let name = words.last().copied().unwrap_or_default().to_owned();
    let mut spec = Spec {
        name,
        ..Default::default()
    };
    let mut section = Section::Other;
    let mut last = Last::None;
    // Option names seen, so a flag listed twice (global and local) is kept once.
    let mut seen_options = HashSet::new();
    let mut seen_subcommands = HashSet::new();
    // argparse: the names listed in `{a,b,c}`, described on the lines below.
    let mut braced: Vec<String> = Vec::new();
    // Headers follow a blank line; `type: boolean` under an entry is text.
    let mut after_blank = true;
    // The usage names a command (`usage: fastboot [OPTION...] COMMAND...`), so sections under
    // headers we don't know (`flashing:`, `basics:`) list commands.
    let mut takes_command = false;

    for raw in text.lines() {
        let line = strip_ansi(raw);
        let line = line.trim_end();
        let trimmed = line.trim_start();
        if trimmed.is_empty() {
            last = Last::None;
            after_blank = true;
            // atuin: `Usage: atuin <COMMAND>`, a blank line, then its first commands with no
            // header of their own.
            if section == Section::Usage && takes_command {
                section = Section::Commands;
            }
            continue;
        }
        let indent = indent_width(line);
        let first_after_blank = std::mem::replace(&mut after_blank, false);
        if (section == Section::Usage || trimmed.to_lowercase().starts_with("usage")) && names_command(trimmed) {
            takes_command = true;
        }

        if indent == 0
            && first_after_blank
            && let Some((header, inline)) = header(trimmed)
        {
            section = classify(&header, inline, takes_command);
            last = Last::None;
            braced.clear();
            continue;
        }

        match section {
            Section::Skip => continue,
            Section::Usage if indent == 0 || !trimmed.starts_with('-') => continue,
            _ => {},
        }

        if trimmed.starts_with('-')
            && let Some(opt) = parse_option(trimmed)
        {
            if opt.name.iter().all(|name| seen_options.insert(name.clone())) {
                spec.options.push(opt);
                last = Last::Opt {
                    index: spec.options.len() - 1,
                    indent,
                };
            } else {
                last = Last::None;
            }
            continue;
        }

        // A more indented line continues the entry above it; so does any line right below an
        // entry at column 0 (tsc).
        let continues = |entry: usize| indent > entry || (entry == 0 && indent == 0);
        match last {
            Last::Opt { index, indent: entry } if continues(entry) => {
                append_description(&mut spec.options[index].description, trimmed);
                continue;
            },
            Last::Subcommand { index, indent: entry } if continues(entry) && braced.is_empty() => {
                append_description(&mut spec.subcommands[index].description, trimmed);
                continue;
            },
            Last::Dropped { indent: entry } if continues(entry) => continue,
            _ => {},
        }

        match section {
            Section::Commands | Section::Positional => {
                if section == Section::Positional {
                    if let Some(names) = braced_names(trimmed) {
                        for name in &names {
                            if seen_subcommands.insert(name.clone()) {
                                spec.subcommands.push(Subcommand {
                                    name: vec![name.clone()],
                                    description: None,
                                });
                            }
                        }
                        braced = names;
                        continue;
                    }
                    let (head, desc) = split_description(trimmed);
                    if braced.iter().any(|name| name == head)
                        && let Some(sub) = spec.subcommands.iter_mut().find(|sub| sub.name[0] == head)
                    {
                        sub.description = desc.map(str::to_owned);
                    }
                    continue;
                }
                if let Some(sub) = parse_subcommand(words, trimmed)
                    && sub.name.iter().all(|name| seen_subcommands.insert(name.clone()))
                {
                    spec.subcommands.push(sub);
                    last = Last::Subcommand {
                        index: spec.subcommands.len() - 1,
                        indent,
                    };
                } else if indent > 0 {
                    // A command listed again, or a form we can't read (fastboot's
                    // `flash vendor_boot:RAMDISK`): its description isn't the entry above's.
                    last = Last::Dropped { indent };
                } else {
                    // Text at column 0, such as a header with no blank line above it.
                    last = Last::None;
                }
            },
            _ => {},
        }
    }

    for opt in &mut spec.options {
        if let Some(mut desc) = opt.description.take() {
            apply_annotations(&mut desc, opt);
            opt.description = clean_description(&desc);
        }
    }
    for sub in &mut spec.subcommands {
        if let Some(mut desc) = sub.description.take() {
            take_aliases(&mut desc, &mut sub.name);
            sub.description = clean_description(&desc);
        }
    }
    spec
}

/// A section header: a line at column 0 such as `Options:`, `Usage: x [OPTIONS]` or
/// `CORE COMMANDS`. Returns its name, and whether text follows it on the same line.
fn header(line: &str) -> Option<(String, bool)> {
    if line.starts_with(['-', '[', '{', '<', '$']) {
        return None;
    }
    if let Some((name, rest)) = line.split_once(':') {
        let name = name.trim();
        let words = name.split_whitespace().count();
        // kubectl: `Basic Commands (Beginner):`, fastboot: `locking/unlocking:`, atuin:
        // `Sync & account:`
        if (1..=5).contains(&words) && name.chars().all(|c| c.is_alphanumeric() || " -_()/&".contains(c)) {
            return Some((name.to_lowercase(), !rest.trim().is_empty()));
        }
        return None;
    }
    // `CORE COMMANDS`, `FLAGS`: all capitals, a few words.
    let words = line.split_whitespace().count();
    if (1..=4).contains(&words)
        && line.chars().any(|c| c.is_alphabetic())
        && line.chars().all(|c| c.is_uppercase() || c == ' ' || c == '-')
    {
        return Some((line.to_lowercase(), false));
    }
    // Go's flag package: `Usage of tool:` is matched above; anything else is text.
    None
}

/// A usage line with a command placeholder: `COMMAND...`, `<COMMAND>`, `<command>`, `[COMMAND]`.
/// Not prose such as ripgrep's `command | rg [OPTIONS] PATTERN`.
fn names_command(usage: &str) -> bool {
    usage.split_whitespace().any(|word| {
        let bare = word.trim_end_matches("...");
        bare.starts_with("COMMAND")
            || ["<", "["].iter().any(|open| {
                bare.to_lowercase()
                    .strip_prefix(open)
                    .is_some_and(|rest| rest.starts_with("command"))
            })
    })
}

fn classify(header: &str, inline: bool, takes_command: bool) -> Section {
    if header.contains("example") || header.contains("topic") || header.contains("environment") {
        return Section::Skip;
    }
    if header.starts_with("usage") {
        // `Usage: x [OPTIONS]` has its usage on the line; Go's `Usage of x:` lists the flags below.
        return if inline || header == "usage" {
            Section::Usage
        } else {
            Section::Other
        };
    }
    // `Commands:`, `Available Commands:`, `CORE COMMANDS`, `Subcommands:`. A singular `Command:`
    // (mise watch) or `COMMAND LINE FLAGS` (tsc) names a group of options.
    if header.contains("commands") || header.contains("subcommand") {
        return Section::Commands;
    }
    if header.contains("positional") {
        return Section::Positional;
    }
    if header.contains("option") || header.contains("flag") {
        return Section::Other;
    }
    if header.contains("argument") {
        return Section::Positional;
    }
    if takes_command {
        return Section::Commands;
    }
    // mise watch's `Filtering:`, `Output:`: groups of options.
    Section::Other
}

fn indent_width(line: &str) -> usize {
    let mut width = 0;
    for c in line.chars() {
        match c {
            ' ' => width += 1,
            '\t' => width += 8 - width % 8,
            _ => break,
        }
    }
    width
}

/// Splits `-v, --verbose   Use verbose output` at the first gap of two spaces or a tab.
fn split_description(line: &str) -> (&str, Option<&str>) {
    let bytes = line.as_bytes();
    let mut depth = 0i32;
    for i in 0..bytes.len() {
        match bytes[i] {
            b'<' | b'[' | b'{' | b'(' => depth += 1,
            b'>' | b']' | b'}' | b')' => depth -= 1,
            b'\t' if depth <= 0 => return (line[..i].trim_end(), Some(line[i..].trim())),
            b' ' if depth <= 0 && bytes.get(i + 1) == Some(&b' ') => {
                return (line[..i].trim_end(), Some(line[i..].trim()));
            },
            _ => {},
        }
    }
    (line, None)
}

/// Splits the names part on commas and spaces, keeping `<a b>`, `[=x]` and `{a,b}` whole.
fn tokens(part: &str) -> Vec<&str> {
    let mut out = Vec::new();
    let mut depth = 0i32;
    let mut start = None;
    for (i, c) in part.char_indices() {
        match c {
            '<' | '[' | '{' | '(' => depth += 1,
            '>' | ']' | '}' | ')' => depth -= 1,
            _ => {},
        }
        if depth <= 0 && (c == ',' || c.is_whitespace()) {
            if let Some(s) = start.take() {
                out.push(&part[s..i]);
            }
        } else if start.is_none() {
            start = Some(i);
        }
    }
    if let Some(s) = start {
        out.push(&part[s..]);
    }
    out
}

fn is_option_name(name: &str) -> bool {
    let body = name.trim_start_matches('-');
    let dashes = name.len() - body.len();
    (1..=2).contains(&dashes)
        && !body.is_empty()
        && body.len() <= 60
        && body.starts_with(|c: char| c.is_ascii_alphanumeric() || c == '?' || c == '#' || c == '@')
        && body
            .chars()
            .all(|c| c.is_ascii_alphanumeric() || "-_.:+?#@".contains(c))
}

fn parse_option(line: &str) -> Option<Opt> {
    let (names_part, desc) = split_description(line);
    // kubectl: `-o, --output='':`
    let names_part = names_part.strip_suffix(':').unwrap_or(names_part);

    let mut names: Vec<String> = Vec::new();
    let mut arg: Option<Arg> = None;
    let mut is_repeatable = false;

    for token in tokens(names_part) {
        if token.starts_with('-') && token.len() > 1 {
            // `--[no-]color`
            if let Some(rest) = token.strip_prefix("--[no-]") {
                let rest = rest.split(['=', '[', '<']).next().unwrap_or(rest);
                for name in [format!("--{rest}"), format!("--no-{rest}")] {
                    if is_option_name(&name) {
                        names.push(name);
                    }
                }
                continue;
            }
            let (mut name, value) = match token.find(['=', '[', '<']) {
                Some(i) => (&token[..i], Some(&token[i..])),
                None => (token, None),
            };
            if let Some(stripped) = name.strip_suffix("...") {
                name = stripped;
                is_repeatable = true;
            }
            if !is_option_name(name) {
                return None;
            }
            if let Some(value) = value
                && arg.is_none()
            {
                arg = value_arg(name, value);
            }
            names.push(name.to_owned());
        } else if names.is_empty() {
            return None;
        } else if !matches!(token, "/" | "|" | "...") && arg.is_none() {
            arg = Some(placeholder_arg(token));
        }
    }

    if names.is_empty() {
        return None;
    }
    Some(Opt {
        name: names,
        description: desc.map(str::to_owned),
        args: arg,
        is_repeatable,
    })
}

/// The value written after an option's name: `=FILE`, `[=WHEN]`, `<FILE>`, kubectl's `=''`.
fn value_arg(name: &str, value: &str) -> Option<Arg> {
    let optional = value.starts_with('[');
    let inner = value
        .trim_start_matches(['[', '='])
        .trim_end_matches(']')
        .trim_start_matches('=');
    // `--help[=true|false]`, kubectl's `--watch=false`: a flag.
    if matches!(inner, "true" | "false" | "true|false") {
        return None;
    }
    let mut arg = placeholder_arg(inner);
    if inner.is_empty() || inner.starts_with(['\'', '"']) || inner == "[]" || inner.parse::<f64>().is_ok() {
        // kubectl prints the default, not a name.
        arg.name = name.trim_start_matches('-').to_owned();
        arg.suggestions.clear();
    }
    arg.is_optional |= optional;
    Some(arg)
}

fn placeholder_arg(token: &str) -> Arg {
    let is_optional = token.starts_with('[') && token.ends_with(']');
    let inner = token.trim_matches(['[', ']', '<', '>']).trim_end_matches("...");
    if let Some(choices) = inner.strip_prefix('{').and_then(|s| s.strip_suffix('}')) {
        let suggestions: Vec<String> = choices.split(',').map(|s| s.trim().to_owned()).collect();
        return Arg {
            name: choices.to_owned(),
            is_optional,
            suggestions,
        };
    }
    // gh: `[HOST/]OWNER/REPO`
    let name = inner.replace(['[', ']', '<', '>'], "").to_lowercase();
    Arg {
        name,
        is_optional,
        suggestions: Vec::new(),
    }
}

/// Reads and removes the bracketed notes frameworks append to a description: clap's
/// `[possible values: a, b]`, yargs' `[string] [choices: "a", "b"]`, commander's
/// `(choices: "a", "b")`, and the `[default: …]` / `[env: …]` that carry nothing to complete.
fn apply_annotations(desc: &mut String, opt: &mut Opt) {
    let mut choices: Option<Vec<String>> = None;
    let mut takes_value = false;
    let mut out = String::with_capacity(desc.len());
    let mut rest = desc.as_str();

    while let Some(start) = rest.find(['[', '(']) {
        let close = if rest.as_bytes()[start] == b'[' { ']' } else { ')' };
        let Some(len) = rest[start..].find(close) else { break };
        let inner = &rest[start + 1..start + len];
        let (key, value) = inner.split_once(':').map_or((inner, ""), |(k, v)| (k.trim(), v.trim()));
        let known = match key {
            "possible values" | "choices" => {
                choices = Some(
                    value
                        .split(',')
                        .map(|s| s.trim().trim_matches('"').to_owned())
                        .filter(|s| !s.is_empty())
                        .collect(),
                );
                true
            },
            "string" | "number" | "array" => {
                takes_value = true;
                true
            },
            "boolean" | "count" | "required" | "default" | "env" | "aliases" | "alias" => true,
            _ => false,
        };
        let end = start + len + 1;
        if known {
            out.push_str(&rest[..start]);
        } else {
            out.push_str(&rest[..end]);
        }
        rest = &rest[end..];
    }
    out.push_str(rest);
    *desc = out;

    let name = opt
        .name
        .last()
        .map(|n| n.trim_start_matches('-').to_owned())
        .unwrap_or_default();
    if let Some(choices) = choices {
        let arg = opt.args.get_or_insert_with(|| Arg {
            name,
            is_optional: false,
            suggestions: Vec::new(),
        });
        if arg.suggestions.is_empty() {
            arg.suggestions = choices;
        }
    } else if takes_value && opt.args.is_none() {
        opt.args = Some(Arg {
            name,
            is_optional: false,
            suggestions: Vec::new(),
        });
    }
}

/// Adds a wrapped line to a description.
fn append_description(desc: &mut Option<String>, more: &str) {
    match desc {
        Some(desc) => {
            desc.push(' ');
            desc.push_str(more);
        },
        None => *desc = Some(more.to_owned()),
    }
}

fn clean_description(desc: &str) -> Option<String> {
    let desc = desc.split_whitespace().collect::<Vec<_>>().join(" ");
    let desc = desc.trim_end_matches(':').trim();
    (!desc.is_empty()).then(|| desc.to_owned())
}

fn is_subcommand_name(name: &str) -> bool {
    !name.is_empty()
        && name.len() <= 40
        && name.starts_with(|c: char| c.is_ascii_alphanumeric())
        && name.chars().all(|c| c.is_ascii_alphanumeric() || "-_.:+".contains(c))
}

fn parse_subcommand(words: &[&str], line: &str) -> Option<Subcommand> {
    let (names_part, desc) = match split_description(line) {
        (names, Some(desc)) => (names, Some(desc)),
        // gh: `update-branch: Update a pull request branch`
        (_, None) => match line.split_once(": ").filter(|(names, _)| !names.contains(' ')) {
            Some((names, desc)) => (names, Some(desc)),
            None => return parse_usage_entry(words, line),
        },
    };
    // gh: `auth:          Authenticate gh`
    let names_part = names_part.strip_suffix(':').unwrap_or(names_part);

    let mut tokens = tokens(names_part);
    // yargs: `deploy push [target]` names the program first.
    let mut skip = 0;
    while skip < words.len() && tokens.len() > skip + 1 && tokens[skip] == words[skip] {
        skip += 1;
    }
    if skip == 0
        && let Some(last) = words.last()
        && tokens.len() > 1
        && tokens[0] == *last
    {
        skip = 1;
    }
    tokens.drain(..skip);

    let mut names: Vec<String> = Vec::new();
    for (i, token) in tokens.iter().enumerate() {
        // commander: `serve|s [options] <dir>`
        let parts: Vec<&str> = token.split('|').collect();
        if parts.iter().all(|p| is_subcommand_name(p)) && (i == 0 || names_part.contains(',')) {
            names.extend(parts.iter().map(|p| (*p).to_owned()));
        } else if i == 0 {
            return None;
        } else {
            break;
        }
    }
    if names.is_empty() {
        return None;
    }

    Some(Subcommand {
        name: names,
        description: desc.map(str::to_owned),
    })
}

/// fastboot: `flash PARTITION [FILENAME] Flash given partition…`, or `boot KERNEL [RAMDISK]`
/// with its description on the lines below: the command, its placeholders, then the text,
/// with no wide gap between them.
fn parse_usage_entry(words: &[&str], line: &str) -> Option<Subcommand> {
    let mut rest = line;
    let name = tokens(line).first().copied()?;
    // tsc: `tsc` alone, an example of running the command itself.
    if !is_subcommand_name(name) || name.chars().any(|c| c.is_uppercase()) || words.last() == Some(&name) {
        return None;
    }
    rest = rest[name.len()..].trim_start();
    let mut placeholders = 0;
    while let Some(token) = tokens(rest).first().copied()
        && is_placeholder(token)
    {
        placeholders += 1;
        rest = rest[token.len()..].trim_start();
    }
    if placeholders == 0 && !rest.is_empty() {
        return None;
    }
    Some(Subcommand {
        name: vec![name.to_owned()],
        description: (!rest.is_empty()).then(|| rest.to_owned()),
    })
}

/// `PARTITION`, `[FILENAME]`, `<file>`, `{a,b}`.
fn is_placeholder(token: &str) -> bool {
    token.starts_with(['[', '<', '{'])
        || (token.chars().any(|c| c.is_ascii_uppercase())
            && token
                .chars()
                .all(|c| c.is_ascii_uppercase() || c.is_ascii_digit() || "_|:.-".contains(c)))
}

/// clap: `build  Compile the project [aliases: b, bld]`
fn take_aliases(desc: &mut String, names: &mut Vec<String>) {
    let Some(start) = desc.find("[aliases: ").or_else(|| desc.find("[alias: ")) else {
        return;
    };
    let Some(len) = desc[start..].find(']') else { return };
    let inner = &desc[start + 1..start + len];
    if let Some((_, aliases)) = inner.split_once(':') {
        for alias in aliases.split(',').map(str::trim) {
            if is_subcommand_name(alias) && !names.iter().any(|n| n == alias) {
                names.push(alias.to_owned());
            }
        }
    }
    desc.replace_range(start..start + len + 1, "");
}

/// argparse lists its subcommands as `{start,stop,status}`.
fn braced_names(line: &str) -> Option<Vec<String>> {
    let (head, _) = split_description(line);
    let inner = head.strip_prefix('{')?.strip_suffix('}')?;
    let names: Vec<String> = inner.split(',').map(|s| s.trim().to_owned()).collect();
    names.iter().all(|n| is_subcommand_name(n)).then_some(names)
}

fn strip_ansi(line: &str) -> String {
    let mut out = String::with_capacity(line.len());
    let mut chars = line.chars().peekable();
    while let Some(c) = chars.next() {
        if c == '\u{1b}' {
            if chars.peek() == Some(&'[') {
                chars.next();
                for c in chars.by_ref() {
                    if ('@'..='~').contains(&c) {
                        break;
                    }
                }
            } else {
                chars.next();
            }
            continue;
        }
        // Backspace overstrike (`N\bNA\bAM\bME`), as man pages print bold.
        if c == '\u{8}' {
            out.pop();
            continue;
        }
        out.push(c);
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    fn fixture(name: &str) -> String {
        let path = format!(
            "{}/src/cli/internal/help_spec/fixtures/{name}.txt",
            env!("CARGO_MANIFEST_DIR")
        );
        std::fs::read_to_string(path).unwrap()
    }

    fn sub<'a>(spec: &'a Spec, name: &str) -> &'a Subcommand {
        let found = spec.subcommands.iter().find(|s| s.name.iter().any(|n| n == name));
        found.unwrap_or_else(|| panic!("no subcommand {name}: {:#?}", spec.subcommands))
    }

    fn opt<'a>(spec: &'a Spec, name: &str) -> &'a Opt {
        let found = spec.options.iter().find(|o| o.name.iter().any(|n| n == name));
        found.unwrap_or_else(|| panic!("no option {name}: {:#?}", spec.options))
    }

    fn sub_names(spec: &Spec) -> Vec<&str> {
        spec.subcommands.iter().map(|s| s.name[0].as_str()).collect()
    }

    fn desc(description: &Option<String>) -> &str {
        description.as_deref().unwrap_or_default()
    }

    fn arg(opt: &Opt) -> (&str, bool, Vec<&str>) {
        let arg = opt
            .args
            .as_ref()
            .unwrap_or_else(|| panic!("{:?} takes no value", opt.name));
        (
            arg.name.as_str(),
            arg.is_optional,
            arg.suggestions.iter().map(String::as_str).collect(),
        )
    }

    #[test]
    fn clap() {
        let spec = parse(&["rustup"], &fixture("clap-rustup"));
        assert_eq!(sub_names(&spec).len(), 16);
        assert_eq!(
            desc(&sub(&spec, "toolchain").description),
            "Install, uninstall, or list toolchains"
        );
        assert_eq!(opt(&spec, "-v").name, ["-v", "--verbose"]);
        assert!(opt(&spec, "--verbose").args.is_none());
        // `[+toolchain]` under `Arguments:` is not a subcommand.
        assert!(
            !sub_names(&spec)
                .iter()
                .any(|n| n.contains("toolchain") && *n != "toolchain")
        );

        let spec = parse(&["uv"], &fixture("clap-uv"));
        assert_eq!(
            arg(opt(&spec, "--color")),
            ("color_choice", false, vec!["auto", "always", "never"])
        );
        assert_eq!(
            desc(&opt(&spec, "--color").description),
            "Control the use of color in output"
        );
        assert!(opt(&spec, "--quiet").is_repeatable);
        // `[env: …]` is dropped, even wrapped onto the next line.
        assert_eq!(desc(&opt(&spec, "--offline").description), "Disable network access");
        assert_eq!(
            desc(&opt(&spec, "--no-python-downloads").description),
            "Disable automatic downloads of Python."
        );
        assert_eq!(arg(opt(&spec, "--cache-dir")).0, "cache_dir");

        // Long help: the description on the lines below.
        let spec = parse(&["dust"], &fixture("clap-dust"));
        assert!(spec.subcommands.is_empty());
        assert_eq!(arg(opt(&spec, "-d")).0, "depth");
        assert_eq!(desc(&opt(&spec, "--depth").description), "Depth to show");
    }

    #[test]
    fn cobra() {
        let spec = parse(&["gh"], &fixture("cobra-gh"));
        assert!(sub_names(&spec).contains(&"auth"));
        assert!(sub_names(&spec).contains(&"variable"));
        // `HELP TOPICS` aren't commands.
        assert!(!sub_names(&spec).contains(&"accessibility"));
        assert!(opt(&spec, "--help").args.is_none());

        let spec = parse(&["gh", "pr"], &fixture("cobra-gh-pr"));
        assert_eq!(
            desc(&sub(&spec, "update-branch").description),
            "Update a pull request branch"
        );
        assert_eq!(arg(opt(&spec, "--repo")).0, "host/owner/repo");
        // `- by number, …` under ARGUMENTS and `$ gh pr …` under EXAMPLES are text.
        assert_eq!(spec.options.len(), 2);

        let spec = parse(&["kubectl", "get"], &fixture("cobra-kubectl-get"));
        assert!(opt(&spec, "--watch").args.is_none());
        assert_eq!(arg(opt(&spec, "--output")).0, "output");
        assert_eq!(arg(opt(&spec, "--filename")).0, "filename");
        assert!(desc(&opt(&spec, "-o").description).starts_with("Output format."));
    }

    #[test]
    fn argparse() {
        let spec = parse(&["venv"], &fixture("argparse-venv"));
        assert!(spec.subcommands.is_empty());
        assert_eq!(arg(opt(&spec, "--prompt")).0, "prompt");
        assert_eq!(
            desc(&opt(&spec, "--system-site-packages").description),
            "Give the virtual environment access to the system site-packages dir."
        );

        let spec = parse(&["tool"], &fixture("argparse-subparsers"));
        assert_eq!(sub_names(&spec), ["start", "stop", "status"]);
        assert_eq!(desc(&sub(&spec, "stop").description), "Stop the service");
        assert_eq!(opt(&spec, "--config").name, ["--config", "-c"]);
        assert_eq!(arg(opt(&spec, "--format")).2, ["json", "text"]);
    }

    #[test]
    fn click() {
        let spec = parse(&["flask"], &fixture("click-flask"));
        assert_eq!(sub_names(&spec), ["routes", "run", "shell"]);
        assert_eq!(opt(&spec, "--debug").name, ["--debug", "--no-debug"]);
        assert!(opt(&spec, "--debug").args.is_none());
        assert_eq!(arg(opt(&spec, "--app")).0, "import");
    }

    #[test]
    fn commander() {
        let spec = parse(&["app"], &fixture("commander-app"));
        assert_eq!(sub(&spec, "serve").name, ["serve", "s"]);
        assert_eq!(desc(&sub(&spec, "build").description), "build for production");
        assert_eq!(desc(&opt(&spec, "--port").description), "port number");
        assert_eq!(
            arg(opt(&spec, "--log-level")),
            ("level", true, vec!["debug", "info", "warn"])
        );
    }

    #[test]
    fn yargs() {
        let spec = parse(&["deploy"], &fixture("yargs-deploy"));
        assert_eq!(sub_names(&spec), ["push", "rollback"]);
        assert!(opt(&spec, "--verbose").args.is_none());
        assert_eq!(desc(&opt(&spec, "--verbose").description), "Print each step");
        assert_eq!(arg(opt(&spec, "--env")), ("env", false, vec!["staging", "production"]));
    }

    #[test]
    fn commands_under_own_headers() {
        let spec = parse(&["fastboot"], &fixture("custom-fastboot"));
        let names = sub_names(&spec);
        for name in [
            "update",
            "flash",
            "devices",
            "reboot",
            "flashing",
            "boot",
            "flash:raw",
            "fetch",
        ] {
            assert!(names.contains(&name), "{name} missing from {names:?}");
        }
        assert_eq!(names.iter().filter(|n| **n == "flash").count(), 1);
        assert!(!names.contains(&"ramdisk."), "{names:?}");
        assert_eq!(
            desc(&sub(&spec, "flash").description),
            "Flash given partition, using the image from $ANDROID_PRODUCT_OUT if no filename is given."
        );
        assert_eq!(
            desc(&sub(&spec, "boot").description),
            "Download and boot kernel from RAM."
        );
        assert_eq!(
            desc(&sub(&spec, "flashing").description),
            "Lock/unlock partitions for flashing"
        );
        assert!(opt(&spec, "--skip-reboot").description.is_some());
    }

    #[test]
    fn groups_without_a_commands_header() {
        let spec = parse(&["atuin"], &fixture("clap-atuin"));
        let names = sub_names(&spec);
        // Right below the usage, under no header.
        for name in ["search", "history", "stats"] {
            assert!(names.contains(&name), "{name} missing from {names:?}");
        }
        // Under `Sync & account:  Keep your history in sync across machines`.
        for name in ["sync", "login", "account"] {
            assert!(names.contains(&name), "{name} missing from {names:?}");
        }
        assert!(!names.contains(&"Sync"), "{names:?}");
        assert_eq!(desc(&sub(&spec, "sync").description), "Sync with the configured server");
        assert_eq!(names.len(), 33, "{names:?}");
    }

    #[test]
    fn usage_prose_is_no_command() {
        // `command | rg [OPTIONS] PATTERN` pipes into rg; rg has no subcommands.
        let spec = parse(&["rg"], &fixture("custom-rg"));
        assert!(spec.subcommands.is_empty(), "{:?}", sub_names(&spec));
        assert!(names_command("Usage: atuin <COMMAND>"));
        assert!(names_command("usage: fastboot [OPTION...] COMMAND..."));
        assert!(names_command("Usage: tool [command]"));
        assert!(!names_command("    command | rg [OPTIONS] PATTERN"));
    }

    #[test]
    fn option_group_named_command() {
        // mise watch groups its options under `Command:`; their long descriptions aren't commands.
        let spec = parse(&["mise", "watch"], &fixture("clap-mise-watch"));
        assert!(spec.subcommands.is_empty(), "{:?}", sub_names(&spec));
        assert!(opt(&spec, "--shell").description.is_some());
    }

    #[test]
    fn go_flag() {
        let spec = parse(&["gotool"], &fixture("goflag-tool"));
        assert_eq!(arg(opt(&spec, "-addr")).0, "string");
        assert_eq!(
            desc(&opt(&spec, "-addr").description),
            "listen address (default \":8080\")"
        );
        assert!(opt(&spec, "-v").args.is_none());
        assert_eq!(desc(&opt(&spec, "-v").description), "verbose output");
    }

    #[test]
    fn description_below_at_column_zero() {
        let spec = parse(&["tsc"], &fixture("custom-tsc"));
        assert_eq!(desc(&opt(&spec, "--watch").description), "Watch input files.");
        // `type: boolean` right under an entry isn't a section header.
        assert!(spec.options.len() > 20);
    }

    #[test]
    fn options_forms() {
        let o = parse_option("--color[=WHEN]  colorize").unwrap();
        assert_eq!(arg(&o), ("when", true, vec![]));
        let o = parse_option("-o, --output=FILE").unwrap();
        assert_eq!(o.name, ["-o", "--output"]);
        assert_eq!(arg(&o).0, "file");
        let o = parse_option("--[no-]verify  Check").unwrap();
        assert_eq!(o.name, ["--verify", "--no-verify"]);
        assert!(parse_option("- a bullet").is_none());
        assert!(parse_option("--- a rule").is_none());
        assert!(parse_option("-->").is_none());
    }

    #[test]
    fn colors_and_overstrike() {
        let text = "\u{1b}[1mOptions:\u{1b}[0m\n  \u{1b}[32m-v\u{1b}[0m  Verbose\n\nC\u{8}Co\u{8}om\u{8}mm\u{8}ma\u{8}an\u{8}nd\u{8}ds\u{8}s:\n  run  Run it\n";
        let spec = parse(&["x"], text);
        assert_eq!(opt(&spec, "-v").name, ["-v"]);
        assert_eq!(sub_names(&spec), ["run"]);
    }

    #[test]
    fn not_help() {
        assert!(parse(&["x"], "error: unexpected argument '--help' found\n").is_empty());
        assert!(parse(&["x"], "").is_empty());
    }
}
