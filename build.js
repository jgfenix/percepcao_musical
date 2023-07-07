const { exec } = require("child_process");

const INDEX_HTML_PATH = "./";
const INDEX_HTML_ARCHIVE_NAME = "index.html";

const OUTPUT_PATH = "./output/";

const HTML_MINIFIER_BIN = "./node_modules/html-minifier/cli.js";
const HTML_MINIFIER_OPTS = "--remove-comments --remove-tag-whitespace --collapse-whitespace --remove-optional-tags";

const TERSER_BIN = "./node_modules/terser/bin/terser";
const TERSER_OPTS = "-c -m";

const SCRIPTS_PATH = "scripts"
const SCRIPTS_FILE_NAME = "scripts.js";
const SCRIPTS_FILE_PATH = `./src/${SCRIPTS_PATH}/`;

const IMAGES_PATH = "./images"

const LIBS = "./libs"

const WINDOWS=true

const commands = [
		`rm -rf ${OUTPUT_PATH}/*` ,
		`mkdir ${OUTPUT_PATH}` ,
		`mkdir ${OUTPUT_PATH}${SCRIPTS_FILE_PATH}/` ,
		"npm install" ,
		`node ${HTML_MINIFIER_BIN} ${INDEX_HTML_PATH}${INDEX_HTML_ARCHIVE_NAME} -o ${OUTPUT_PATH}${INDEX_HTML_ARCHIVE_NAME} ${HTML_MINIFIER_OPTS}`,
		`node ${TERSER_BIN} ${SCRIPTS_FILE_PATH}${SCRIPTS_FILE_NAME} -o ${OUTPUT_PATH}${SCRIPTS_FILE_PATH}/${SCRIPTS_FILE_NAME} ${TERSER_OPTS}`,
		`cp -rf ${LIBS} ${OUTPUT_PATH}`,
		`cp -rf ${IMAGES_PATH} ${OUTPUT_PATH}`
	]

for(let command of commands) {
	if (WINDOWS)
		command = command.replaceAll("/", "\\");

	exec(command, (error, stdout, stderr) => {
	    if (error) {
	        console.log(`error: ${error.message}`);
	        return;
	    }
	    if (stderr) {
	        console.log(`stderr: ${stderr}`);
	        return;
	    }
	    console.log(`[OK]: ${command}`);
	});
}