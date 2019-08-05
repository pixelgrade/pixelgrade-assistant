var plugin = 'pixelgrade-assistant',
	source_SCSS = { admin: './admin/scss/**/*.scss', public: './public/scss/**/*.scss'},
	dest_CSS = { admin:'./admin/css/', public: './public/css/'},

	gulp = require( 'gulp' ),
	plugins = require( 'gulp-load-plugins' )(),
	fs = require('fs'),
	del = require('del'),
	cp = require('child_process'),
	commandExistsSync = require('command-exists').sync;

var u = plugins.util,
	c = plugins.util.colors,
	log = plugins.util.log;

var options = {
	silent: true,
	continueOnError: true, // default: false
	sourceMaps: true,
	showDeps: false, // This should be activated only when wanting to see only the dependencies - it breaks the bundle; see https://blog.kowalczyk.info/article/3/analyzing-browserify-bundles-to-minimize-javascript-bundle-size.html
};

// -----------------------------------------------------------------------------
// Stylesheets (CSS) tasks
// -----------------------------------------------------------------------------

function logError( err, res ) {
	log( c.red( 'Sass failed to compile' ) );
	log( c.red( '> ' ) + err.file.split( '/' )[err.file.split( '/' ).length - 1] + ' ' + c.underline( 'line ' + err.line ) + ': ' + err.message );
}

function stylesAdmin() {
	return gulp.src( source_SCSS.admin )
		.pipe( plugins.sass( {'sourcemap': false, style: 'compact'} ).on( 'error', logError ) )
		.pipe( plugins.autoprefixer() )
		.pipe( gulp.dest( dest_CSS.admin ) );
}
stylesAdmin.description = 'Compiles admin css files';
gulp.task( 'styles-admin', stylesAdmin );

function stylesAdminRtl() {
	return gulp.src( './admin/css/pixelgrade_assistant-admin.css' )
		.pipe( plugins.rtlcss() )
		.pipe( plugins.rename( 'pixelgrade_assistant-admin-rtl.css' ) )
		.pipe( gulp.dest( dest_CSS.admin ) );
}
stylesAdminRtl.description = 'Generate admin pixelgrade_assistant-admin-rtl.css file based on admin pixelgrade_assistant-admin.css';
gulp.task( 'styles-admin-rtl', stylesAdminRtl );

function stylesClub() {
	return gulp.src( './admin/scss/club/*.scss' )
		.pipe( plugins.sass( {'sourcemap': false, style: 'compact'} ).on( 'error', logError ) )
		.pipe( plugins.autoprefixer() )
		.pipe( gulp.dest( './admin/css/club' ) );
}
stylesClub.description = 'Compiles club related css files';
gulp.task( 'styles-club', stylesClub );


function stylesSequence(cb) {
	return gulp.series( 'styles-admin', 'styles-admin-rtl', 'styles-club' )(cb);
}
stylesSequence.description = 'Compile styles';
gulp.task( 'styles', stylesSequence );


gulp.task('watch', watch);
function watch() {
    gulp.watch('./admin/scss/*.scss').on('change', gulp.series( 'styles-admin', 'styles-admin-rtl', 'styles-club' ));
}


// -----------------------------------------------------------------------------
// Scripts tasks
// -----------------------------------------------------------------------------

var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var commonShake = require('common-shakeify')
var watchify = require('watchify');
var through = require('through2');
var rollup = require('gulp-better-rollup');
var babel = require('rollup-plugin-babel');
var resolve = require('rollup-plugin-node-resolve');
var commonjs = require('rollup-plugin-commonjs');
var replace = require('rollup-plugin-replace');
var json = require('rollup-plugin-json');

