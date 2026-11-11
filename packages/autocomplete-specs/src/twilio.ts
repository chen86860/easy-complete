/* eslint-disable @withfig/fig-linter/no-useless-insertvalue */

/** A version of Fig.Subcommand with a predictable name prop */
interface TwilioSubcommand extends Fig.Subcommand {
  name: string;
  // Bad documentation is a bug. Descriptions are required.
  description: string;
  subcommands?: TwilioSubcommand[];
}

/** Recursively flatten subcommands by joining them with a separator */
function flattenSubcommands(
  separator: string,
  parents: TwilioSubcommand[],
  subcommand: TwilioSubcommand,
): TwilioSubcommand[] {
  // If this subcommand has children, flatten it further.
  if (subcommand.subcommands && subcommand.subcommands.length > 0) {
    return subcommand.subcommands.flatMap((child) =>
      flattenSubcommands(separator, parents.concat(subcommand), child),
    );
  }

  // This subcommand has no children - join the name of all of its parent
  // commands with the separator and set that as the new name.
  const name = parents
    .map(({ name }) => name)
    .concat(subcommand.name)
    .join(separator);

  return [{ ...subcommand, name }];
}

/**
 * Flatten the subcommands array as deep as possible to produce every "final"
 * subcommand. These subcommands are hidden. Returns an object with these
 * subcommands, and an optional argument with a generator to help build them.
 *
 * If `generatorShouldInsertSeparator` is true, intermediate suggestions (while
 * building the full subcommand) will have their `insertValue` set to the name
 * and separator.
 */
function createSeparatedSubcommandTree(
  separator: string,
  subcommands: TwilioSubcommand[],
  options: {
    generatorShouldInsertSeparator: boolean;
  },
): { subcommands?: TwilioSubcommand[]; args: Fig.Arg } {
  const flattened = subcommands.flatMap((subcommand) =>
    flattenSubcommands(separator, [], subcommand),
  );

  // The generated options are only used for the option/argument suggestions so
  // we don't have to reimplement the parser. They shouldn't be shown.
  for (const subcommand of flattened) {
    subcommand.hidden = true;
  }

  return {
    subcommands: flattened,
    args: {
      name: "command",
      isOptional: true,
      generators: {
        getQueryTerm: separator,
        trigger: separator,
        custom: async (tokens) => {
          // We don't need the final "part" since that's what's being suggested
          const parts = tokens[tokens.length - 1].split(separator).slice(0, -1);

          let suggest: TwilioSubcommand[] = subcommands;

          // Step through each part of the name, finding the relevant subcommand,
          // and assign its subcommands to the `suggest` array.
          for (const part of parts) {
            const result = suggest.find((child) => child.name === part);
            if (!result?.subcommands) return [];
            suggest = result.subcommands;
          }

          return suggest.map((subcommand) => {
            const suggestion: Fig.Suggestion = { ...subcommand };
            suggestion.type ??= "subcommand";
            suggestion.insertValue =
              options.generatorShouldInsertSeparator && subcommand.subcommands
                ? subcommand.name + separator
                : subcommand.insertValue;
            return suggestion;
          });
        },
      },
    },
  };
}

const logOption: Fig.Option = {
  name: "-l",
  args: {
    name: "level",
    description: "Level of logging messages",
    default: "info",
    suggestions: [
      { name: "debug", icon: "fig://icon?type=string" },
      { name: "info", icon: "fig://icon?type=string" },
      { name: "warn", icon: "fig://icon?type=string" },
      { name: "error", icon: "fig://icon?type=string" },
      { name: "none", icon: "fig://icon?type=string" },
    ],
  },
};

const outputFormatOption: Fig.Option = {
  name: "-o",
  description: "Format of command output",
  args: {
    name: "format",
    default: "columns",
    suggestions: [
      { name: "columns", icon: "fig://icon?type=string" },
      { name: "json", icon: "fig://icon?type=string" },
      { name: "tsv", icon: "fig://icon?type=string" },
      { name: "none", icon: "fig://icon?type=string" },
    ],
  },
};

const silentOption: Fig.Option = {
  name: "--silent",
  description:
    'Suppress output and logs. This is a shorthand for "-l none -o none"',
};

// These options are on subcommands, not on the top level twilio CLI
const persistentOptions = [logOption, outputFormatOption, silentOption];

const configSubcommand: TwilioSubcommand = {
  name: "config",
  description: "Manage Twilio CLI configurations",
  subcommands: [
    {
      name: "list",
      description: "List Twilio CLI configurations",
      options: persistentOptions,
    },
    {
      name: "set",
      description: "Update Twilio CLI configurations",
      options: [
        ...persistentOptions,
        {
          name: ["-e", "--edge"],
          description: "Sets an Edge configuration",
        },
        {
          name: "--require-profile-input",
          exclusiveOn: ["--no-require-profile-input"],
        },
        {
          name: "--no-require-profile-input",
          exclusiveOn: ["--require-profile-input"],
        },
      ],
    },
  ],
};

const debuggerSubcommand: TwilioSubcommand = {
  name: "debugger",
  description: "Show a list of log events for the account",
  subcommands: [
    {
      name: "logs",
      description: "Show a list of log events generated for the account",
      subcommands: [
        {
          name: "list",
          description: "Show a list of log events generated for the account",
        },
      ],
    },
  ],
};

const emailSubcommand: TwilioSubcommand = {
  name: "email",
  description:
    "Send emails to single or multiple recipients using Twilio SendGrid",
  subcommands: [
    {
      name: "send",
      description: "Sends emails to single or multiple recipients",
      options: [
        ...persistentOptions,
        {
          name: "--attachment",
          description: "Path for the file that you want to attach",
          args: {
            name: "attachment",
            template: "filepaths",
          },
        },
        {
          name: "--from",
          description: "Email address of the sender",
          args: {
            name: "from",
          },
        },
        {
          name: "--no-attachment",
          description: "Do not include or prompt for an attachment",
        },
        {
          name: "--subject",
          description: "The subject line for an email",
          args: {
            name: "subject",
          },
        },
        {
          name: "--text",
          description: "Text to send within the email body",
          args: {
            name: "text",
          },
        },
        {
          name: "--to",
          description: "Email address of recipient (comma-separated)",
          args: {
            name: "to",
          },
        },
      ],
    },
    {
      name: "set",
      description: "Sets a default sending email address and subject line",
      options: [
        ...persistentOptions,
        {
          name: "--from",
          description: "Email address of the sender",
          args: {
            name: "from",
          },
        },
        {
          name: "--subject",
          description: "The subject line for an email",
          args: {
            name: "subject",
          },
        },
      ],
    },
  ],
};

