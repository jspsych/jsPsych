/**
 * Generates documentation for jsPsych plugins from JSDoc comments and examples.
 *
 * This script parses plugin source files to extract:
 * - Plugin description from the class JSDoc comment
 * - Parameter information from the `info.parameters` object with JSDoc comments
 * - Data information from the `info.data` object with JSDoc comments
 * - Examples from the examples folder
 *
 * It generates markdown documentation matching the format of existing plugin docs.
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "../..");

// Map ParameterType enum values to human-readable type names
const parameterTypeMap = {
  BOOL: "boolean",
  STRING: "string",
  INT: "numeric",
  FLOAT: "numeric",
  FUNCTION: "function",
  KEY: "string",
  KEYS: "array of strings",
  SELECT: "string",
  HTML_STRING: "HTML string",
  IMAGE: "string",
  AUDIO: "string",
  VIDEO: "string",
  OBJECT: "object",
  COMPLEX: "object",
  TIMELINE: "object",
};

/**
 * Find the matching closing brace for content starting after an opening brace
 */
function findMatchingBrace(content, startIndex) {
  let braceCount = 1;
  let i = startIndex;

  while (i < content.length && braceCount > 0) {
    if (content[i] === "{") braceCount++;
    if (content[i] === "}") braceCount--;
    i++;
  }

  return i - 1;
}

/**
 * Parses parameters or data section from the info object
 */
