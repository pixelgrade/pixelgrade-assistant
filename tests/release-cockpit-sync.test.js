const assert = require( 'node:assert/strict' );
const fs = require( 'node:fs' );
const path = require( 'node:path' );
const { spawnSync } = require( 'node:child_process' );
const test = require( 'node:test' );

const repoRoot = path.resolve( __dirname, '..' );
const workflowPath = path.join( repoRoot, '.github/workflows/release-cockpit-sync.yml' );

function extractVersionStatusScript() {
	const workflow = fs.readFileSync( workflowPath, 'utf8' );
	assert.match( workflow, /uses: actions\/checkout@v7/, 'workflow actions must use the Node 24 runtime' );
	assert.match( workflow, /export TITLE="\$title"/, 'issue matcher must receive the title environment variable' );
	assert.doesNotMatch( workflow, /TITLE="\$title" gh issue list/, 'title must not be scoped only to the gh process' );

	const lines = workflow.split( '\n' );
	const start = lines.findIndex( ( line ) => line.includes( "node <<'NODE'" ) );
	const end = lines.findIndex( ( line, index ) => index > start && line.trim() === 'NODE' );

	assert.notEqual( start, -1, 'workflow must contain the version-status Node script' );
	assert.notEqual( end, -1, 'workflow version-status Node script must have a terminator' );

	return lines
		.slice( start + 1, end )
		.map( ( line ) => line.replace( /^ {10}/, '' ) )
		.join( '\n' );
}

test( 'release cockpit workflow parses the current version markers', () => {
	const result = spawnSync( process.execPath, [ '-' ], {
		cwd: repoRoot,
		encoding: 'utf8',
		input: extractVersionStatusScript(),
	} );

	assert.equal( result.status, 0, result.stderr );

	const outputs = Object.fromEntries(
		result.stdout
			.trim()
			.split( '\n' )
			.map( ( line ) => line.split( '=' ) )
	);

	assert.equal( outputs.plugin_version, '2.3.1' );
	assert.equal( outputs.singleton_version, '2.3.1' );
	assert.equal( outputs.readme_stable_tag, '2.3.1' );
	assert.equal( outputs.package_version, '2.3.1' );
	assert.equal( outputs.versions_consistent, 'yes' );
} );
