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
 * Convert plugin name (kebab-case) to jsPsych variable name (e.g., html-button-response -> jsPsychHtmlButtonResponse)
 */
function pluginNameToVarName(pluginName) {
  return (
    "jsPsych" +
    pluginName
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("")
  );
}

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
      // Regex explanation:
      // \bdefault\s*:\s* - Match "default:" with optional whitespace
      // ([\s\S]*?) - Capture the value (non-greedy, including newlines)
      // (?:,\s*(?:\w+\s*:|$)|$) - Stop at: comma followed by another property, or end of string
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

      // Format array types properly (e.g., "array of strings" not "array of strings")
      let displayType = type;
      if (isArray) {
        // Handle proper pluralization for different types
        const pluralForms = {
          string: "strings",
          boolean: "booleans",
          numeric: "numbers",
          function: "functions",
          object: "objects",
          "HTML string": "HTML strings",
        };
        const pluralType = pluralForms[type] || `${type}s`;
        displayType = `array of ${pluralType}`;
      }

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
 * Extracts JavaScript code from an example HTML file.
 * Note: This function parses trusted example files from the jsPsych repository,
 * not arbitrary user-provided HTML. The regex patterns are sufficient for
 * parsing well-formed HTML from our own examples.
 */
function extractExampleCode(htmlContent) {
  // Find script tags that contain jsPsych code (not src imports)
  // Note: This regex is for parsing trusted internal example files, not for security-critical HTML sanitization
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
 * Normalizes the indentation of code to use consistent 2-space indentation.
 */
function normalizeCodeIndentation(code) {
  const lines = code.split("\n");

  // Find the minimum indentation (excluding empty lines and the first line which should start with {)
  let minIndent = Infinity;
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim()) {
      const leadingSpaces = line.match(/^(\s*)/)[1].length;
      minIndent = Math.min(minIndent, leadingSpaces);
    }
  }

  if (minIndent === Infinity) minIndent = 0;

  // Remove the common indentation and normalize
  const normalizedLines = lines.map((line, idx) => {
    if (!line.trim()) return "";
    if (idx === 0) return line.trim(); // First line (opening brace)
    return line.substring(minIndent);
  });

  // Format into a proper object literal with consistent indentation
  let result = normalizedLines.join("\n").trim();

  // Try to reformat as a proper JavaScript object
  // Remove extra indentation before closing brace
  result = result.replace(/\n\s*\}$/, "\n}");

  return result;
}

/**
 * Extracts individual trial configurations from example code.
 * Returns an array of trial objects with their code and a description derived from the prompt or comments.
 */