const feedbackSubcommand: TwilioSubcommand = {
  name: "feedback",
  description: "Provide feedback to the CLI team",
};

const phoneNumbersBuyOptions: Fig.Option[] = [
  ...persistentOptions,
  {
    name: "--country-code",
    description:
      "The ISO-3166-1 country code of the country from which to read phone numbers",
    isRequired: true,
    args: {
      name: "country-code",
      // https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2
      suggestions: [
        { name: "AD - Andorra", insertValue: "AD", icon: "🗺" },
        { name: "AE - United Arab Emirates", insertValue: "AE", icon: "🗺" },
        { name: "AF - Afghanistan", insertValue: "AF", icon: "🗺" },
        { name: "AG - Antigua and Barbuda", insertValue: "AG", icon: "🗺" },
        { name: "AI - Anguilla", insertValue: "AI", icon: "🗺" },
        { name: "AL - Albania", insertValue: "AL", icon: "🗺" },
        { name: "AM - Armenia", insertValue: "AM", icon: "🗺" },
        { name: "AO - Angola", insertValue: "AO", icon: "🗺" },
        { name: "AQ - Antarctica", insertValue: "AQ", icon: "🗺" },
        { name: "AR - Argentina", insertValue: "AR", icon: "🗺" },
        { name: "AS - American Samoa", insertValue: "AS", icon: "🗺" },
        { name: "AT - Austria", insertValue: "AT", icon: "🗺" },
        { name: "AU - Australia", insertValue: "AU", icon: "🗺" },
        { name: "AW - Aruba", insertValue: "AW", icon: "🗺" },
        { name: "AX - Åland Islands", insertValue: "AX", icon: "🗺" },
        { name: "AZ - Azerbaijan", insertValue: "AZ", icon: "🗺" },
        { name: "BA - Bosnia and Herzegovina", insertValue: "BA", icon: "🗺" },
        { name: "BB - Barbados", insertValue: "BB", icon: "🗺" },
        { name: "BD - Bangladesh", insertValue: "BD", icon: "🗺" },
        { name: "BE - Belgium", insertValue: "BE", icon: "🗺" },
        { name: "BF - Burkina Faso", insertValue: "BF", icon: "🗺" },
        { name: "BG - Bulgaria", insertValue: "BG", icon: "🗺" },
        { name: "BH - Bahrain", insertValue: "BH", icon: "🗺" },
        { name: "BI - Burundi", insertValue: "BI", icon: "🗺" },
        { name: "BJ - Benin", insertValue: "BJ", icon: "🗺" },
        { name: "BL - Saint Barthélemy", insertValue: "BL", icon: "🗺" },
        { name: "BM - Bermuda", insertValue: "BM", icon: "🗺" },
        { name: "BN - Brunei Darussalam", insertValue: "BN", icon: "🗺" },
        {
          name: "BO - Bolivia (Plurinational State of)",
          insertValue: "BO",
          icon: "🗺",
        },
        {
          name: "BQ - Bonaire, Sint Eustatius and Saba",
          insertValue: "BQ",
          icon: "🗺",
        },
        { name: "BR - Brazil", insertValue: "BR", icon: "🗺" },
        { name: "BS - Bahamas", insertValue: "BS", icon: "🗺" },
        { name: "BT - Bhutan", insertValue: "BT", icon: "🗺" },
        { name: "BV - Bouvet Island", insertValue: "BV", icon: "🗺" },
        { name: "BW - Botswana", insertValue: "BW", icon: "🗺" },
        { name: "BY - Belarus", insertValue: "BY", icon: "🗺" },
        { name: "BZ - Belize", insertValue: "BZ", icon: "🗺" },
        { name: "CA - Canada", insertValue: "CA", icon: "🗺" },
        { name: "CC - Cocos (Keeling) Islands", insertValue: "CC", icon: "🗺" },
        {
          name: "CD - Congo, Democratic Republic of the",
          insertValue: "CD",
          icon: "🗺",
        },
        {
          name: "CF - Central African Republic",
          insertValue: "CF",
          icon: "🗺",
        },
        { name: "CG - Congo", insertValue: "CG", icon: "🗺" },
        { name: "CH - Switzerland", insertValue: "CH", icon: "🗺" },
        { name: "CI - Côte d'Ivoire", insertValue: "CI", icon: "🗺" },
        { name: "CK - Cook Islands", insertValue: "CK", icon: "🗺" },
        { name: "CL - Chile", insertValue: "CL", icon: "🗺" },
        { name: "CM - Cameroon", insertValue: "CM", icon: "🗺" },
        { name: "CN - China", insertValue: "CN", icon: "🗺" },
        { name: "CO - Colombia", insertValue: "CO", icon: "🗺" },
        { name: "CR - Costa Rica", insertValue: "CR", icon: "🗺" },
        { name: "CU - Cuba", insertValue: "CU", icon: "🗺" },
        { name: "CV - Cabo Verde", insertValue: "CV", icon: "🗺" },
        { name: "CW - Curaçao", insertValue: "CW", icon: "🗺" },
        { name: "CX - Christmas Island", insertValue: "CX", icon: "🗺" },
        { name: "CY - Cyprus", insertValue: "CY", icon: "🗺" },
        { name: "CZ - Czechia", insertValue: "CZ", icon: "🗺" },
        { name: "DE - Germany", insertValue: "DE", icon: "🗺" },
        { name: "DJ - Djibouti", insertValue: "DJ", icon: "🗺" },
        { name: "DK - Denmark", insertValue: "DK", icon: "🗺" },
        { name: "DM - Dominica", insertValue: "DM", icon: "🗺" },
        { name: "DO - Dominican Republic", insertValue: "DO", icon: "🗺" },
        { name: "DZ - Algeria", insertValue: "DZ", icon: "🗺" },
        { name: "EC - Ecuador", insertValue: "EC", icon: "🗺" },
        { name: "EE - Estonia", insertValue: "EE", icon: "🗺" },
        { name: "EG - Egypt", insertValue: "EG", icon: "🗺" },
        { name: "EH - Western Sahara", insertValue: "EH", icon: "🗺" },
        { name: "ER - Eritrea", insertValue: "ER", icon: "🗺" },
        { name: "ES - Spain", insertValue: "ES", icon: "🗺" },
        { name: "ET - Ethiopia", insertValue: "ET", icon: "🗺" },
        { name: "FI - Finland", insertValue: "FI", icon: "🗺" },
        { name: "FJ - Fiji", insertValue: "FJ", icon: "🗺" },
        {
          name: "FK - Falkland Islands (Malvinas)",
          insertValue: "FK",
          icon: "🗺",
        },
        {
          name: "FM - Micronesia (Federated States of)",
          insertValue: "FM",
          icon: "🗺",
        },
        { name: "FO - Faroe Islands", insertValue: "FO", icon: "🗺" },
        { name: "FR - France", insertValue: "FR", icon: "🗺" },
        { name: "GA - Gabon", insertValue: "GA", icon: "🗺" },
        {
          name: "GB - United Kingdom of Great Britain and Northern Ireland",
          insertValue: "GB",
          icon: "🗺",
        },
        { name: "GD - Grenada", insertValue: "GD", icon: "🗺" },
        { name: "GE - Georgia", insertValue: "GE", icon: "🗺" },
        { name: "GF - French Guiana", insertValue: "GF", icon: "🗺" },
        { name: "GG - Guernsey", insertValue: "GG", icon: "🗺" },
        { name: "GH - Ghana", insertValue: "GH", icon: "🗺" },
        { name: "GI - Gibraltar", insertValue: "GI", icon: "🗺" },
        { name: "GL - Greenland", insertValue: "GL", icon: "🗺" },
        { name: "GM - Gambia", insertValue: "GM", icon: "🗺" },
        { name: "GN - Guinea", insertValue: "GN", icon: "🗺" },
        { name: "GP - Guadeloupe", insertValue: "GP", icon: "🗺" },
        { name: "GQ - Equatorial Guinea", insertValue: "GQ", icon: "🗺" },
        { name: "GR - Greece", insertValue: "GR", icon: "🗺" },
        {
          name: "GS - South Georgia and the South Sandwich Islands",
          insertValue: "GS",
          icon: "🗺",
        },
        { name: "GT - Guatemala", insertValue: "GT", icon: "🗺" },
        { name: "GU - Guam", insertValue: "GU", icon: "🗺" },
        { name: "GW - Guinea-Bissau", insertValue: "GW", icon: "🗺" },
        { name: "GY - Guyana", insertValue: "GY", icon: "🗺" },
        { name: "HK - Hong Kong", insertValue: "HK", icon: "🗺" },
        {
          name: "HM - Heard Island and McDonald Islands",
          insertValue: "HM",
          icon: "🗺",
        },
        { name: "HN - Honduras", insertValue: "HN", icon: "🗺" },
        { name: "HR - Croatia", insertValue: "HR", icon: "🗺" },
        { name: "HT - Haiti", insertValue: "HT", icon: "🗺" },
        { name: "HU - Hungary", insertValue: "HU", icon: "🗺" },
        { name: "ID - Indonesia", insertValue: "ID", icon: "🗺" },
        { name: "IE - Ireland", insertValue: "IE", icon: "🗺" },
        { name: "IL - Israel", insertValue: "IL", icon: "🗺" },
        { name: "IM - Isle of Man", insertValue: "IM", icon: "🗺" },
        { name: "IN - India", insertValue: "IN", icon: "🗺" },
        {
          name: "IO - British Indian Ocean Territory",
          insertValue: "IO",
          icon: "🗺",
        },
        { name: "IQ - Iraq", insertValue: "IQ", icon: "🗺" },
        {
          name: "IR - Iran (Islamic Republic of)",
          insertValue: "IR",
          icon: "🗺",
        },
        { name: "IS - Iceland", insertValue: "IS", icon: "🗺" },
        { name: "IT - Italy", insertValue: "IT", icon: "🗺" },
        { name: "JE - Jersey", insertValue: "JE", icon: "🗺" },
        { name: "JM - Jamaica", insertValue: "JM", icon: "🗺" },
        { name: "JO - Jordan", insertValue: "JO", icon: "🗺" },
        { name: "JP - Japan", insertValue: "JP", icon: "🗺" },
        { name: "KE - Kenya", insertValue: "KE", icon: "🗺" },
        { name: "KG - Kyrgyzstan", insertValue: "KG", icon: "🗺" },
        { name: "KH - Cambodia", insertValue: "KH", icon: "🗺" },
        { name: "KI - Kiribati", insertValue: "KI", icon: "🗺" },
        { name: "KM - Comoros", insertValue: "KM", icon: "🗺" },
        { name: "KN - Saint Kitts and Nevis", insertValue: "KN", icon: "🗺" },
        {
          name: "KP - Korea (Democratic People's Republic of)",
          insertValue: "KP",
          icon: "🗺",
        },
        { name: "KR - Korea, Republic of", insertValue: "KR", icon: "🗺" },
        { name: "KW - Kuwait", insertValue: "KW", icon: "🗺" },
        { name: "KY - Cayman Islands", insertValue: "KY", icon: "🗺" },
        { name: "KZ - Kazakhstan", insertValue: "KZ", icon: "🗺" },
        {
          name: "LA - Lao People's Democratic Republic",
          insertValue: "LA",
          icon: "🗺",
        },
        { name: "LB - Lebanon", insertValue: "LB", icon: "🗺" },
        { name: "LC - Saint Lucia", insertValue: "LC", icon: "🗺" },
        { name: "LI - Liechtenstein", insertValue: "LI", icon: "🗺" },
        { name: "LK - Sri Lanka", insertValue: "LK", icon: "🗺" },
        { name: "LR - Liberia", insertValue: "LR", icon: "🗺" },
        { name: "LS - Lesotho", insertValue: "LS", icon: "🗺" },
        { name: "LT - Lithuania", insertValue: "LT", icon: "🗺" },
        { name: "LU - Luxembourg", insertValue: "LU", icon: "🗺" },
        { name: "LV - Latvia", insertValue: "LV", icon: "🗺" },
        { name: "LY - Libya", insertValue: "LY", icon: "🗺" },
        { name: "MA - Morocco", insertValue: "MA", icon: "🗺" },
        { name: "MC - Monaco", insertValue: "MC", icon: "🗺" },
        { name: "MD - Moldova, Republic of", insertValue: "MD", icon: "🗺" },
        { name: "ME - Montenegro", insertValue: "ME", icon: "🗺" },
        {
          name: "MF - Saint Martin (French part)",
          insertValue: "MF",
          icon: "🗺",
        },
        { name: "MG - Madagascar", insertValue: "MG", icon: "🗺" },
        { name: "MH - Marshall Islands", insertValue: "MH", icon: "🗺" },
        { name: "MK - North Macedonia", insertValue: "MK", icon: "🗺" },
        { name: "ML - Mali", insertValue: "ML", icon: "🗺" },
        { name: "MM - Myanmar", insertValue: "MM", icon: "🗺" },
        { name: "MN - Mongolia", insertValue: "MN", icon: "🗺" },
        { name: "MO - Macao", insertValue: "MO", icon: "🗺" },
        {
          name: "MP - Northern Mariana Islands",
          insertValue: "MP",
          icon: "🗺",
        },
        { name: "MQ - Martinique", insertValue: "MQ", icon: "🗺" },
        { name: "MR - Mauritania", insertValue: "MR", icon: "🗺" },
        { name: "MS - Montserrat", insertValue: "MS", icon: "🗺" },
        { name: "MT - Malta", insertValue: "MT", icon: "🗺" },
        { name: "MU - Mauritius", insertValue: "MU", icon: "🗺" },
        { name: "MV - Maldives", insertValue: "MV", icon: "🗺" },
        { name: "MW - Malawi", insertValue: "MW", icon: "🗺" },
        { name: "MX - Mexico", insertValue: "MX", icon: "🗺" },
        { name: "MY - Malaysia", insertValue: "MY", icon: "🗺" },
        { name: "MZ - Mozambique", insertValue: "MZ", icon: "🗺" },
        { name: "NA - Namibia", insertValue: "NA", icon: "🗺" },
        { name: "NC - New Caledonia", insertValue: "NC", icon: "🗺" },
        { name: "NE - Niger", insertValue: "NE", icon: "🗺" },
        { name: "NF - Norfolk Island", insertValue: "NF", icon: "🗺" },
        { name: "NG - Nigeria", insertValue: "NG", icon: "🗺" },
        { name: "NI - Nicaragua", insertValue: "NI", icon: "🗺" },
        { name: "NL - Netherlands", insertValue: "NL", icon: "🗺" },
        { name: "NO - Norway", insertValue: "NO", icon: "🗺" },
        { name: "NP - Nepal", insertValue: "NP", icon: "🗺" },
        { name: "NR - Nauru", insertValue: "NR", icon: "🗺" },
        { name: "NU - Niue", insertValue: "NU", icon: "🗺" },
        { name: "NZ - New Zealand", insertValue: "NZ", icon: "🗺" },
        { name: "OM - Oman", insertValue: "OM", icon: "🗺" },
        { name: "PA - Panama", insertValue: "PA", icon: "🗺" },
        { name: "PE - Peru", insertValue: "PE", icon: "🗺" },
        { name: "PF - French Polynesia", insertValue: "PF", icon: "🗺" },
        { name: "PG - Papua New Guinea", insertValue: "PG", icon: "🗺" },
        { name: "PH - Philippines", insertValue: "PH", icon: "🗺" },
        { name: "PK - Pakistan", insertValue: "PK", icon: "🗺" },
        { name: "PL - Poland", insertValue: "PL", icon: "🗺" },
        {
          name: "PM - Saint Pierre and Miquelon",
          insertValue: "PM",
          icon: "🗺",
        },
        { name: "PN - Pitcairn", insertValue: "PN", icon: "🗺" },
        { name: "PR - Puerto Rico", insertValue: "PR", icon: "🗺" },
        { name: "PS - Palestine, State of", insertValue: "PS", icon: "🗺" },
        { name: "PT - Portugal", insertValue: "PT", icon: "🗺" },
        { name: "PW - Palau", insertValue: "PW", icon: "🗺" },
        { name: "PY - Paraguay", insertValue: "PY", icon: "🗺" },
        { name: "QA - Qatar", insertValue: "QA", icon: "🗺" },
        { name: "RE - Réunion", insertValue: "RE", icon: "🗺" },
        { name: "RO - Romania", insertValue: "RO", icon: "🗺" },
        { name: "RS - Serbia", insertValue: "RS", icon: "🗺" },
        { name: "RU - Russian Federation", insertValue: "RU", icon: "🗺" },
        { name: "RW - Rwanda", insertValue: "RW", icon: "🗺" },
        { name: "SA - Saudi Arabia", insertValue: "SA", icon: "🗺" },
        { name: "SB - Solomon Islands", insertValue: "SB", icon: "🗺" },
        { name: "SC - Seychelles", insertValue: "SC", icon: "🗺" },
        { name: "SD - Sudan", insertValue: "SD", icon: "🗺" },
        { name: "SE - Sweden", insertValue: "SE", icon: "🗺" },
        { name: "SG - Singapore", insertValue: "SG", icon: "🗺" },
        {
          name: "SH - Saint Helena, Ascension and Tristan da Cunha",
          insertValue: "SH",
          icon: "🗺",
        },
        { name: "SI - Slovenia", insertValue: "SI", icon: "🗺" },
        { name: "SJ - Svalbard and Jan Mayen", insertValue: "SJ", icon: "🗺" },
        { name: "SK - Slovakia", insertValue: "SK", icon: "🗺" },
        { name: "SL - Sierra Leone", insertValue: "SL", icon: "🗺" },
        { name: "SM - San Marino", insertValue: "SM", icon: "🗺" },
        { name: "SN - Senegal", insertValue: "SN", icon: "🗺" },
        { name: "SO - Somalia", insertValue: "SO", icon: "🗺" },
        { name: "SR - Suriname", insertValue: "SR", icon: "🗺" },
        { name: "SS - South Sudan", insertValue: "SS", icon: "🗺" },
        { name: "ST - Sao Tome and Principe", insertValue: "ST", icon: "🗺" },
        { name: "SV - El Salvador", insertValue: "SV", icon: "🗺" },
        {
          name: "SX - Sint Maarten (Dutch part)",
          insertValue: "SX",
          icon: "🗺",
        },
        { name: "SY - Syrian Arab Republic", insertValue: "SY", icon: "🗺" },
        { name: "SZ - Eswatini", insertValue: "SZ", icon: "🗺" },
        {
          name: "TC - Turks and Caicos Islands",
          insertValue: "TC",
          icon: "🗺",
        },
        { name: "TD - Chad", insertValue: "TD", icon: "🗺" },
        {
          name: "TF - French Southern Territories",
          insertValue: "TF",
          icon: "🗺",
        },
        { name: "TG - Togo", insertValue: "TG", icon: "🗺" },
        { name: "TH - Thailand", insertValue: "TH", icon: "🗺" },
        { name: "TJ - Tajikistan", insertValue: "TJ", icon: "🗺" },
        { name: "TK - Tokelau", insertValue: "TK", icon: "🗺" },
        { name: "TL - Timor-Leste", insertValue: "TL", icon: "🗺" },
        { name: "TM - Turkmenistan", insertValue: "TM", icon: "🗺" },
        { name: "TN - Tunisia", insertValue: "TN", icon: "🗺" },
        { name: "TO - Tonga", insertValue: "TO", icon: "🗺" },
        { name: "TR - Turkey", insertValue: "TR", icon: "🗺" },
        { name: "TT - Trinidad and Tobago", insertValue: "TT", icon: "🗺" },
        { name: "TV - Tuvalu", insertValue: "TV", icon: "🗺" },
        {
          name: "TW - Taiwan, Province of China",
          insertValue: "TW",
          icon: "🗺",
        },
        {
          name: "TZ - Tanzania, United Republic of",
          insertValue: "TZ",
          icon: "🗺",
        },
        { name: "UA - Ukraine", insertValue: "UA", icon: "🗺" },
        { name: "UG - Uganda", insertValue: "UG", icon: "🗺" },
        {
          name: "UM - United States Minor Outlying Islands",
          insertValue: "UM",
          icon: "🗺",
        },
        {
          name: "US - United States of America",
          insertValue: "US",
          icon: "🗺",
        },
        { name: "UY - Uruguay", insertValue: "UY", icon: "🗺" },
        { name: "UZ - Uzbekistan", insertValue: "UZ", icon: "🗺" },
        { name: "VA - Holy See", insertValue: "VA", icon: "🗺" },
        {
          name: "VC - Saint Vincent and the Grenadines",
          insertValue: "VC",
          icon: "🗺",
        },
        {
          name: "VE - Venezuela (Bolivarian Republic of)",
          insertValue: "VE",
          icon: "🗺",
        },
        {
          name: "VG - Virgin Islands (British)",
          insertValue: "VG",
          icon: "🗺",
        },
        { name: "VI - Virgin Islands (U.S.)", insertValue: "VI", icon: "🗺" },
        { name: "VN - Viet Nam", insertValue: "VN", icon: "🗺" },
        { name: "VU - Vanuatu", insertValue: "VU", icon: "🗺" },
        { name: "WF - Wallis and Futuna", insertValue: "WF", icon: "🗺" },
        { name: "WS - Samoa", insertValue: "WS", icon: "🗺" },
        { name: "YE - Yemen", insertValue: "YE", icon: "🗺" },
        { name: "YT - Mayotte", insertValue: "YT", icon: "🗺" },
        { name: "ZA - South Africa", insertValue: "ZA", icon: "🗺" },
        { name: "ZM - Zambia", insertValue: "ZM", icon: "🗺" },
      ],
    },
  },
  {
    name: "--account-sid",
    description:
      "The SID of the Account requesting the AvailablePhoneNumber resources",
    args: {
      name: "account-sid",
    },
  },
  {
    name: "--address-sid",
    description:
      "The SID of the Address resource we should associate with the new phone number. Some regions require addresses to meet local regulations",
    args: {
      name: "address-sid",
    },
  },
  {
    name: "--api-version",
    description:
      "The API version to use for incoming calls made to the new phone number. The default is `2010-04-01`",
    args: {
      name: "api-version",
    },
  },
  {
    name: "--area-code",
    description:
      "The area code of the phone numbers to read. Applies to only phone numbers in the US and Canada",
    args: {
      name: "area-code",
    },
  },
  {
    name: "--beta",
    description:
      "Whether to read phone numbers that are new to the Twilio platform. Can be: `true` or `false` and the default is `true`",
    exclusiveOn: ["--no-beta"],
  },
  {
    name: "--no-beta",
    description:
      "Whether to read phone numbers that are new to the Twilio platform. Can be: `true` or `false` and the default is `true`",
    exclusiveOn: ["--beta"],
  },
  {
    name: "--bundle-sid",
    description:
      "The SID of the Bundle resource that you associate with the phone number. Some regions require a Bundle to meet local Regulations",
    args: {
      name: "bundle-sid",
    },
  },
  {
    name: "--contains",
    description:
      "The pattern on which to match phone numbers. Valid characters are `*`, `0-9`, `a-z`, and `A-Z`. The `*` character matches any single digit. For examples, see Example 2 and Example 3. If specified, this value must have at least two characters",
    args: {
      name: "contains",
    },
  },
  {
    name: "--distance",
    description:
      "The search radius, in miles, for a `near_` query.  Can be up to `500` and the default is `25`. Applies to only phone numbers in the US and Canada",
    args: {
      name: "distance",
    },
  },
  {
    name: "--emergency-address-sid",
    description:
      "The SID of the emergency address configuration to use for emergency calling from the new phone number",
    args: {
      name: "emergency-address-sid",
    },
  },
  {
    name: "--emergency-status",
    description:
      "The parameter displays if emergency calling is enabled for this number. Active numbers may place emergency calls by dialing valid emergency numbers for the country",
    args: {
      name: "status",
      suggestions: [
        { name: "active", icon: "fig://icon?type=string" },
        { name: "inactive", icon: "fig://icon?type=string" },
      ],
    },
  },
  {
    name: "--exclude-all-address-required",
    description:
      "Whether to exclude phone numbers that require an Address. Can be: `true` or `false` and the default is `false`",
    exclusiveOn: ["--no-exclude-all-address-required"],
  },
  {
    name: "--no-exclude-all-address-required",
    description:
      "Whether to exclude phone numbers that require an Address. Can be: `true` or `false` and the default is `false`",
    exclusiveOn: ["--exclude-all-address-required"],
  },
  {
    name: "--exclude-foreign-address-required",
    description:
      "Whether to exclude phone numbers that require a foreign Address. Can be: `true` or `false` and the default is `false`",
    exclusiveOn: ["--no-exclude-foreign-address-required"],
  },
  {
    name: "--no-exclude-foreign-address-required",
    description:
      "Whether to exclude phone numbers that require a foreign Address. Can be: `true` or `false` and the default is `false`",
    exclusiveOn: ["--exclude-foreign-address-required"],
  },
  {
    name: "--exclude-local-address-required",
    description:
      "Whether to exclude phone numbers that require a local Address. Can be: `true` or `false` and the default is `false`",
    exclusiveOn: ["--no-exclude-local-address-required"],
  },
  {
    name: "--no-exclude-local-address-required",
    description:
      "Whether to exclude phone numbers that require a local Address. Can be: `true` or `false` and the default is `false`",
    exclusiveOn: ["--exclude-local-address-required"],
  },
  {
    name: "--fax-enabled",
    description:
      "Whether the phone numbers can receive faxes. Can be: `true` or `false`",
    exclusiveOn: ["--no-fax-enabled"],
  },
  {
    name: "--no-fax-enabled",
    description:
      "Whether the phone numbers can receive faxes. Can be: `true` or `false`",
    exclusiveOn: ["--fax-enabled"],
  },
  {
    name: "--friendly-name",
    description:
      "A descriptive string that you created to describe the new phone number. It can be up to 64 characters long. By default, this is a formatted version of the new phone number",
    args: {
      name: "friendly-name",
    },
  },
  {
    name: "--identity-sid",
    description:
      "The SID of the Identity resource that we should associate with the new phone number. Some regions require an identity to meet local regulations",
    args: {
      name: "identity-sid",
    },
  },
  {
    name: "--in-lata",
    description:
      "Limit results to a specific local access and transport area (LATA). Given a phone number, search within the same LATA as that number. Applies to only phone numbers in the US and Canada",
    args: {
      name: "in-lata",
    },
  },
  {
    name: "--in-locality",
    description:
      "Limit results to a particular locality or city. Given a phone number, search within the same Locality as that number",
    args: {
      name: "in-locality",
    },
  },
  {
    name: "--in-postal-code",
    description:
      "Limit results to a particular postal code. Given a phone number, search within the same postal code as that number. Applies to only phone numbers in the US and Canada",
    args: {
      name: "in-postal-code",
    },
  },
  {
    name: "--in-rate-center",
    description:
      "Limit results to a specific rate center, or given a phone number search within the same rate center as that number. Requires `in_lata` to be set as well. Applies to only phone numbers in the US and Canada",
    args: {
      name: "in-rate-center",
    },
  },
  {
    name: "--in-region",
    description:
      "Limit results to a particular region, state, or province. Given a phone number, search within the same region as that number. Applies to only phone numbers in the US and Canada",
    args: {
      name: "in-region",
    },
  },
  {
    name: "--limit",
    description:
      "The maximum number of resources to return. Use '--no-limit' to disable",
    args: {
      default: "50",
      name: "limit",
    },
  },
  {
    name: "--mms-enabled",
    description:
      "Whether the phone numbers can receive MMS messages. Can be: `true` or `false`",
    exclusiveOn: ["--no-mms-enabled"],
  },
  {
    name: "--no-mms-enabled",
    description:
      "Whether the phone numbers can receive MMS messages. Can be: `true` or `false`",
    exclusiveOn: ["--mms-enabled"],
  },
  {
    name: "--near-lat-long",
    description:
      "Given a latitude/longitude pair `lat,long` find geographically close numbers within `distance` miles. Applies to only phone numbers in the US and Canada",
    args: {
      name: "near-lat-long",
    },
  },
  {
    name: "--near-number",
    description:
      "Given a phone number, find a geographically close number within `distance` miles. Distance defaults to 25 miles. Applies to only phone numbers in the US and Canada",
    args: {
      name: "near-number",
    },
  },
  {
    name: "--no-header",
    description: "Skip including of headers while listing the data",
  },
  {
    name: "--page-size",
    description:
      "How many resources to return in each list page. The default is 50, and the maximum is 1000",
    args: {
      name: "page-size",
    },
  },
  {
    name: "--properties",
    description:
      "The properties you would like to display (JSON output always shows all properties)",
    args: {
      default: "phoneNumber, region, isoCountry, addressRequirements",
      name: "properties",
    },
  },
  {
    name: "--sms-application-sid",
    description:
      "The SID of the application that should handle SMS messages sent to the new phone number. If an `sms_application_sid` is present, we ignore all of the `sms_*_url` urls and use those set on the application",
    args: {
      name: "sms-application-sid",
    },
  },
  {
    name: "--sms-enabled",
    description:
      "Whether the phone numbers can receive text messages. Can be: `true` or `false`",
    exclusiveOn: ["--no-sms-enabled"],
  },
  {
    name: "--no-sms-enabled",
    description:
      "Whether the phone numbers can receive text messages. Can be: `true` or `false`",
    exclusiveOn: ["--sms-enabled"],
  },
  {
    name: "--sms-fallback-method",
    description:
      "The HTTP method that we should use to call `sms_fallback_url`. Can be: `GET` or `POST` and defaults to `POST`",
    args: {
      name: "method",
      suggestions: [
        { name: "head", icon: "fig://icon?type=string" },
        { name: "get", icon: "fig://icon?type=string" },
        { name: "post", icon: "fig://icon?type=string" },
        { name: "patch", icon: "fig://icon?type=string" },
        { name: "put", icon: "fig://icon?type=string" },
        { name: "delete", icon: "fig://icon?type=string" },
      ],
    },
  },
  {
    name: "--sms-fallback-url",
    description:
      "The URL that we should call when an error occurs while requesting or executing the TwiML defined by `sms_url`",
    args: {
      name: "sms-fallback-url",
    },
  },
  {
    name: "--sms-method",
    description:
      "The HTTP method that we should use to call `sms_url`. Can be: `GET` or `POST` and defaults to `POST`",
    args: {
      name: "method",
      suggestions: [
        { name: "head", icon: "fig://icon?type=string" },
        { name: "get", icon: "fig://icon?type=string" },
        { name: "post", icon: "fig://icon?type=string" },
        { name: "patch", icon: "fig://icon?type=string" },
        { name: "put", icon: "fig://icon?type=string" },
        { name: "delete", icon: "fig://icon?type=string" },
      ],
    },
  },
  {
    name: "--sms-url",
    description:
      "The URL we should call when the new phone number receives an incoming SMS message",
    args: {
      name: "sms-url",
    },
  },
  {
    name: "--status-callback",
    description:
      "The URL we should call using the `status_callback_method` to send status information to your application",
    args: {
      name: "status-callback",
    },
  },
  {
    name: "--status-callback-method",
    description:
      "The HTTP method we should use to call `status_callback`. Can be: `GET` or `POST` and defaults to `POST`",
    args: {
      name: "method",
      suggestions: [
        { name: "head", icon: "fig://icon?type=string" },
        { name: "get", icon: "fig://icon?type=string" },
        { name: "post", icon: "fig://icon?type=string" },
        { name: "patch", icon: "fig://icon?type=string" },
        { name: "put", icon: "fig://icon?type=string" },
        { name: "delete", icon: "fig://icon?type=string" },
      ],
    },
  },
  {
    name: "--trunk-sid",
    description:
      "The SID of the Trunk we should use to handle calls to the new phone number. If a `trunk_sid` is present, we ignore all of the voice urls and voice applications and use only those set on the Trunk. Setting a `trunk_sid` will automatically delete your `voice_application_sid` and vice versa",
    args: {
      name: "trunk-sid",
    },
  },
  {
    name: "--voice-application-sid",
    description:
      "The SID of the application we should use to handle calls to the new phone number. If a `voice_application_sid` is present, we ignore all of the voice urls and use only those set on the application. Setting a `voice_application_sid` will automatically delete your `trunk_sid` and vice versa",
    args: {
      name: "voice-application-sid",
    },
  },
  {
    name: "--voice-caller-id-lookup",
    description:
      "Whether to lookup the caller's name from the CNAM database and post it to your app. Can be: `true` or `false` and defaults to `false`",
    exclusiveOn: ["--no-voice-caller-id-lookup"],
  },
  {
    name: "--no-voice-caller-id-lookup",
    description:
      "Whether to lookup the caller's name from the CNAM database and post it to your app. Can be: `true` or `false` and defaults to `false`",
    exclusiveOn: ["--voice-caller-id-lookup"],
  },
  {
    name: "--voice-enabled",
    description:
      "Whether the phone numbers can receive calls. Can be: `true` or `false`",
    exclusiveOn: ["--no-voice-enabled"],
  },
  {
    name: "--no-voice-enabled",
    description:
      "Whether the phone numbers can receive calls. Can be: `true` or `false`",
    exclusiveOn: ["--voice-enabled"],
  },
  {
    name: "--voice-fallback-method",
    description:
      "The HTTP method that we should use to call `voice_fallback_url`. Can be: `GET` or `POST` and defaults to `POST`",
    args: {
      name: "method",
      suggestions: [
        { name: "head", icon: "fig://icon?type=string" },
        { name: "get", icon: "fig://icon?type=string" },
        { name: "post", icon: "fig://icon?type=string" },
        { name: "patch", icon: "fig://icon?type=string" },
        { name: "put", icon: "fig://icon?type=string" },
        { name: "delete", icon: "fig://icon?type=string" },
      ],
    },
  },
  {
    name: "--voice-fallback-url",
    description:
      "The URL that we should call when an error occurs retrieving or executing the TwiML requested by `url`",
    args: {
      name: "voice-fallback-url",
    },
  },
  {
    name: "--voice-method",
    description:
      "The HTTP method that we should use to call `voice_url`. Can be: `GET` or `POST` and defaults to `POST`",
    args: {
      name: "method",
      suggestions: [
        { name: "head", icon: "fig://icon?type=string" },
        { name: "get", icon: "fig://icon?type=string" },
        { name: "post", icon: "fig://icon?type=string" },
        { name: "patch", icon: "fig://icon?type=string" },
        { name: "put", icon: "fig://icon?type=string" },
        { name: "delete", icon: "fig://icon?type=string" },
      ],
    },
  },
  {
    name: "--voice-receive-mode",
    description:
      "The configuration parameter for the new phone number to receive incoming voice calls or faxes. Can be: `fax` or `voice` and defaults to `voice`",
    args: {
      name: "mode",
      suggestions: [
        { name: "voice", icon: "fig://icon?type=string" },
        { name: "fax", icon: "fig://icon?type=string" },
      ],
    },
  },
  {
    name: "--voice-url",
    description:
      "The URL that we should call to answer a call to the new phone number. The `voice_url` will not be called if a `voice_application_sid` or a `trunk_sid` is set",
    args: {
      name: "voice-url",
    },
  },
];

