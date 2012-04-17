jasmine.Matchers.AnyThing = function() {
};

jasmine.Matchers.AnyThing.prototype.matches = function(other) {
    return true;
};

jasmine.Matchers.AnyThing.prototype.toString = function() {
    return '<jasmine.anyThing()>';
};

jasmine.anyThing = function() {
    return new jasmine.Matchers.AnyThing();
};
