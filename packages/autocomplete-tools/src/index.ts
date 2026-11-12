import { Command } from "commander";
import dev from "./scripts/dev";
import createSpec from "./scripts/create-spec";
import compile from "./scripts/compile";

const program = new Command();

program
  .name("autocomplete-tools")
  .description("Build and develop Easy Complete's completion specs")
  .version("2.11.0");
program.addCommand(createSpec);
program.addCommand(compile);
program.addCommand(dev);

export { program };