const phoneNumbersSubcommand: TwilioSubcommand = {
  name: "phone-numbers",
  description: "Manage Twilio phone numbers",
  subcommands: [
    {
      name: "buy",
      description: "Purchase Twilio phone numbers",
      subcommands: [
        {
          name: "local",
          description: "Purchase a local phone number",
          options: phoneNumbersBuyOptions,
        },
        {
          name: "machine-to-machine",
          description: "Purchase a machine-to-machine phone number",
          options: phoneNumbersBuyOptions,
        },
        {
          name: "mobile",
          description: "Purchase a mobile phone number",
          options: phoneNumbersBuyOptions,
        },
        {
          name: "national",
          description: "Purchase a national phone number",
          options: phoneNumbersBuyOptions,
        },
        {
          name: "shared-cost",
          description: "Purchase a shared-cost phone number",
          options: phoneNumbersBuyOptions,
        },
        {
          name: "toll-free",
          description: "Purchase a toll-free phone number",
          options: phoneNumbersBuyOptions,
        },
        {
          name: "voip",
          description: "Purchase a voip phone number",
          options: phoneNumbersBuyOptions,
        },
      ],
    },
    {
      name: "list",
      description: "Show what Twilio phone numbers you have configured",
      options: [
        ...persistentOptions,
        {
          name: "--account-sid",
          description: "Access resources for the specified account",
          args: {
            name: "account-sid",
          },
        },
        {
          name: "--no-header",
          description: "Skip including of headers while listing the data",
        },
        {
          name: "--properties",
          args: {
            name: "properties",
            default: "sid, phoneNumber, friendlyName",
          },
          description:
            "The incomingPhoneNumber object properties you would like to display (JSON output always shows all properties)",
        },
      ],
    },
    {
      name: "update",
      description: "Update the properties of a Twilio phone number",
      args: {
        name: "phone-number",
        description:
          "The SID or E.164 formatted phone number you wish to update",
      },
      options: [
        ...persistentOptions,
        {
          name: "--account-sid",
          args: { name: "account-sid" },
          description: "Access resources for the specified account",
        },
        {
          name: "--friendly-name",
          args: { name: "friendly-name" },
          description:
            "A human readable descriptive text for this resource, up to 64 characters long",
        },
        {
          name: "--sms-fallback-method",
          args: {
            name: "method",
            suggestions: [
              { name: "GET", icon: "fig://icon?type=string" },
              { name: "POST", icon: "fig://icon?type=string" },
            ],
          },
          description:
            "The HTTP method that should be used to request the SmsFallbackUrl",
        },
        {
          name: "--sms-fallback-url",
          args: { name: "sms-fallback-url" },
          description:
            "A URL that Twilio will request if an error occurs requesting or executing the TwiML defined by SmsUrl",
        },
        {
          name: "--sms-method",
          args: {
            name: "method",
            suggestions: [
              { name: "GET", icon: "fig://icon?type=string" },
              { name: "POST", icon: "fig://icon?type=string" },
            ],
          },
          description:
            "The HTTP method Twilio will use when making requests to the SmsUrl",
        },
        {
          name: "--sms-url",
          args: { name: "sms-url" },
          description:
            "The URL that Twilio should request when somebody sends an SMS to the new phone number",
        },
        {
          name: "--voice-fallback-method",
          args: {
            name: "method",
            suggestions: [
              { name: "GET", icon: "fig://icon?type=string" },
              { name: "POST", icon: "fig://icon?type=string" },
            ],
          },
          description:
            "The HTTP method Twilio will use when requesting the VoiceFallbackUrl",
        },
        {
          name: "--voice-fallback-url",
          args: { name: "voice-fallback-url" },
          description:
            "A URL that Twilio will request if an error occurs requesting or executing the TwiML defined by VoiceUrl",
        },
        {
          name: "--voice-method",
          args: {
            name: "method",
            suggestions: [
              { name: "GET", icon: "fig://icon?type=string" },
              { name: "POST", icon: "fig://icon?type=string" },
            ],
          },
          description:
            "The HTTP method Twilio will use when making requests to the VoiceUrl",
        },
        {
          name: "--voice-url",
          args: { name: "voice-url" },
          description:
            "The URL that Twilio should request when somebody dials the phone number",
        },
      ],
    },
  ],
};