function compileScriptsRollup(watch) {
	return gulp.src(['./admin/src/dashboard.js', './admin/src/setup_wizard.js'])
		.pipe(plugins.sourcemaps.init({loadMaps: false}))
		.pipe(rollup({
			// There is no `input` option as rollup integrates into the gulp pipeline
			plugins: [
				replace({
					'process.env.NODE_ENV': JSON.stringify( 'production' )
				}),
				json(),
				babel({
					exclude: [
						'node_modules/**',
					],
				}),
				resolve({
					browser: true,
					preferBuiltins: true,
				}),
				commonjs({
					include: [
						'node_modules/**',
					],
					browser: true,
					namedExports: {
						'react-is': ['ForwardRef','isForwardRef','isValidElementType','isContextConsumer'],
						'react': ['isValidElement','Children','cloneElement','Component','useLayoutEffect',
							'useEffect','useMemo','useContext','useReducer','useRef'],
						'react-dom': ['findDOMNode','unstable_batchedUpdates'],
						'prop-types': ['element','oneOfType','func','bool','elementType'],
						'@material-ui/core/styles': ['createMuiTheme','MuiThemeProvider'],
						'@material-ui/styles': ['withStyles'],
					}
				})
			]
		}, {
			// Rollups `sourcemap` option is unsupported. Use `gulp-sourcemaps` plugin instead
			format: 'iife',
			globals: {
				'lodash': '_',
			}
		}))
		// inlining the sourcemap into the exported .js file
		.pipe(plugins.sourcemaps.write('./'))
		.pipe(gulp.dest('./admin/js'))
}
gulp.task('compile_scripts_rollup', function() { return compileScriptsRollup(false); });

function scriptCompileRollupProductionSequence(cb) {
	gulp.series( 'apply-prod-environment', 'compile_scripts_rollup' )(cb);
}
gulp.task( 'compile_production_rollup', scriptCompileRollupProductionSequence );

function compile_support(watch) {
	var bundler = browserify(
		'./admin/src/support.js',
		{
			debug: options.sourceMaps ,
		});

	if ( !!u.env.production ) {
		bundler = bundler.transform('uglifyify', {global: true}).plugin(commonShake, { verbose: !u.env.production });
	}

	if (!u.env.production && options.showDeps) {
		// for debugging dump (flattened and inverted) dependency tree
		// b is browserify instance
		bundler.pipeline.get('deps').push(through.obj(
			function(row, enc, next) {
				// format of row is { id, file, source, entry, deps }
				// deps is {} where key is module name and value is file it comes from
				console.log(row.file || row.id);
				for (let k in row.deps) {
					const v = row.deps[k];
					console.log('  ', k, ':', v);
				}
				next();
			}));
	}

	function rebundle_support() {
		return bundler.bundle()
			.on('error', function(err) { console.error(err); this.emit('end'); })
			.pipe(source('support.js'))
			.pipe(buffer())
			.pipe(plugins.sourcemaps.init({ loadMaps: true }))
			.pipe(plugins.sourcemaps.write('./'))
			.pipe(gulp.dest('./admin/js'));
	}

	if (watch) {
		bundler = watchify(bundler);
		bundler.on('update', function() {
			console.log('-> bundling support...');
			rebundle_support();
		})
	}

	return rebundle_support();
}

function watch_dashboard() {
	return compile_dashboard(true);
}

function watch_setup_wizard() {
	return compile_setup_wizard(true);
}

function watch_support() {
	return compile_support(true);
}

// This DOESN'T exclude the need for --production!!!
function setProductionEnvironment( done ) {
	process.stdout.write("Setting NODE_ENV to 'production'" + "\n");
	process.env.NODE_ENV = 'production';
	if (process.env.NODE_ENV !== 'production') {
		throw new Error("Failed to set NODE_ENV to production!!!!");
	} else {
		process.stdout.write("Successfully set NODE_ENV to production" + "\n");
	}

	done()
}
setProductionEnvironment.description = 'Set the NODE_ENV environment variable to production.';
gulp.task( 'apply-prod-environment', setProductionEnvironment );

/**
 * Compile tasks
 */
