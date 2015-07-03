var FileUploader = require("./FileUploader.js");
var BatchPreparer = require("./BatchPreparer.js");
var ConfigFileLoader = require('./ConfigFileLoader.js')


var batchPreparer = new BatchPreparer();

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

var batches = [];

var uploadBatchesRecursive = function(uploader, i){
	if(i >= batches.length){
		console.log('Finished all uploads!');
		process.exit();
		return;
	}

	uploader.uploadFiles(batches[i].files, function(){
		uploadBatchesRecursive(uploader, i + 1);
	});
};

var upload = function(){
	var config = new ConfigFileLoader().load('ftp_config.json');

	batchPreparer.prepare(config);

	var uploader = new FileUploader(config);

	batches = config.ftpBatches;
	uploadBatchesRecursive(uploader, 0);
};

upload();