const pluginsSubcommand: TwilioSubcommand = {
  name: "plugins",
  description: "List available plugins for installation",
  subcommands: [
    {
      name: "available",
      description: "List available plugins for installation",
    },
    {
      name: "inspect",
      description: "Displays installation properties of a plugin",
      args: {
        name: "plugin",
        description: "Plugin to inspect",
      },
      options: [
        {
          name: ["-v", "--verbose"],
        },
      ],
    },
    {
      // TODO: This has an alias ("add"), not supported at the moment
      name: "install",
      description: "Installs a plugin into the CLI",
      args: {
        name: "plugin",
        description: "Plugin to install",
      },
      options: [
        {
          name: ["-f", "--force"],
          description: "`yarn install` with force flag",
        },
        {
          name: ["-v", "--verbose"],
        },
      ],
    },
    {
      name: "link",
      description: "Links a plugin into the CLI for development",
      args: {
        name: "path",
        template: "filepaths",
      },
      options: [
        {
          name: ["-v", "--verbose"],
        },
      ],
    },
    {
      // TODO: aliases (unlink, remove)
      name: "uninstall",
      description: "Removes a plugin from the CLI",
      args: {
        name: "plugin",
      },
      options: [
        {
          name: ["-v", "--verbose"],
        },
      ],
    },
    {
      name: "update",
      description: "Update installed plugins",
      options: [
        {
          name: ["-v", "--verbose"],
        },
      ],
    },
  ],
};