gulp.task('compile_support', function() { return compile_support(false); });
function scriptCompileProductionSupportSequence(cb) {
	gulp.series( 'apply-prod-environment', 'compile_support' )(cb);
}
gulp.task( 'compile_production_support', scriptCompileProductionSupportSequence );

// Compile all - no minify
function scriptCompileSequence(cb) {
	return gulp.parallel( 'compile_dashboard', 'compile_wizard', 'compile_support' )(cb);
}
gulp.task( 'compile', scriptCompileSequence );

function scriptCompileProductionSequence(cb) {
	gulp.series( 'apply-prod-environment', 'compile_scripts_rollup', 'compile_production_support' )(cb);
}
gulp.task( 'compile_production', scriptCompileProductionSequence );

// Compile for release - with minify
function minifyScripts() {
	return gulp.src(['./admin/js/**/*.js','!./admin/js/**/*.min.js'])
		.pipe( plugins.unassert() )
		.pipe( plugins.envify('production') )
		.pipe( plugins.terser({
			warnings: true,
			compress: true, mangle: true,
			output: { comments: 'some' }
		}))
		.pipe(plugins.rename({
			suffix: ".min"
		}))
		.pipe(gulp.dest('./admin/js'));
}
gulp.task( 'minify-scripts', minifyScripts );

function scriptCompileMinifiedSequence(cb) {
	gulp.series( 'compile_production', 'minify-scripts' )(cb);
}
gulp.task( 'compile_distribution', scriptCompileMinifiedSequence );

/**
 * Watch Tasks
 */
gulp.task('watch_dashboard', function() { return watch_dashboard(true); });
gulp.task('watch_wizard', function() { return watch_setup_wizard(true); });
gulp.task('watch_support', function() { return watch_support(true); });


// -----------------------------------------------------------------------------
// Build tasks
// -----------------------------------------------------------------------------

/**
 * Copy plugin folder outside in a build folder, recreate styles before that
 */
function copyFolder() {
	var dir = process.cwd();
	return gulp.src( './*' )
		.pipe( plugins.exec( 'rm -Rf ./../build; mkdir -p ./../build/' + plugin + ';', {
			silent: true,
			continueOnError: true // default: false
		} ) )
		.pipe( plugins.rsync({
			root: dir,
			destination: '../build/' + plugin + '/',
			progress: false,
			silent: false,
			compress: false,
			recursive: true,
			emptyDirectories: true,
			clean: true,
			exclude: ['node_modules']
		}));
}
gulp.task( 'copy-folder', copyFolder );

/**
 * Clean the folder of unneeded files and folders
 */
function removeUnneededFiles() {

	// files that should not be present in build zip
	var files_to_remove = [
		'**/codekit-config.json',
		'node_modules',
		'bin',
		'tests',
		'.travis.yml',
		'.babelrc',
		'.gitignore',
		'.codeclimate.yml',
		'.csslintrc',
		'.eslintignore',
		'.eslintrc',
		'circle.yml',
		'phpunit.xml.dist',
		'.sass-cache',
		'config.rb',
		'gulpfile.js',
		'webpack.config.js',
		'package.json',
		'package-lock.json',
		'pxg.json',
		'build',
		'.idea',
		'**/*.css.map',
		'**/.git*',
		'*.sublime-project',
		'.DS_Store',
		'**/.DS_Store',
		'__MACOSX',
		'**/__MACOSX',
		'+development.rb',
		'+production.rb',
		'README.md',
		'admin/src',
		'admin/scss',
		'admin/js/**/*.map',
		'admin/css/**/*.map',
		'.csscomb',
		'.csscomb.json',
		'.codeclimate.yml',
		'tests',
		'circle.yml',
		'.circleci',
		'.labels',
		'.jscsrc',
		'.jshintignore',
		'browserslist',
		'babel.config.js',

		'admin/scss',
		'admin/src'
	];

	files_to_remove.forEach( function( e, k ) {
		files_to_remove[k] = '../build/' + plugin + '/' + e;
	} );

	return del(files_to_remove, {force: true});
}
gulp.task( 'remove-files', removeUnneededFiles );