function parseParametersSection(content, sectionName) {
  const params = [];

  // Find the info object first - look for "const info = <const>{"
  const infoStart = content.indexOf("const info = <const>{");
  if (infoStart === -1) {
    return params;
  }

  // Find the end of the info object (look for "type Info = typeof info")
  const infoEnd = content.indexOf("type Info = typeof info");
  if (infoEnd === -1) {
    return params;
  }

  const infoContent = content.substring(infoStart, infoEnd);

  // Find the section (parameters or data) within the info object
  const sectionPattern = new RegExp(`\\b${sectionName}\\s*:\\s*\\{`);
  const sectionMatch = infoContent.match(sectionPattern);
  if (!sectionMatch) {
    return params;
  }

  const sectionStartIndex = sectionMatch.index + sectionMatch[0].length;
  const sectionEndIndex = findMatchingBrace(infoContent, sectionStartIndex);
  const sectionContent = infoContent.substring(sectionStartIndex, sectionEndIndex);

  // Parse parameters by finding JSDoc comments followed by property names
  // Pattern: /** comment */ propertyName: { ... }
  let pos = 0;

  while (pos < sectionContent.length) {
    // Find the next JSDoc comment
    const commentStartIdx = sectionContent.indexOf("/**", pos);
    if (commentStartIdx === -1) break;

    const commentEndIdx = sectionContent.indexOf("*/", commentStartIdx);
    if (commentEndIdx === -1) break;

    // Extract and clean the comment text
    const rawComment = sectionContent.substring(commentStartIdx + 3, commentEndIdx);
    const commentText = rawComment
      .split("\n")
      .map((line) => line.replace(/^\s*\*\s?/, ""))
      .join(" ")
      .trim();

    // Look for the property name immediately after the comment
    const afterComment = sectionContent.substring(commentEndIdx + 2);
    const propertyNameMatch = afterComment.match(/^\s*(\w+)\s*:\s*\{/);

    if (propertyNameMatch) {
      const propertyName = propertyNameMatch[1];

      // Find the property definition block
      const propStartIndex = commentEndIdx + 2 + propertyNameMatch[0].length;
      const propEndIndex = findMatchingBrace(sectionContent, propStartIndex);
      const propertyDef = sectionContent.substring(propStartIndex, propEndIndex);

      // Extract type
      const typeMatch = propertyDef.match(/type\s*:\s*ParameterType\.(\w+)/);
      const typeEnum = typeMatch ? typeMatch[1] : null;
      const type = typeEnum ? parameterTypeMap[typeEnum] || typeEnum.toLowerCase() : "any";

      // Check if it's an array
      const isArray = /\barray\s*:\s*true/.test(propertyDef);

      // Extract default value
      let defaultValue = "*undefined*";
      // Match default: followed by value, handling functions, strings, numbers, etc.
      const defaultMatch = propertyDef.match(/\bdefault\s*:\s*([\s\S]*?)(?:,\s*(?:\w+\s*:|$)|$)/);

      if (defaultMatch) {
        let defaultStr = defaultMatch[1].trim();
        // Remove trailing comma if present
        defaultStr = defaultStr.replace(/,\s*$/, "").trim();

        if (defaultStr === "undefined") {
          defaultValue = "*undefined*";
        } else if (defaultStr === "null") {
          defaultValue = "null";
        } else if (defaultStr === "true" || defaultStr === "false") {
          defaultValue = defaultStr;
        } else if (/^-?\d+(\.\d+)?$/.test(defaultStr)) {
          defaultValue = defaultStr;
        } else if (defaultStr.startsWith('"') && defaultStr.endsWith('"')) {
          defaultValue = `'${defaultStr.slice(1, -1)}'`;
        } else if (defaultStr.startsWith("'") && defaultStr.endsWith("'")) {
          defaultValue = defaultStr;
        } else if (defaultStr.startsWith("[") && defaultStr.endsWith("]")) {
          defaultValue = "[]";
        } else if (defaultStr.startsWith("function") || defaultStr.includes("=>")) {
          defaultValue = "See description";
        } else if (defaultStr.startsWith("`")) {
          defaultValue = "See description";
        } else if (defaultStr === "{}" || defaultStr.startsWith("{")) {
          defaultValue = "{}";
        } else {
          // For complex defaults, simplify
          defaultValue = "See description";
        }
      }

      const displayType = isArray ? `array of ${type}s` : type;

      params.push({
        name: propertyName,
        type: displayType,
        default: defaultValue,
        description: commentText,
      });

      // Move position past this property definition
      pos = propEndIndex + 1;
    } else {
      pos = commentEndIdx + 2;
    }
  }

  return params;
}

/**
 * Extracts the plugin class JSDoc comment (description)
 */
function extractPluginDescription(content) {
  // Find the class definition - look for "class XxxPlugin implements JsPsychPlugin"
  const classDefMatch = content.match(/class\s+(\w+Plugin)\s+implements\s+JsPsychPlugin/);

  if (!classDefMatch) {
    return null;
  }

  const classDefIndex = classDefMatch.index;

  // Now search backwards from the class definition to find the JSDoc comment
  // The JSDoc comment should be immediately before the class definition (with only whitespace between)
  const contentBeforeClass = content.substring(0, classDefIndex);

  // Find the JSDoc comment that ends just before the class (with only whitespace between)
  // We need to find a pattern like: */ whitespace class
  // So we search from the end of contentBeforeClass backwards
  const lastCommentEndIndex = contentBeforeClass.lastIndexOf("*/");

  if (lastCommentEndIndex === -1) {
    return null;
  }

  // Check that there's only whitespace between */ and class
  const betweenCommentAndClass = contentBeforeClass.substring(lastCommentEndIndex + 2);
  if (!/^\s*$/.test(betweenCommentAndClass)) {
    return null;
  }

  // Find the start of this JSDoc comment
  const lastCommentStartIndex = contentBeforeClass.lastIndexOf("/**", lastCommentEndIndex);

  if (lastCommentStartIndex === -1) {
    return null;
  }

  // Extract the comment content
  const commentContent = contentBeforeClass.substring(lastCommentStartIndex + 3, lastCommentEndIndex);

  let description = commentContent
    .split("\n")
    .map((line) => line.replace(/^\s*\*\s?/, ""))
    .join(" ")
    .replace(/@author\s+[\w\s]+/g, "")
    .replace(/@see\s+\{@link[^}]+\}[^\n]*/g, "")
    .replace(/@see\s+[^\n]+/g, "")
    .trim();

  // Clean up multiple spaces
  description = description.replace(/\s+/g, " ").trim();

  return description;
}

/**
 * Extracts plugin name and version from the info object
 */
function extractPluginInfo(content) {
  const nameMatch = content.match(/name\s*:\s*["']([^"']+)["']/);
  const name = nameMatch ? nameMatch[1] : null;

  return { name };
}

/**
 * Gets package version from package.json
 */