const loginSubcommand: (name: string) => TwilioSubcommand = (name) => ({
  name,
  description:
    "Create a new profile to store Twilio Account credentials and configuration",
  options: [
    ...persistentOptions,
    {
      name: ["-f", "--force"],
      description: "Force overwriting existing profile credentials",
    },
    {
      name: ["-p", "--profile"],
      description: "Shorthand identifier for your profile",
      args: {
        name: "profile",
      },
    },
    {
      name: "--auth-token",
      description:
        "Your Twilio Auth Token for your Twilio Account or Subaccount",
      args: {
        name: "auth-token",
      },
    },
    {
      name: "--region",
      description: "Twilio region to use",
      args: {
        name: "region",
      },
    },
  ],
});

const profilesSubcommand: TwilioSubcommand = {
  name: "profiles",
  description: "Manage credentials for Twilio profiles",
  subcommands: [
    loginSubcommand("add"),
    loginSubcommand("create"),
    {
      name: "list",
      description: "Show what profiles you have configured",
      options: [
        ...persistentOptions,
        {
          name: "--no-header",
          description: "Skip including of headers while listing the data",
        },
      ],
    },
    {
      name: "port",
      description:
        "Port API keys from keytar to config file. This command ports ALL keys by default, although to only port a specific key append the profile-id as additional argument",
      args: {
        name: "profile",
      },
      options: persistentOptions,
    },
    {
      name: "remove",
      description: "Select which profile to remove",
      args: {
        name: "profile",
      },
      options: persistentOptions,
    },
    {
      name: "use",
      description: "Select which profile to use",
      args: {
        name: "profile",
      },
      options: persistentOptions,
    },
  ],
};

