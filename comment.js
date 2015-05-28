/*
@class Comment
@private
@description
	Input a jdoc @comment style bloc, and the key/value pairs will be on the instance's Comment.attributes
*/
module.exports = Comment;

function Comment(raw) {
	if (!(this instanceof Comment)) { return new Comment(raw); }
	var self = this,
			attrs = {};
	self._raw = raw;
	(function init(raw) {
		// for now, just return dictionary of all @KEY [VALUE, LINE2, ETC]
		var m, keyMatch = /@([^\s@]*).?([^$@]*)/g;
		while ((m = keyMatch.exec(raw)) !== null) {
			attrs[m[1]] = String(m[2]).trim();
			this[m[1]] = String(m[2]).trim();// Next match starts at ' + myRe.lastIndex;
		}
	})(raw);
	self.attributes = attrs;
}
