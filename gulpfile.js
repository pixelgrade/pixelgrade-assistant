var plugin = 'pixelgrade-assistant',
	textDomain = 'pixelgrade_assistant',
	source_SCSS = { admin: './admin/scss/**/*.scss', public: './public/scss/**/*.scss'},
	dest_CSS = { admin:'./admin/css/', public: './public/css/'},

	gulp = require( 'gulp' ),
	plugins = require( 'gulp-load-plugins' )(),
	sass = require('gulp-sass')(require('node-sass')),
	gulpEnvify = require('@ladjs/gulp-envify'),
	fs = require('fs'),
	del = require('del'),
	cp = require('child_process'),
	cleanCSS = require('gulp-clean-css'),
	commandExistsSync = require('command-exists').sync,
	log = require('fancy-log'),
	yargs = require('yargs/yargs'),
	{ hideBin } = require('yargs/helpers'),
	argv = yargs(hideBin(process.argv)).argv;

// -----------------------------------------------------------------------------
// Stylesheets (CSS) tasks
// -----------------------------------------------------------------------------

function stylesAdmin() {
	return gulp.src( source_SCSS.admin )
		.pipe( sass.sync( {'sourcemap': false, style: 'compact'} ).on( 'error', sass.logError ) )
		.pipe( plugins.autoprefixer() )
		.pipe(plugins.replace(/^@charset \"UTF-8\";\n/gm, ''))
		.pipe(cleanCSS())
		.pipe( gulp.dest( dest_CSS.admin ) );
}
stylesAdmin.description = 'Compiles admin css files';
gulp.task( 'styles-admin', stylesAdmin );

function stylesAdminRtl() {
	return gulp.src( ['./admin/css/pixelgrade_assistant-admin.css', './admin/css/notices.css'] )
		.pipe( plugins.rtlcss() )
		.pipe(plugins.replace(/^@charset \"UTF-8\";\n/gm, ''))
		.pipe(cleanCSS())
		.pipe( plugins.rename( function (path) {
			path.basename += "-rtl";
		} ) )
		.pipe( gulp.dest( dest_CSS.admin ) );
}
stylesAdminRtl.description = 'Generate admin pixelgrade_assistant-admin-rtl.css file based on admin pixelgrade_assistant-admin.css';
gulp.task( 'styles-admin-rtl', stylesAdminRtl );


function stylesSequence(cb) {
	return gulp.series( 'styles-admin', 'styles-admin-rtl')(cb);
}
stylesSequence.description = 'Compile styles';
gulp.task( 'compile:styles', stylesSequence );


gulp.task('watch', watch);
function watch() {
    gulp.watch('./admin/scss/*.scss').on('change', gulp.series( 'styles-admin', 'styles-admin-rtl'));
}


// -----------------------------------------------------------------------------
// Scripts tasks
// -----------------------------------------------------------------------------

const rollup = require('rollup')
const babel = require('rollup-plugin-babel')
const builtins = require('rollup-plugin-node-builtins')
const globals = require('rollup-plugin-node-globals')
const resolve = require('@rollup/plugin-node-resolve').nodeResolve
const commonjs = require('@rollup/plugin-commonjs')
const replace = require('@rollup/plugin-replace')
const json = require('@rollup/plugin-json')

const rollupPluginsConfig = [
	replace({
		'process.env.NODE_ENV': argv.development ? JSON.stringify('development') : JSON.stringify( 'production' ),
		preventAssignment: true,
	}),
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
			'node_modules/react-is/index.js': ['ForwardRef', 'isForwardRef', 'isValidElementType', 'isContextConsumer', 'isFragment', 'Memo'],
			'node_modules/react-redux/node_modules/react-is/index.js': ['ForwardRef', 'isForwardRef', 'isValidElementType', 'isContextConsumer'],
			'react': ['isValidElement', 'Children', 'cloneElement', 'Component', 'useLayoutEffect',
				'useEffect', 'useMemo', 'useContext', 'useReducer', 'useRef',
				'forwardRef', 'createElement', 'createContext', 'useState', 'useCallback', 'Fragment', 'useImperativeHandle',
				'memo'
			],
			'react-dom': ['findDOMNode', 'unstable_batchedUpdates', 'createPortal'],
			'prop-types': ['element', 'oneOfType', 'func', 'bool', 'elementType'],
			'@material-ui/core/styles': ['createMuiTheme', 'MuiThemeProvider'],
			'@material-ui/styles': ['withStyles'],
		}
	}),
	globals(),
	builtins(),
	json(),
]

const rollupOutputOptions = {
	dir: './admin/js',
	format: 'iife',
	globals: {
		'window': 'window',
		'jQuery': 'jQuery',
		'wpAjax': 'wpAjax',
		'wp': 'wp',
		'pixassist': 'pixassist',
	},
	intro: 'const global = window;',
	sourcemap: true
}

function compileScriptsRollupDashboard (watch) {
	const rollupInputOptions = {
		input: './admin/src/dashboard.js',
		plugins: rollupPluginsConfig,
		external: ['jQuery', 'elasticsearch', 'AWS']
	}

	if (watch) {
		const watcher = rollup.watch({
			...rollupInputOptions,
			output: rollupOutputOptions,
			watch: {}
		})

		// This will make sure that bundles are properly closed after each run
		watcher.on('event', ({result}) => {
			if (result) {
				result.close()
			}
		})

		return watcher
	}

	return rollup
		.rollup(rollupInputOptions)
		.then(bundle => {
			return bundle.write(rollupOutputOptions)
		})
}

gulp.task('compile_scripts_rollup_dashboard', function () { return compileScriptsRollupDashboard(false) })

function compileScriptsRollupWizard (watch) {
	const rollupInputOptions = {
		input: './admin/src/setup_wizard.js',
		plugins: rollupPluginsConfig,
		external: ['jQuery', 'elasticsearch', 'AWS']
	}

	if (watch) {
		const watcher = rollup.watch({
			...rollupInputOptions,
			output: rollupOutputOptions,
			watch: {}
		})

		// This will make sure that bundles are properly closed after each run
		watcher.on('event', ({result}) => {
			if (result) {
				result.close()
			}
		})

		return watcher
	}

	return rollup
		.rollup(rollupInputOptions)
		.then(bundle => {
			return bundle.write(rollupOutputOptions)
		})
}

gulp.task('compile_scripts_rollup_wizard', function () { return compileScriptsRollupWizard(false) })

function compileScriptsRollupSupport (watch) {
	const rollupInputOptions = {
		input: './admin/src/support.js',
		plugins: rollupPluginsConfig,
		external: ['jQuery', 'elasticsearch', 'AWS']
	}

	if (watch) {
		const watcher = rollup.watch({
			...rollupInputOptions,
			output: rollupOutputOptions,
			watch: {}
		})

		// This will make sure that bundles are properly closed after each run
		watcher.on('event', ({result}) => {
			if (result) {
				result.close()
			}
		})

		return watcher
	}

	return rollup
		.rollup(rollupInputOptions)
		.then(bundle => {
			return bundle.write(rollupOutputOptions)
		})
}

gulp.task('compile_scripts_rollup_support', function () { return compileScriptsRollupSupport(false) })

function scriptCompileRollupProductionSequence (cb) {
	gulp.series('apply-prod-environment', 'compile_scripts_rollup_dashboard', 'compile_scripts_rollup_wizard', 'compile_scripts_rollup_support')(cb)
}

gulp.task('compile_production_rollup', scriptCompileRollupProductionSequence)

function scriptCompileRollupDevelopmentSequence (cb) {
	gulp.series('compile_scripts_rollup_dashboard', 'compile_scripts_rollup_wizard', 'compile_scripts_rollup_support')(cb)
}

gulp.task('compile_dev_rollup', scriptCompileRollupDevelopmentSequence)

/**
 * This function just copies the JS code for elasticsearch in the admin/js directory
 */
function compile_elasticsearch_admin (watch) {
	return gulp.src('./admin/src/vendor/elasticsearch-js/elasticsearch.js')
		.pipe(gulp.dest('./admin/js/vendor'))
}
gulp.task('compile_elasticsearch_admin', function () { return compile_elasticsearch_admin() })

function copyOtherScripts() {
	return gulp.src(['./admin/src/admin-notices.js'])
		.pipe(gulp.dest('./admin/js'));
}
gulp.task('copy_other_scripts', function() { return copyOtherScripts(); });

function watch_dashboard () {
	return compileScriptsRollupDashboard(true)
}

function watch_setup_wizard () {
	return compileScriptsRollupWizard(true)
}

function watch_support () {
	return compileScriptsRollupSupport(true)
}

// This DOESN'T exclude the need for --production!!!
function setProductionEnvironment (done) {
	process.stdout.write('Setting NODE_ENV to \'production\'' + '\n')
	process.env.NODE_ENV = 'production'
	if (process.env.NODE_ENV !== 'production') {
		throw new Error('Failed to set NODE_ENV to production!!!!')
	} else {
		process.stdout.write('Successfully set NODE_ENV to production' + '\n')
	}

	done()
}

setProductionEnvironment.description = 'Set the NODE_ENV environment variable to production.'
gulp.task('apply-prod-environment', setProductionEnvironment)

/**
 * Compile tasks
 */

// Compile all - no minify
function scriptCompileSequence (cb) {
	return gulp.parallel('compile_production_rollup', 'compile_elasticsearch_admin', 'copy_other_scripts' )(cb)
}

gulp.task('compile:dev', scriptCompileSequence)

function scriptCompileProductionSequence (cb) {
	gulp.series('apply-prod-environment', 'compile_production_rollup', 'compile_elasticsearch_admin', 'copy_other_scripts')(cb)
}

gulp.task('compile:production', scriptCompileProductionSequence)

// Compile for release - with minify
function minifyScripts () {
	return gulp.src(['./admin/js/**/*.js', '!./admin/js/**/*.min.js'])
		.pipe(plugins.unassert())
		.pipe(gulpEnvify('production'))
		.pipe(plugins.terser({
			warnings: true,
			compress: true, mangle: true,
			output: {comments: 'some'}
		}))
		.pipe(plugins.rename({
			suffix: '.min'
		}))
		.pipe(gulp.dest('./admin/js'))
}

gulp.task('minify-scripts', minifyScripts)

function scriptCompileMinifiedSequence (cb) {
	gulp.series('compile:production', 'minify-scripts')(cb)
}

gulp.task('compile:distribution', scriptCompileMinifiedSequence)

/**
 * Watch Tasks
 */
gulp.task('watch:dashboard', function () { return watch_dashboard(true) })
gulp.task('watch:wizard', function () { return watch_setup_wizard(true) })
gulp.task('watch:support', function () { return watch_support(true) })

// Watch SCSS files and JS files
function watchAllSequence (cb) {
	return gulp.parallel('watch:dashboard', 'watch:wizard', 'watch:support', 'watch:styles')(cb)
}

watchAllSequence.description = 'Start all the watchers.'
gulp.task('watch:all', watchAllSequence)


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
function removeUnneededFiles( done ) {

	// files that should not be present in build zip
	var files_to_remove = [
		'**/codekit-config.json',
		'node_modules',
		'node-tasks',
		'.nvmrc',
		'.node-version',
		'bin',
		'tests',
		'.travis.yml',
		'.babelrc',
		'.gitignore',
		'.codeclimate.yml',
		'.csslintrc',
		'.editorconfig',
		'.eslintignore',
		'.eslintrc',
		'.gitignore',
		'.gitmodules',
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
		'admin/src',
		'admin/js/vendor/elasticsearch.js'
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
	if (!commandExistsSync('dos2unix')) {
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
		.pipe( plugins.replace( /['|"]__plugin_txtd['|"]/g, '\'' + textDomain + '\'' ) )
		.pipe( gulp.dest( '../build/' + plugin ) );
}
gulp.task( 'txtdomain-replace', replaceTextdomainPlaceholder);

function generatePotFile (done) {
	if (!fs.existsSync('../build/' + plugin)) {
		log.error('The build folder (`'+'../build/' + plugin+'`) is missing!')
		log.error('Aborting...')
		done(new Error('missing_build_folder'))
	}

	if (!commandExistsSync('wp')) {
		log.error('Could not generate the pot file since the wp command is missing. Please install the WP CLI!')
		log.error('The build task will continue.')
	} else {
		cp.execSync('wp i18n make-pot ../build/' + plugin + '/ ../build/' + plugin + '/languages/' + textDomain + '.pot --skip-js',
			{
				stdio: 'inherit' // Use the same console as the io for the child process.
			}
		);
	}

	return done();
}

generatePotFile.description = 'Scan the build files and generate the .pot file.'
gulp.task('generatepot', generatePotFile)

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
	return gulp.series( 'copy-folder', 'remove-files', 'fix-build-dir-permissions', 'fix-build-file-permissions', 'fix-line-endings', 'txtdomain-replace', generatePotFile )(cb);
}
buildSequence.description = 'Sets up the build folder';
gulp.task( 'build', buildSequence );

function zipSequence(cb) {
	return gulp.series( 'build', 'make-zip' )(cb);
}
zipSequence.description = 'Creates the zip file';
gulp.task( 'zip', zipSequence  );