function extractTrialsFromExampleCode(code, pluginName) {
  const trials = [];

  const pluginVarName = pluginNameToVarName(pluginName);

  // Look for trial objects that use this plugin type
  // Pattern matches: { type: jsPsychPluginName, ... } or timeline.push({ type: jsPsychPluginName, ... })
  // Note: This regex handles up to 2 levels of nested objects which covers most trial configurations
  const trialPattern = new RegExp(
    `(?:(?:const|let|var)\\s+(\\w+)\\s*=\\s*)?\\{[^{}]*type\\s*:\\s*${pluginVarName}[^{}]*(?:\\{[^{}]*(?:\\{[^{}]*\\}[^{}]*)*\\}[^{}]*)*\\}`,
    "g"
  );

  let match;
  while ((match = trialPattern.exec(code)) !== null) {
    let trialCode = match[0];

    // If the trial was assigned to a variable, use just the object literal
    if (match[1]) {
      // Extract just the object part
      const objStart = trialCode.indexOf("{");
      trialCode = trialCode.substring(objStart);
    }

    // Try to extract a description from the prompt parameter or nearby comments
    let description = null;
    const promptMatch = trialCode.match(/prompt\s*:\s*["'`]([^"'`]+)["'`]/);
    if (promptMatch) {
      // Strip HTML tags from the prompt to get plain text for the example title
      // Note: This is processing trusted internal example files, not user input
      description = promptMatch[1].replace(/<[^>]*>/g, "").trim();
    }

    // Clean up and normalize the trial code formatting
    trialCode = normalizeCodeIndentation(trialCode);

    trials.push({
      code: trialCode,
      description: description || `Example ${trials.length + 1}`,
    });
  }

  return trials;
}

/**
 * Generates a demo HTML file for embedding in documentation.
 * The demo file uses CDN-hosted scripts and the docs-demo-timeline wrapper.
 */
function generateDemoHtml(trialCode, pluginName, jspsychVersion, pluginVersion) {
  const packageName = `@jspsych/plugin-${pluginName}`;

  // Note: The demo HTML files depend on docs-demo-timeline.js and docs-demo.css
  // which should already exist in docs/demos/ from the existing documentation build.
  // These files provide the interactive "Run demo" / "Repeat demo" wrapper functionality.

  return `<!DOCTYPE html>
<html>
  <head>
    <script src="docs-demo-timeline.js"></script>
    <script src="https://unpkg.com/jspsych@${jspsychVersion}"></script>
    <script src="https://unpkg.com/${packageName}@${pluginVersion}"></script>
    <link rel="stylesheet" href="https://unpkg.com/jspsych@${jspsychVersion}/css/jspsych.css" />
    <link rel="stylesheet" href="docs-demo.css" type="text/css">
  </head>
  <body></body>
  <script>

    const jsPsych = initJsPsych();

    const timeline = [];

    const trial = ${trialCode};

    timeline.push(trial);

    if (typeof jsPsych !== "undefined") {
      jsPsych.run(generateDocsDemoTimeline(timeline));
    } else {
      document.body.innerHTML = '<div style="text-align:center; margin-top:50%; transform:translate(0,-50%);">You must be online to view the plugin demo.</div>';
    }
  </script>
</html>
`;
}

/**
 * Generates the examples section markdown with Code/Demo tabs.
 */
function generateExamplesSection(trials, pluginName, demoBasePath) {
  if (trials.length === 0) {
    return "";
  }

  let markdown = "\n## Examples\n\n";

  trials.forEach((trial, index) => {
    const demoNum = index + 1;
    const demoFileName = `jspsych-${pluginName}-demo${demoNum}.html`;

    markdown += `???+ example "${trial.description}"\n`;
    markdown += `    === "Code"\n`;
    markdown += `        \`\`\`javascript\n`;

    // Indent the code properly for the markdown
    const indentedCode = trial.code
      .split("\n")
      .map((line) => `        ${line}`)
      .join("\n");
    markdown += indentedCode + "\n";

    markdown += `        \`\`\`\n`;
    markdown += `\n`;
    markdown += `    === "Demo"\n`;
    markdown += `        <div style="text-align:center;">\n`;
    markdown += `            <iframe src="${demoBasePath}${demoFileName}" width="90%;" height="600px;" frameBorder="0"></iframe>\n`;
    markdown += `        </div>\n`;
    markdown += `\n`;
    markdown += `    <a target="_blank" rel="noopener noreferrer" href="${demoBasePath}${demoFileName}">Open demo in new tab</a>\n`;
    markdown += `\n`;
  });

  return markdown;
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
    // Escape special markdown characters in description for table cell
    // First escape backslashes, then pipes, and convert newlines to spaces
    const description = param.description
      .replace(/\\/g, "\\\\")
      .replace(/\|/g, "\\|")
      .replace(/\n/g, " ");
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
    // Escape special markdown characters in description for table cell
    // First escape backslashes, then pipes, and convert newlines to spaces
    const description = item.description
      .replace(/\\/g, "\\\\")
      .replace(/\|/g, "\\|")
      .replace(/\n/g, " ");
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

  // Extract trials from examples and generate examples section
  const extractedTrials = [];
  const demoFiles = [];

  // Get jsPsych version for demo files
  const jspsychPackagePath = join(rootDir, "packages", "jspsych", "package.json");
  const jspsychVersion = existsSync(jspsychPackagePath)
    ? JSON.parse(readFileSync(jspsychPackagePath, "utf8")).version
    : "latest";

  for (const example of examples) {
    const exampleCode = extractExampleCode(example.content);
    if (exampleCode) {
      const trials = extractTrialsFromExampleCode(exampleCode, pluginName);
      for (const trial of trials) {
        extractedTrials.push(trial);

        // Generate demo HTML file content
        const demoHtml = generateDemoHtml(
          trial.code,
          pluginName,
          jspsychVersion,
          version || "latest"
        );
        const demoFileName = `jspsych-${pluginName}-demo${extractedTrials.length}.html`;
        demoFiles.push({
          fileName: demoFileName,
          content: demoHtml,
        });
      }
    }
  }

  // Add examples section with Code/Demo tabs if trials were extracted
  if (extractedTrials.length > 0) {
    markdown += generateExamplesSection(extractedTrials, pluginName, "../../demos/");
  } else if (examples.length > 0) {
    // Fallback to simple link if no trials could be extracted
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
    extractedTrials,
    demoFiles,
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
 * Get argument value for a flag (supports both long and short forms)
 */
function getArgValue(args, longFlag, shortFlag) {
  const longIndex = args.indexOf(longFlag);
  if (longIndex !== -1 && args[longIndex + 1] && !args[longIndex + 1].startsWith("-")) {
    return args[longIndex + 1];
  }
  const shortIndex = args.indexOf(shortFlag);
  if (shortIndex !== -1 && args[shortIndex + 1] && !args[shortIndex + 1].startsWith("-")) {
    return args[shortIndex + 1];
  }
  return null;
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
  --help, -h          Show this help message
  --all               Generate docs for all plugins
  --output, -o        Output directory for markdown files (default: stdout)
  --demos-output, -d  Output directory for demo HTML files
  --list              List all available plugins

Examples:
  node generatePluginDocs.js html-button-response
  node generatePluginDocs.js --all --output docs/plugins --demos-output docs/demos
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

  if (args.includes("--all")) {
    pluginNames = getAllPluginNames();
  } else {
    // Filter out flag arguments and their values
    const flagsWithValues = ["--output", "-o", "--demos-output", "-d"];
    const skipNext = new Set();
    for (let i = 0; i < args.length; i++) {
      if (flagsWithValues.includes(args[i])) {
        skipNext.add(i + 1);
      }
    }
    pluginNames = args.filter((arg, idx) => !arg.startsWith("-") && !skipNext.has(idx));
  }

  const outputDir = getArgValue(args, "--output", "-o");
  const demosOutputDir = getArgValue(args, "--demos-output", "-d");

  if (pluginNames.length === 0) {
    console.error("No plugins specified. Use --help for usage information.");
    process.exit(1);
  }

  // Create output directories if specified and don't exist
  if (outputDir && !existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
    console.error(`Created output directory: ${outputDir}`);
  }

  if (demosOutputDir && !existsSync(demosOutputDir)) {
    mkdirSync(demosOutputDir, { recursive: true });
    console.error(`Created demos output directory: ${demosOutputDir}`);
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

      // Write demo files if demos output directory is specified
      if (demosOutputDir && result.demoFiles && result.demoFiles.length > 0) {
        for (const demoFile of result.demoFiles) {
          const demoPath = join(demosOutputDir, demoFile.fileName);
          writeFileSync(demoPath, demoFile.content);
          console.error(`  Demo written to: ${demoPath}`);
        }
      }

      console.error(
        `  Parameters: ${result.parameters.length}, Data fields: ${result.data.length}, Examples: ${result.examplesCount}, Extracted trials: ${result.extractedTrials ? result.extractedTrials.length : 0}`
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
  extractTrialsFromExampleCode,
  generateDemoHtml,
  generateExamplesSection,
  pluginNameToVarName,
  parameterTypeMap,
};

// Run main if this is the entry point (i.e., script executed directly)
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  main();
}
