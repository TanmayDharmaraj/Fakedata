﻿(function (exports) {
    var chance = null;
    if (typeof window == 'undefined') {
        chance = require('chance').Chance();
    }
    else {
        chance = window.chance;
    }
    
    exports.Helper = exports.Helper || {};
    
    exports.Helper.isNumber = function (e) {
        //if the letter is not digit then display error and don't type anything
        if (e.which != 8 && e.which != 0 && (e.which < 48 || e.which > 57)) {
            return false;
        }
        else { return true }
    };
    
    exports.Helper.isEmpty = function (obj) {
        // null and undefined are "empty"
        if (obj == null) return true;
        
        // Assume if it has a length property with a non-zero value
        // that that property is correct.
        if (obj.length && obj.length > 0) return false;
        if (obj.length === 0) return true;
        
        // Otherwise, does it have any properties of its own?
        // Note that this doesn't handle
        // toString and toValue enumeration bugs in IE < 9
        for (var key in obj) {
            if (hasOwnProperty.call(obj, key)) return false;
        }
        
        return true;
    };
    
    exports.Helper.SyntaxHiglight = function (json) {
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            var cls = 'number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'key';
                } else {
                    cls = 'string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'boolean';
            } else if (/null/.test(match)) {
                cls = 'null';
            }
            return '<span class="' + cls + '">' + match + '</span>';
        });
    };
    
    exports.Helper.Cases = {
        "INT": function () { return chance.natural({ min: 0, max: 1000 }) },
        "FLT": function () { return chance.floating() },
        "BOOL": function () { return chance.bool() },
        "FN": function () { return chance.first() },
        "LN": function () { return chance.last() },
        "GDR": function () { return chance.gender() },
        "BD": function () { return chance.birthday() },
        "PHN": function () { return chance.phone() },
        "ZIP": function () { return chance.zip() },
        "WRD": function () { return chance.word() },
        "PARA": function () { return chance.paragraph() },
        "CORD": function () { return chance.coordinates({ fixed: 2 }) },
        "IMG": function () { return chance.image() }
    };

    chance.mixin({
        'image': function (data) {
            var data = data || {};
            data.height = data.height || 400;
            data.width = data.width || 200;
            var cat = "";
            return {
                url: "http://lorempixel/" + data.height + "/" + data.width + "/" + cat,
                height: data.height,
                width: data.width,
                category: cat
            }
        }
    });

    return exports.Helper

})((typeof process === 'undefined' || !process.versions)
   ? window.FakeData = window.FakeData || {}
   : exports);