function getPackageVersion(packagePath) {
  const packageJsonPath = join(packagePath, "package.json");
  if (existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
    return packageJson.version;
  }
  return null;
}

/**
 * Finds examples for a plugin
 */
function findExamples(pluginName, rootDir) {
  const examples = [];

  // Check root examples folder
  const rootExamplesDir = join(rootDir, "examples");
  const rootExampleFile = join(rootExamplesDir, `jspsych-${pluginName}.html`);

  if (existsSync(rootExampleFile)) {
    examples.push({
      path: rootExampleFile,
      type: "root",
      content: readFileSync(rootExampleFile, "utf8"),
    });
  }

  // Check package-specific examples folder
  const packageExamplesDir = join(rootDir, "packages", `plugin-${pluginName}`, "examples");
  if (existsSync(packageExamplesDir)) {
    const packageExamples = readdirSync(packageExamplesDir).filter((f) => f.endsWith(".html"));
    for (const exampleFile of packageExamples) {
      examples.push({
        path: join(packageExamplesDir, exampleFile),
        type: "package",
        name: exampleFile,
        content: readFileSync(join(packageExamplesDir, exampleFile), "utf8"),
      });
    }
  }

  return examples;
}

/**
 * Extracts JavaScript code from an example HTML file
 */
function extractExampleCode(htmlContent) {
  // Find script tags that contain jsPsych code (not src imports)
  const scriptMatch = htmlContent.match(/<script[^>]*>(?![\s\S]*src=)([\s\S]*?)<\/script>/gi);

  if (scriptMatch) {
    // Get the last script tag (usually contains the experiment code)
    for (let i = scriptMatch.length - 1; i >= 0; i--) {
      const script = scriptMatch[i];
      const codeMatch = script.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
      if (codeMatch && codeMatch[1].trim()) {
        let code = codeMatch[1].trim();
        // Clean up the code - remove initJsPsych and run calls if they're boilerplate
        return code;
      }
    }
  }

  return null;
}

/**
 * Generates the parameters table markdown
 */
function generateParametersTable(params) {
  if (params.length === 0) {
    return "This plugin has no parameters.\n";
  }

  let table =
    "In addition to the [parameters available in all plugins](../overview/plugins.md#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.\n\n";

  table += "Parameter | Type | Default Value | Description\n";
  table += "----------|------|---------------|------------\n";

  for (const param of params) {
    // Escape pipe characters in description
    const description = param.description.replace(/\|/g, "\\|").replace(/\n/g, " ");
    table += `${param.name} | ${param.type} | ${param.default} | ${description}\n`;
  }

  return table;
}

/**
 * Generates the data table markdown
 */
function generateDataTable(data) {
  if (data.length === 0) {
    return "This plugin does not collect any additional data beyond the [default data collected by all plugins](../overview/plugins.md#data-collected-by-all-plugins).\n";
  }

  let table =
    "In addition to the [default data collected by all plugins](../overview/plugins.md#data-collected-by-all-plugins), this plugin collects the following data for each trial.\n\n";

  table += "Name | Type | Value\n";
  table += "-----|------|------\n";

  for (const item of data) {
    // Escape pipe characters in description
    const description = item.description.replace(/\|/g, "\\|").replace(/\n/g, " ");
    table += `${item.name} | ${item.type} | ${description}\n`;
  }

  return table;
}

/**
 * Generates install section markdown
 */
function generateInstallSection(pluginName, version) {
  const packageName = `@jspsych/plugin-${pluginName}`;
  const camelCaseName = pluginName
    .split("-")
    .map((part, index) => (index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)))
    .join("");

  return `## Install

Using the CDN-hosted JavaScript file:

\`\`\`js
<script src="https://unpkg.com/${packageName}@${version}"></script>
\`\`\`

Using the JavaScript file downloaded from a GitHub release dist archive:

\`\`\`js
<script src="jspsych/plugin-${pluginName}.js"></script>
\`\`\`

Using NPM:

\`\`\`
npm install ${packageName}
\`\`\`
\`\`\`js
import ${camelCaseName} from '${packageName}';
\`\`\`
`;
}

/**
 * Main function to generate documentation for a single plugin
 */