function maybeFixBuildDirPermissions(done) {

	cp.execSync('find ./../build -type d -exec chmod 755 {} \\;');

	return done();
}
maybeFixBuildDirPermissions.description = 'Make sure that all directories in the build directory have 755 permissions.';
gulp.task( 'fix-build-dir-permissions', maybeFixBuildDirPermissions );

function maybeFixBuildFilePermissions(done) {

	cp.execSync('find ./../build -type f -exec chmod 644 {} \\;');

	return done();
}
maybeFixBuildFilePermissions.description = 'Make sure that all files in the build directory have 644 permissions.';
gulp.task( 'fix-build-file-permissions', maybeFixBuildFilePermissions );

function maybeFixIncorrectLineEndings(done) {
	if (commandExistsSync('dos2unix')) {
		log( c.red( 'Could not ensure that line endings are correct on the build files since you are missing the "dos2unix" utility! You should install it.' ) );
		log( c.red( 'However, this is not a very big deal. The build task will continue.' ) );
	} else {
		cp.execSync('find ./../build -type f -print0 | xargs -0 -n 1 -P 4 dos2unix');
	}

	return done();
}
maybeFixIncorrectLineEndings.description = 'Make sure that all line endings in the files in the build directory are UNIX line endings.';
gulp.task( 'fix-line-endings', maybeFixIncorrectLineEndings );

// -----------------------------------------------------------------------------
// Replace the plugin's text domain with the actual text domain
// -----------------------------------------------------------------------------
function replaceTextdomainPlaceholder() {

	return gulp.src( '../build/' + plugin + '/**/*.php' )
		.pipe( plugins.replace( /['|"]__plugin_txtd['|"]/g, '\'' + plugin + '\'' ) )
		.pipe( gulp.dest( '../build/' + plugin ) );
}
gulp.task( 'txtdomain-replace', replaceTextdomainPlaceholder);

/**
 * Create a zip archive out of the cleaned folder and delete the folder
 */
function createZipFile() {
	var versionString = '';
	// get plugin version from the main plugin file
	var contents = fs.readFileSync("./" + plugin + ".php", "utf8");

	// split it by lines
	var lines = contents.split(/[\r\n]/);

	function checkIfVersionLine(value, index, ar) {
		var myRegEx = /^[\s\*]*[Vv]ersion:/;
		if (myRegEx.test(value)) {
			return true;
		}
		return false;
	}

	// apply the filter
	var versionLine = lines.filter(checkIfVersionLine);

	versionString = versionLine[0].replace(/^[\s\*]*[Vv]ersion:/, '').trim();
	versionString = '-' + versionString.replace(/\./g, '-');

	return gulp.src('./')
		.pipe( plugins.exec('cd ./../; rm -rf ' + plugin[0].toUpperCase() + plugin.slice(1) + '*.zip; cd ./build/; zip -r -X ./../' + plugin[0].toUpperCase() + plugin.slice(1) + versionString + '.zip ./; cd ./../; rm -rf build'));

}
gulp.task( 'make-zip', createZipFile );

function buildSequence(cb) {
	return gulp.series( 'copy-folder', 'remove-files', 'fix-build-dir-permissions', 'fix-build-file-permissions', 'fix-line-endings', 'txtdomain-replace' )(cb);
}
buildSequence.description = 'Sets up the build folder';
gulp.task( 'build', buildSequence );

function zipSequence(cb) {
	return gulp.series( 'build', 'make-zip' )(cb);
}
zipSequence.description = 'Creates the zip file';
gulp.task( 'zip', zipSequence  );



// Watch SCSS files and JS files
function watchAllSequence(cb) {
	return gulp.parallel( 'watch_dashboard', 'watch_wizard', 'watch_support' )(cb);
}
watchAllSequence.description = 'Start all the JS watchers.';
gulp.task( 'watch-all', watchAllSequence  );