const updateSubcommand: TwilioSubcommand = {
  name: "update",
  description: "Update the twilio CLI",
  args: {
    name: "channel",
    isOptional: true,
  },
  options: [
    {
      name: "--from-local",
      description: "Interactively choose an already installed version",
    },
  ],
};

const autocompleteSubcommand: TwilioSubcommand = {
  name: "autocomplete",
  description: "Display autocomplete installation instructions",
  args: {
    name: "shell",
    description: "Shell type",
    suggestions: [
      { name: "bash", icon: "fig://icon?type=string" },
      { name: "zsh", icon: "fig://icon?type=string" },
    ],
  },
  options: [
    {
      name: ["-r", "--refresh-cache"],
      description: "Refresh cache (ignores displaying instructions)",
    },
  ],
};

const subcommands: TwilioSubcommand[] = [
  // apiSubcommand,
  autocompleteSubcommand,
  configSubcommand,
  debuggerSubcommand,
  emailSubcommand,
  feedbackSubcommand,
  loginSubcommand("login"),
  phoneNumbersSubcommand,
  pluginsSubcommand,
  profilesSubcommand,
  updateSubcommand,
];

const completionSpec: Fig.Spec = {
  name: "twilio",
  description: "Manage your Twilio resources from your terminal",
  options: [
    {
      name: ["-h", "--help"],
      description: "Show a help message",
      isPersistent: true,
    },
  ],
  ...createSeparatedSubcommandTree(":", subcommands, {
    generatorShouldInsertSeparator: true,
  }),
};

completionSpec.subcommands.push(
  {
    name: "help",
    args: createSeparatedSubcommandTree(":", subcommands, {
      generatorShouldInsertSeparator: false,
    }).args,
  },
  {
    name: "plugins",
    description: "List installed plugins",
    hidden: true,
    options: [
      {
        name: "--core",
        description: "List core plugins",
      },
    ],
  },
);

export default completionSpec;