function generatePluginDoc(pluginName) {
  const packagePath = join(rootDir, "packages", `plugin-${pluginName}`);
  const srcPath = join(packagePath, "src", "index.ts");

  if (!existsSync(srcPath)) {
    console.error(`Source file not found: ${srcPath}`);
    return null;
  }

  const content = readFileSync(srcPath, "utf8");

  const pluginInfo = extractPluginInfo(content);
  const version = getPackageVersion(packagePath);
  const description = extractPluginDescription(content);
  const parameters = parseParametersSection(content, "parameters");
  const data = parseParametersSection(content, "data");
  const examples = findExamples(pluginName, rootDir);

  // Generate markdown
  let markdown = `# ${pluginName}

Current version: ${version || "current-plugin-version"}. [See version history](https://github.com/jspsych/jsPsych/blob/main/packages/plugin-${pluginName}/CHANGELOG.md).

${description || "No description available."}

## Parameters

${generateParametersTable(parameters)}

## Data Generated

${generateDataTable(data)}

${generateInstallSection(pluginName, version || "latest")}
`;

  // Add examples section if examples exist
  if (examples.length > 0) {
    markdown += `\n## Examples\n\n`;
    markdown += `See example file${examples.length > 1 ? "s" : ""} in the [examples folder](https://github.com/jspsych/jsPsych/tree/main/examples) for usage demonstrations.\n`;
  }

  return {
    markdown,
    pluginName,
    version,
    parameters,
    data,
    description,
    examplesCount: examples.length,
  };
}

/**
 * Gets all plugin names from the packages directory
 */
function getAllPluginNames() {
  const packagesDir = join(rootDir, "packages");
  const packages = readdirSync(packagesDir);

  return packages
    .filter((p) => p.startsWith("plugin-"))
    .map((p) => p.replace("plugin-", ""));
}

/**
 * Main entry point
 */
function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
Usage: node generatePluginDocs.js [options] [plugin-name...]

Options:
  --help, -h     Show this help message
  --all          Generate docs for all plugins
  --output, -o   Output directory (default: stdout)
  --list         List all available plugins

Examples:
  node generatePluginDocs.js html-button-response
  node generatePluginDocs.js --all --output docs/plugins
  node generatePluginDocs.js --list
`);
    return;
  }

  if (args.includes("--list")) {
    const plugins = getAllPluginNames();
    console.log("Available plugins:");
    plugins.forEach((p) => console.log(`  - ${p}`));
    return;
  }

  let pluginNames = [];
  let outputDir = null;

  if (args.includes("--all")) {
    pluginNames = getAllPluginNames();
  } else {
    pluginNames = args.filter((arg) => !arg.startsWith("-"));
  }

  const outputIndex = args.indexOf("--output");
  if (outputIndex !== -1 && args[outputIndex + 1]) {
    outputDir = args[outputIndex + 1];
  }
  const outputIndexShort = args.indexOf("-o");
  if (outputIndexShort !== -1 && args[outputIndexShort + 1]) {
    outputDir = args[outputIndexShort + 1];
  }

  if (pluginNames.length === 0) {
    console.error("No plugins specified. Use --help for usage information.");
    process.exit(1);
  }

  // Create output directory if specified and doesn't exist
  if (outputDir && !existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
    console.error(`Created output directory: ${outputDir}`);
  }

  for (const pluginName of pluginNames) {
    console.error(`Generating documentation for: ${pluginName}`);

    const result = generatePluginDoc(pluginName);

    if (result) {
      if (outputDir) {
        const outputPath = join(outputDir, `${pluginName}.md`);
        writeFileSync(outputPath, result.markdown);
        console.error(`  Written to: ${outputPath}`);
      } else {
        console.log(result.markdown);
      }

      console.error(
        `  Parameters: ${result.parameters.length}, Data fields: ${result.data.length}, Examples: ${result.examplesCount}`
      );
    }
  }
}

// Export functions for testing
export {
  generatePluginDoc,
  getAllPluginNames,
  extractPluginDescription,
  parseParametersSection,
  extractPluginInfo,
  parameterTypeMap,
};

// Run main if this is the entry point
main();
