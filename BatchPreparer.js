var globule = require('globule');
var path = require('path');

var makeUnixPath = function(filePath) {
	return filePath.split('\\').join('/');
};

var BatchPreparer = function(){
	var self = this;

	var trimStart = function(s, match){
		return s.substring(match.length);
	};

	var pushRootDir = function(ftpBatch){
		var paths = ftpBatch.remoteRoot.split('/');
		var current = '';
		for(var i = 0; i < paths.length; i++){
			if(!paths[i])
				continue;

			paths[i] = current = current + '/' + paths[i];

			ftpBatch.files.push({
				sourcePath: '', //Directories don't need sourcePath
				destinationPath: paths[i]
			});
		}
	};

	var pushGlobs = function(ftpBatch){
		var startDir = process.cwd();
		process.chdir(ftpBatch.localRoot);
		
		globule.find(ftpBatch.match)
				.map(function(file){

					var localPath = makeUnixPath(path.join(ftpBatch.localRoot, file));
					var remotePath = makeUnixPath(path.join(ftpBatch.remoteRoot, file));

					ftpBatch.files.push({
						sourcePath: localPath,
						destinationPath: remotePath
					});
				});

		process.chdir(startDir);
	};

	var setFilePaths = function(ftpBatch){
		ftpBatch.files = [];

		pushRootDir(ftpBatch);
		pushGlobs(ftpBatch);

		return ftpBatch;
	};

	var logBatches = function(batches){
		console.log("Found files:");
		
		batches.forEach(function(ftpBatch){
			ftpBatch.files.forEach(function(file){
				console.log(file.sourcePath);
			});

			ftpBatch.files.forEach(function(file){
				console.log(file.destinationPath);
			});
		});
	};

	self.prepare = function(config){
		config.ftpBatches.forEach(setFilePaths);

		if(config.debugMode === true)
			logBatches(config.ftpBatches);
	};
};

module.exports = BatchPreparer;