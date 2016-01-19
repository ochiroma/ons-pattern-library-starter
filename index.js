var Metalsmith = require('metalsmith'),
	markdown   = require('metalsmith-markdown'),
	templates  = require('metalsmith-templates'),
	collections = require('metalsmith-collections'),
	permalinks  = require('metalsmith-permalinks'),
	Handlebars = require('handlebars'),
	fs         = require('fs');


var deletePartialMarkdownFiles = function(files, metalsmith, done) {

	meta = metalsmith.metadata();
	for (var file in files) {
		var type = files[file].type;
		if (type == "partial" || type == "code") {
			delete files[file];
			// console.log(type);
		}

		// if (files[file].partial) delete files[file];
	}
	done();
};

var parseContentForSnippet = function (files, metalsmith, done) {
	var contents;
	var cleancontents;
	var snippet;
	var snippetclean;

	Object.keys(files).forEach(function (file) {
		var type = files[file].type;
		contents = files[file].contents.toString();
		if (type == "partial") {
			// console.log("partial");
			
			try {
				// console.log("inside try");
				// cleancontents = contents.replace(/\<p>\[snippet\]\<\/p>[\s\S]*?\[\/snippet\]\<\/p>/i, "");
				cleancontents = contents.replace(/\[snippet\][\s\S]*?\[\/snippet\]/i, "");

				// snippet = contents.match(/\<p>\[snippet\]\<\/p>[\s\S]*?\[\/snippet\]\<\/p>/i);
				snippet = contents.match(/\[snippet\][\s\S]*?\[\/snippet\]/i);

				if (snippet) {
					// console.log("has snippet");
					snippetclean = snippet[0];
					
					// snippetclean = snippetclean.replace(/\<p>\[snippet\]\<\/p>[\s\S]\<p>/, "");
					// snippetclean = snippetclean.replace(/\[\/snippet\]\<\/p>/, "");
					snippetclean = snippetclean.replace(/\[snippet\]/, "");
					snippetclean = snippetclean.replace(/\[\/snippet\]/, "");

					// console.log(snippetclean);
					// files[file].snippet = snippetclean;
					const buffsnippet = new Buffer(snippetclean);
					files[file].snippet = buffsnippet;

					const buffcontents = new Buffer(cleancontents);
					files[file].contents = buffcontents;
				} else {
					cleancontents = null;
					contents = null;
					snippet = null;
					snippetclean = null;
				}
			} catch(err) {
				return err.message;
			}



			// console.log("inside try");
			// console.log(snippetclean);
			// console.log(files[file].snippet);
		}

		// files[file].original_filename = file;
		// console.log(cleancontents);
		// const buffcontents = new Buffer("\"" + cleancontents + "\"");
		// files[file].snippet = snippetclean;
		// files[file].contents = buffcontents;
		// if (cleancontents) {
		// 	console.log("test");
		// 	const buffcontents = new Buffer('cleancontents');
		// }
	});
	done();
};

// var parseContentForSnippetOld = function(files, metalsmith, done) {
// 	meta = metalsmith.metadata();
// 	var contents;
// 	var cleancontents;
// 	var snippet;
// 	var snippetclean;

// 	for (var file in files) {
// 		var type = files[file].type;
// 		contents = files[file].contents.toString();
// 		if (type == "partial") {
			
// 			try {
// 				// console.log("inside try");
// 				cleancontents = contents.replace(/\<p>\[snippet\]\<\/p>[\s\S]*?\[\/snippet\]\<\/p>/i, "");
// 				snippet = contents.match(/\<p>\[snippet\]\<\/p>[\s\S]*?\[\/snippet\]\<\/p>/i);
// 				// console.log("snippet: " + snippet);
// 				if (snippet) {
// 					// console.log("has snippet");
// 				snippetclean = snippet[0];
				
// 				snippetclean = snippetclean.replace(/\<p>\[snippet\]\<\/p>[\s\S]\<p>/, "");
// 				snippetclean = snippetclean.replace(/\[\/snippet\]\<\/p>/, "");

// 				// console.log(snippetclean);
// 				files[file].snippet = snippetclean;
// 				} else {
// 					contents = "";
// 					cleancontents = "";
// 					snippet = "";
// 					snippetclean = "";
// 				}
// 			} catch(err) {
// 				return err.message;
// 			}



// 			// console.log("inside try");
// 			// console.log(snippetclean);
// 			console.log(files[file].snippet);
// 		}

// 		// if (files[file].partial) delete files[file];
// 	}
// 	done();
// };


Handlebars.registerPartial('header', fs.readFileSync(__dirname + '/templates/partials/header.html').toString());
Handlebars.registerPartial('footer', fs.readFileSync(__dirname + '/templates/partials/footer.html').toString());


Metalsmith(__dirname)
	.use(parseContentForSnippet)
	.use(collections({
		elements: {
			pattern: 'elements/partials/*.md'
		},
		components: {
			pattern: 'components/partials/*.md'
		}
	}))
	.use(markdown())
	.use(templates('handlebars'))
	// .use(parseContentForSnippet)
	.use(deletePartialMarkdownFiles)
	.destination('./build')
	.build(function (err) { if(err) console.log(err) })