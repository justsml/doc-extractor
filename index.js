/**
@title doc-extractor class
@author Dan Levy
@summary Extract comment comment blocks just like this
@status Work in progress
@inherits EventEmitter
@events comment, done
@example
var commentary = new CssProcessor(process.stdin [, doneCallback]);
commentary.on
*/

const commentParts = /([^@]*)@([^\s]*)([^@]*\n*)/,
			commentStart = /\/\*\*/,
			commentEnd = /\*\//; 		// ^^^ only single matches

var HelpComment = require('./comment.js');
var util = require('util'),
		EventEmitter = require('events').EventEmitter;

function DocExtractor(stream, done) {
	if (!(this instanceof DocExtractor)) { return new DocExtractor(); }
	var self = this;
	self.comments = [];
	self.done = done;
	// setup events
	self.on('done', function _chkCB() {
		if (typeof(self.done) === 'function') {
			self.done(null, self);
		}
	});
	self.on('raw_comment', function(raw) {
		var helpCmt = new HelpComment(raw);
		self.comments.push(helpCmt);// Add b4 emmiting the helpCmt instance
		self.emit('comment', helpCmt);
	});
	if (stream && stream.read) {
		// auto process stream if we have one on _ctor()
		process.nextTick(function _streamer() {
			self.readStream(stream);
		})
	}
}
util.inherits(DocExtractor, EventEmitter);

DocExtractor.prototype.readStream = function(stream, done) {
	var self = this;
	var isCapturing = false,
			comment = [];
	self.done = done || self.done;
	stream.on('error', console.error);
	stream.on('data', function(data) {
		if ( data.indexOf('\n|\r') < 0 && data.length > 300 ) { throw new Error('Compressed input not supported.')}
		if (!isCapturing && commentStart.test(data) ) {
			isCapturing = true;
			data = data.split(commentStart)[0];
		}
		if ( isCapturing && commentEnd.test(data) ) {
			data = data.split(commentEnd)[1];
		}
		comment.push(data);
		if (isCapturing && commentEnd.test(data)) {
			isCapturing = false;
			self.emit('raw_comment', comment.join(''));
			comment = [];
		}
	});
	// Send DONE event to the main class
	stream.on('end', function _dunzo() {
		if ( self.comments.length <= 0 ) {
			self.emit('error', new Error('No doc comments found. Must start with: \/**\\n'));
		} else {
			self.emit('done', self.comments);
		}
	});

}


module.exports = DocExtractor



