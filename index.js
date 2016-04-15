const through = require('through2');
const gutil = require('gulp-util');
const PluginError = gutil.PluginError;
const tinify = require("tinify");

// consts
const PLUGIN_NAME = 'gulp-tinify';

// plugin level function (dealing with files)
function gulpTinify(options) {
    if (!options && options.key) {
        throw new PluginError(PLUGIN_NAME, 'Missing prefix text!');
    } else {
        tinify.key = options.key;
    }
    if (!options && options.verbose) {
        options.verbose = true;
    }

    key = new Buffer(options.key); // allocate ahead of time

    // creating a stream through which each file will pass
    var stream = through.obj(function(file, enc, cb) {
        if (file.isStream()) {
            this.emit('error', new PluginError(PLUGIN_NAME, 'Streams are not supported!'));
            return cb();
        }

        if (file.isBuffer()) {
            if (options.verbose) {
                gutil.log('compressing', gutil.colors.magenta(file.relative) + '...');
            }
            tinify.fromBuffer(file.contents).toBuffer(function(err, resultData) {
                if (err) {
                    this.emit('error', new PluginError(PLUGIN_NAME, 'Something went wrong connecting to tinify servers'));
                }
                if (options.verbose) {
                    gutil.log(gutil.colors.magenta(file.relative) + gutil.colors.green('✔ ('+((1 - resultData.length/file.contents.length) * 100).toFixed()+'% saved)'));
                }
                file.contents = resultData;
                this.push(file);
                return cb();
            }.bind(this));
        }
        
    });

    // returning the file stream
    if (tinify.compressionCount && options.verbose) {
        gutil.log(tinify.compressionCount + "compression this monht");
    }
    
    return stream;
};

// exporting the plugin main function
module.exports = gulpTinify;